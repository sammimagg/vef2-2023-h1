import express, { NextFunction, Request, Response } from 'express';

/**
 * Higher-order fall sem umlykur async middleware með villumeðhöndlun.
 *
 * @param {function} fn Middleware sem grípa á villur fyrir
 * @returns {function} Middleware með villumeðhöndlun
 */
export function catchErrors(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}
