CREATE TABLE public.users (
  id serial primary key,
  name CHARACTER VARYING(64) NOT NULL,
  username character varying(64) NOT NULL UNIQUE,
  password character varying(256) NOT NULL,
  admin BOOLEAN DEFAULT false,
  profile_picture VARCHAR(128)
);

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

CREATE TABLE public.registrations (
  id SERIAL PRIMARY KEY,
  comment TEXT,
  event INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event FOREIGN KEY (event) REFERENCES events (id),
  CONSTRAINT fk_userId FOREIGN KEY (userId) REFERENCES users (id)
);