import UserService from "../services/UserService";
import ModulesService from "../services/ModulesService";
import User from "../../common/models/user";
import Module from "../../common/models/module";
import {Post, IPost} from "../../common/models/post";
import PostService from "../services/PostService";
import {Moment} from "moment";
import moment from "moment";

export default class {
    private userService: UserService;
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
        this.userService = new UserService("/api/user");
        this.modulesService = new ModulesService("/api/modules");
        this.postService = new PostService("/api/posts");
    }

    async init() {
        let user = this.userService.get();
        let modules = this.modulesService.getAll();

        let res = await Promise.all([user, modules]);
        this.user = res[0];
        
        this.modules = this.getUserModules(res[1]);

        return this.modules;
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
}