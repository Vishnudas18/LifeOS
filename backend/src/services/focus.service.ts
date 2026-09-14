import { Types } from "mongoose";
import { FocusRepository } from "../repositories/focus.repository.js";
import { Task } from "../models/Task.js";
import { Goal } from "../models/Goal.js";
import { Milestone } from "../models/Milestone.js";
import { FocusStatus } from "../types/focus.types.js";
import { NotificationService } from "./notification.service.js";
import { NotificationType } from "../types/notification.types.js";
import {
  CreateFocusSessionSchemaInput,
  FocusQuerySchemaInput,
  FocusSummaryQuerySchemaInput,
} from "../validators/focus.validator.js";

export class FocusError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "FocusError";
  }
}

export class FocusService {
  private focusRepository: FocusRepository;

  constructor() {
    this.focusRepository = new FocusRepository();
  }

  private async validateRelatedEntityOwnership(
    userId: string,
    taskId?: string | null,
    goalId?: string | null,
    milestoneId?: string | null
  ) {
    const userObjId = new Types.ObjectId(userId);

    if (taskId) {
      if (!Types.ObjectId.isValid(taskId)) {
        throw new FocusError("Invalid Task ID format", 400);
      }
      const task = await Task.findOne({
        _id: new Types.ObjectId(taskId),
        userId: userObjId,
      });
      if (!task) {
        throw new FocusError("Task not found or does not belong to you", 404);
      }
    }

    if (goalId) {
      if (!Types.ObjectId.isValid(goalId)) {
        throw new FocusError("Invalid Goal ID format", 400);
      }
      const goal = await Goal.findOne({
        _id: new Types.ObjectId(goalId),
        userId: userObjId,
      });
      if (!goal) {
        throw new FocusError("Goal not found or does not belong to you", 404);
      }
    }

    if (milestoneId) {
      if (!Types.ObjectId.isValid(milestoneId)) {
        throw new FocusError("Invalid Milestone ID format", 400);
      }
      const milestone = await Milestone.findOne({
        _id: new Types.ObjectId(milestoneId),
        userId: userObjId,
      });
      if (!milestone) {
        throw new FocusError("Milestone not found or does not belong to you", 404);
      }

      if (goalId && milestone.goalId.toString() !== goalId) {
        throw new FocusError(
          "Milestone does not belong to the selected Goal",
          400
        );
      }
    }
  }

  async startSession(userId: string, input: CreateFocusSessionSchemaInput) {
    // 1. Prevent concurrent active focus sessions
    const active = await this.focusRepository.findActiveSession(userId);
    if (active) {
      throw new FocusError(
        "An active focus session is already in progress. Please complete or cancel it before starting a new session.",
        400
      );
    }

    // 2. Validate related entities ownership
    await this.validateRelatedEntityOwnership(
      userId,
      input.taskId,
      input.goalId,
      input.milestoneId
    );

    // 3. Create session
    return await this.focusRepository.createSession(userId, input);
  }

  async getActiveSession(userId: string) {
    return await this.focusRepository.findActiveSession(userId);
  }

  async getSessionById(userId: string, sessionId: string) {
    const session = await this.focusRepository.findSessionById(userId, sessionId);
    if (!session) {
      throw new FocusError("Focus session not found", 404);
    }
    return session;
  }

  async pauseSession(userId: string, sessionId: string) {
    const session = await this.focusRepository.findSessionById(userId, sessionId);
    if (!session) {
      throw new FocusError("Focus session not found", 404);
    }

    if (session.status !== FocusStatus.RUNNING) {
      throw new FocusError(
        `Cannot pause a session with status '${session.status}'. Only running sessions can be paused.`,
        400
      );
    }

    return await this.focusRepository.updateSession(userId, sessionId, {
      status: FocusStatus.PAUSED,
      pausedAt: new Date(),
    });
  }

  async resumeSession(userId: string, sessionId: string) {
    const session = await this.focusRepository.findSessionById(userId, sessionId);
    if (!session) {
      throw new FocusError("Focus session not found", 404);
    }

    if (session.status !== FocusStatus.PAUSED) {
      throw new FocusError(
        `Cannot resume a session with status '${session.status}'. Only paused sessions can be resumed.`,
        400
      );
    }

    const now = new Date();
    let additionalPauseSeconds = 0;
    if (session.pausedAt) {
      additionalPauseSeconds = Math.max(
        0,
        Math.floor((now.getTime() - new Date(session.pausedAt).getTime()) / 1000)
      );
    }

    const totalPausedDuration =
      (session.accumulatedPausedDuration || 0) + additionalPauseSeconds;

    return await this.focusRepository.updateSession(userId, sessionId, {
      status: FocusStatus.RUNNING,
      accumulatedPausedDuration: totalPausedDuration,
      pausedAt: null,
    });
  }

  async completeSession(userId: string, sessionId: string) {
    const session = await this.focusRepository.findSessionById(userId, sessionId);
    if (!session) {
      throw new FocusError("Focus session not found", 404);
    }

    if (
      session.status !== FocusStatus.RUNNING &&
      session.status !== FocusStatus.PAUSED
    ) {
      throw new FocusError(
        `Cannot complete a session with status '${session.status}'. Only active sessions can be completed.`,
        400
      );
    }

    const now = new Date();
    let accumulatedPaused = session.accumulatedPausedDuration || 0;

    if (session.status === FocusStatus.PAUSED && session.pausedAt) {
      const additionalPause = Math.max(
        0,
        Math.floor((now.getTime() - new Date(session.pausedAt).getTime()) / 1000)
      );
      accumulatedPaused += additionalPause;
    }

    const startedAtTime = session.startedAt
      ? new Date(session.startedAt).getTime()
      : now.getTime();
    const grossSeconds = Math.max(
      0,
      Math.floor((now.getTime() - startedAtTime) / 1000)
    );
    const actualDuration = Math.max(0, grossSeconds - accumulatedPaused);

    const completedSession = await this.focusRepository.updateSession(userId, sessionId, {
      status: FocusStatus.COMPLETED,
      endedAt: now,
      accumulatedPausedDuration: accumulatedPaused,
      actualDuration,
      pausedAt: null,
    });

    // Non-blocking notification dispatch
    try {
      const notificationService = new NotificationService();
      const mins = Math.round(actualDuration / 60);
      await notificationService.createInAppNotification({
        userId,
        type: NotificationType.FOCUS_COMPLETED,
        title: "Focus Session Completed",
        message: `You completed a ${mins}-minute ${completedSession?.mode || "Focus"} session!`,
        relatedFocusSessionId: sessionId,
      });
    } catch (err) {
      // Non-blocking
    }

    return completedSession;
  }

  async cancelSession(userId: string, sessionId: string) {
    const session = await this.focusRepository.findSessionById(userId, sessionId);
    if (!session) {
      throw new FocusError("Focus session not found", 404);
    }

    if (
      session.status !== FocusStatus.RUNNING &&
      session.status !== FocusStatus.PAUSED
    ) {
      throw new FocusError(
        `Cannot cancel a session with status '${session.status}'. Only active sessions can be cancelled.`,
        400
      );
    }

    const now = new Date();

    return await this.focusRepository.updateSession(userId, sessionId, {
      status: FocusStatus.CANCELLED,
      endedAt: now,
      pausedAt: null,
    });
  }

  async getSessionHistory(userId: string, queryInput: FocusQuerySchemaInput) {
    return await this.focusRepository.findSessions(userId, queryInput);
  }

  async getFocusSummary(
    userId: string,
    rangeInput: FocusSummaryQuerySchemaInput
  ) {
    return await this.focusRepository.getSummaryMetrics(userId, rangeInput);
  }
}
