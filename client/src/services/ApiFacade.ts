import ModulesService from "./ModulesService";
import User from "../models/user";
import Module from "../models/module";
import {Post} from "../models/Post";
import PostService from "./PostService";
import {Moment} from "moment";
import AuthService from "./AuthService";
import Observable from "../utils/Observable";

export default class ApiFacade {
    private authService: AuthService;
    private modulesService: ModulesService;
    private postService: PostService;

    private readonly user:Observable<User> = new Observable<User>(null);
    public get User() { return this.user; }

    private _modules:Module[] = null;
    public get modules() { return this._modules; }

    constructor() {
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
        return (await this.postService.getAll()).map(p => new Post(p));
    }
    async createPost(date:Moment, data:any) {
        return new Post(await this.postService.create({date: date.format("YYYY-MM-DD"), data}));
    }
    async updateModuleData(postId:string, mod:string, data:any) {
        return new Post(await this.postService.updateModuleData(postId, mod, data));
    }
}