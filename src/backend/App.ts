import express from 'express';
import * as path from "path";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

import { DBService } from "./services/DBService";
import AuthService, { IAuthApiTokens, IAuthTokenPayload } from './services/AuthService';
import UserService from "./services/UserService";
import User from '../common/models/user';
import { IPost } from '../common/models/post';

export interface IAuthApiPayload extends IAuthApiTokens {
    user: User;
};

const defaultUserModules = [
    [
        "weather",
        true
    ],
    [
        "mood",
        false
    ],
    [
        "books",
        false
    ],
    [
        "log",
        true
    ]
];

console.log(`CWD: ${process.cwd()}`);
dotenv.config();

const PORT = process.env.PORT || '8000';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_NAME = process.env.DB_NAME || "log2";
const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export class App {
    public app: express.Application;
    private port: number;
    private db: DBService;

    private authService: AuthService;
    private userService: UserService;

    constructor() {
        this.app = express();
        this.port = Number.parseInt(PORT);

        this.db = new DBService("mongodb://" + DB_HOST + ":" + DB_PORT + "/", DB_NAME);

        this.userService = new UserService(this.db, GOOGLE_CLIENT_ID);
        this.authService = new AuthService(JWT_SECRET);

        this.setupRoutes();
    }

    private setupRoutes() {
        let staticServe = express.static(path.join(__dirname, '../../public_html/'));
        this.app.use(staticServe);

        this.app.use(express.json());

        //auth
        this.app.post("/api/auth/login", async (req, res) => {
            try {
                const user = await this.userService.handleLogin(req.body.id_token);
                if(!user)
                    throw new Error("No matching user found");
                const result: IAuthApiPayload = { ...this.authService.createTokens(user._id), user };
                res.json(result);
            }
            catch (err) {
                console.error(err);
                res.sendStatus(401);
            }
        });
        this.app.post("/api/auth/refresh", (req, res, next) => this.authService.authMiddleware(req, res, next, true), async (req, res) => {
            try {
                const auth = res.locals.auth as IAuthTokenPayload;
                const user = await this.db.getUser(auth.userId);
                const result: IAuthApiPayload = { ...this.authService.createTokens(auth.userId), user };

                res.json(result);
            }
            catch (err) {
                console.error(err);
                res.sendStatus(401);
            }
        });

        //Content
        this.app.get("/api/posts", this.authService.authMiddleware, async (req: any, res) => {
            let data = await this.db.getPosts() || [];
            res.json(data);
        })
        this.app.post("/api/posts", this.authService.authMiddleware, async (req, res) => {
            let post = req.body as IPost;
            console.log(post);
            post.user = res.locals.auth.userId;
            post.created = (new Date()).toISOString();
            let data = await this.db.createPost(post);
            res.json(data);
        })
        this.app.put("/api/posts/:id/:module", this.authService.authMiddleware, async (req, res) => {
            //TODO: require that userID of post matches current user
            let data = await this.db.updatePostData(req.params.id, req.params.module, req.body);
            res.json(data);
        })

        //modules
        this.app.get("/api/modules", async (req: any, res) => {
            let data = await this.db.getModules() || [];
            res.json(data);
        })

        /* final catch-all route to index.html defined last */
        if (staticServe) {
            this.app.use('/', staticServe);
            this.app.use('*', staticServe);
        }
    }

    run() {
        this.app.listen(this.port, () => {
            console.log('Express server listening on port ' + this.port);
        })
    }
}
