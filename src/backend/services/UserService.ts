import { OAuth2Client } from "google-auth-library";
import IDBService from "./IDBService";

export default class UserService
{
    private db:IDBService;
    private oauth2Client: OAuth2Client;

    constructor(db:IDBService, googleClientId:string) {
        this.db = db;
        this.oauth2Client = new OAuth2Client(googleClientId);
    }

    async handleLogin(id_token:string) {
        let profile = await this.verifyGoogleIdToken(id_token);
        let dbUser = await this.db.getUserByEmail(profile["email"]);
        return dbUser;
    };

    //google sign-in
    private async verifyGoogleIdToken(token: string) {
        const ticket = await this.oauth2Client.verifyIdToken({
            idToken: token,
            audience: this.oauth2Client._clientId
        });

        return ticket.getPayload();
    }
}