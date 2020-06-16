import React, { useState, useEffect } from "react";
import moment from "moment";
import classnames from "classnames";

import "./Dashboard.scss";

import View from "./";
import Calender, { CalendarTileProperties } from "react-calendar";
import "./Calendar.scss";
import { useEntries, EntriesDispatcher } from "../hooks/useEntries";
import { useDebounce } from "../hooks/useDebounce";
import { RadialProgress } from "../components/RadialProgress";
import { Entry } from "../models/entry";
import { Image } from "../models/image";
import { appendToFilename } from "../utils/fileutils";

const DailyGoal = 100;


export const Dashboard:React.FC = () => {
  //const user = useContext(UserContext);
  const [state, store] = useEntries();

  function onNewDate(date:Date|Date[]) {
    store.selectDate(date as Date);
  }
  async function onNewMonth(date:Date) {
    if(!moment(store.state.month).isSame(date, "month")) {
      await store.selectMonth(date);
    }
  }

  const getDateClassname = React.useCallback((currMonth:number|undefined, props:CalendarTileProperties) => {
    if(props.date.getMonth() !== currMonth)
      return "";

    const text = state.entries?.[props.date.getDate()]?.text || "";
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

  return (
    <View name="dashboard">
      <Calender className="widget" 
        view="month" 
        activeStartDate={state.month} 
        value={state.selectedDate as Date|undefined} 
        showNeighboringMonth={false}
        tileClassName={props=>getDateClassname(state.month?.getMonth(), props)} 
        onActiveStartDateChange={opts => onNewMonth(opts.activeStartDate)} 
        onClickDay={onNewDate} />

      { state.selectedDate 
        ? <Editor date={state.selectedDate} store={store} /> 
        : <Stats todaysEntry={state.todaysEntry} onClick={() => onNewDate(state.todaysEntry!.date as Date)} /> 
      } 
    </View>);
};

const Stats:React.FC<{todaysEntry:Entry|undefined, onClick?:()=>void}> = ({todaysEntry, onClick}) => {
  const count = ((todaysEntry?.text || "").split(/\s/).length -1);
  const progress =  Math.min(1,count / DailyGoal);
  const date = new Date();
  return (
  <div className="widget stats" onClick={onClick ? onClick : undefined}>
    <div className="count"><p>{count}</p></div>
    <RadialProgress className="daily-progress" background={true} radius={28} stroke={7} progress={progress} />
    <div className="details">
      <span>Dagens datum: <b>{moment(date).format("DD MMMM")}</b></span>
      <span>Antal skrivna ord: <b>{count}</b> (mål: <b>{DailyGoal}</b>)</span>
    </div>
  </div>)
}

const Editor:React.FC<{date: Date, store:EntriesDispatcher}> = ({date, store}) => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [editing, setEditing] = useState(false);
  const [images, setImages] = useState<Image[]|null>(null);

  useEffect(() => {
    setEditing(false);
  }, [date]);

  useEffect(() => {
    setText(store.state.current?.text || "");
    setTitle(store.state.current?.title || "");
    const fetchImages = async () => {
      const id = store.state.current?.id;
      id && setImages(await store.getImages(id));
    };
    fetchImages();

    return () => setImages(null);
  }, [date]);
  
  const debouncedText = useDebounce(text, 750);
  useEffect(() => { 
    store.saveCurrentEntry(text, title);
  }, [debouncedText]);

  async function uploadImage() {
    const id = store.state.current?.id;
    const fileInput = document.getElementById("imageUpload") as HTMLInputElement;
    if(id) {
      const img = (await store.uploadImage(id, fileInput.files?.[0]) as Image);
      if(img && img?.id)
        setImages([...(images || []), img]);
    }

  }

  const count = text.split(/\s/).length-1;
  const progress =  Math.min(1, count / DailyGoal);

  return (
    <div className={classnames({"widget": true, "editor": true, "editing": editing })}>
      <div className="header">
        <RadialProgress className="progress" radius={12} stroke={8} progress={progress} /> 
        <span className="date">{moment(date).format("DD MMMM")}</span>
        <input type="file" accept="image/jpeg" name="imageUpload" id="imageUpload" className="hide" onChange={uploadImage} /> 
        <label htmlFor="imageUpload" className="upload">📷</label>
      </div>
      <div className="entry">
        {
          editing 
          ? <textarea autoFocus={true} value={text} onChange={ev => setText(ev.target.value)}></textarea>
          : <div className="linebreaks" onClick={() => setEditing(true)}>{text}</div>
        }
        <ul className="images">
          {images?.map((img, i) => <img key={i} src={`/images/${appendToFilename(img.filename, editing ? "-t" : "-m")}`} />)}
        </ul>
      </div>
    </div>)
}