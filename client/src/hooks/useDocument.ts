import { useState, useEffect, useReducer, useMemo } from "react";
import ApiFacade from  "../services/ApiFacade";
import { Post } from "../models/Post";
import { Moment } from "moment";
import User from "../models/user";
import Module from "../models/module";

type ViewMode = "journal" | "new-post" | string;

export interface IAppState {
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
    
    switch(action.type) {
        case 'update-user':
            return newState({user: action.user, isLoggedIn: !!action.user, isMenuVisible: false, posts: action.posts, modules: action.modules, view: action.hasPostToday ? "journal" : "new-post"});
        case 'show-menu':
            return newState({isMenuVisible: true });
        case 'hide-menu':
            return newState({isMenuVisible: false });
        case 'show-journal':
            return newState({view: "journal", currentPost: null });
        case 'add-post':
            return newState({posts: [...state.posts, action.post]});
        case 'open-post':
            return newState({currentPost: action.post, view: action.post._id });
        case 'save-post':
            {
                let posts = [...state.posts];
                const index = posts.findIndex(p => p._id === action.post._id);
                posts[index] = action.post;
                return newState({posts});
            }

        case 'show-create-post':
            return newState({currentPost: action.date, view: "new-post" });

        default:
            throw new Error('AppReducer - Invalid action type');
    }
}

export interface IDocument {
    Today: Moment,

    login: (token:string) => Promise<void>,
    showMenu: () => void,
    hideMenu: () => void,
    showJournal: () => void,
    addPost: (post:Post) => void,
    openPost: (post:Post) => void,
    savePost: (post:Post) => void,
    createNewPost: (data:any) => Promise<Post>,
    saveLog: (data:any) => Promise<Post>,
    saveModule: (key:string, data:any) => Promise<Post>,
    showCreatePostWizard: (date:Moment) => void
};

export default function useDocument(initialState:IAppState):[IAppState,IDocument] {
    const [state, dispatch] = useReducer(appReducer, initialState);
    
    const [api] = useState(new ApiFacade());
    useEffect(() => {
        api.init();
        api.User.removeAllListeners();
        api.User.addListener(async (user:User) => {
            const posts = await api.getUserPosts();
            const hasPostToday = api.HasPostToday;
            
            let userModules = user.modules.map(m => m[1] ? m[0] : null).filter(s => s !== null);
            const modules = api.modules.filter(m => userModules.find(um => um === m.key) != null )

            dispatch({type: 'update-user', user, posts, hasPostToday, modules});
        })
    }, [api, dispatch]);

    const document = useMemo(() => {
        return {
            Today: api.Today,
    
            login: (token:string) => api.login(token),
            showMenu: () => dispatch({type: 'show-menu'}),
            hideMenu: () => dispatch({type: 'hide-menu'}),
            showJournal: () => dispatch({type: 'show-journal'}),
            addPost: (post:Post) => dispatch({type:'add-post', post}),
            openPost: (post:Post) => dispatch({type:'open-post', post}),
            savePost: (post:Post) => dispatch({type:'open-post', post}),
            createNewPost: async (data:any) => {
                let date = state.currentPost as Moment || api.Today;
                const post = await api.createPost(date, data);
                dispatch({type: 'add-post', post});
                dispatch({type: 'open-post', post});
                return post;
            },
            saveLog: async (data: any) => {
                const post = await api.updateModuleData((state.currentPost as Post)._id, "log", data);
                dispatch({type:'save-post', post});
                dispatch({type: 'show-journal'});
                return post;
            },
            saveModule: async (key: string, data: any) => {
                const post = await api.updateModuleData((state.currentPost as Post)._id, key, data);
                dispatch({type:'save-post', post});
                return post;
            },
            showCreatePostWizard: (date:Moment) => dispatch({type: 'show-create-post', date})
        };
    }, [api, dispatch, state.currentPost, api.Today]);
    return [state, document];
}