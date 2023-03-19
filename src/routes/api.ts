import express, { NextFunction, Request, Response } from "express";
import {
  listEvents,
  getEvent,
  eventRoute,
  updateEventRoute,
  deleteEvent,
  createEventRoute,
} from "./event-routes.js";
import passport, {
  ensureAdmin,
  ensureLoggedIn,
  ensureAuthenticated,
  checkTokenExpiration,
} from "../lib/login.js";
import {
  validationCheck,
  logout,
  signupSuccesful,
  signupRoute,
  signupValidation,
} from "../routes/users-routes.js";
import { catchErrors } from "../lib/catch-errors.js";
import { body } from "express-validator";
import xss from "xss";
import { authMiddleware } from "../lib/login.js";
import {
  registrationValidationMiddleware,
  xssSanitizationMiddleware,
  sanitizationMiddleware,
} from "../lib/validation.js";
import { registerToEventRoute, registerUsesrToEventRoute } from "./registration-routes.js";
import { uploadImage } from "./images.js";

//import app from '..app.js/'

export const router = express.Router();

export async function index(req: Request, res: Response, next: NextFunction) {
  return res.json([
    {
      href: "/signup",
      methods: ["POST"],
      response: ["200 OK", "400 Bad request"],
      description:
        "To register a new user, be default user has no admin privileges. Example to be put in body for post request",
      example_body: {
        name: "Samúel Magnússon",
        username: "sammi",
        password: "12345678910",
      },
    },
    {
      href: "/login",
      methods: ["POST"],
      response: ["200 OK", "400 Bad request", "401 Unauthorized"],
      description:
        "To login as a user/admin. You will be given accesstoken and token type in response. Save the accesstoken to make autherized request for JWT Bearer. Example to be put in body for POST request",
      example_body: {
        username: "sammi",
        password: "12345678910",
      },
    },
    {
      href: "/logout",
      methods: ["GET"],
      response: ["200 OK"],
      description:
        "Logs user our and removes the session, the old accesstoken will expire in 1hour",
    },
    {
      href: "/events",
      methods: ["GET"],
      response: ["200 OK"],
      description: "Returns a list of all events",
    },
    {
      href: "/events/:slug",
      methods: ["GET", "POST"],
      response: ["200 OK", "404 Not found", "409 Conflict"],
      description:
        "GET to get specific event by slug or POST to register for a event. You will get conflict if you are already register for that event",
      authorization: "TYPE: Bearer Token. TOKEN:hashed string",
      privileges: "User, Admin",
    },
    {
      href: "/admin",
      methods: ["GET"],
      response: ["200 OK", "401 unauthorized", "403 Forbidden"],
      description:
        "returns list of all events, user needs to have Bearer Token in Autherization and admin",
      authorization: "TYPE: Bearer Token. TOKEN:hashed string",
      privileges: "Admin",
    },
    {
      href: "/admin/:slug",
      methods: ["POST", "PATCH"],
      response: [
        "200 OK",
        "404 Not found",
        "400 Bad Request",
        "500 Internal Error",
      ],
      description:
        "POST to create new event and PATCH to update event. User needs to have Bearer Token in Autherization and admin",
      authorization: "TYPE: Bearer Token. TOKEN:hashed string",
      privileges: "Admin",
      example_body: {
        name: "prufa",
        description: "Prufa",
        location: "prufa",
        url: "prufa",
      },
    },
    {
      href: "/admin/:slug/register",
      methods: ["POST"],
      response: ["200 OK","404 Not found"],
      description:
        "POST to get all user registered to event/:slug",
      authorization: "TYPE: Bearer Token. TOKEN:hashed string",
      privileges: "Admin",
      example_responde: [
        {
            "id": 2,
            "name": "User",
            "username": "user",
            "password": "$2b$11$lO6A/nVVIH/T5e2xkWhJmuSormWYwniUBiKHHLIGp27rSozcgypUe",
            "admin": true,
            "profile_picture": null
        },
        {
            "id": 3,
            "name": "Forvitinn forritari",
            "username": "forritari",
            "password": "$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii",
            "admin": false,
            "profile_picture": null
        },
        {
            "id": 4,
            "name": "Jón Jónsson",
            "username": "jonjons",
            "password": "$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii",
            "admin": false,
            "profile_picture": null
        }
    ]
    },
    {
      href: "/admin/:delete/:slug",
      methods: ["DELETE"],
      response: ["200 OK", "404 Not found", "400 Bad Request"],
      description:
        "To delete event by slug. User needs to have Bearer Token in Autherization and admin. No need for anything in body",
      authorization: "TYPE: Bearer Token. TOKEN:hashed string",
      privileges: "Admin",
    },
    {
      href: "/users/:id/profile-picture",
      methods: ["PUT"],
      response: ["200 OK", "401 unauthorized", "500 Internal Error"],
      description:
        "Upload profile picture for a user. User needs to be logged in. Only JPG and PNG allowed and fileSize: 50 * 2024 * 1024",
      authorization: "TYPE: Bearer Token. TOKEN:hashed string",
      privileges: "User, Admin",
      example_body: "form-data: KEY=images,VALUE=local path to picture.",
      example_response: {
        id: 15,
        name: "user",
        username: "user",
        password: "Hashed password",
        admin: false,
        profile_picture:
          "http://res.cloudinary.com/dxjolxcx7/image/upload/v1679249054/images/slod.png",
      },
    },
  ]);
}

// API document[200 OK]
router.get("/", index);

// Signup for new users [200 OK], [400 Bad Request]
router.post(
  "/signup",
  signupValidation,
  catchErrors(validationCheck),
  catchErrors(signupRoute),
  passport.authenticate("local", { failureFlash: true }),
  signupSuccesful
);
// Login for users[200 OK], [400 Bad Request]
router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  authMiddleware
);
// Log out for users [200 OK]
router.get("/logout", logout);
// List all events [200 OK]
router.get("/events", listEvents);
// Gets event by slug [200 OK], [404 Not Found]
router.get("/events/:slug", getEvent);
// User Register to event [200 OK], [400 Bad Request]
router.post(
  "/events/:slug",
  checkTokenExpiration,
  ensureAuthenticated,
  ensureLoggedIn,
  body("comment")
    .isLength({ max: 400 })
    .withMessage("Athugasemd má að hámarki vera 400 stafir"),
  body("comment").customSanitizer((v) => xss(v)),
  body("comment").trim().escape(),
  registerToEventRoute
);
// Admin list of events [200 OK]
router.get(
  "/admin/",
  checkTokenExpiration,
  ensureAuthenticated,
  ensureLoggedIn,
  ensureAdmin,
  listEvents
);
// Gets event by slug. [200 OK], [400 Bad Request]
router.get(
  "/admin/:slug",
  ensureAuthenticated,
  ensureLoggedIn,
  ensureAdmin,
  catchErrors(eventRoute)
);
// Gets register to event by slug. [200 OK], [400 Bad Request]
router.get(
  "/admin/:slug/register",
  ensureAuthenticated,
  ensureLoggedIn,
  ensureAdmin,
  catchErrors(registerUsesrToEventRoute)
);
// [200 OK], [400 Bad Request]
router.post(
  "/admin/",
  checkTokenExpiration,
  ensureAuthenticated,
  ensureLoggedIn,
  ensureAdmin,
  registrationValidationMiddleware("description"),
  xssSanitizationMiddleware("description"),
  sanitizationMiddleware("description"),
  createEventRoute
);
// [200 OK], [404 Not Found], [500 Internal Error]
router.delete(
  "/admin/delete/:slug",
  checkTokenExpiration,
  ensureAuthenticated,
  ensureLoggedIn,
  ensureAdmin,
  deleteEvent
);
// [200 OK], [404 Not Found], [500 Internal Error]
router.patch(
  "/admin/:slug",
  checkTokenExpiration,
  ensureAuthenticated,
  ensureLoggedIn,
  ensureAdmin,
  updateEventRoute
);
router.put(
  "/users/:id/profile-picture",
  checkTokenExpiration,
  ensureAuthenticated,
  ensureLoggedIn,
  uploadImage
);
