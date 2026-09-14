import { useState, useEffect, useCallback } from "react";
import type { FocusSession } from "../types/focus";

export interface FocusTimerState {
  elapsedSeconds: number;
  remainingSeconds: number;
  formattedTime: string;
  progressPercentage: number;
  isFinished: boolean;
}

export function formatTimeSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function useFocusTimer(session: FocusSession | null | undefined): FocusTimerState {
  const calculateTimerState = useCallback((): FocusTimerState => {
    if (!session) {
      return {
        elapsedSeconds: 0,
        remainingSeconds: 0,
        formattedTime: "00:00",
        progressPercentage: 0,
        isFinished: false,
      };
    }

    const { status, plannedDuration, startedAt, pausedAt, accumulatedPausedDuration, actualDuration } = session;

    if (status === "COMPLETED") {
      const elapsed = actualDuration || plannedDuration;
      return {
        elapsedSeconds: elapsed,
        remainingSeconds: 0,
        formattedTime: formatTimeSeconds(plannedDuration),
        progressPercentage: 100,
        isFinished: true,
      };
    }

    if (status === "CANCELLED" || status === "IDLE") {
      return {
        elapsedSeconds: 0,
        remainingSeconds: plannedDuration,
        formattedTime: formatTimeSeconds(plannedDuration),
        progressPercentage: 0,
        isFinished: false,
      };
    }

    let elapsed = 0;
    const accumulatedPaused = accumulatedPausedDuration || 0;

    if (status === "RUNNING" && startedAt) {
      const now = Date.now();
      const started = new Date(startedAt).getTime();
      const grossElapsed = Math.max(0, Math.floor((now - started) / 1000));
      elapsed = Math.max(0, grossElapsed - accumulatedPaused);
    } else if (status === "PAUSED" && startedAt && pausedAt) {
      const paused = new Date(pausedAt).getTime();
      const started = new Date(startedAt).getTime();
      const grossElapsed = Math.max(0, Math.floor((paused - started) / 1000));
      elapsed = Math.max(0, grossElapsed - accumulatedPaused);
    }

    const remaining = Math.max(0, plannedDuration - elapsed);
    const progressPercentage = Math.min(100, Math.max(0, (elapsed / plannedDuration) * 100));
    const isFinished = elapsed >= plannedDuration;

    return {
      elapsedSeconds: elapsed,
      remainingSeconds: remaining,
      formattedTime: formatTimeSeconds(remaining),
      progressPercentage,
      isFinished,
    };
  }, [session]);

  const [timerState, setTimerState] = useState<FocusTimerState>(calculateTimerState);

  useEffect(() => {
    // Immediate calculation on session change
    setTimerState(calculateTimerState());

    if (!session || session.status !== "RUNNING") {
      return;
    }

    // 1-second interval for smooth UI ticks when RUNNING
    const intervalId = setInterval(() => {
      setTimerState(calculateTimerState());
    }, 1000);

    // Recalculate on tab visibility change (tab refocus after throttling)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setTimerState(calculateTimerState());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session, calculateTimerState]);

  return timerState;
}
