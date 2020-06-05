import { FetchService } from "./FetchService";
import { UserInfo } from "../models/user";

export interface IAuthService {
  accessToken: string | undefined;
  refresh(): Promise<UserInfo|undefined>;
}

export class AuthService extends FetchService implements IAuthService {
  private baseUrl: string;
  private _accessToken: string | undefined = undefined;
  public get accessToken() { return this._accessToken; }

  constructor(baseUrl: string = "") {
    super();
    this.baseUrl = baseUrl;
  }

  async login(idToken: string): Promise<UserInfo|undefined> {
    return this.process(await this.doFetch(`${this.baseUrl}/login`, this.createOptions("POST", { "id_token": idToken })));
  }

  async refresh(): Promise<UserInfo|undefined> {
    return this.process(await this.doFetch(`${this.baseUrl}/refresh`, this.createOptions("POST")));
  }

  private process(data:any): UserInfo|undefined {
    try
    {
      this._accessToken = data?.accessToken as string | undefined;
      if(this.accessToken) {
        const payload:any = decode_jwt(this.accessToken);
        return payload?.user || null;
      }
    }
    catch(err) { console.error(err); }

    return undefined;
  }
}

function decode_jwt(token:string) {
  const encoded = token.substring(token.indexOf(".")+1, token.lastIndexOf("."));
  const decoded = atob(encoded);
  return JSON.parse(decoded);
}