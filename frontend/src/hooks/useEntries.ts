import React, { useEffect } from "react";
import * as services from "../services";
import { Entry } from "../models/entry";
import update from "immutability-helper";
import moment from "moment";

export type EntriesState = {
  entries: Entry[]|null;
  month: Date;
  selectedDate: Date|null;
  current: Entry|null;
  todaysEntry: Entry|undefined;
};

const initialState = {
  entries: null,
  month: moment(new Date()).startOf("month").toDate(),
  selectedDate: null,
  current: null,
  todaysEntry: undefined
}

enum Actions {
  selectMonth = "select-month",
  updateCurrent = "update-current",
  selectDate = "select-date"
};

type EntriesReducerAction = { type: Actions } 
  & Partial<EntriesState> 
  & { entry?: Partial<Entry> }

function entriesReducer(prevState:EntriesState, action: EntriesReducerAction) {
  let result = prevState;

  switch(action.type) {
    case Actions.selectMonth:
      {
        const today = new Date();
        result = {...prevState, month: action.month!, entries: action.entries!, selectedDate: null };
        if(!prevState.entries) {
          result.todaysEntry = action.entries![today.getDate()];

          if(!result.todaysEntry?.text) {
            result.current = { text: '', title: '', date: moment(today).startOf("day").toDate() }
          }
        }
      }
      break;

    case Actions.selectDate:
      {
        if(moment(action.selectedDate).isSame(prevState.selectedDate, "date")) {
          result = { ...prevState, selectedDate: null, current: null };
        }
        else {
          const entries = prevState.entries || [];
          const date = moment(action.selectedDate!).startOf('day').toDate();
          const entry = entries[date.getDate()];
          result = { ...prevState, selectedDate: date, current: entry || { text: '', title: '', date } };
        }  
        break;
      }

    case Actions.updateCurrent:
      {
        const day = prevState.selectedDate!.getDate();
        const newArray = [...prevState.entries!];
        const prev = newArray[day];
        const newEntry = prev ? {...prev, ...action.entry} : action.entry as Entry;
        newArray[day] = newEntry;
        result = {...prevState, current: newEntry, entries: newArray };

        if(moment(prevState.selectedDate!).isSame(new Date(), "day")) {
          result.todaysEntry = newEntry;
        }
        break;
      }
  }
  return result;
}

let global_state:EntriesState = initialState;

export class EntriesDispatcher {
  private get dispatcher() { return global_dispatcher; }
  public get state() { return global_state };

  public async selectMonth(date?:Date) {
    if(!date || !moment(date).isSame(this.state.month, "month")) {
      const d = moment(date).startOf("month").toDate() || this.state.month;
      let entries = await services.entriesService.getByMonth(d.getFullYear(), d.getMonth()+1);
      entries = entries.reduce((agg, e, i) => {
        if(e.date) {
          const d = new Date(e.date);
          agg[d.getDate()] = {...e, date: d };
        }
        return agg;
      }, Array(31));
      this.dispatcher({type: Actions.selectMonth, entries, month: d });
    }
  }

  public async selectDate(date:Date) {
    const d = moment(date);
    if(!d.isSame(this.state.month, "month"))
      await this.selectMonth(d.startOf("month").toDate());

    this.dispatcher({type: Actions.selectDate, selectedDate: date });
  }

  public getImages(entry_id:number) {
    return services.entriesService.getImages(entry_id);
  }
  public uploadImage(entry_id:number, file:File|undefined) {
    return services.entriesService.uploadImage(entry_id, file);
  }

  public async saveCurrentEntry(text:string, title:string) {
    if(text && ((this.state.current?.text || "") !== text || (this.state.current?.title || "") !== title)) {
      const entry = await services.entriesService.save({...this.state.current!, text, title });
      this.dispatcher({type: Actions.updateCurrent, entry });
    }
  }
}

let global_store:EntriesDispatcher = new EntriesDispatcher();
let global_dispatcher:React.Dispatch<EntriesReducerAction>;

export function useEntries() : [Readonly<EntriesState>, EntriesDispatcher] {
  const [state, dispatch] = React.useReducer(entriesReducer, initialState);
  global_dispatcher = dispatch;
  global_state = state;

  useEffect(() => {
    global_store.selectMonth();
  }, []);

  return [state, global_store];
}