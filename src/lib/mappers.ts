import { Event } from "../types.js";

export function eventMapper(potentialEvent: unknown): Event | null {
  const event = potentialEvent as Event | null;

  if (
    !event ||
    !event.id ||
    !event.name ||
    !event.slug ||
    !event.description ||
    !event.created ||
    !event.updated
  ) {
    return null;
  }

  const mapped: Event = {
    id: event.id,
    name: event.name,
    slug: event.slug,
    location: event.location,
    url: event.url,
    description: event.description,
    created: event.created,
    updated: event.updated,
  };

  return mapped;
}
export function eventsMapper(potentialEvents: unknown): Array<Event> {
  const events = potentialEvents as Array<unknown> | null;

  if (!events) {
    return [];
  }

  const mapped = events.map((dept) => eventMapper(dept));
  return mapped.filter((i): i is Event => Boolean(i));
}
