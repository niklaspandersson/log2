import * as express from 'express';
import * as jwt from "jsonwebtoken";
import { UserInfo } from '../models/user';

export interface AuthTokenPayload {
  user: UserInfo;
  refresh: boolean;
};

export interface AuthApiTokens {
  accessToken: string;
  refreshToken: string;
};

type CreateTokensOptions = {
  accessExpiresIn?: string;
  refreshExpiresIn?: string;
};

const REFRESH_COOKIE_NAME = "jwt_refresh";

export class AuthService {
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  /// sets res.locals.auth
  authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction, refresh: boolean = false) => {
    try {
      const token = refresh ? this.getTokenFromCookie(req) : this.getTokenFromHeader(req);
      const payload = this.checkToken(token);
      if (payload.refresh !== refresh) {
        console.log(`auth middleware - expected refresh = ${refresh}, found ${payload.refresh}`);
        throw new Error("401");
      }

      res.locals.auth = payload;
      next();
    }
    catch (err) {
      res.sendStatus(401);
    }
  };

  public setRefreshTokenCookie(res:express.Response<any>, path:string, token:string) {
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      signed: true,
      maxAge: (7 * 60*60*24 - 60*60)*1000,
      path
    })    
  }

  private getTokenFromCookie(req:express.Request<any>) {
    return req.signedCookies[REFRESH_COOKIE_NAME] as string;
  }

  private getTokenFromHeader(req:express.Request<any>) {
    let authHeader = req.get('authorization');
    if (!authHeader) {
      console.debug("auth middleware - no auth header available")
      throw new Error("401");
    }
    return authHeader.replace('Bearer ', '');
  }

  //tokens
  public checkToken(token: string): AuthTokenPayload {
    return jwt.verify(token, this.secret) as AuthTokenPayload;
  };

  public createTokens(user:UserInfo, options?: CreateTokensOptions): AuthApiTokens {
    options = { refreshExpiresIn: "7 days", accessExpiresIn: "15 minutes", ...options};
    return {
      accessToken: this.createToken({user, refresh: false}, options),
      refreshToken: this.createToken({user, refresh: true}, options)
    };
  }

  private createToken(payload: AuthTokenPayload, options: CreateTokensOptions) {
    return jwt.sign(payload, this.secret, { expiresIn: payload.refresh ? options.refreshExpiresIn : options.accessExpiresIn });
  };
}