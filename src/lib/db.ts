import { readFile } from 'fs/promises';
import pg from 'pg';

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';

const { DATABASE_URL: connectionString, NODE_ENV: nodeEnv = 'development' } =
  process.env;

if (!connectionString) {
  console.error('vantar DATABASE_URL í .env');
  process.exit(-1);
}

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development
// mode, á heroku, ekki á local vél
const ssl = nodeEnv === 'production' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err: Error) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export async function query(q: String, values = []) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    console.error('unable to query', e);
    console.info(q, values);
    return null;
  } finally {
    client.release();
  }
}

export async function createSchema(schemaFile = SCHEMA_FILE) {
  const data = await readFile(schemaFile);

  return query(data.toString('utf-8'));
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
  const data = await readFile(dropFile);

  return query(data.toString('utf-8'));
}

export async function createEvent({
  name: number,
  slug: String,
  location :String,
  url: string,
  description: String,
} = {}) {
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

export async function updateEvent(
  id,
  { name, slug, location, url, description } = {}
) {
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

export async function register({ userId, eventId, comment } = {}) {
  const q = `
    INSERT INTO registrations
      (comment, event, userId)
    VALUES
      ($1, $2, $3)
    RETURNING
      id, comment, event, userId;
  `;
  const values = [comment, eventId, userId];
  const result = await query(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function listEvents(page = 1) {
  const q = `
    SELECT
      id, name, slug, location, url, description, created, updated
    FROM
      events
    ORDER BY updated DESC
    OFFSET $1 LIMIT $2
  `;

  const PAGE_SIZE = 10;
  const offset = (page - 1) * PAGE_SIZE;
  const limit = PAGE_SIZE;
  const result = await query(q, [offset, limit]);

  if (result) {
    return result.rows;
  }

  return null;
}

export async function countEvents() {
  const q = 'SELECT COUNT(*) AS count FROM events';
  const result = await query(q);

  if (result) {
    return result.rows[0].count;
  }

  return null;
}

export async function listEvent(slug) {
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

// TODO gætum fellt þetta fall saman við það að ofan
export async function listEventByName(name) {
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

export async function listRegistered(event) {
  const q = `
    SELECT
      users.id as id,
      users.username as username,
      users.name as name,
      registrations.comment as comment
    FROM
      registrations
    LEFT JOIN
      users ON users.id = registrations.userId
    WHERE event = $1
  `;

  const result = await query(q, [event]);

  if (result) {
    return result.rows;
  }

  return null;
}

export async function findRegistrationForUser({ userId, eventId }) {
  const q = `
    SELECT
      id
    FROM
      registrations
    WHERE event = $1 AND userid = $2
  `;

  const result = await query(q, [eventId, userId]);

  if (result?.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function deleteRegistrationForUser({ userId, eventId }) {
  const q = 'DELETE FROM registrations WHERE event = $1 AND userid = $2';

  const result = await query(q, [eventId, userId]);

  if (result && result.rowCount >= 1) {
    return true;
  }

  return null;
}

/**
 * Eyðir viðburði og skráningum úr gagnagrunni.
 * Keyrir í transaction þ.a. ef það kemur upp villa við að eyða skráningum er
 * viðburð ekki eytt og öfugt.
 * @see https://node-postgres.com/features/transactions
 * @param {number} eventId Id of event to delete
 */
export async function deleteEvent(eventId) {
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

export async function end() {
  await pool.end();
}