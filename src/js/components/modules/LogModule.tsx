import React from "react";
import Card, { CardProps } from "../Card";
import classnames from "classnames";

export interface LogModuleProps extends CardProps {
    phrases: string[],
    itemsPerRow: number
}

const MultiChoiceModule: React.FunctionComponent<LogModuleProps> = (props) => {

    return  <Card name={props.name}>
                <div className={classnames({columns:true, "is-mobile": true, "is-multiline": props.phrases.length > props.itemsPerRow })}>
                    { props.phrases.map((p,i) => <div key={i} className={classnames("column", "is-half", "choice")}>{p}</div> )}
                </div>
            </Card>
}

export default MultiChoiceModule;