import passport, { PassportStatic } from 'passport';
import { Strategy } from 'passport-local';
import { Request, Response, NextFunction } from 'express';
import { comparePasswords, findById, findByUsername } from './users.js';
import { CustomRequest, User, UserWithoutPassword  } from '../types.js'; // Import User type from the corresponding file


export async function strat(
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

passport.serializeUser((user: any,cb) => {
cb(null,user.id);
});

passport.deserializeUser((id: number, cb) => {
  findById(id)
    .then(user => {
      if (user) {
        const userObject: User = {
          id: user.id,
          name: user.name,
          username: user.username,
          password: user.password,
          admin: user.admin
        };
        cb(null, userObject);
      } else {
        cb(null, null);
      }
    })
    .catch(err => {
      cb(err, null);
    });
});

export function ensureLoggedIn(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(403).json({ message: '401 Unauthorized, please log in' });
}

export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user?.admin) {
    return next();
  }
  return res.status(403).json({ message: '403 Forbidden, User is not Admin' });
}

export default passport as PassportStatic;