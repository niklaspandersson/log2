import * as express from 'express';
import * as jwt from "jsonwebtoken";

export interface IAuthTokenPayload {
    userId: string;
    refresh: boolean;
};

export interface IAuthApiTokens {
    accessToken: string;
    refreshToken: string;
};

export default class AuthService
{
    private secret:string;

    constructor(secret:string) {
        this.secret = secret;
    }

    /// sets res.locals.auth
    authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction, expectedRefresh:boolean = false) => {
        try {
            let authHeader = req.get('authorization');
            if (!authHeader)
            {
                console.debug("auth middleware - no auth header available")
                throw new Error("401");
            }
    
            const token = authHeader.replace('Bearer ', '');
            const auth = this.checkToken(token);
            if(auth.refresh !== expectedRefresh)
            {
                console.log(`auth middleware - expected refresh = ${expectedRefresh}, found ${auth.refresh}`);
                throw new Error("401");
            }

            res.locals.auth = auth;
            next();
        }
        catch (err) {
            res.sendStatus(401);
        }
    };

    //tokens
    public checkToken(token: string):IAuthTokenPayload {
        return jwt.verify(token, this.secret) as IAuthTokenPayload;
    };

    public createTokens(userId: string):IAuthApiTokens {
        return {
            accessToken: this.createToken(userId, false),
            refreshToken: this.createToken(userId, true)
        };
    }

    //TODO: make expiresIn configurable
    private createToken(userId:string, refresh:boolean) {
        const payload:IAuthTokenPayload = { userId, refresh };
        return jwt.sign(payload, this.secret, { expiresIn: refresh ? "7 days" : "15 minutes" });
    };
}