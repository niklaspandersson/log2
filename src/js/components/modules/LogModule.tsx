import React from "react";
import Panel, { PanelProps } from "../Panel";
import classnames from "classnames";

export interface LogModuleProps extends PanelProps {
    phrases: string[],
    itemsPerRow: number
}

const MultiChoiceModule: React.FunctionComponent<LogModuleProps> = (props) => {

    return  <Panel name={props.name}>
                <div className={classnames({columns:true, "is-mobile": true, "is-multiline": props.phrases.length > props.itemsPerRow })}>
                    { props.phrases.map((p,i) => <div key={i} className={classnames("column", "is-half", "choice")}>{p}</div> )}
                </div>
            </Panel>
}

export default MultiChoiceModule;