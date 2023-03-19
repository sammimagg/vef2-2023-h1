import { NextFunction, Request, Response } from "express";
import slugify from "slugify";
import {
  createEvent,
  deleteEventBySlug,
  getEventBySlug,
  getEvents,
  updateEvent,
} from "../lib/db.js";
import { listEvent } from "../lib/events.js";
import { Event } from "../types.js";

export async function listEvents(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const events = await getEvents();

  if (!events) {
    return next(new Error("unable to get events"));
  }

  return res.json(events);
}
export async function getEvent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { slug } = req.params;

  const event = await getEventBySlug(slug);

  if (!event) {
    return next();
  }
  return res.json(event);
}
export async function eventRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { slug } = req.params;
  const { user } = req;

  const event = await listEvent(slug);

  if (!event) {
    return next();
  }

  return res.render("admin-event", {
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
export async function updateEventRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name, description, location, url } = req.body;
  const { slug } = req.params;
  if (!name || !description) {
    return res.status(400).json({ message: "Wrong information in body" });
  }
  const event = await listEvent(slug);

  const newSlug = slugify(name);

  if (event === null) {
    return res.status(404).json({ message: "No event with that name" });
  }

  const updated = await updateEvent(event.id, {
    name,
    slug: newSlug,
    description,
    location,
    url,
  });

  if (updated) {
    return res.status(200).json({ updated });
  }

  return res.status(500).json({ message: "Error updating event" });
}

export async function createEventRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name, description, location, url } = req.body;
  const slug = slugify(name, "-");
  const alreadyExist = await getEventBySlug(slug);
  if (alreadyExist) {
    return res.status(409).json({ message: "Event already exists" });
  }
  const eventToCreate: Omit<Event, "id"> = {
    name,
    slug: slugify(name),
    description,
    url,
    location,
    created: new Date(),
    updated: new Date(),
  };
  const event = await createEvent(eventToCreate);
  if (!event) {
    return res.status(400);
  }
  return res.status(201).json({ event });
}
export async function deleteEvent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { slug } = req.params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return res.status(400).json({ message: "No event by that name." });
  }
  const result = await deleteEventBySlug(event.id);
  if (!result) {
    return res.status(500).json({ message: "Errror deleted." });
  }
  return res
    .status(204)
    .json({ message: "The event was successfully deleted." });
}
