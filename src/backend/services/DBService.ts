import {MongoClient, Db, ObjectId} from "mongodb";
import User from "../../common/models/user";

export class DBService
{
    private url:string;
    private name:string;

    private cachedConnection:Promise<Db>;
    private client:MongoClient;

    constructor(url:string, name:string) {
        this.url = url;
        this.name = name;
    }

    // public getContents() {
    //     return this.guard(db => db.collection<IContent>("content").find({}).sort('_id', -1).toArray());
    // }
    // public createContent(data:IContent) {
    //     return this.guard(async db => {
    //         let result = await db.collection<IContent>("content").insertOne(data);
    //         return  {...data, _id: result.insertedId };
    //     });
    // }
    // public createExercise(contentId: string, data:Partial<IExercise>) {
    //     return this.guard(async db => {
    //         return await db.collection<IContent>("content").updateOne({_id: ObjectId.createFromHexString(contentId) }, {$push: { exercises: data }});
    //     });
    // }
    // public updateExercise(contentId: string, exerciseKey:string, data:Partial<IExercise>) {
    //     return this.guard(db => db.collection<IContent>("content").updateOne({_id: ObjectId.createFromHexString(contentId), "exercises.key": exerciseKey }, {$set: {"exercises.$": data}}));
    // }

    // public updateContent(id: string, data:Partial<IContent>) {
    //     return this.guard(db => db.collection<IContent>("content").updateOne({_id: ObjectId.createFromHexString(id) }, {$set: data}));
    // }

    // public getUserWork(id:string) {
    //     return this.guard(db => db.collection<IWork>("work").find({userId: id}).toArray());
    // }
    // public updateUserWork(userId:string, exerciseKey:string, completed:boolean) {
    //     return this.guard(db => db.collection<IWork>("work").updateOne({userId, exerciseKey}, { $set: {completed: !!completed} }, {upsert:true}));
    // }
    public getUser(email:string) {
        return this.guard(db => db.collection<User>("users").findOne({email: email}));
    }
    public createUser(model:User) {
        return this.guard(async db => {
            let result = await db.collection<User>("users").insertOne(model);
            return {...model, _id: result.insertedId };
        });
    }
    private get connection() {
        return this.cachedConnection || (this.cachedConnection = this.createConnection());
    } 

    private createConnection = async () => {
        if(this.client)
            this.closeConnection();

        this.client = new MongoClient(this.url);
        await this.client.connect();

        return this.cachedConnection = Promise.resolve(this.client.db(this.name));
    }

    private async closeConnection() {
        try {
            if(this.client) {
                await this.client.close();
            }
        }
        catch(err) {
        }
        finally {
            this.client = null;
            this.cachedConnection = null;
        }
    }

    private async guard<T>(worker: (db:Db) => Promise<T>) {
        try {
            const db = await this.connection;
            return worker(db);
        }
        catch(err) {
            console.log("error: ", err);
            this.closeConnection();
        }
    }
}