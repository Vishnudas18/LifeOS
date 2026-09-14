import { FilterQuery, SortOrder, Types } from "mongoose";
import { Task, ITask } from "../models/Task.js";
import { CreateTaskInput, UpdateTaskInput, SubtaskInput } from "../validators/task.validator.js";

export interface TaskFilterOptions {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  dueDate?: string;
}

export interface TaskPaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export class TaskRepository {
  private buildQuery(userId: string, filters: TaskFilterOptions): FilterQuery<ITask> {
    const query: FilterQuery<ITask> = {
      userId: new Types.ObjectId(userId),
    };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.category) {
      query.category = { $regex: new RegExp(`^${filters.category}$`, "i") };
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { category: { $regex: filters.search, $options: "i" } },
        { tags: { $in: [new RegExp(filters.search, "i")] } },
      ];
    }

    if (filters.dueDate) {
      const date = new Date(filters.dueDate);
      if (!isNaN(date.getTime())) {
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        query.dueDate = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    return query;
  }

  async findTasks(userId: string, filters: TaskFilterOptions, pagination: TaskPaginationOptions) {
    const query = this.buildQuery(userId, filters);
    const skip = (pagination.page - 1) * pagination.limit;
    const sort: Record<string, SortOrder> = {
      [pagination.sortBy]: pagination.sortOrder === "asc" ? 1 : -1,
    };

    const [tasks, total] = await Promise.all([
      Task.find(query).sort(sort).skip(skip).limit(pagination.limit).exec(),
      Task.countDocuments(query),
    ]);

    return { tasks, total };
  }

  async findById(userId: string, taskId: string): Promise<ITask | null> {
    if (!Types.ObjectId.isValid(taskId)) return null;
    return Task.findOne({
      _id: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
    }).exec();
  }

  async create(userId: string, input: CreateTaskInput): Promise<ITask> {
    return Task.create({
      ...input,
      userId: new Types.ObjectId(userId),
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      startDate: input.startDate ? new Date(input.startDate) : null,
    });
  }

  async update(userId: string, taskId: string, input: Partial<UpdateTaskInput> & { completedAt?: Date | null }): Promise<ITask | null> {
    if (!Types.ObjectId.isValid(taskId)) return null;

    const updateData: Record<string, unknown> = { ...input };

    if (input.dueDate !== undefined) {
      updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }
    if (input.startDate !== undefined) {
      updateData.startDate = input.startDate ? new Date(input.startDate) : null;
    }

    return Task.findOneAndUpdate(
      {
        _id: new Types.ObjectId(taskId),
        userId: new Types.ObjectId(userId),
      },
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();
  }

  async delete(userId: string, taskId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(taskId)) return false;
    const result = await Task.deleteOne({
      _id: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
    }).exec();
    return result.deletedCount > 0;
  }

  async addSubtask(userId: string, taskId: string, input: SubtaskInput): Promise<ITask | null> {
    if (!Types.ObjectId.isValid(taskId)) return null;
    return Task.findOneAndUpdate(
      {
        _id: new Types.ObjectId(taskId),
        userId: new Types.ObjectId(userId),
      },
      {
        $push: {
          subtasks: {
            _id: new Types.ObjectId(),
            title: input.title,
            completed: input.completed ?? false,
          },
        },
      },
      { new: true }
    ).exec();
  }

  async updateSubtask(
    userId: string,
    taskId: string,
    subtaskId: string,
    data: { title?: string; completed?: boolean }
  ): Promise<ITask | null> {
    if (!Types.ObjectId.isValid(taskId) || !Types.ObjectId.isValid(subtaskId)) return null;

    const updateFields: Record<string, unknown> = {};
    if (data.title !== undefined) {
      updateFields["subtasks.$.title"] = data.title;
    }
    if (data.completed !== undefined) {
      updateFields["subtasks.$.completed"] = data.completed;
    }

    return Task.findOneAndUpdate(
      {
        _id: new Types.ObjectId(taskId),
        userId: new Types.ObjectId(userId),
        "subtasks._id": new Types.ObjectId(subtaskId),
      },
      { $set: updateFields },
      { new: true }
    ).exec();
  }

  async deleteSubtask(userId: string, taskId: string, subtaskId: string): Promise<ITask | null> {
    if (!Types.ObjectId.isValid(taskId) || !Types.ObjectId.isValid(subtaskId)) return null;
    return Task.findOneAndUpdate(
      {
        _id: new Types.ObjectId(taskId),
        userId: new Types.ObjectId(userId),
      },
      {
        $pull: {
          subtasks: { _id: new Types.ObjectId(subtaskId) },
        },
      },
      { new: true }
    ).exec();
  }
}

export const taskRepository = new TaskRepository();
