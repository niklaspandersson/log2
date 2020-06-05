import { OAuth2Client } from "google-auth-library";
import { UserService } from "./UserService";

export class GoogleLoginService {
  private _userService: UserService;
  public get userService() { return this._userService; }

  private oauth2Client: OAuth2Client;
  private googleClientId: string;

  constructor(userService: UserService, googleClientId: string) {
    this._userService = userService;
    this.googleClientId = googleClientId;
    this.oauth2Client = new OAuth2Client(googleClientId);
  }

  async handleLogin(id_token: string) {
    let profile = await this.verifyGoogleIdToken(id_token);
    if(profile) {
      const googleId = profile.sub;
      let dbUser = await this.userService.getUserByGoogleId(googleId);
      if(!dbUser)
        throw new Error("no new users allowed at the moment");
      //  dbUser = await this.userService.createUser(googleId);
      
      return {
        dbUser,
        profile
      };
    }
    
    return null;
  };

  //google sign-in
  private async verifyGoogleIdToken(token: string) {
    const ticket = await this.oauth2Client.verifyIdToken({
      idToken: token,
      audience: this.googleClientId
    });

    return ticket.getPayload();
  }
}