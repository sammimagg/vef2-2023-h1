import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import slugify from 'slugify';
import { getEventBySlug, getEvents, updateEvent } from '../lib/db.js';
import { listEvent } from '../lib/events.js';
import { Event } from '../types.js';

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
  export async function eventRoute(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;
    const { user } = req;
  
    const event = await listEvent(slug);
  
    if (!event) {
      return next();
    }
  
    return res.render('admin-event', {
      user,
      title: `${event.name} — Viðburðir — umsjón`,
      event,
      errors: [],
      data: {
        name: event.name,
        description: event.description,
        location: event.location,
        url: event.url,
      },
    });
  }
  export async function updateRoute(req: Request, res: Response, next: NextFunction) {
    const { name, description, location, url } = req.body;
    const { slug } = req.params;
  
    const event = await listEvent(slug);
  
    const newSlug = slugify(name);

    if (event === null) {
      return 
    }
  
    const updated = await updateEvent(event.id, {
      name,
      slug: newSlug,
      description,
      location,
      url,
    });
  
    if (updated) {
      return res.redirect('/admin');
    }
  
    return res.render('error');
  }
  