import express from 'express';
import * as path from "path";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";

import { DBService } from "./services/DBService";
import { IPost } from '../common/models/post';

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
const DB_HOST = process.env.DB_HOST || process.env.HOST_IP || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_NAME = process.env.DB_NAME || "log2";
const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export class App {
    public app: express.Application;
    private port: number;
    private db: DBService;
    private oauth2Client: OAuth2Client;

    private adminEmail: string;
    private defaultModules: any;

    constructor() {
        this.authMiddleware = this.authMiddleware.bind(this);
        this.oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

        this.app = express();
        this.port = Number.parseInt(PORT);

        this.defaultModules = defaultUserModules;
        this.db = new DBService("mongodb://" + DB_HOST + ":" + DB_PORT + "/", DB_NAME);
        
        this.setupRoutes();
    }

    private setupRoutes() {
        let staticServe = express.static(path.join(__dirname, '../../public_html/'));
        this.app.use(staticServe);

        this.app.use(express.json());

        this.app.post("/api/login", async (req, res) => {

            try {
                let token = req.body.id_token;
                let profile = await this.verifyGoogleIdToken(token);

                let profileUser = {
                    fullName: profile["name"],
                    name: profile["given_name"],
                    pictureUrl: profile["picture"],
                    email: profile["email"],
                    modules: undefined
                };

                if(profileUser.email !== "niklaspandersson.se@gmail.com")
                    throw new Error("Unauthorized user");

                let dbUser = null;
                try
                {
                    dbUser = await this.db.getUser(profile["email"]);
                    if (!dbUser) {
                        dbUser = await this.db.createUser(profileUser, this.defaultModules);
                    }
                }
                catch(err) {
                    console.log(err);
                    console.log("failed to access database - continuing anyway");
                }

                let awtUser = dbUser || {...profileUser, modules: this.defaultModules};
                res.json({token: this.createToken(awtUser)});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(401);
            }
        })

        //Content
        this.app.get("/api/posts", this.authMiddleware, async (req: any, res) => {
            let data = await this.db.getPosts() || [];
            res.json(data);
        })
        this.app.post("/api/posts", this.authMiddleware, async (req, res) => {
            let post = req.body as IPost;
            console.log(post);
            post.user = res.locals.user.email;
            post.created = (new Date()).toISOString();
            let data = await this.db.createPost(post);
            res.json(data);
        })
        this.app.put("/api/posts/:id/:module", this.authMiddleware, async (req, res) => {
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

    private authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            let user = this.checkToken(req);
            res.locals.user = user;
            next();
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    };

    //google sign-in
    private async verifyGoogleIdToken(token: string) {
        const ticket = await this.oauth2Client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID
        });

        return ticket.getPayload();
    }

    //tokens
    private checkToken(req: express.Request) {
        let authHeader = req.get('authorization');
        if (!authHeader)
            throw new Error("401");

        const token = authHeader.replace('Bearer ', '');
        return jwt.verify(token, JWT_SECRET);
    };

    private createToken(user: any) {
        return jwt.sign({
            user
        }, JWT_SECRET, { expiresIn: "2 days" });
    };
}
