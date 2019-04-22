import {FetchService} from "./FetchService";
import User from "../../common/models/user";

export default class LoginService extends FetchService
{
    url:string;

    constructor(url:string) {
        super();
        this.url = url;
    }

    async login(idToken:string) {
        const jwt:string = (await this.doFetch(`${this.url}`, this.createOptions("POST", {"id_token": idToken}))).token;
        return jwt;
    }    
}