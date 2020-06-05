import React from "react";
import GoogleLogin, { GoogleLoginResponse } from "react-google-login";
import View from "./";
import { authService } from "../services";
import { UserInfo } from "../models/user";

type Props = {
  onLogin(user:UserInfo|undefined):void;
  onLoginFail(err:any):void;
}

export const Welcome:React.FC<Props> = ({children, onLogin, onLoginFail}) => {
  return (
    <View name="welcome">
      {children && <section className="section">{children}</section> }
      <GoogleLogin 
        buttonText="Logga in med Google" 
        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID!} 
        onSuccess={async res => onLogin(await authService.login((res as GoogleLoginResponse).tokenId))} 
        onFailure={res => onLoginFail(res)} />
    </View>);
}