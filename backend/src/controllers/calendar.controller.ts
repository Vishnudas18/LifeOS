import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { CalendarService } from "../services/calendar.service.js";
import {
  createCalendarEventSchema,
  updateCalendarEventSchema,
  calendarRangeQuerySchema,
} from "../validators/calendar.validator.js";
import { sendSuccess } from "../utils/response.js";

const calendarService = new CalendarService();

export async function getEventsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const queryInput = calendarRangeQuerySchema.parse(req.query);
    const events = await calendarService.getEventsInRange(userId, queryInput);
    sendSuccess(res, { events }, "Calendar events retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function createEventController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const input = createCalendarEventSchema.parse(req.body);
    const event = await calendarService.createEvent(userId, input);
    sendSuccess(res, { event }, "Calendar event created successfully", 201);
  } catch (error) {
    next(error);
  }
}

export async function getEventByIdController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const eventId = req.params.id as string;
    const event = await calendarService.getEventById(userId, eventId);
    sendSuccess(res, { event }, "Calendar event details retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateEventController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const eventId = req.params.id as string;
    const input = updateCalendarEventSchema.parse(req.body);
    const event = await calendarService.updateEvent(userId, eventId, input);
    sendSuccess(res, { event }, "Calendar event updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteEventController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const eventId = req.params.id as string;
    await calendarService.deleteEvent(userId, eventId);
    sendSuccess(res, null, "Calendar event deleted successfully");
  } catch (error) {
    next(error);
  }
}
