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