import FetchService from "./FetchService";
import User from "../../common/models/user";

export default class PostService extends FetchService<User>
{
    constructor(url:string) {
        super(url);
    }
}