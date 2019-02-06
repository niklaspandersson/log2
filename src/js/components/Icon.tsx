import React from "react";

export interface IconProps{
    icon:string;
};

const Icon:React.FunctionComponent<IconProps> = props => {
    return <div className="icon"><i className={`icon-${props.icon}`} /></div>
}

export default Icon;