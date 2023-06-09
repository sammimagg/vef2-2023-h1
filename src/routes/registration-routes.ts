import { NextFunction, Request, Response } from "express";
import {
  getEventBySlug,
  getUserRegisterToEvent,
  isUserRegisterToEventBySLug,
  listEventBySlug,
  listRegisterById,
  registerToEvent,
  unregisterEventBySLug,
} from "../lib/db.js";

export async function registerToEventRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { user } = req;
  const { comment } = req.body;
  const { slug } = req.params;
  if (!user) {
    return res
      .status(401)
      .json({ message: "Please sign in to register to event" });
  }

  const event = await listEventBySlug(slug);
  const aldreadyRegister = await listRegisterById(user.id, event.id);
  if (aldreadyRegister) {
    return res.status(409).json({ aldreadyRegister });
  }

  const registrations = await registerToEvent(user.id, event.id, comment);

  if (registrations) {
    return res.status(200).json({ registrations });
  }

  return res.status(500).json({ message: "Error register to an event" });
}

export async function registerUsersToEventRoute(  req: Request, res: Response, next: NextFunction) {
  const { slug } = req.params;
 
  const eventSlug = await getEventBySlug(slug);
  if (!eventSlug) {
    return res.status(404).json({error: 'No event by that name'});
  }

  const eventRegister = await getUserRegisterToEvent(slug);

  if (!eventRegister) {
    return res.status(500).json({});
  }
  return res.status(200).json(eventRegister);
}
export async function unregisterToEventRoute(  req: Request, res: Response, next: NextFunction) {
  const { slug } = req.params;
  const { user } = req;
  if(user) {
    const result = await unregisterEventBySLug(slug,user.id )
    if(!result) {
      return res.status(500).json({});
    }
    return res.status(200).json(result)
  }


}
export async function isUserRegisteredToEventRoute(  req: Request, res: Response, next: NextFunction) {
  const { slug } = req.params;
  const { user } = req;
  if(user) {
    const result = await isUserRegisterToEventBySLug(slug,user.id)
    if(!result) {
      return res.status(500).json({});
    }
    return res.status(200).json(result)
  }


}
