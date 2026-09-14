import { FilterQuery, Types } from "mongoose";
import { CalendarEvent, ICalendarEventDoc } from "../models/CalendarEvent.js";
import {
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  CalendarRangeQueryInput,
} from "../validators/calendar.validator.js";

export class CalendarRepository {
  async createEvent(
    userId: string,
    input: CreateCalendarEventInput
  ): Promise<ICalendarEventDoc> {
    const event = new CalendarEvent({
      ...input,
      userId: new Types.ObjectId(userId),
      startDateTime: new Date(input.startDateTime),
      endDateTime: new Date(input.endDateTime),
      taskId: input.taskId ? new Types.ObjectId(input.taskId) : null,
      goalId: input.goalId ? new Types.ObjectId(input.goalId) : null,
      milestoneId: input.milestoneId ? new Types.ObjectId(input.milestoneId) : null,
    });
    return await event.save();
  }

  async findEventById(
    userId: string,
    eventId: string
  ): Promise<ICalendarEventDoc | null> {
    if (!Types.ObjectId.isValid(eventId)) return null;
    return await CalendarEvent.findOne({
      _id: new Types.ObjectId(eventId),
      userId: new Types.ObjectId(userId),
    });
  }

  async findEventsInRange(
    userId: string,
    queryInput: CalendarRangeQueryInput
  ): Promise<ICalendarEventDoc[]> {
    const startRange = new Date(queryInput.start);
    const endRange = new Date(queryInput.end);

    const query: FilterQuery<ICalendarEventDoc> = {
      userId: new Types.ObjectId(userId),
      // Overlapping date range condition: event starts before range end AND ends after range start
      startDateTime: { $lt: endRange },
      endDateTime: { $gt: startRange },
    };

    if (queryInput.type) {
      query.type = queryInput.type;
    }

    if (queryInput.status) {
      query.status = queryInput.status;
    }

    if (queryInput.search) {
      query.$or = [
        { title: { $regex: queryInput.search, $options: "i" } },
        { description: { $regex: queryInput.search, $options: "i" } },
        { location: { $regex: queryInput.search, $options: "i" } },
      ];
    }

    return await CalendarEvent.find(query)
      .sort({ startDateTime: 1 })
      .exec();
  }

  async updateEvent(
    userId: string,
    eventId: string,
    input: UpdateCalendarEventInput
  ): Promise<ICalendarEventDoc | null> {
    if (!Types.ObjectId.isValid(eventId)) return null;

    const updateData: Record<string, any> = { ...input };

    if (input.startDateTime) {
      updateData.startDateTime = new Date(input.startDateTime);
    }
    if (input.endDateTime) {
      updateData.endDateTime = new Date(input.endDateTime);
    }
    if (input.taskId !== undefined) {
      updateData.taskId = input.taskId ? new Types.ObjectId(input.taskId) : null;
    }
    if (input.goalId !== undefined) {
      updateData.goalId = input.goalId ? new Types.ObjectId(input.goalId) : null;
    }
    if (input.milestoneId !== undefined) {
      updateData.milestoneId = input.milestoneId ? new Types.ObjectId(input.milestoneId) : null;
    }

    return await CalendarEvent.findOneAndUpdate(
      {
        _id: new Types.ObjectId(eventId),
        userId: new Types.ObjectId(userId),
      },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async deleteEvent(userId: string, eventId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(eventId)) return false;
    const result = await CalendarEvent.deleteOne({
      _id: new Types.ObjectId(eventId),
      userId: new Types.ObjectId(userId),
    });
    return result.deletedCount > 0;
  }
}
