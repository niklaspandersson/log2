import UserService from "../services/UserService";
import ModulesService from "../services/ModulesService";
import User from "../models/user";
import Module from "../models/module";
import Post from "../models/post";
import PostService from "../services/PostService";
import moment = require("moment");

export default class {
    private userService: UserService;
    private modulesService: ModulesService;
    private postService: PostService;

    private today:moment.Moment = null;
    public get Today() { return this.today; }

    private user:User = null;
    public get User() { return this.user; }

    private posts:Post[] = null;
    public get HasPosts() { return this.posts != null; }
    public get Posts() { return this.posts; }


    private modules:Module[] = null;
    public get Modules() { return this.modules; }

    public get HasPostToday() {
        return this.posts && !!this.posts.find(p => this.Today.isSame(((p.time as unknown) as moment.Moment), 'day'));        
    }

    constructor() {
        this.today = moment();
        this.userService = new UserService("/users");
        this.modulesService = new ModulesService("/modules");
        this.postService = new PostService("/posts");
    }

    async init() {
        let user = this.userService.get(1);
        let modules = this.modulesService.getAll();

        let res = await Promise.all([user, modules]);
        this.user = res[0];
        
        this.modules = this.getUserModules(res[1]);

        return this.modules;
    }

    async getUserPosts() {
        this.posts = await this.postService.getAll();
        this.posts.forEach(post => (post.time as moment.Moment) = moment(post.time as string));
        return this.posts;
    }

    private getUserModules(appModules:Module[]) {
        let userModules = this.user.modules.map(m => m[1] ? m[0] : null).filter(s => s !== null);
        return appModules.filter(m => userModules.find(um => um === m.key) != null )
    }
}