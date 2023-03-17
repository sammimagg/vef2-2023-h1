import express, { NextFunction, Request, Response } from 'express';
import { listEvents, getEvent, eventRoute, updateRoute } from './event-routes.js';
import passport, { ensureAdmin, ensureLoggedIn } from '../lib/login.js'
import {validationCheck, login, logout, loginSuccesful, registerSuccesful, validationCheckUpdate, registerRoute } from '../routes/users-routes.js'
import { register, registerValidation, registerGet,deleteRoute } from '../routes/users-routes.js';
import { catchErrors } from '../lib/catch-errors.js';
import { CustomRequest, User } from '../types.js';
import { registrationValidationMiddleware, xssSanitizationMiddleware,sanitizationMiddleware } from '../lib/validation.js';
export const router = express.Router();

export async function index(req: Request, res: Response) {
  return res.json([
    {
      href: '/events',
      methods: ['GET', 'POST'],
    },
    {
      href: '/events/:slug',
      methods: ['GET', 'PATCH', 'DELETE'],
    },
    {
      href: '/events/:slug/registration',
      methods: ['GET', 'POST'],
    },
    {
      href: '/signup',
      methods: ['GET', 'POST'],
    },
    {
      href: '/login',
      methods: ['GET', 'POST'],
    }
  ]);
}


router.get('/', index);
router.get('/events', listEvents);
router.get('/events/:slug', getEvent);
// router.get('CreateEvent')
router.get('/register', registerGet)
router.post('/register',registerValidation, catchErrors(validationCheck), catchErrors(register), passport.authenticate('local', {failureMessage: 'Notandanafn eða lykilorð vitlaust.'}), registerSuccesful);
router.get('/login', login);
router.post('/login', passport.authenticate('local', {failureMessage: 'Notandanafn eða lykilorð vitlaust.' }), loginSuccesful);
router.get('/logout', logout);

router.get('/admin/', ensureLoggedIn, ensureAdmin, listEvents);
router.post('/admin/', ensureLoggedIn, ensureAdmin, registrationValidationMiddleware('description'), xssSanitizationMiddleware('description'), catchErrors(validationCheck), sanitizationMiddleware('description'), catchErrors(registerRoute));

// Verður að vera seinast svo það taki ekki yfir önnur route
router.get('/admin/:slug', ensureLoggedIn, ensureAdmin, catchErrors(eventRoute));
router.post('/admin/:slug', ensureLoggedIn, ensureAdmin, registrationValidationMiddleware('description'), xssSanitizationMiddleware('description'), catchErrors(validationCheckUpdate), sanitizationMiddleware('description'), catchErrors(updateRoute));
router.post('/admin/delete/:id', ensureLoggedIn,  ensureAdmin,  catchErrors(deleteRoute));
// Möguleiki á að eyða viðburðum og auka gögn
// Paging á viðburðum
// Almennir notendur og skráning á viðburði
// Uppfærslur á pökkum og lagfæringar
// Yfirlitssíða
// Stakur viðburður
// event.html?id=1