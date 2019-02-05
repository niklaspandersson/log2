import { OptionalKeys, IsOptional } from "prop-types";

type HTTPVerb = "GET" | "POST" | "PUT" | "PATCH" | "UPDATE" | "DELETE";

export default class FetchService<T> 
{
    url: string;
    
    constructor(url:string) {
        this.url = url;
    }

    async getAll() {
        return this.doFetch(this.url, this.createOptions("GET"));
    }

    async get(id:number) {
        return this.doFetch(`${this.url}/${id}`, this.createOptions("GET"));
    }

    async create(data:T) {
        return this.doFetch(this.url, this.createOptions("POST", data));
    }
    async update(id:number, data:Partial<T>) {
        return this.doFetch(`${this.url}/${id}`, this.createOptions("UPDATE", data));
    }
    async delete(id:number) {
        return this.doFetch(`${this.url}/${id}`, this.createOptions("DELETE"));
    }

    private async doFetch(url:string, options?:Partial<RequestInit>) {
        let res = await window.fetch(url, options);
        if(!res.ok)
            throw new FetchServiceError("Response code not ok", res);
        let data = await res.json();
        return data;
    }


    private createOptions(method:HTTPVerb = "GET", data?:Partial<T>, extras?:Partial<RequestInit>):Partial<RequestInit> {
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

export class FetchServiceError extends Error
{
    data?:Response|Error;

    constructor(message:string, data?:Response|Error) {
        super(message);
        this.data = data;
    }
}