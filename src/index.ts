
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
const app = express();

// Allow all origins to make requests to your server
app.use(cors());

// Your routes and middleware come here

// Error handling middleware
app.use((err: Error,   req: Request,  res: Response,  next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
