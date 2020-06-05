import React from "react";
import * as services from "../services";
import { Entry } from "../models/entry";
import update from "immutability-helper";
import moment from "moment";

export type EntriesState = {
  entries: Entry[];
  month: Date;
  selectedDate: Date;
  current: Entry|null;
};

const initialState = {
  entries: [],
  month: new Date(),
  selectedDate: new Date(),
  current: null
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
      result = {...prevState, month: action.month!, entries: action.entries! };
      break;

    case Actions.selectDate:
      {
        const date = moment(action.selectedDate!).startOf('day').toDate();
        const entry = prevState.entries[date.getDate()];
        result = { ...prevState, selectedDate: date, current: entry || { text: '', title: '', date } };
        break;
      }

    case Actions.updateCurrent:
      {
        const day = prevState.selectedDate.getDate();
        const newArray = [...prevState.entries];
        const prev = newArray[day];
        const newEntry = prev ? {...prev, ...action.entry} : action.entry as Entry;
        newArray[day] = newEntry;
        result = {...prevState, current: newEntry, entries: newArray };
        break;
      }
  }
  return result;
}

let global_state:EntriesState = initialState;

export class EntriesDispatcher {
  private get dispatcher() { return global_dispatcher; }
  public get state() { return global_state };

  public async selectMonth(date:Date) {
    let entries = await services.entriesService.getByMonth(date.getFullYear(), date.getMonth()+1);
    entries = entries.reduce((agg, e, i) => {
      if(e.date) {
        const d = new Date(e.date);
        agg[d.getDate()] = {...e, date: d };
      }
      return agg;
    }, Array(31));
    this.dispatcher({type: Actions.selectMonth, entries, month: date });
  }

  public selectDate(date:Date) {
    this.dispatcher({type: Actions.selectDate, selectedDate: date });
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
  return [state, global_store];
}