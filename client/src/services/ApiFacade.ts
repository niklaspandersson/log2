import ModulesService from "./ModulesService";
import User from "../models/user";
import Module from "../models/module";
import {Post} from "../models/Post";
import PostService from "./PostService";
import {Moment} from "moment";
import moment from "moment";
import AuthService from "./AuthService";
import Observable from "../utils/Observable";

export default class ApiFacade {
    private authService: AuthService;
    private modulesService: ModulesService;
    private postService: PostService;

    private today:Moment = null;
    public get Today() { return this.today; }

    private readonly user:Observable<User> = new Observable<User>(null);
    public get User() { return this.user; }

    private posts:Post[] = null;
    public get HasPosts() { return this.posts != null; }
    public get Posts() { return this.posts; }

    private _modules:Module[] = null;
    public get modules() { return this._modules; }

    public get HasPostToday() {
        return this.posts && !!this.posts.find(p => this.Today.isSame(p.time, 'day'));        
    }

    constructor() {
        this.today = moment();

        this.authService = new AuthService("/api");
        this.modulesService = new ModulesService("/api/modules");
        this.postService = new PostService("/api/posts");
        this.postService.authService = this.authService;
    }

    private onUserChanged = (user:User) => {
        this.user.value = user;
    }

    init = async () => {
        this._modules = await this.modulesService.getAll();

        if(this.authService.refreshToken)
            this.onUserChanged(await this.authService.refresh());
    }

    async login(token:string) {
        this.onUserChanged(await this.authService.login(token));
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
}