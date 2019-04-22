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
    private _authToken:string;
    public get authToken() {
        return this._authToken;
    }
    public set authToken(token:string) {
        this._authToken = token;
    }

    protected async doFetch(url:string, options?:Partial<RequestInit>) {
        let res = await window.fetch(url, options);
        if(!res.ok)
            throw new FetchServiceError("Response code not ok", res);
        let data = await res.json();
        return data;
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

        if(this.authToken) {
            obj["headers"] = { ...obj["headers"], "Authorization": `Bearer ${this.authToken}` };
        }


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