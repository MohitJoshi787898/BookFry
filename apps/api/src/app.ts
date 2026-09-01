import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import rateLimit from "express-rate-limit";

const app = express();

app.use(helmet());

const allowedOrigins = [env.FRONTEND_URL, "http://localhost:3000"].filter(
  Boolean,
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or if origin matches allowedOrigins
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        env.NODE_ENV === "test"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  }),
);

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000000000, // Limit each IP to 100 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests, please try again later.",
    },
  },
});

// if (env.NODE_ENV !== "test") {
//   app.use("/api", limiter);
// }

import { serverAdapter } from "./jobs/bull-board";
import { requireAuth } from "./middlewares/auth.middleware";
import { requireAdmin } from "./middlewares/rbac.middleware";

// Mount Bull Board Admin Dashboard
app.use(
  "/api/v1/admin/queues",
  requireAuth,
  requireAdmin,
  serverAdapter.getRouter(),
);

// Mount API routes under /api/v1
app.use("/api/v1", routes);

// Global Error Handler
app.use(errorHandler);

export default app;
