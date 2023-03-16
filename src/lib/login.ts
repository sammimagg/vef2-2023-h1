import passport, { PassportStatic } from 'passport';
import { Strategy } from 'passport-local';
import { Request, Response, NextFunction } from 'express';
import { comparePasswords, findById, findByUsername } from './users.js';
import { CustomRequest, User, UserWithoutPassword  } from '../types.js'; // Import User type from the corresponding file


async function strat(
  username: string,
  password: string,
  done: (error: any, user?: User | false) => void,
): Promise<void> {
  try {
    const user = await findByUsername(username);
    if (!user) {
      return done(null, false);
    }

    const result = await comparePasswords(password, user.password);
    return done(null, result ? user : false);
  } catch (err) {
    console.error(err);
    return done(err);
  }
}

passport.use(new Strategy(strat));

passport.serializeUser<any, any>((req, user, done) => {
  done(undefined, user);
});




passport.deserializeUser(async (id: number, done: (error: any, user?: UserWithoutPassword | null) => void) => {
  try {
    const user = await findById(id);

    if (!user) {
      return done(null, null);
    }

    const { password, ...userWithoutPassword } = user;
    done(null, userWithoutPassword);
  } catch (err) {
    done(err);
  }
});


export function ensureLoggedIn(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/login');
}

export function ensureAdmin(req: CustomRequest, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user?.admin) {
    return next();
  }

  const title = 'Síða fannst ekki';
  return res.status(404).render('error', { title });
}


export default passport as PassportStatic;