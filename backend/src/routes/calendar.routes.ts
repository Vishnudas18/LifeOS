import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getEventsController,
  createEventController,
  getEventByIdController,
  updateEventController,
  deleteEventController,
} from "../controllers/calendar.controller.js";

const calendarRouter = Router();

// Protect all calendar endpoints with authentication middleware
calendarRouter.use(authenticate);

calendarRouter.get("/events", getEventsController);
calendarRouter.post("/events", createEventController);
calendarRouter.get("/events/:id", getEventByIdController);
calendarRouter.patch("/events/:id", updateEventController);
calendarRouter.delete("/events/:id", deleteEventController);

export default calendarRouter;
