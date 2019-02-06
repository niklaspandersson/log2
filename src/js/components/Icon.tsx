import React from "react";

export interface IconProps{
    icon:string;
};

const Icon:React.FunctionComponent<IconProps> = props => {
    return <div className="icon is-xlarge"><i className={`icon-${props.icon}`} /></div>
}

export default Icon;