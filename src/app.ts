import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { cors } from "./lib/cors.js";
import { router } from "./routes/api.js";
import passport from "passport";
import session, { SessionOptions } from "express-session";
import fileUpload from "express-fileupload";

dotenv.config();
const { SESSION_SECRET: sessionSecret, DATABASE_URL: connectionString } =
  process.env;

if (!connectionString || !sessionSecret) {
  console.error("Vantar gögn í env");
  process.exit(1);
}

const app = express();

app.use(express.json());

app.use(cors);
app.use(
  fileUpload({
    useTempFiles: true,
    limits: { fileSize: 50 * 2024 * 1024 },
  })
);
const sessionOptions: SessionOptions = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
};
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

// Move the router middleware after session and passport middleware
app.use(router);

/** Middleware sem sér um 404 villur. */
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "not found" });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (
    err instanceof SyntaxError &&
    "status" in err &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({ error: "invalid json" });
  }

  console.error("error handling route", err);
  return res
    .status(500)
    .json({ error: err.message ?? "internal server error" });
});
export default app;
