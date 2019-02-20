import {MongoClient, Db, ObjectId} from "mongodb";

export default class MongoDBService
{
    private url:string;
    private name:string;

    private cachedConnection:Promise<Db>;
    private client:MongoClient;

    constructor(url:string, name:string) {
        this.url = url;
        this.name = name;
    }

    protected get connection() {
        return this.cachedConnection || (this.cachedConnection = this.createConnection());
    } 

    protected createConnection = async () => {
        if(this.client)
            this.closeConnection();

        this.client = new MongoClient(this.url);
        await this.client.connect();

        return this.cachedConnection = Promise.resolve(this.client.db(this.name));
    }

    protected async closeConnection() {
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

    protected async guard<T>(worker: (db:Db) => Promise<T>) {
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