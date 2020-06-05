import * as express from "express";
import { AuthService, AuthTokenPayload } from "../services/AuthService";
import { GoogleLoginService } from "../services/GoogleLoginService";


export function authApi(loginService:GoogleLoginService, auth:AuthService, mountpoint:string) {

  const router = express.Router();

  router.post("/login", async (req, res) => {
    try {
      const user = await loginService.handleLogin(req.body.id_token);
      if (!user)
        throw new Error("No matching user found");
      const tokens = auth.createTokens({id: user.dbUser.id, name: user.profile.given_name || user.profile.name || "Anonymous" });
      auth.setRefreshTokenCookie(res, mountpoint, tokens.refreshToken);
      res.json({ accessToken: tokens.accessToken });
    }
    catch (err) {
      console.error(err);
      res.sendStatus(401);
    }
  });
  router.post("/refresh", (req, res, next) => auth.authMiddleware(req, res, next, true), async (req, res) => {
    try {
      const authPayload = res.locals.auth as AuthTokenPayload;
      const user = await loginService.userService.getUserById(authPayload.user.id);
      const tokens = auth.createTokens(authPayload.user);
      auth.setRefreshTokenCookie(res, mountpoint, tokens.refreshToken);
      res.json({ accessToken: tokens.accessToken });
    }
    catch (err) {
      console.error(err);
      res.sendStatus(401);
    }
  });

  return router;
}