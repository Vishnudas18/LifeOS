import { Router } from "express";
import healthRouter from "./health.routes.js";
import authRouter from "./auth.routes.js";
import taskRouter from "./task.routes.js";
import transactionRouter from "./transaction.routes.js";
import goalRouter from "./goal.routes.js";
import calendarRouter from "./calendar.routes.js";
import focusRouter from "./focus.routes.js";
import analyticsRouter from "./analytics.routes.js";
import notificationRouter from "./notification.routes.js";
import searchRouter from "./search.routes.js";
import settingsRouter from "./settings.routes.js";

const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/tasks", taskRouter);
apiRouter.use("/transactions", transactionRouter);
apiRouter.use("/goals", goalRouter);
apiRouter.use("/calendar", calendarRouter);
apiRouter.use("/focus", focusRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/settings", settingsRouter);

export default apiRouter;
