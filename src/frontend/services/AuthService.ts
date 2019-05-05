import {FetchService} from "./FetchService";
import IUser from "../../common/models/user";
import { object } from "prop-types";

export interface IAuthService
{
    accessToken:string;
    refresh():Promise<IUser>;
}

export default class AuthService extends FetchService implements IAuthService
{
    private baseUrl:string;
    private _refreshToken:string = null;
    private _accessToken:string = null;
    public get accessToken() { return this._accessToken; }
    public get refreshToken() { return this._refreshToken; }

    constructor(baseUrl:string = "") {
        super();
        this.baseUrl = baseUrl + "/auth";

        const storedRefreshToken = window.localStorage.getItem("refreshToken");
        if(storedRefreshToken)
            this._refreshToken = storedRefreshToken;
    }

    async login(idToken:string) {
        return this.process(await this.doFetch(`${this.baseUrl}/login`, this.createOptions("POST", {"id_token": idToken})));
    }

    async refresh() {
        let opts = this.createOptions("POST");
        opts["headers"] = { ...opts["headers"], "Authorization": `Bearer ${this._refreshToken}` };
        return this.process(await this.doFetch(`${this.baseUrl}/refresh`, opts));
    }

    private process(payload:any) {
        this._accessToken = payload.accessToken;
        this._refreshToken = payload.refreshToken;
        window.localStorage.setItem("refreshToken", this._refreshToken);
        return payload.user as IUser;
    }
}
