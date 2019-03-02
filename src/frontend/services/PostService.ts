import FetchService from "./FetchService";
import {IPost} from "../../common/models/post";

export default class PostService extends FetchService<IPost>
{
    constructor(url:string) {
        super(url);
    } 
    async updateModuleData(id:string, key:string, data:any) {
        return this.doFetch(`${this.url}/${id}/${key}`, this.createOptions("PUT", data)) as Promise<IPost>;
    }    
}