import React, { useState } from "react";
import classnames from "classnames";
import Loader from "./components/Loader";
import AppDocument from "./document/Document";
import SidePanel from "./components/SidePanel";
import { Post } from "./models/Post";
import JournalView from "./views/JournalView";
import Icon from "./components/Icon";
import moment, { Moment } from "moment";
import CreateNewPostView from "./views/CreateNewPostView";
import PostView from "./views/PostView";
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login";
import User from "./models/user";


type ViewMode = "journal" | "new-post" | string;

export interface IAppState {
    isMenuVisible: boolean;
    isLoggedIn: boolean;
    view: ViewMode;
    posts: Post[];
    hasPostToday: boolean;
    currentPost?: Post | Moment | null;
}

const CLIENT_ID = "422996462760-r53gj3lqgjf209pgbnpcddjvoqrl1d4u.apps.googleusercontent.com";

type MenuIcon = "menu" | "back" | null;
interface AppHeaderProps {
    title?: string | JSX.Element;
    menuIcon?: MenuIcon;
    menuAction?: () => void;
}
function ApplicationHeader(props: AppHeaderProps) {
    let title = props.title || <span className="application-title">log<sup>2</sup></span>

    return <header className="application-header">
        {props.menuIcon && <Icon icon={props.menuIcon} onClick={props.menuAction} className="appmenu-icon" />}
        <h1>{title}</h1>
    </header>
}

function LoginView(props: any) {
    return <div>Login</div>
}

interface IAppMenuProps {
    isLoggedIn: boolean;
    onSocialLoginResult: (tokens: string) => void;
}

class ApplicationMenu extends React.Component<IAppMenuProps, {}> {
    constructor(props: any) {
        super(props)
    }

    private onLoginSuccess(res: GoogleLoginResponse | GoogleLoginResponseOffline) {
        let token = (res as any).tokenId;
        this.props.onSocialLoginResult(token);
        console.log(res);
    }
    private onLoginFail(res: GoogleLoginResponse | GoogleLoginResponseOffline) {
        this.props.onSocialLoginResult(null);
    }

    render() {
        return <div className="application-menu">
            <ApplicationHeader />
            {this.props.isLoggedIn
                ? "Inloggad"
                : <GoogleLogin clientId={CLIENT_ID} onSuccess={res => this.onLoginSuccess(res)} onFailure={res => this.onLoginFail(res)} />
            }
        </div>
    }
}

export default class Application extends React.Component<{}, IAppState> {
    private document: AppDocument;

    constructor(props: any) {
        super(props);

        this.document = new AppDocument(this);
        this.state = {
            isMenuVisible: false,
            isLoggedIn: false,
            posts: null,
            hasPostToday: false,
            view: "journal"
        };

        this.hideMenu = this.hideMenu.bind(this);
        this.showMenu = this.showMenu.bind(this);
        this.showJournal = this.showJournal.bind(this);
    }


    componentDidMount() {
        this.document.init();
    }

    private onUserUpdated = async (user: User) => {
        this.setState({ isLoggedIn: !!user, isMenuVisible: false });
        let posts = await this.document.getUserPosts();
        let hasPostToday = this.document.HasPostToday;
        this.setState({ posts, hasPostToday, view: hasPostToday ? "journal" : "new-post" });
    }

    hideMenu() {
        this.setState({ isMenuVisible: false });
    }
    showMenu() {
        this.setState({ isMenuVisible: true });
    }
    showJournal() {
        this.setState({ view: "journal", currentPost: null });
    }

    private onSocialLogin = async (token: string) => {
        if (token)
            this.document.login(token);
        else
            console.log("social login failed");
    }

    render() {
        const [menuProps, contents] = this.getContents();
        const theme = "theme-default";
        return <>
            <div className={classnames("application", theme)}>
                <ApplicationHeader {...menuProps} />

                <Loader>{contents}</Loader>
            </div>
            <SidePanel className={theme} visible={this.state.isMenuVisible} onHide={this.hideMenu}>
                <ApplicationMenu isLoggedIn={this.state.isLoggedIn} onSocialLoginResult={this.onSocialLogin} />
            </SidePanel>
        </>
    }

    private getContents(): [AppHeaderProps, JSX.Element] {
        let defaultHeaderProps: AppHeaderProps = { menuIcon: "menu", menuAction: this.showMenu }
        if (this.document.User == null)
            return [defaultHeaderProps, <LoginView className="view" />]

        else if (this.state.view === "journal") {
            const openPost = (post: Post) => {
                this.setState({ currentPost: post, view: post._id });
            }
            const createPost = (date: Moment) => {
                console.log(`Creating post for ${date.toLocaleString()}`);
                this.setState({ currentPost: date, view: "new-post" });
            }

            if (this.state.posts)
                return [defaultHeaderProps, <JournalView today={this.document.Today} className="view" onCreatePost={date => createPost(date)} onSelectPost={post => openPost(post)} hasPostToday={this.state.hasPostToday} posts={this.state.posts} />];
            else
                return [defaultHeaderProps, null as JSX.Element];
        }
        else {
            let postHeaderProps: AppHeaderProps = { menuIcon: "back", menuAction: this.showJournal }
            if (this.state.view === "new-post") {
                let date = this.state.currentPost as Moment || this.document.Today;
                postHeaderProps.title = this.getPostTitle(date);
                const createNewPost = async (data: any) => {
                    let newPost = await this.document.createPost(date, data);
                    this.setState((s, p) => {
                        return {
                            view: newPost._id,
                            currentPost: newPost,
                            posts: [...s.posts, newPost]
                        };
                    });
                }
                return [postHeaderProps, <CreateNewPostView className="view" modules={this.document.Modules} onComplete={data => createNewPost(data)} />];
            }

            let currentPost = this.state.currentPost as Post;
            const saveLog = async (data: any) => {
                let newPost = await this.document.updateModuleData(currentPost._id, "log", data);
                this.setState((s, p) => {
                    let posts = [...s.posts];
                    let index = posts.findIndex(p => p._id == newPost._id);
                    posts[index] = newPost;
                    return { posts };
                });
                this.showJournal();
            }
            const saveModule = async (key: string, data: any) => {
                let newPost = await this.document.updateModuleData(currentPost._id, key, data);
                this.setState((s, p) => {
                    let posts = [...s.posts];
                    let index = posts.findIndex(p => p._id == newPost._id);
                    posts[index] = newPost;
                    return { posts };
                });
            }

            postHeaderProps.title = this.getPostTitle((currentPost as any).time);
            return [postHeaderProps, <PostView className="view" modules={this.document.Modules} initialValue={(currentPost && currentPost.data) || undefined} onSaveModule={(key: string, data: any) => saveModule(key, data)} onSaveLog={data => saveLog(data)} />]
        }
    }

    private getPostTitle(date: moment.Moment) {
        return <span className="post-title">{date.format("MMM D").toLocaleLowerCase()} <span className="year">{date.format("Y")}</span></span>;
    }
}