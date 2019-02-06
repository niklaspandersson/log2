import React from "react";
import Card, { CardProps } from "../Card";
import Icon from "../Icon";
import classnames from "classnames";

export interface MultiChoiceModuleProps extends CardProps {
    choices: string[],
    itemsPerRow: number
}

function getColumnSize(count:number) {
    let result = "";
    switch(count) {
        case 2:
            result = "is-half";
            break;
        case 3:
            result = "is-one-third";
            break;
        case 4:
            result = "is-one-quarter";
            break;
        case 5:
            result = "is-one-fifth";
            break;
        default:
            break;
    }

    return result;
}

const MultiChoiceModule: React.FunctionComponent<MultiChoiceModuleProps> = (props) => {

    const columnSize = getColumnSize(props.itemsPerRow);

    return  <Card name={props.name}>
                <div className={classnames({columns:true, "is-mobile": true, "is-multiline": props.choices.length > props.itemsPerRow })}>
                    { props.choices.map((c,i) => <div key={i} className={classnames("column", "choice", columnSize)}>{<Icon icon={c} />}</div> )}
                </div>
            </Card>
}

export default MultiChoiceModule;