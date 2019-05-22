import {IPost} from "./IPost";
import moment, {Moment} from "moment";

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