import React from "react";
import classnames from "classnames";

import Loader from "./components/Loader";

import DocumentContext from "./contexts/DocumentContext";
import useDocument from "./hooks/useDocument";
import SidePanel from "./components/SidePanel";
import { Post } from "./models/Post";
import JournalView from "./views/JournalView";
import moment, { Moment } from "moment";
import CreateNewPostView from "./views/CreateNewPostView";
import PostView from "./views/PostView";
import LoginView from "./views/LoginView";
import { ApplicationHeader, ApplicationMenu, IAppHeaderProps } from "./components/ApplicationMenu";

function getPostTitle(date: moment.Moment) {
    return <span className="post-title">{date.format("MMM D").toLocaleLowerCase()} <span className="year">{date.format("Y")}</span></span>;
}  

export default function Application() {

    const [state, document] = useDocument();

    function getContents(): [IAppHeaderProps, JSX.Element] {
        let defaultHeaderProps: IAppHeaderProps = { menuIcon: "menu", menuAction: document.showMenu}
        if (state.user == null)
            return [defaultHeaderProps, <LoginView />]

        else if (state.view === "journal") {
            if (state.posts)
                return [defaultHeaderProps, <JournalView today={state.today} hasPostToday={state.hasPostToday} posts={state.posts} />];
            else
                return [defaultHeaderProps, null as JSX.Element];
        }
        else {
            let postHeaderProps: IAppHeaderProps = { menuIcon: "back", menuAction: document.showJournal }
            if (state.view === "new-post") {
                let date = state.currentPost as Moment || state.today;
                postHeaderProps.title = getPostTitle(date);
                return [postHeaderProps, <CreateNewPostView modules={state.modules} />];
            }

            let currentPost = state.currentPost as Post;

            postHeaderProps.title = getPostTitle(currentPost.time);
            return [postHeaderProps, <PostView modules={state.modules} 
                                            postId={currentPost && currentPost._id}
                                            initialValue={(currentPost && currentPost.data) || undefined} />]
        }
    }

    const [menuProps, contents] = getContents();
    const theme = "theme-default";
    return <DocumentContext.Provider value={document}>
        <div className={classnames("application", theme)}>
            <ApplicationHeader {...menuProps} />
            <Loader>{contents}</Loader>
        </div>
        <SidePanel className={theme} visible={state.isMenuVisible} onHide={document.hideMenu}>
            <ApplicationMenu isLoggedIn={state.isLoggedIn} onSocialLoginResult={document.login} />
        </SidePanel>
    </DocumentContext.Provider>
}