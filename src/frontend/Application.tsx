import React, {useState} from "react";
import classnames from "classnames";
import Loader from "./components/Loader";
import AppDocument from "./document/Document";
import SidePanel from "./components/SidePanel";
import Module from "./../common/models/module";
import Post from "./../common/models/post";
import JournalView from "./views/JournalView";
import Icon from "./components/Icon";
import moment = require("moment");
import CreateNewPostView from "./views/CreateNewPostView";
import PostView from "./views/PostView";

type ViewMode = "journal" | "new-post" | number;
const NewPostId:number = 0;

interface ApplicationState {
    isMenuVisible:boolean;
    view: ViewMode;
    posts: Post[];
    hasPostToday: boolean;
    currentPost?: Post;
}



type MenuIcon = "menu"|"back"|null;
interface AppHeaderProps {
    title?: string | JSX.Element;
    menuIcon?: MenuIcon;
    menuAction?: () => void;
}
function ApplicationHeader(props:AppHeaderProps) {
    let title = props.title || <span className="application-title">log<sup>2</sup></span>

    return  <header className="application-header">
                {props.menuIcon && <Icon icon={props.menuIcon} onClick={props.menuAction} className="appmenu-icon" /> }
                <h1>{title}</h1>
            </header>
}

function LoginView(props:any) {
    return  <div>Login</div>
}

function ApplicationMenu(props:any) {
    return  <div className="application-menu">
                <ApplicationHeader />
            </div>
}

export default class Application extends React.Component<{}, ApplicationState> {
    private document:AppDocument;
    
    constructor(props:any) {
        super(props);
        
        this.document = new AppDocument();
        this.state = {
            isMenuVisible: false,
            posts: null,
            hasPostToday: false,
            view: "journal"
        };

        this.hideMenu = this.hideMenu.bind(this);
        this.showMenu = this.showMenu.bind(this);
        this.showJournal = this.showJournal.bind(this);
    }

    componentDidMount() {
        this.init();
    }

    private async init() {
        try {
            await this.document.init();

            let posts = await this.document.getUserPosts();
            let hasPostToday = this.document.HasPostToday;
            this.setState({posts, hasPostToday, view: hasPostToday ? "journal" : "new-post"});
        }
        catch(err) {
            console.error(err);
        }
    }

    hideMenu() {
        this.setState({isMenuVisible: false});
    }
    showMenu() {
        this.setState({isMenuVisible: true});
    }
    showJournal() {
        this.setState({view: "journal", currentPost: null});
    }

    render() {
        const [menuProps, contents] = this.getContents();
        const theme = "theme-default";
        return  <>
                    <div className={classnames("application", theme)}>
                        <ApplicationHeader {...menuProps} />

                        <Loader>{contents}</Loader>
                    </div>
                    <SidePanel className={theme} visible={this.state.isMenuVisible} onHide={this.hideMenu}>
                        <ApplicationMenu />
                    </SidePanel>
                </>
    }

    private getContents():[AppHeaderProps, JSX.Element] {
        let defaultHeaderProps:AppHeaderProps = { menuIcon: "menu", menuAction: this.showMenu }
        if(this.document.User == null)
            return [defaultHeaderProps, <LoginView className="view" />]
        
        else if(this.state.view === "journal") {
            const openPost = (post:Post) => {
                this.setState({currentPost: post, view: post.id });
            }

            if(this.state.posts)
                return [defaultHeaderProps, <JournalView className="view" onSelectPost={post => openPost(post)} hasPostToday={this.state.hasPostToday} posts={this.state.posts} />];
            else
                return [defaultHeaderProps, null as JSX.Element];
        }
        else
        {
            let postHeaderProps:AppHeaderProps = { menuIcon: "back", menuAction: this.showJournal }
            if(this.state.view === "new-post") {
                postHeaderProps.title = this.getPostTitle();
                const newPostCreated = (data:any) => {
                    this.setState({view: NewPostId, currentPost: { id: NewPostId, data }});
                }
                return [postHeaderProps, <CreateNewPostView className="view" modules={this.document.Modules} onComplete={data => newPostCreated(data)} />];
            }
                
            const savePost = (data:any) => {
                //TODO: Save post to backend and return to journal
                this.showJournal();
            }        
            return [postHeaderProps, <PostView className="view" initialValue={(this.state.currentPost && this.state.currentPost.data) || undefined} onSave={data => savePost(data)} />]
        } 
    }

    private getPostTitle(date?:moment.Moment) {
        date = date || this.document.Today; 
        return <span className="post-title">{date.format("MMM D").toLocaleLowerCase()} <span className="year">{date.format("Y")}</span></span>;
    }
}