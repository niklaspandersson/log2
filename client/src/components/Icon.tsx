import React from "react";
import classnames from "classnames";

export interface IconProps{
    icon:string;
    onClick?: () => void;
    className?:string;
};

export function Icon(props:IconProps) {
    return <div className={classnames(props.className, "icon", {"clickable": !!props.onClick})} onClick={props.onClick}><i className={`icon-${props.icon}`} /></div>
}

export default Icon;