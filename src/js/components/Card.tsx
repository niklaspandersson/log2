import React from "react";
import classnames from "classnames";

export interface CardProps {
    name:string;
    hidden?: boolean;
}
const Panel: React.FunctionComponent<CardProps> = (props) => {

    const [hidden, setHidden] = React.useState(false);

    return  (!hidden) ? <section className={classnames({"removing": !!props.hidden}, "card", "panel", props.name)} onTransitionEnd={ev => setHidden(ev.propertyName == "height")}>
                <div className="card-content">
                    {props.children}
                </div>                
            </section>
            : null
}

export default Panel;