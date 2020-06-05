import React, { useContext, useState, useEffect } from "react";
import moment from "moment";

import "./Dashboard.scss";


import View, { ViewTypes } from "./";
import Calender, { CalendarTileProperties } from "react-calendar";
import "./Calendar.scss";
import { UserContext } from "../hooks/useUser";
import { useEntries, EntriesDispatcher } from "../hooks/useEntries";
import { useDebounce } from "../hooks/useDebounce";

type DashboardProps = {
  navigate(id:ViewTypes):void;
}
export const Dashboard:React.FC<DashboardProps> = ({navigate}) => {
  //const user = useContext(UserContext);
  const [state, store] = useEntries();

  function onNewDate(date:Date|Date[]) {
    store.selectDate(date as Date);
  }
  async function onNewMonth(date:Date) {
    if(!moment(store.state.month).isSame(date, "month")) {
      await store.selectMonth(date);
      store.selectDate(date);
    }
  }

  const getDateClassname = React.useCallback((currMonth:number, props:CalendarTileProperties) => {
    if(props.date.getMonth() !== currMonth)
      return "";

    const text = state.entries[props.date.getDate()]?.text || "";
    const words = text.split(" ").length;

    if(text.length === 0)
      return "empty";
    else if(words < 25)
      return "short"
    else if(words < 100)
      return "medium";
    else
      return "long";
  }, [state.entries]);

  useEffect(() => {
    (async function() {
      const now = new Date();
      await store.selectMonth(now);
      store.selectDate(now);
    })();
  }, []);

  return (
    <View name="dashboard">
      <Calender className="widget" view="month" activeStartDate={state.month} value={state.selectedDate} tileClassName={props=>getDateClassname(state.selectedDate.getMonth(), props)} onActiveStartDateChange={opts => onNewMonth(opts.activeStartDate)} onChange={onNewDate} />
      <Editor date={state.selectedDate} store={store} />
    </View>);
};

const Editor:React.FC<{date: Date, store:EntriesDispatcher}> = ({date, store}) => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    setText(store.state.current?.text || "");
    setTitle(store.state.current?.title || "");
  }, [date]);
  
  const debouncedText = useDebounce(text, 750);
  useEffect(() => { 
    store.saveCurrentEntry(text, title);
  }, [debouncedText]);

  return (
    <div className="widget editor">
      <div className="header"><span className="date">{date.toDateString()}</span></div>
      <textarea value={text} onChange={ev => setText(ev.target.value)}></textarea>
    </div>)
}