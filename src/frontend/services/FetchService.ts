type HTTPVerb = "GET" | "POST" | "PUT" | "PATCH" | "UPDATE" | "DELETE";

export default class FetchService<T> 
{
    url: string;
    
    constructor(url:string) {
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

    protected async doFetch(url:string, options?:Partial<RequestInit>) {
        let res = await window.fetch(url, options);
        if(!res.ok)
            throw new FetchServiceError("Response code not ok", res);
        let data = await res.json();
        return data;
    }


    protected createOptions(method:HTTPVerb = "GET", data?:Partial<T>, extras?:Partial<RequestInit>):Partial<RequestInit> {
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