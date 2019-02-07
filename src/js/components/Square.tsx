import React from "react";

export interface SquareProps {
    size:string;
}
const Square:React.FunctionComponent<SquareProps> = props => {
    const style = {
        width: props.size,
        height: props.size
    };
    return <div className="square" style={style}>
                <div className="square-content">
                    {props.children}
                </div>
            </div>
}

export default Square;