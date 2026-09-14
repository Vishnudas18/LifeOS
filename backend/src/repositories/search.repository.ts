import { Types } from "mongoose";
import { Task } from "../models/Task.js";
import { Goal } from "../models/Goal.js";
import { Milestone } from "../models/Milestone.js";
import { Transaction } from "../models/Transaction.js";
import { CalendarEvent } from "../models/CalendarEvent.js";
import { FocusSession } from "../models/FocusSession.js";
import { Notification } from "../models/Notification.js";
import { SearchEntityType } from "../types/search.types.js";

export class SearchRepository {
  /**
   * Safely escapes regex special characters in raw search input
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Executes queries across models matching specified entity types.
   * All queries are strictly scoped by userId for isolation.
   */
  async searchAllEntities(
    userId: string,
    queryStr: string,
    typesToSearch: SearchEntityType[],
    perTypeLimit: number = 20
  ) {
    const userObjId = new Types.ObjectId(userId);
    const escaped = this.escapeRegex(queryStr);
    const searchRegex = new RegExp(escaped, "i");

    const promises: Promise<{ type: SearchEntityType; docs: any[] }>[] = [];

    if (typesToSearch.includes("TASK")) {
      promises.push(
        Task.find({
          userId: userObjId,
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
            { tags: { $in: [searchRegex] } },
          ],
        })
          .sort({ updatedAt: -1 })
          .limit(perTypeLimit)
          .lean()
          .exec()
          .then((docs) => ({ type: "TASK" as SearchEntityType, docs }))
      );
    }

    if (typesToSearch.includes("GOAL")) {
      promises.push(
        Goal.find({
          userId: userObjId,
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
          ],
        })
          .sort({ updatedAt: -1 })
          .limit(perTypeLimit)
          .lean()
          .exec()
          .then((docs) => ({ type: "GOAL" as SearchEntityType, docs }))
      );
    }

    if (typesToSearch.includes("MILESTONE")) {
      promises.push(
        Milestone.find({
          userId: userObjId,
          $or: [{ title: searchRegex }, { description: searchRegex }],
        })
          .sort({ updatedAt: -1 })
          .limit(perTypeLimit)
          .lean()
          .exec()
          .then((docs) => ({ type: "MILESTONE" as SearchEntityType, docs }))
      );
    }

    if (typesToSearch.includes("TRANSACTION")) {
      promises.push(
        Transaction.find({
          userId: userObjId,
          $or: [
            { description: searchRegex },
            { notes: searchRegex },
            { category: searchRegex },
            { paymentMethod: searchRegex },
          ],
        })
          .sort({ date: -1 })
          .limit(perTypeLimit)
          .lean()
          .exec()
          .then((docs) => ({ type: "TRANSACTION" as SearchEntityType, docs }))
      );
    }

    if (typesToSearch.includes("CALENDAR_EVENT")) {
      promises.push(
        CalendarEvent.find({
          userId: userObjId,
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { location: searchRegex },
            { type: searchRegex },
          ],
        })
          .sort({ startDateTime: -1 })
          .limit(perTypeLimit)
          .lean()
          .exec()
          .then((docs) => ({ type: "CALENDAR_EVENT" as SearchEntityType, docs }))
      );
    }

    if (typesToSearch.includes("FOCUS_SESSION")) {
      promises.push(
        FocusSession.find({
          userId: userObjId,
          $or: [{ title: searchRegex }, { notes: searchRegex }],
        })
          .sort({ startedAt: -1 })
          .limit(perTypeLimit)
          .lean()
          .exec()
          .then((docs) => ({ type: "FOCUS_SESSION" as SearchEntityType, docs }))
      );
    }

    if (typesToSearch.includes("NOTIFICATION")) {
      promises.push(
        Notification.find({
          userId: userObjId,
          $or: [{ title: searchRegex }, { message: searchRegex }],
        })
          .sort({ createdAt: -1 })
          .limit(perTypeLimit)
          .lean()
          .exec()
          .then((docs) => ({ type: "NOTIFICATION" as SearchEntityType, docs }))
      );
    }

    const resultsArr = await Promise.all(promises);
    return resultsArr;
  }
}
