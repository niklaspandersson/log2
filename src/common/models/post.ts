import { Moment } from "moment";

export default interface Post {
    _id?: string;
    data: object;
    time?: string|Moment;
    updated?: string;
    user?: string;
}