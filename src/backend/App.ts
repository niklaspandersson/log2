import * as express from 'express';
import * as path from "path";

import User from "../common/models/user";
import {DBService} from "./services/DBService";

const DEFAULT_PORT = 8080;

export class App
{
    public app: express.Application;
    private port: number;
    private prod:boolean;
    private db:DBService;
    
    private adminEmail:string;

    constructor() {
        this.app = express();
        this.setupEnviroment();

        this.db = new DBService("mongodb://localhost:27017/", "log2");
        this.setupRoutes();
    }

    private setupEnviroment() {
        this.port = Number.parseInt(process.env.PORT) || DEFAULT_PORT;

        this.prod = (process.env.NODE_ENV === 'production');
        this.app.use(this.prod ? this.prodUserMiddleware : this.devUserMiddleware)
    }

    private setupRoutes() {
        //serve static files from the codetutor-frontend while we're developing
        let staticServe = null;
        if(!this.prod) {
            staticServe = express.static(path.join(__dirname, '../../public_html'));
            this.app.use(staticServe);
            this.app.use(function(req, res, next) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                next();
              });
        }

        this.app.use(express.json());

        this.app.get("/api/user", async (req, res) => {
            let oidUser:User = (req as any).user as User;
            let dbUser = await this.db.getUser(oidUser.email);
            if(!dbUser) {
                dbUser = await this.db.createUser(oidUser);
            }

            res.json(dbUser);
        })

        //Content
        // this.app.get("/api/posts", async (req, res) => {
        //     let data = await this.db.getContents() || [];
        //     res.json(data);
        // })

        // this.app.post("/api/posts", async (req, res) => {
        //     let data = await this.db.createContent(req.body as IContent);
        //     res.json(data);
        // })

        // this.app.put("/api/posts/:id", async (req, res) => {
        //     let data = await this.db.updateContent(req.params.id, req.body as Partial<IContent>);
        //     res.json(data);
        // })

        /* final catch-all route to index.html defined last */
        if((!this.prod) && staticServe) {
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
            email: "niklaspandersson.se@gmail.se",
            pictureUrl: "https://lh3.googleusercontent.com/-Y29VGDp_tiA/AAAAAAAAAAI/AAAAAAAAAAQ/G6shmElDO6M/s96-c/photo.jpg",
            profileUrl: "https://plus.google.com/108993789665707522983"
        };
        next();
    }    
}