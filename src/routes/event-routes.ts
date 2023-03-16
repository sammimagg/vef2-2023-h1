import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import slugify from 'slugify';
import { getEventBySlug, getEvents } from '../lib/db.js';

export async function listEvents(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const events = await getEvents();
  
    if (!events) {
      return next(new Error('unable to get events'));
    }
  
    return res.json(events);
  }
  export async function getEvent(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { slug } = req.params;

    const event = await getEventBySlug(slug);

    if (!event) {
        return next();
    }
    return res.json(event);
  }