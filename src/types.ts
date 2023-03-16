import { Request } from 'express';

/*
CREATE TABLE public.users (
    id serial primary key,
    name CHARACTER VARYING(64) NOT NULL,
    username character varying(64) NOT NULL UNIQUE,
    password character varying(256) NOT NULL,
    admin BOOLEAN DEFAULT false
  );
*/
export type User = {
    id: number,
    name: string,
    username: string,
    password: string,
    admin: boolean
}

interface PassportRequest {
    isAuthenticated(): boolean;
  }

interface RequestWithUser extends Request {
  user?: User;
}

interface PassportRequest {
  isAuthenticated(): boolean;
}

export type CustomRequest = RequestWithUser & PassportRequest & { user?: User }

export type UserWithoutPassword = Omit<User, 'password'>;
/*  
  CREATE TABLE public.events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    slug VARCHAR(64) NOT NULL UNIQUE,
    location VARCHAR(256),
    url VARCHAR(256),
    description TEXT,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
 */
export type Event = {
    id: number,
    name: string,
    slug: string,
    description: string,
    location?: string,
    url?: string,
    created: Date,
    updated: Date,
}
export type EventDb = {
  id: number,
  name: string,
  slug: string,
  description: string,
  location?: string,
  url?: string,
  comment?: string,
  created: Date,
  updated: Date,
}
/* 
  CREATE TABLE public.registrations (
    id SERIAL PRIMARY KEY,
    comment TEXT,
    event INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event FOREIGN KEY (event) REFERENCES events (id),
    CONSTRAINT fk_userId FOREIGN KEY (userId) REFERENCES users (id)
  );
  */
 export type Registrations = {
    id: number,
    comment: string,
    created: Date,
    
 }
 export type RegistrationsDb = {
  id: number,
  event_id: number,
  comment: string,
  created: Date,
  
}