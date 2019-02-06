import React from "react";
import classnames from "classnames";

export interface CardProps {
    name:string;
}
const Panel: React.FunctionComponent<CardProps> = (props) => {

    return  <div className={classnames("card", name)}>
                <div className="card-content">
                    {props.children}
                </div>                
            </div>
}

export default Panel;