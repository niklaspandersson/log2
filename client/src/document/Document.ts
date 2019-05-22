import ModulesService from "../services/ModulesService";
import User from "../models/user";
import Module from "../models/module";
import {IPost} from "../models/IPost";
import {Post} from "../models/Post";
import PostService from "../services/PostService";
import {Moment} from "moment";
import moment from "moment";
import AuthService from "../services/AuthService";
import {IAppState} from "../Application";

interface IApp<S,P> {
    state:S;
    setState<K extends keyof S>(
        state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
        callback?: () => void
    ): void;

}
export default class Document {
    private app:IApp<IAppState,{}>;
    private authService: AuthService;
    private modulesService: ModulesService;
    private postService: PostService;

    private today:Moment = null;
    public get Today() { return this.today; }

    private user:User = null;
    public get User() { return this.user; }

    private posts:Post[] = null;
    public get HasPosts() { return this.posts != null; }
    public get Posts() { return this.posts; }

    private onExternalUserChanged:(user:User) => void;

    private allModules:Module[] = null;

    private modules:Module[] = null;
    public get Modules() { return this.modules; }

    public get HasPostToday() {
        return this.posts && !!this.posts.find(p => this.Today.isSame(p.time, 'day'));        
    }

    constructor(app:IApp<IAppState,{}>) {
        this.app = app;
        //this.onExternalUserChanged = onUserChanged;

        this.today = moment();

        this.authService = new AuthService("/api");

        this.modulesService = new ModulesService("/api/modules");

        this.postService = new PostService("/api/posts");
        this.postService.authService = this.authService;
    }

    onUserChanged = (user:User) => {
        this.user = user;
        this.onExternalUserChanged(user);
        this.modules = user ? this.getUserModules() : [];
    }

    init = async () => {
        this.allModules = await this.modulesService.getAll();

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

    private getUserModules() {
        let userModules = this.user.modules.map(m => m[1] ? m[0] : null).filter(s => s !== null);
        return this.allModules.filter(m => userModules.find(um => um === m.key) != null )
    }
}