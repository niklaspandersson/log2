import React from "react";
import Card, { CardProps } from "../Card";
import Icon from "../Icon";
import classnames from "classnames";

export interface MultiChoiceModuleProps extends CardProps {
    choices: string[],
    itemsPerRow: number,
    onChoiceSelected: (str:string) => void,
    done: boolean
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

    const [activeChoice, setActiveChoice] = React.useState("");
    const timeoutRef = React.useRef(-1);

    const selectChoice = function (str:string) {
        setActiveChoice(str);
        if(timeoutRef.current != -1)
            clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => props.onChoiceSelected(activeChoice), 1000);
    }

    return  <Card name={props.name} hidden={props.done}>
                <div className={classnames({columns:true, "is-mobile": true, "is-multiline": props.choices.length > props.itemsPerRow })}>
                    { props.choices.map((c,i) => {
                        return  <div key={i} className={classnames("column", "choice", columnSize)}>
                                    <Icon icon={c} onClick={() => selectChoice(c)} className={classnames({"active": activeChoice == c})} />
                                </div>
                    })}
                </div>
            </Card>
}

export default MultiChoiceModule;