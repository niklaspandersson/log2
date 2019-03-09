import React from "react";
import {Post} from "../../common/models/post";
import classnames from "classnames";
import moment, { Moment } from "moment";
import IViewProps from "./IViewProps";
import { string } from "prop-types";
import { isString } from "util";

interface JournalViewProps extends IViewProps {
    posts: Post[];
    today: Moment;
    hasPostToday: boolean;
    onSelectPost: (post:Post) => void;
    onCreatePost: (date:Moment) => void;
}

function getPostText(data:any) {
    return (data && data.log && data.log.body) || "";
}
function getPostDateString(date:Moment) {
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
    post:Post;
    onClick: (date:Moment, post:Post) => void;
}

function DayOfMonth(props:DayOfMonthProps) {
    let future = props.distance > 0;
    let old = false;
    let passed = false;
    if(props.distance < 0)
        passed = true;
    
    if(props.distance < -3) 
        passed = !(old = true);

    let clickable = !future && !props.prevMonth;
    let onClick = (ev:React.MouseEvent<HTMLDivElement>) => clickable && props.onClick(props.date, props.post);
    return  <div onClick={onClick} className={classnames({passed, old, day: true, 'has-post': !!props.post, future, clickable, 'prev-month': props.prevMonth, 'next-month': props.nextMonth, current: props.distance === 0 })}>
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

function getDays(date:Moment, posts:Post[], onClick:(date:Moment, post:Post)=>void) {
    let today = moment(0, "HH");
    let [first, numDays] = getDaySpan(date);
    let month = date.month();

    let days = [];
    for(let i=0; i<numDays;++i) {
        let d = first.clone().add(i, 'days');
        let diff = d.diff(today, 'days');
        let post = posts.find(p => p.time.isSame(d, 'day'));
        days.push(<DayOfMonth onClick={onClick} key={d.format()} post={post} date={d} distance={diff} prevMonth={d.month() < month} nextMonth={d.month() > month} />)
    }

    return days;
}

interface MonthProps {
    date:Moment;
    posts: Post[];
    onDayClick: (date:Moment, post:Post) => void;
}
function Month(props:MonthProps) {
    let days = getDays(props.date, props.posts, props.onDayClick);

    return  <section className="month">
                <header>{props.date.format("MMMM").toLocaleLowerCase()}</header>
                <div className="calendar">
                    {days}
                </div>
            </section>
}

function RenderCalendar(props:JournalViewProps) {
    let handleCalendarClick = (date:Moment, post:Post) => 
    {
        if(post)
            props.onSelectPost(post)
        else 
            props.onCreatePost(date);
    }
    let last = props.today.clone().subtract(1, 'month');
    return  <>
                <Month onDayClick={handleCalendarClick} date={last} posts={props.posts} />
                <Month onDayClick={handleCalendarClick} date={props.today} posts={props.posts} />
            </>
}

function RenderLogList(props:JournalViewProps) {
    let posts = props.posts && props.posts.map(post => <PostListItem key={post._id} {...post} select={props.onSelectPost} />)
    return  <ul>
                {posts}
            </ul>
}

export default function JournalView(props:JournalViewProps) {
    return  <div className={classnames("journal", props.className)}>
                <RenderCalendar {...props} />
            </div>
}