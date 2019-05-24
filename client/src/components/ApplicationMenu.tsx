import React from "react";
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login";
import {Icon} from "./Icon";
import Config from "../config";

export type MenuIcon = "menu" | "back" | null;

export interface IAppHeaderProps {
    title?: string | JSX.Element;
    menuIcon?: MenuIcon;
    menuAction?: () => void;
}
export function ApplicationHeader(props: IAppHeaderProps) {
    let title = props.title || <span className="application-title">log<sup>2</sup></span>

    return <header className="application-header">
        {props.menuIcon && <Icon icon={props.menuIcon} onClick={props.menuAction} className="appmenu-icon" />}
        <h1>{title}</h1>
    </header>
}

interface IAppMenuProps {
    isLoggedIn: boolean;
    onSocialLoginResult: (tokens: string) => void;
}

export class ApplicationMenu extends React.Component<IAppMenuProps, {}> {
    private onLoginSuccess(res: GoogleLoginResponse | GoogleLoginResponseOffline) {
        let token = (res as any).tokenId;
        this.props.onSocialLoginResult(token);
        console.log(res);
    }
    private onLoginFail(res: GoogleLoginResponse | GoogleLoginResponseOffline) {
        this.props.onSocialLoginResult(null);
    }

    render() {
        return <div className="application-menu">
            <ApplicationHeader />
            {this.props.isLoggedIn
                ? "Inloggad"
                : <GoogleLogin clientId={Config.googleClientId} onSuccess={res => this.onLoginSuccess(res)} onFailure={res => this.onLoginFail(res)} />
            }
        </div>
    }
}