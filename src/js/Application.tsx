import React, {useState} from "react";
import Loader from "./components/Loader";
import AppDocument from "./document/Document";
import SidePanel from "./components/SidePanel";
import Module from "./models/module";
import Post from "./models/post";
import JournalView from "./views/JournalView";
import Icon from "./components/Icon";
import moment = require("moment");
import CreateNewPostView from "./views/CreateNewPostView";

type ViewMode = "journal" | "new-post";

interface ApplicationState {
    isMenuVisible:boolean;
    view: number|ViewMode;
    posts: Post[];
    hasPostToday: boolean;
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

function PostView(props:any) {
    return  <div>single post</div>
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
        this.setState({view: "journal"});
    }

    render() {
        let [menuProps, contents] = this.getContents();
        return  <>
                    <div className="application theme-default">
                        <ApplicationHeader {...menuProps} />

                        <Loader>{contents}</Loader>
                    </div>
                    <SidePanel visible={this.state.isMenuVisible} onHide={this.hideMenu}>
                        <ApplicationMenu />
                    </SidePanel>
                </>
    }

    private getContents():[AppHeaderProps, JSX.Element] {
        let defaultHeaderProps:AppHeaderProps = { menuIcon: "menu", menuAction: this.showMenu }
        if(this.document.User == null)
            return [defaultHeaderProps, <LoginView className="view" />]
        
        else if(this.state.view === "journal") {
            if(this.state.posts)
                return [defaultHeaderProps, <JournalView className="view" hasPostToday={this.state.hasPostToday} posts={this.state.posts} />];
            else
                return [defaultHeaderProps, null as JSX.Element];
        }
        else
        {
            let postHeaderProps:AppHeaderProps = { menuIcon: "back", menuAction: this.showJournal }
            if(this.state.view === "new-post") {
                postHeaderProps.title = this.getPostTitle();
                return [postHeaderProps, <CreateNewPostView className="view" modules={this.document.Modules} />];
            }
                
        
            return [postHeaderProps, <PostView className="view" id={this.state.view} />]
        } 
    }

    private getPostTitle(date?:moment.Moment) {
        date = date || this.document.Today; 
        return <span className="post-title">{date.format("MMM D").toLocaleLowerCase()} <span className="year">{date.format("Y")}</span></span>;
    }
}