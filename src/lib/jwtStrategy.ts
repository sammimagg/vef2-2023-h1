import { Strategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import dotenv from "dotenv";

import { UserWithoutPassword } from "../types.js";
import { findById } from "./users.js";
dotenv.config();

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SESSION_SECRET,
};

export const jwtStrategy = new Strategy(
  options,
  async (
    payload,
    done: (error: any, user: UserWithoutPassword | false) => void
  ) => {
    try {
      const user = await findById(payload.id);

      if (!user) {
        return done(null, false);
      }

      const userWithoutPassword: UserWithoutPassword = {
        id: user.id,
        username: user.username,
        name: user.name,
        admin: user.admin,
      };

      return done(null, userWithoutPassword);
    } catch (err) {
      return done(err, false);
    }
  }
);
