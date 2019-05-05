import User from "../../common/models/user";

export default interface IDBService {
    getUserByEmail(email:string):Promise<User>;
}