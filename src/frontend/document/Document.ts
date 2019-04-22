import LoginService from "../services/LoginService";
import ModulesService from "../services/ModulesService";
import User from "../../common/models/user";
import Module from "../../common/models/module";
import {Post, IPost} from "../../common/models/post";
import PostService from "../services/PostService";
import {Moment} from "moment";
import moment from "moment";
import { userInfo } from "os";

export default class Document {
    private loginService: LoginService;
    private modulesService: ModulesService;
    private postService: PostService;

    private today:Moment = null;
    public get Today() { return this.today; }

    private user:User = null;
    public get User() { return this.user; }

    private posts:Post[] = null;
    public get HasPosts() { return this.posts != null; }
    public get Posts() { return this.posts; }


    private modules:Module[] = null;
    public get Modules() { return this.modules; }

    public get HasPostToday() {
        return this.posts && !!this.posts.find(p => this.Today.isSame(p.time, 'day'));        
    }

    constructor() {
        this.today = moment();
        this.loginService = new LoginService("/api/login");
        this.modulesService = new ModulesService("/api/modules");
        this.postService = new PostService("/api/posts");
    }

    async init() {
        let modules = await this.modulesService.getAll();
        this.modules = this.getUserModules(modules);

        return this.modules;
    }

    async login(idToken:string) {
        let jwt = await this.loginService.login(idToken);
        this.user = Document.ExtractUser(jwt);
        this.postService.authToken = jwt;

        return this.user;
    }

    async getUserPosts() {
        //TODO: just fetch current and prevous month. Get the rest on demand
        this.posts = (await this.postService.getAll()).map(p => new Post(p));
        return this.posts;
    }
    async createPost(date:Moment, data:any) {
        return new Post(await this.postService.create({date: date.format("YYYY-MM-DD"), data}));
    }
    async updateModuleData(postId:string, mod:string, data:any) {
        return new Post(await this.postService.updateModuleData(postId, mod, data));
    }

    private getUserModules(appModules:Module[]) {
        let userModules = this.user.modules.map(m => m[1] ? m[0] : null).filter(s => s !== null);
        return appModules.filter(m => userModules.find(um => um === m.key) != null )
    }

    private static ExtractUser(jwt:string) {
        let [header,payloadStr,sign] = jwt.split(".");
        let payload:any = JSON.parse(atob(payloadStr));
        return payload.user as User;

    }
}