import { useRef, useEffect, useReducer, useMemo } from "react";
import ApiFacade from  "../services/ApiFacade";
import { Post } from "../models/Post";
import moment, { Moment } from "moment";
import User from "../models/user";
import Module from "../models/module";

type ViewMode = "journal" | "new-post" | string;

export interface IAppState {
    today: Moment;
    isMenuVisible: boolean;
    isLoggedIn: boolean;
    view: ViewMode;
    user: User | null;
    posts: Post[];
    modules: Module[];
    hasPostToday: boolean;
    currentPost?: Post | Moment | null;
}

function appReducer(state:IAppState, action:{type:string, post?:Post, date?:Moment, user?:User, posts?: Post[], hasPostToday?:boolean, modules?:Module[]}) 
{
    function newState(values:Partial<IAppState>) {
        return {...state, ...values};
    }
    
    let change: Partial<IAppState>|null = null;
    switch(action.type) {
        case 'update-user':
          change = {user: action.user, isLoggedIn: !!action.user, isMenuVisible: false, posts: action.posts, modules: action.modules, view: action.hasPostToday ? "journal" : "new-post"};
          break;
        case 'show-menu':
          change = {isMenuVisible: true };
          break;
        case 'hide-menu':
          change = {isMenuVisible: false };
          break;
        case 'show-journal':
          change = {view: "journal", currentPost: null };
          break;
        case 'add-post':
          change = {posts: [...state.posts, action.post]};
          break;
        case 'open-post':
          change = {currentPost: action.post, view: action.post._id };
          break;
        case 'save-post':
          {
              let posts = [...state.posts];
              const index = posts.findIndex(p => p._id === action.post._id);
              posts[index] = action.post;
              change = {posts};
              break;
            }

        case 'show-create-post':
          change = {currentPost: action.date, view: "new-post" };
          break;

        default:
            throw new Error('AppReducer - Invalid action type');
    }

    return newState(change);
}

export interface IDocument {
    login: (token:string) => Promise<void>,
    showMenu: () => void,
    hideMenu: () => void,
    showJournal: () => void,
    openPost: (post:Post) => void,
    createNewPost: (data:any) => Promise<Post>,
    saveLog: (id:string, data:any) => Promise<Post>,
    saveModule: (postId:string, key:string, data:any) => Promise<Post>,
    showCreatePostWizard: (date:Moment) => void,
    loadPrevMonth: () => void,
    loadNextMonth: () => void
};

export default function useDocument():[Readonly<IAppState>,IDocument] {
    const [state, dispatch] = useReducer(appReducer, {
        today: moment(),
        isMenuVisible: false,
        isLoggedIn: false,
        modules: [],
        posts: null,
        user: null,
        hasPostToday: false,
        view: "journal"
    });
    
    const apiRef = useRef(new ApiFacade());
    const api = apiRef.current;
    useEffect(() => {
        api.init();
        api.User.removeAllListeners();
        api.User.addListener(async (user:User) => {
            const posts = await api.getUserPosts();
            const hasPostToday = posts.find(p => state.today.isSame(p.time, 'day')) != null;
            
            let userModules = user.modules.map(m => m[1] ? m[0] : null).filter(s => s !== null);
            const modules = api.modules.filter(m => userModules.find(um => um === m.key) != null )

            dispatch({type: 'update-user', user, posts, hasPostToday, modules});
        })
    }, [api, dispatch, state.today]);

    const document = useMemo(() => {
        return {
            login: (token:string) => api.login(token),
            showMenu: () => dispatch({type: 'show-menu'}),
            hideMenu: () => dispatch({type: 'hide-menu'}),
            showJournal: () => dispatch({type: 'show-journal'}),
            openPost: (post:Post) => dispatch({type:'open-post', post}),
            createNewPost: async (data:any) => {
                let date = state.currentPost as Moment || state.today;
                const post = await api.createPost(date, data);
                dispatch({type: 'add-post', post});
                dispatch({type: 'open-post', post});
                return post;
            },
            saveLog: async (id:string, data: any) => {
                const post = await api.updateModuleData(id, "log", data);
                dispatch({type:'save-post', post});
                dispatch({type: 'show-journal'});
                return post;
            },
            saveModule: async (postId:string, key: string, data: any) => {
                const post = await api.updateModuleData(postId, key, data);
                dispatch({type:'save-post', post});
                return post;
            },
            loadPrevMonth: () => dispatch({type:'load-prev-month'}),
            loadNextMonth: () => dispatch({type:'load-next-month'}),
            showCreatePostWizard: (date:Moment) => dispatch({type: 'show-create-post', date})
        };
    }, [api, dispatch, state.today, state.currentPost]);
    return [state, document];
}