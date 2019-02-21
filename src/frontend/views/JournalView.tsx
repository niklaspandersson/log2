import React from "react";
import Post from "../../common/models/post";
import classnames from "classnames";
import moment, { Moment } from "moment";
import IViewProps from "./IViewProps";
import { string } from "prop-types";
import { isString } from "util";

interface JournalViewProps extends IViewProps {
    posts: Post[];
    hasPostToday: boolean;
    onSelectPost: (post:Post) => void;
}

function getPostText(data:any) {
    return (data && data.log && data.log.body) || "";
}
function getPostDateString(date:Moment|string) {
    if(isString(date))
        date = moment(date as string);
    return <>{date.format("D")}<br />{date.format("MMM").toLocaleLowerCase()}</>
}

function PostListItem(post:Post&{select: (post:Post) => void}) {
    let date = getPostDateString(post.time);
    let text = getPostText(post.data);
    return  <li>
                <div className="post clickable" onClick={() => post.select(post)}>
                    <div className="date"><p>{date}</p></div>
                    <div className="log">{text}</div>
                </div>
            </li>
}

export default function JournalView(props:JournalViewProps) {
    let posts = props.posts && props.posts.map(post => <PostListItem key={post._id} {...post} select={props.onSelectPost} />)
    return  <div className={classnames("journal", props.className)}>
                { /*!hasToday && createPostButton() */ }
                <ul>
                    {posts}
                </ul>
            </div>
}