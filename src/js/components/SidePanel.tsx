import React, {useState} from "react";
import classnames from "classnames";

interface SidePanelProps {
    visible: boolean;
    children?: React.ReactNode;
    onHide?: () => void;
}

function SidePanel(props:SidePanelProps) {

    return  <div className={classnames({"side-panel": true, "visible": props.visible})}>
                <div className="background" onClick={props.onHide}></div>
                <div className="container">
                    {props.children}
                </div>
            </div>
}

export default SidePanel;