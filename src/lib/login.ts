import passport, { PassportStatic } from "passport";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import { comparePasswords, findById, findByUsername } from "./users.js";
import { User, UserWithoutPassword } from "../types.js"; // Import User type from the corresponding file
import jwt, { JwtPayload } from "jsonwebtoken";
import strategy from "./localStrategy.js";
dotenv.config();
const sessionSecret = process.env.SESSION_SECRET;

export async function strat(
  username: string,
  password: string,
  done: (
    error: any,
    user?: string | false,
    message?: string | undefined
  ) => void
): Promise<void> {
  try {
    const user = await findByUsername(username);
    if (!user) {
      return done(null, false, "Incorrect username");
    }

    const result = await comparePasswords(password, user.password);
    if (result) {
      const userWithoutPassword: UserWithoutPassword = {
        id: user.id,
        name: user.name,
        username: user.username,
        admin: user.admin,
      };

      const token = generateJwtToken(userWithoutPassword);
      return done(null, token, "Logged in successfully");
    } else {
      return done(null, false, "Incorrect password");
    }
  } catch (err) {
    console.error(err);
    return done(err);
  }
}

function generateJwtToken(user: UserWithoutPassword): string {
  const payload = {
    id: user.id,
    username: user.username,
    admin: user.admin,
  };

  const secret = process.env.SESSION_SECRET || "your-secret-key";

  const options = {
    expiresIn: "24h", // Token expiration time (e.g., 24 hour)
  };

  return jwt.sign(payload, secret, options);
}

passport.use(strategy);

passport.serializeUser((user: any, cb) => {
  cb(null, 1);
});

passport.deserializeUser((id: number, cb) => {
  findById(id)
    .then((user) => {
      if (user) {
        const userObject: User = {
          id: 1,
          name: user.name,
          username: user.username,
          password: user.password,
          admin: user.admin,
        };
        cb(null, userObject);
      } else {
        cb(null, null);
      }
    })
    .catch((err) => {
      cb(err, null);
    });
});

export function ensureLoggedIn(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(403).json({ message: "401 Unauthorized, please log in" });
}

export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user?.admin) {
    return next();
  }
  return res.status(403).json({ message: "403 Forbidden, User is not Admin" });
}
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as UserWithoutPassword;
  const accessToken = generateJwtToken(user);

  res.status(200).json({
    user_id: user.id,
    username: user.username,
    isAdmin: user.admin,
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 2400,
  });
}
const isUser = (payload: string | JwtPayload): payload is User => {
  return typeof (payload as User).id !== "undefined";
};
export const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, sessionSecret as jwt.Secret, {
      complete: true,
    }) as { payload: string | JwtPayload };
    if (isUser(decoded.payload)) {
      req.user = decoded.payload;
      next();
    } else {
      return res.status(401).json({ message: "Invalid payload" });
    }
  } catch (err) {
    console.log("Error during token verification:", err);
    return res.status(401).json({ message: "Failed to authenticate token" });
  }
};
export function checkTokenExpiration(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!sessionSecret)
    return res.status(500).json({ error: "No session secret" });
  jwt.verify(token, sessionSecret, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(500).json({ message: "Internal server error" });
    }

    req.user = decoded as User;
    next();
  });
}

export default passport as PassportStatic;
//
