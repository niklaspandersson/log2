import { Moment } from "moment";

export default interface Post {
    id: number;
    data: object;
    time: string|Moment;
    userId: number;
}