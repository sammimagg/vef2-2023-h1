import { Strategy as LocalStrategy } from "passport-local";
import {
  User,
  UserWithoutPassword,
  CustomVerifyFunction,
  DoneFunction,
} from "../types.js";
import { findByUsername, comparePasswords } from "./users.js";

const strategyCallback: CustomVerifyFunction = async (
  username: string,
  password: string,
  done: DoneFunction
) => {
  const user: User | boolean = await findByUsername(username);

  if (!user) {
    return done(null, false, { message: "Incorrect username." });
  }

  const isValidPassword = await comparePasswords(password, user.password);
  if (!isValidPassword) {
    return done(null, false, { message: "Incorrect password." });
  }

  const userWithoutPassword: UserWithoutPassword = {
    id: user.id,
    username: user.username,
    name: user.name,
    admin: user.admin,
  };

  return done(null, userWithoutPassword);
};

const strategy = new LocalStrategy(
  { usernameField: "username", passwordField: "password" },
  strategyCallback
);
export default strategy;
