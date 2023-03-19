import dotenv from "dotenv";
import { readFile } from "fs/promises";
import { query, poolEnd } from "../lib/db.js";

dotenv.config();

const SCHEMA_FILE = "./sql/schema.sql";
const DROP_SCHEMA_FILE = "./sql/drop.sql";

export async function createSchema(schemaFile = SCHEMA_FILE) {
  const data = await readFile(schemaFile);

  return query(data.toString("utf-8"));
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
  const data = await readFile(dropFile);

  return query(data.toString("utf-8"));
}

async function setup() {
  const drop = await dropSchema();

  if (drop) {
    console.info("schema dropped");
  } else {
    console.info("schema not dropped, exiting");
    poolEnd();
    return process.exit(-1);
  }

  const result = await createSchema();

  if (result) {
    console.info("schema created");
  } else {
    console.info("schema not created, exiting");
    poolEnd();
    return process.exit(-1);
  }
  const data = await readFile("./sql/insert.sql");
  const insert = await query(data.toString("utf-8"));

  if (insert) {
    console.info("data inserted");
  } else {
    console.info("data not inserted");
  }

  await poolEnd();
}

setup().catch((err) => {
  console.error("error running setup", err);
  poolEnd();
});
