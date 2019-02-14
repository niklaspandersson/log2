import FetchService from "./FetchService";
import Post from "../../common/models/post";

export default class PostService extends FetchService<Post>
{
    constructor(url:string) {
        super(url);
    } 
}