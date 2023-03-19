import { NextFunction, Request, Response } from "express";
import { createUser, findByUsername } from "../lib/users.js";
import { body, validationResult } from "express-validator";

import { User } from "../types.js";
import { listEventByName } from "../lib/db.js";
import { listEvent } from "../lib/events.js";
export async function signupRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name, username, password } = req.body;
  const userToCreate: Omit<User, "id"> = {
    name: name,
    username: username,
    password: password,
    admin: false,
  };

  const validationMessage = await validateUser(username);

  if (validationMessage) {
    return res.send(`
        <p>${validationMessage}</p>
        <a href="/register">Reyna aftur</a>
      `);
  }

  const user = await createUser(userToCreate);

  if (!user) {
    return next(new Error("Gat ekki búið til notanda"));
  }

  // næsta middleware mun sjá um að skrá notanda inn
  // `username` og `password` verða ennþá sett sem rétt í `req`
  return next();
}
async function validateUser(username: string): Promise<string | null> {
  const user = await findByUsername(username);

  // Villa frá findByUsername
  if (user === null) {
    return "Gat ekki athugað notendanafn";
  }

  if (user) {
    return "Notendanafn er þegar skráð";
  }

  return null;
}
export const signupValidation = [
  body("username")
    .isLength({ min: 1, max: 64 })
    .withMessage("Skrá verður notendanafn, hámark 64 stafir."),
  body("name")
    .isLength({ min: 1, max: 64 })
    .withMessage("Skrá verður nafn, hámark 64 stafir."),
  body("password")
    .isLength({ min: 10, max: 256 })
    .withMessage("Skrá verður lykilorð, lágmark 10 stafir."),
  body("username").custom(async (username) => {
    const user = await findByUsername(username);
    if (user) {
      return Promise.reject(new Error("Notendanafn er þegar skráð."));
    }
    return Promise.resolve();
  }),
];
export async function validationCheck(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name, username } = req.body;

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const data = {
      name,
      username,
    };
    if (!data) return res.status(500);

    return res.status(400).json(validation);
  }

  return next();
}
export async function signupGet(req: Request, res: Response) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  return res.render("register", {
    title: "Nýskráning — Viðburðasíðan",
    data: {},
    errors: [],
  });
}
export function login(req: Request, res: Response) {
  if (req.isAuthenticated()) {
    return res.status(403).json({ message: "You are already logged in." });
  }
  return res.status(200).json({ message: "Login succesful" });
}
export async function logout(req: Request, res: Response, next: NextFunction) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res
      .status(200)
      .json({ message: "You have been logged out successfully." });
  });
}
export function loginSuccesful(res: Response) {
  res.status(200).json({ message: "Log in succesful" });
}
export function signupSuccesful(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(200).json({ message: "Sign up succesful" });
}
export async function validationCheckUpdate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name, description } = req.body;
  const { slug } = req.params;

  const event = await listEvent(slug);

  const data = {
    name,
    description,
  };
  if (!data) return;

  const validation = validationResult(req);

  const customValidations: any[] = [];

  const eventNameExists = await listEventByName(name);
  if (event === null) {
    return;
  }

  if (eventNameExists !== null && eventNameExists.id !== event.id) {
    customValidations.push({
      param: "name",
      msg: "Viðburður með þessu nafni er til",
    });
  }

  if (!validation.isEmpty() || customValidations.length > 0) {
    return;
  }

  return next();
}
