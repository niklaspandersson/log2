import moment from "moment";
import FetchDataService from "./FetchService";
import { Entry } from "../models/entry";

export class EntriesService extends FetchDataService<Entry>
{
  getByMonth(year:number, month:number) {
    return this.getAll(new URLSearchParams(`?year=${year}&month=${month}`));
  }

  save(entry:Entry) {
    if(entry.id)
      return this.update(entry.id.toString(), entry);
    
    return this.create({...entry, date: moment(entry.date).format('YYYY-MM-DD')});
  }
}