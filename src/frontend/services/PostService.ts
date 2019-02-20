import FetchService from "./FetchService";
import Post from "../../common/models/post";

export default class PostService extends FetchService<Post>
{
    constructor(url:string) {
        super(url);
    } 
    async updateModuleData(id:string, key:string, data:any) {
        return this.doFetch(`${this.url}/${id}/${key}`, this.createOptions("PUT", data));
    }    
}