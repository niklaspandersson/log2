import MongoDBService from "./MongoDBService";

import User from "../../common/models/user";
import {IPost} from "../../common/models/post";
import { ObjectID } from "bson";

export class DBService extends MongoDBService
{
    constructor(url:string, name:string) {
        super(url, name);
    }

    public getPosts() {
        return this.guard(db => db.collection<IPost>("posts").find().sort({'created': 1}).toArray());
    }
    public createPost(data:IPost) {
        return this.guard(async db => {
            let result = await db.collection<IPost>("posts").insertOne(data);
            return  {...data, _id: result.insertedId.toHexString() } as IPost;
        });
    }
    public async updatePostData(id: string, module:string, data:any) {
        let val = {};
        val['updated'] = (new Date()).toISOString();
        val[`data.${module}`] = data;
        let res = await this.guard(db => db.collection<IPost>("posts").findOneAndUpdate({_id: ObjectID.createFromHexString(id) }, {$set: val}, {returnOriginal: false}));
        if(!res.ok)
            throw new Error(res.lastErrorObject);
        return res.value;
    }

    public getUser(email:string) {
        return this.guard(db => db.collection<User>("users").findOne({email}));
    }
    public createUser(model:User, defaultModules:any) {
    return this.guard(async db => {
    	    let m = {...model, modules: defaultModules};
            let result = await db.collection<User>("users").insertOne(m);
            return {...m, _id: result.insertedId.toHexString() };
        });
    }
}
