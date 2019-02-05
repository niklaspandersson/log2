import React from "react";
import classnames from "classnames";

export interface PanelProps {
    name:string;
}
const Panel: React.FunctionComponent<PanelProps> = (props) => {

    return  <div className={classnames("panel", name)}>
                {props.children}
            </div>
}

export default Panel;