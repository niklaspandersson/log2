import User from "../models/user";

export default interface IDBService {
    getUserByEmail(email:string):Promise<User>;
}