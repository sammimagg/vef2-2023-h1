import pg from 'pg';
import  { Event } from '../types.js'
import { eventMapper, eventsMapper } from './mappers.js';

let savedPool: pg.Pool | undefined;

export function getPool(): pg.Pool {
  if (savedPool) {
    return savedPool;
  }
  const  { DATABASE_URL: connectionString } = process.env;
  if (!connectionString) {
    console.error("Missing DATABASE_URL in .env");
    throw new Error('Missing DATABASE_URL');
  }
  savedPool = new pg.Pool( { connectionString } );

  savedPool.on('error', (err) => {
    console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
    throw new Error('error in db connection');
  });
  return savedPool;
}
export async function query(q: string, values: Array<unknown> = [], silent = false) {
  const pool = getPool();
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    if (!silent) {
      console.error('unable to get client from pool');
    }
    return null;
  }
  try {
    const result = await client.query(q,values);
    return result;
  } catch (e) {
    if (!silent) {
      console.error('unable to query', e);
    }
    if (!silent) {
      console.info(q, values);
    }
    return null
  } finally {
    client.release();
  }
}

export async function poolEnd() {
  const pool = getPool();
  await pool.end();
}
export async function getEvents(): Promise<Array<Event> | null> {
  const result = await query('SELECT * FROM events');
  if (!result) {
    return null;
  }
  const event = eventsMapper(result.rows);
  console.log(event)
  return event;
}
export async function getEventBySlug(slug: string): Promise<Event | null> {
  const result = await query('SELECT * FROM events WHERE slug = $1', [slug,]);

  if(!result) {
    return null;
  }

  const event = eventMapper(result.rows[0]);
  return event;
}
export async function listEventByName(name:string) {
  const q = `
    SELECT
      id, name, slug, location, url, description, created, updated
    FROM
      events
    WHERE name = $1
  `;

  const result = await query(q, [name]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}
export async function listEventBySlug(slug: string) {
  const q = `
    SELECT
      id, name, slug, description, location, url, created, updated
    FROM
      events
    WHERE slug = $1
  `;

  const result = await query(q, [slug]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}
export async function updateEvent(
  id: number,
  { name, slug, location, url, description }: Partial<Event> = {}
): Promise<Event | null> {
  const q = `
    UPDATE events
      SET
        name = $1,
        slug = $2,
        location = $3,
        url = $4,
        description = $5,
        updated = CURRENT_TIMESTAMP
    WHERE
      id = $6
    RETURNING id, name, slug, description;
  `;
  const values = [name, slug, location, url, description, id];
  const result = await query(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}
export async function deleteEvent(eventId: number) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const deleteRegistrations = 'DELETE FROM registrations WHERE event = $1';
    await client.query(deleteRegistrations, [eventId]);

    const deleteEventQuery = 'DELETE FROM events WHERE id = $1';
    await client.query(deleteEventQuery, [eventId]);
    await client.query('COMMIT');

    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('unable to delete event', e);
    return false;
  } finally {
    client.release();
  }
}



export async function createEvent({
  name,
  slug,
  location,
  url,
  description,
}: Event): Promise<Event | null> {
  const q = `
    INSERT INTO events
      (name, slug, location, url, description)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING id, name, slug, description;
  `;
  const values = [name, slug, location, url, description];
  const result = await query(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}


