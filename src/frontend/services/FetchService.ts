import {IAuthService} from "./AuthService";

type HTTPVerb = "GET" | "POST" | "PUT" | "PATCH" | "UPDATE" | "DELETE";

export class FetchServiceError extends Error
{
    data?:Response|Error;

    constructor(message:string, data?:Response|Error) {
        super(message);
        this.data = data;
    }
}

export class FetchService 
{
    private _authService:IAuthService;
    public get authService():IAuthService { return this._authService; }
    public set authService(auth:IAuthService) { this._authService = auth; }

    protected async doFetch(url:string, options?:Partial<RequestInit>) {

        let res = await this.send(url, options);

        if(!res.ok) {
            if(res.status === 401 && this.authService && this.authService.accessToken) {
                console.log("trying to refresh access token...");
                //Try to refresh token
                await this.authService.refresh();
                console.log("access token refreshed!");
                
                //retry with new token
                res = await this.send(url, options);
                if(!res.ok)
                    throw new FetchServiceError("Response code not ok", res);
            }
            else 
                throw new FetchServiceError("Response code not ok", res);
        }

        return await res.json();
    }

    private async send(url:string, options?:Partial<RequestInit>) {
        if(this.authService && this.authService.accessToken) {
            options["headers"] = { ...options["headers"], "Authorization": `Bearer ${this.authService.accessToken}` };
        }

        return await window.fetch(url, options);
    }

    protected createOptions(method:HTTPVerb = "GET", data?:any, extras?:Partial<RequestInit>):Partial<RequestInit> {
       let obj:RequestInit = {
            method,
        };

        if(data) {
            obj["headers"] = {
                "Content-Type": "application/json"
            };
            obj["body"] = JSON.stringify(data);           
        }

        if(extras)
            obj = { ...obj, ...extras};

        return obj;
    }    
}

export default class FetchDataService<T> extends FetchService
{
    url: string;
    
    constructor(url:string) {
        super();
        this.url = url;
    }

    async getAll() {
        return this.doFetch(this.url, this.createOptions("GET")) as Promise<T[]>;
    }

    async get(id:string) {
        return this.doFetch(`${this.url}/${id}`, this.createOptions("GET")) as Promise<T>;
    }

    async create(data:T) {
        return this.doFetch(this.url, this.createOptions("POST", data)) as Promise<T>;
    }
    async update(id:string, data:Partial<T>) {
        return this.doFetch(`${this.url}/${id}`, this.createOptions("PUT", data));
    }
    async delete(id:string) {
        return this.doFetch(`${this.url}/${id}`, this.createOptions("DELETE"));
    }
}