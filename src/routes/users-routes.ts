import { NextFunction, Request, Response } from 'express';
import { createUser, findByUsername } from '../lib/users.js';
import { body, validationResult } from 'express-validator';
import { catchErrors } from '../lib/catch-errors.js';
import { User } from '../types.js';
export async function register(req: Request, res: Response, next: NextFunction) {
    const { name, username, password } = req.body;
    const userToCreate: Omit<User, 'id'>  = {
      name: name,
      username: username,
      password: password,
      admin: false,
    }

    const validationMessage = await validateUser(username, password);
  
    if (validationMessage) {
      return res.send(`
        <p>${validationMessage}</p>
        <a href="/register">Reyna aftur</a>
      `);
    }

  
    const user = await createUser(userToCreate);
  
    if (!user) {
      return next(new Error('Gat ekki búið til notanda'));
    }
  
    // næsta middleware mun sjá um að skrá notanda inn
    // `username` og `password` verða ennþá sett sem rétt í `req`
    return next();
  }
  async function validateUser(username: string, password: string): Promise<string | null> {

    const user = await findByUsername(username);
  
    // Villa frá findByUsername
    if (user === null) {
      return 'Gat ekki athugað notendanafn';
    }
  
    if (user) {
      return 'Notendanafn er þegar skráð';
    }
  

  
    return null;
  }
  export const registerValidation = [
    body('username')
      .isLength({ min: 1, max: 64 })
      .withMessage('Skrá verður notendanafn, hámark 64 stafir.'),
    body('name')
      .isLength({ min: 1, max: 64 })
      .withMessage('Skrá verður nafn, hámark 64 stafir.'),
    body('password')
      .isLength({ min: 10, max: 256 })
      .withMessage('Skrá verður lykilorð, lágmark 10 stafir.'),
    body('username').custom(async (username) => {
      const user = await findByUsername(username);
      if (user) {
        return Promise.reject(new Error('Notendanafn er þegar skráð.'));
      }
      return Promise.resolve();
    }),
  ];

  export async function validationCheck(req: Request, res: Response, next: NextFunction) {
    const { name, username } = req.body;
  
    const validation = validationResult(req);
  
    if (!validation.isEmpty()) {
      const data = {
        name,
        username,
      };
  
      return res.status(400).json(validation);
    }
  
    return next();
  }
  export async function registerGet(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
  
    return res.render('register', {
      title: 'Nýskráning — Viðburðasíðan',
      data: {},
      errors: [],
    });
  }
  