import express, {
  NextFunction,
  Request,
  Response 
} from 'express';
import { 
  listEvents,
  getEvent,
  eventRoute,
  updateEventRoute,
  indexRoute, 
  deleteEvent,
  createEventRoute
} from './event-routes.js';
import passport, { 
  ensureAdmin,
  ensureLoggedIn,
  ensureAuthenticated 
} from '../lib/login.js'
import {
  validationCheck, 
  login,
  logout, 
  loginSuccesful,
  signupSuccesful, 
  validationCheckUpdate,
  signupRoute,
  signupValidation, 
  signupGet
} from '../routes/users-routes.js'
import { 
  catchErrors 
} from '../lib/catch-errors.js';
import { 
  body,
  validationResult 
} from 'express-validator';
import xss from 'xss';
import { 
  authMiddleware 
} from '../lib/login.js';
import { 
  registrationValidationMiddleware,
  xssSanitizationMiddleware,
  sanitizationMiddleware 
} from '../lib/validation.js';
import { registerToEventRoute } from './registration-routes.js';

export const router = express.Router();


export async function index(req: Request, res: Response) {
  return res.json([
    {
      href: '/signup',
      methods: ['POST'],
      response: ['200 OK', '400 Bad request'],
      description: 'To register a new user, be default user has no admin privileges. Example to be put in body for post request',
      example_body: {
        "name": "Samúel Magnússon",
        "username": "sammi",
        "password": "12345678910"
    }

    },
    {
      href: '/login',
      methods: ['POST'],
      response: ['200 OK', '400 Bad request', '401 Unauthorized'],
      description: 'To login as a user/admin. You will be given accesstoken and token type in response. Save the accesstoken to make autherized request for JWT Bearer. Example to be put in body for POST request',
      example_body: {
        "username": "sammi",
        "password": "12345678910"
    }
    },
    {
      href: '/logout',
      methods: ['GET'],
      response: ['200 OK',],
      description: 'Logs user our and removes the session, the old accesstoken will expire in 1hour'
    },
    {
      href: '/events',
      methods: ['GET'],
      response: ['200 OK',],
      description: 'Returns a list of all events'
    },
    {
      href: '/events/:slug',
      methods: ['GET','POST'],
      response: ['200 OK', '404 Not found', '409 Conflict'],
      description: 'GET to get specific event by slug or POST to register for a event, user needs to logged in and have Bearer Token in Autherization. You will get conflict if you are already register for that event'

    },
    {
      href: '/admin',
      methods: ['GET'],
      response: ['200 OK', '401 unauthorized', '403 Forbidden'],
      description: 'returns list of all events, user needs to have Bearer Token in Autherization and admin'
    },
    {
      href: '/admin/:slug',
      methods: ['POST', 'PATCH'],
      response: ['200 OK', '404 Not found','400 Bad Request','500 Internal Error'],
      description: 'POST to create new event and PATCH to update event. User needs to have Bearer Token in Autherization and admin',
      example_body: {
        "name": "prufa",
        "description": "Prufa",
        "location": "prufa",
        "url": "prufa"
    }
    },
    {
      href: '/admin/:delete/:slug',
      methods: ['DELETE'],
      response: ['200 OK', '404 Not found','400 Bad Request'],
      description: 'To delete event by slug. User needs to have Bearer Token in Autherization and admin. No need for anything in body'
    }

  ]);
}

// API document[200 OK]
router.get('/', index);

// Signup for new users [200 OK], [400 Bad Request]
router.post( '/signup', signupValidation,  catchErrors(validationCheck),  catchErrors(signupRoute),  passport.authenticate('local', {failureMessage: 'Notandanafn eða lykilorð vitlaust.'}), signupSuccesful);
// Login for users[200 OK], [400 Bad Request]
router.post( '/login',  passport.authenticate('local', { session: false }),  authMiddleware);
// Log out for users [200 OK]
router.get( '/logout', logout);
// List all events [200 OK]
router.get('/events', listEvents);
// Gets event by slug [200 OK], [404 Not Found]
router.get('/events/:slug', getEvent);
// User Register to event [200 OK], [400 Bad Request]
router.post( '/events/:slug', ensureAuthenticated,ensureLoggedIn,body('comment').isLength({ max: 400 }).withMessage('Athugasemd má að hámarki vera 400 stafir'), body('comment').customSanitizer((v) => xss(v)), body('comment').trim().escape(),registerToEventRoute);
// Admin list of events [200 OK]
router.get( '/admin/', ensureAuthenticated, ensureLoggedIn, ensureAdmin, listEvents);
// Gets event by slug. [200 OK], [400 Bad Request]
router.get( '/admin/:slug', ensureAuthenticated, ensureLoggedIn, ensureAdmin, catchErrors(eventRoute));
// [200 OK], [400 Bad Request]
router.post( '/admin/', ensureAuthenticated, ensureLoggedIn, ensureAdmin, registrationValidationMiddleware('description'), xssSanitizationMiddleware('description'), sanitizationMiddleware('description'), createEventRoute);
// [200 OK], [404 Not Found], [500 Internal Error]
router.delete( '/admin/delete/:slug',ensureAuthenticated, ensureLoggedIn, ensureAdmin,  deleteEvent);

router.patch('/admin/:slug',ensureAuthenticated, ensureLoggedIn, ensureAdmin, updateEventRoute);
// Möguleiki á að eyða viðburðum og auka gögn
// Paging á viðburðum
// Almennir notendur og skráning á viðburði
// Uppfærslur á pökkum og lagfæringar
// Yfirlitssíða
// Stakur viðburður
// event.html?id=1