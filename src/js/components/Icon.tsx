import React from "react";
import classnames from "classnames";

export interface IconProps{
    icon:string;
    onClick?: () => void;
    className?:string;
};

const Icon:React.FunctionComponent<IconProps> = props => {
    return <div className={classnames(props.className, "icon is-xlarge")} onClick={props.onClick}><i className={`icon-${props.icon}`} /></div>
}

export default Icon;