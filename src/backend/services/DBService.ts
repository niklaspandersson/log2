import MongoDBService from "./MongoDBService";

import User from "../../common/models/user";
import Post from "../../common/models/post";
import { ObjectID } from "bson";

export class DBService extends MongoDBService
{
    constructor(url:string, name:string) {
        super(url, name);
    }

    public getPosts(userId:string) {
        return this.guard(db => db.collection<Post>("posts").find().sort({'time': 1}).toArray());
    }
    public createPost(data:Post) {
        return this.guard(async db => {
            let result = await db.collection<Post>("posts").insertOne(data);
            return  {...data, _id: result.insertedId.toHexString() };
        });
    }
    public async updatePostData(id: string, module:string, data:any) {
        let val = {};
        val['updated'] = (new Date()).toUTCString();
        val[`data.${module}`] = data;
        let res = await this.guard(db => db.collection<Post>("posts").updateOne({_id: ObjectID.createFromHexString(id) }, {$set: val}));
        return res.modifiedCount === 1;
    }

    public getUser(email:string) {
        return this.guard(db => db.collection<User>("users").findOne({email}));
    }
    public createUser(model:User) {
        return this.guard(async db => {
            let result = await db.collection<User>("users").insertOne(model);
            return {...model, _id: result.insertedId.toHexString() };
        });
    }
}