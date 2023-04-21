
import express, { NextFunction, Request, Response } from "express";
const app = express();

// Allow all origins to make requests to your server
app.use();

// Your routes and middleware come here

// Error handling middleware


app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
