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

interface DayOfMonthProps {
    date:Moment;
    prevMonth:boolean;
    nextMonth:boolean;
    distance:number;
}

function DayOfMonth(props:DayOfMonthProps) {
    return  <div className={classnames({day: true, future: props.distance > 0, 'prev-month': props.prevMonth, 'next-month': props.nextMonth, current: props.distance === 0 })}>
                <div className="date">{props.date.date()}</div>
            </div>
}
function getDaySpan(date:Moment) : [Moment, number] {

    let firstOfMonth = date.startOf('month');
    let wd = firstOfMonth.isoWeekday();
    let firstOfCal = firstOfMonth.clone().subtract(wd-1, 'days');

    let lastOfMonth = date.endOf('month');
    let wdl = lastOfMonth.isoWeekday();
    let lastOfCal = lastOfMonth.clone().add(7 - wdl, 'days');

    let diff = Math.round(lastOfCal.diff(firstOfCal, 'days', true));
    return [firstOfCal, diff];
}

function getDays(date:Moment, posts:Post[]) {
    let today = moment(0, "HH");
    let [first, numDays] = getDaySpan(date);
    let month = date.month();

    let days = [];
    for(let i=0; i<numDays;++i) {
        let date = first.clone().add(i, 'days');
        days.push(<DayOfMonth key={date.format()} date={date} distance={date.diff(today, 'days')} prevMonth={date.month() < today.month()} nextMonth={date.month() > today.month()} />)
    }

    return days;
}

interface MonthProps {
    date:Moment;
    posts: Post[];
}
function Month(props:MonthProps) {
    let days = getDays(props.date, props.posts);

    return  <section className="month">
                <header>{props.date.format("MMMM").toLocaleLowerCase()}</header>
                <div className="calendar">
                    {days}
                </div>
            </section>
}

export default function JournalView(props:JournalViewProps) {
    let now = moment();
    let posts = props.posts && props.posts.map(post => <PostListItem key={post._id} {...post} select={props.onSelectPost} />)
    return  <div className={classnames("journal", props.className)}>
                { /*!hasToday && createPostButton() */ }
                <Month date={now} posts={props.posts.filter(p => moment(p.time).month() === now.month())} />
                <ul>
                    {posts}
                </ul>
            </div>
}