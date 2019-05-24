import FetchService from "./FetchService";
import {IPost} from "../models/IPost";

export default class PostService extends FetchService<IPost>
{
    async updateModuleData(id:string, key:string, data:any) {
        return this.doFetch(`${this.url}/${id}/${key}`, this.createOptions("PUT", data)) as Promise<IPost>;
    }    
}