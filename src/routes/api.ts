import express, { NextFunction, Request, Response } from 'express';
import { listEvents, getEvent } from './event-routes.js';
import passport from '../lib/login.js';
import {validationCheck, login } from '../routes/users-routes.js'
import { register, registerValidation, registerGet } from '../routes/users-routes.js';
import { catchErrors } from '../lib/catch-errors.js';
import { CustomRequest, User } from '../types.js';
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

router
  .get('/register', registerGet)
  .post(
    '/register',
    registerValidation,
    catchErrors(validationCheck),
    catchErrors(register),
    passport.authenticate('local', {
      failureMessage: 'Notandanafn eða lykilorð vitlaust.',
      failureRedirect: '/login',
    }),
    (req: Request, res: Response, next: NextFunction) => {
      console.log('test');
      res.json('T'); // Hér vantar
    },
  );

router.get('/login', login);
router.post(
  '/login',

  // Þetta notar strat úr lib/passport.js
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.'  }),

  // Ef við komumst hingað var notandi skráður inn
  (req: Request, res: Response, next: NextFunction) => {
    if (req.hasOwnProperty('authError')) {
      return res.status(401).json({ message: req.statusMessage});
    }
    res.json("Skráður inn")
  }
);
router.get('/logout', async (req: Request, res: Response, next: NextFunction) => {
  // logout hendir session cookie og session
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.json("Logout")
  });
});


// Möguleiki á að eyða viðburðum og auka gögn
// Paging á viðburðum
// Almennir notendur og skráning á viðburði
// Uppfærslur á pökkum og lagfæringar
// Yfirlitssíða
// Stakur viðburður
// event.html?id=1