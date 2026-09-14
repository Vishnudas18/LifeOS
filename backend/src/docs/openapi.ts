import swaggerUi from "swagger-ui-express";
import { Router } from "express";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Life OS API",
    version: "1.0.0",
    description:
      "Production-hardened REST API for Life OS — Personal Life Management Dashboard",
  },
  servers: [
    {
      url: "/api/v1",
      description: "API Version 1",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error message" },
          error: { type: "object" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Liveness probe",
        responses: {
          200: { description: "Process is alive" },
        },
      },
    },
    "/health/ready": {
      get: {
        summary: "Readiness probe",
        responses: {
          200: { description: "Dependencies connected and ready" },
          503: { description: "Dependencies not ready" },
        },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          210: { description: "Registered successfully" },
          400: { description: "Validation error" },
          409: { description: "Email already exists" },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "User login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        summary: "Refresh access token using HTTP-only cookie",
        responses: {
          200: { description: "Token refreshed successfully" },
          401: { description: "Invalid or revoked refresh token" },
        },
      },
    },
    "/tasks": {
      get: {
        summary: "List tasks for authenticated user",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Paginated task list" },
          401: { description: "Unauthorized" },
        },
      },
      post: {
        summary: "Create a new task",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string", maxLength: 200 },
                  description: { type: "string", maxLength: 2000 },
                  category: { type: "string" },
                  priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
                  dueDate: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Task created" },
        },
      },
    },
    "/transactions": {
      get: {
        summary: "List transactions for authenticated user",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Transaction list" } },
      },
    },
    "/goals": {
      get: {
        summary: "List goals for authenticated user",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Goal list" } },
      },
    },
    "/calendar": {
      get: {
        summary: "List calendar events for authenticated user",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Calendar events list" } },
      },
    },
    "/focus": {
      get: {
        summary: "Get active focus session",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Active session info" } },
      },
    },
    "/analytics/overview": {
      get: {
        summary: "Get unified dashboard analytics overview",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Dashboard metrics" } },
      },
    },
    "/notifications": {
      get: {
        summary: "List notifications",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Notification list" } },
      },
    },
    "/search": {
      get: {
        summary: "Global search across all modules",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Search results" } },
      },
    },
    "/settings": {
      get: {
        summary: "Get user settings and preferences",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "User settings" } },
      },
    },
  },
};

const swaggerRouter = Router();
swaggerRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default swaggerRouter;
