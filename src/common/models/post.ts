import moment, { Moment } from "moment";
import {ModuleData} from "./module";
export interface IPost {
    _id?: string;
    data: ModuleData;
    date: string;
    created?: string;
    updated?: string;
    user?: string;
}

export class Post implements IPost {
    constructor(data:IPost) {
        this._id = data._id;
        this.data = data.data;
        this.date = data.date;
        this.created = data.created;
        this.updated = data.updated;
        this.user = data.user;

        this.time = moment(this.date);
    }

    _id?: string;
    data: object;
    date: string;
    created?: string;
    updated?: string;
    user?: string;    
    time: Moment;
}