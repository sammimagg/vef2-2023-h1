import { listEventBySlug } from "./db.js";
import { Event } from "../types.js";
import { body, validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';
import { deleteEventBySlug } from "./db.js";
import { slugify } from '../lib/slugify.js';

export async function listEvent(slug: string): Promise<Event | null> {
    const result =  listEventBySlug(slug);
    return result;
}
