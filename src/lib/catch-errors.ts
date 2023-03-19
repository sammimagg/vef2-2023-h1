import { NextFunction, Request, Response } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export function catchErrors(fn: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);
}
