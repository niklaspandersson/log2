import * as express from 'express';
import * as path from "path";

import User from "../common/models/user";
import {DBService} from "./services/DBService";
import Post from '../common/models/post';

const logModules = require('../conf/modules.json');
const defaultUserModules = require('../conf/default-user-modules.json');
const DEFAULT_PORT = 8000;

export class App
{
    public app: express.Application;
    private port: number;
    private prod:boolean;
    private db:DBService;
    
    private adminEmail:string;
    private defaultModules:any;

    constructor() {
        this.app = express();
        this.setupEnviroment();

	    this.defaultModules = defaultUserModules;
        this.db = new DBService("mongodb://localhost:27017/", "log2");
        this.setupRoutes();
    }

    private setupEnviroment() {
        this.port = Number.parseInt(process.env.PORT) || DEFAULT_PORT;

        this.prod = (process.env.NODE_ENV === 'production');
        this.app.use(this.prod ? this.prodUserMiddleware : this.devUserMiddleware)
    }

    private setupRoutes() {
        let staticServe = express.static(path.join(__dirname, '../../public_html'));
        this.app.use(staticServe);

        this.app.use(express.json());

        this.app.get("/api/user", async (req, res) => {
            let oidUser:User = (req as any).user as User;
            let dbUser = await this.db.getUser(oidUser.email);
            if(!dbUser) {
                dbUser = await this.db.createUser(oidUser, this.defaultModules);
            }

            res.json(dbUser);
        })

        //Content
        this.app.get("/api/posts", async (req:any, res) => {
            let data = await this.db.getPosts() || [];
            res.json(data);
        })
        this.app.post("/api/posts", async (req, res) => {
            let post = req.body as Post;
            post.user = (req as any).user.email;
            post.time = (new Date()).toISOString();
            let data = await this.db.createPost(post);
            res.json(data);
        })
        this.app.put("/api/posts/:id/:module", async (req, res) => {
            //TODO: require that userID of post matches current user
            let data = await this.db.updatePostData(req.params.id, req.params.module, req.body);
            res.json(data);
        })        

        //modules
        this.app.get("/api/modules", async (req:any, res) => {
            res.json(logModules);
        })

        /* final catch-all route to index.html defined last */
        if(staticServe) {
            this.app.use('/', staticServe);
            this.app.use('*', staticServe);

        }
    }

    run() {
        this.app.listen(this.port, () => {
            console.log('Express server listening on port ' + this.port);
        })
    }


    private prodUserMiddleware(req, res, next) {
        if(req.header("OIDC_access_token")) {
            let request: any = req;
            request.user = {
                name: req.header("OIDC_CLAIM_given_name"),
                fullName: req.header("OIDC_CLAIM_name"),
                email: req.header("OIDC_CLAIM_email"),
                pictureUrl: req.header("OIDC_CLAIM_picture"),
                profileUrl: req.header("OIDC_CLAIM_profile")
            };
        }
        next();
    }
    private devUserMiddleware(req, res, next) {
        let request: any = req;
        request.user = {
            name: "Niklas",
            fullName: "Niklas Andersson",
            email: "niklaspandersson.se@gmail.com",
            pictureUrl: "https://lh3.googleusercontent.com/-Y29VGDp_tiA/AAAAAAAAAAI/AAAAAAAAAAQ/G6shmElDO6M/s96-c/photo.jpg",
            profileUrl: "https://plus.google.com/108993789665707522983"
        };
        next();
    }    
}
