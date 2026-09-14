import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getTasksController,
  getTaskByIdController,
  createTaskController,
  updateTaskController,
  updateTaskStatusController,
  deleteTaskController,
  addSubtaskController,
  updateSubtaskController,
  deleteSubtaskController,
} from "../controllers/task.controller.js";

const taskRouter = Router();

// Protect all task endpoints with auth middleware
taskRouter.use(authenticate);

taskRouter.get("/", getTasksController);
taskRouter.post("/", createTaskController);
taskRouter.get("/:id", getTaskByIdController);
taskRouter.patch("/:id", updateTaskController);
taskRouter.delete("/:id", deleteTaskController);
taskRouter.patch("/:id/status", updateTaskStatusController);

taskRouter.post("/:id/subtasks", addSubtaskController);
taskRouter.patch("/:id/subtasks/:subtaskId", updateSubtaskController);
taskRouter.delete("/:id/subtasks/:subtaskId", deleteSubtaskController);

export default taskRouter;
