import { listEventBySlug } from "./db.js";
import { Event } from "../types.js";

export async function listEvent(slug: string): Promise<Event | null> {
  const result = listEventBySlug(slug);
  return result;
}
