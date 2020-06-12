import moment from "moment";
import FetchDataService from "./FetchService";
import { Entry } from "../models/entry";
import { Image } from "../models/image";

export class EntriesService extends FetchDataService<Entry>
{
  getByMonth(year:number, month:number) {
    return this.getAll(new URLSearchParams(`?year=${year}&month=${month}`));
  }

  getImages(entry_id:number) {
    return this.doFetch(`${this.url}/${entry_id}/images`, this.createOptions("GET")) as Promise<Image[]>;
  }
  uploadImage(entry_id:number, file:File|undefined) {
    if(file) {
      const body = new FormData();
      body.append('image', file);
      return this.doFetch(`${this.url}/${entry_id}/images`, this.createOptions("POST", null, { body })) as Promise<Image>;
    }
    else
      return Promise.resolve(false);
  }

  save(entry:Entry) {
    if(entry.id)
      return this.update(entry.id.toString(), entry);
    
    return this.create({...entry, date: moment(entry.date).format('YYYY-MM-DD')});
  }
}