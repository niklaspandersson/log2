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

    readonly _id?: string;
    readonly data: object;
    readonly date: string;
    readonly created?: string;
    readonly updated?: string;
    readonly user?: string;    
    readonly time: Moment;
}