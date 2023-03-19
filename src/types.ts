import { IncomingMessage } from "express";
import { DoneFunction as PassportDoneFunction } from "passport-local";

declare global {
  namespace Express {
    interface User {
      id: number;
      name: string;
      username: string;
      password: string;
      admin: boolean;
    }
  }
}
export interface CustomRequest extends IncomingMessage {
  user?: User;
}

export interface UserWithoutPassword {
  id: number;
  username: string;
  name: string;
  admin: boolean;
}

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
  id: number;
  name: string;
  username: string;
  password: string;
  admin: boolean;
  profile_picture?: string;
};

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
  id: number;
  name: string;
  slug: string;
  description: string;
  location?: string;
  url?: string;
  created: Date;
  updated: Date;
};

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
  id: number;
  comment: string;
  event: number;
  userid: number;
  created: Date;
};

export type DoneFunction = (
  error: any,
  user: UserWithoutPassword | false,
  message?: { message: string }
) => void;
export type CustomVerifyFunction = (
  username: string,
  password: string,
  done: PassportDoneFunction<UserWithoutPassword, { message: string }>
) => Promise<void>;
