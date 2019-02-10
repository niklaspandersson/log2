import React from "react";
import Post from "../models/post";
import classnames from "classnames";
import IViewProps from "./IViewProps";
import Module, { SelectModuleData } from "../models/module";
import Icon from "../components/Icon";

interface CreateNewPostViewProps extends IViewProps {
    modules: Module[];
}
function SelectModuleView(props:Module) {
    let data = props.data as SelectModuleData;
    return  <div>
                <header>{props.title}</header>
                <div className={classnames({columns:true, "is-mobile": true, "is-multiline": data.options.length > 4 })}>
                    { data.options.map((c,i) => {
                        return  <div key={i} className={classnames("column", "choice", "is-one-quarter")}>
                                    <Icon icon={c} />
                                </div>
                    })}
                </div>                
            </div>
}

function LogModuleView(props:Module) {
    return <div>log</div>
}

function createModuleComponent(model:Module) {
    let result:JSX.Element = null;

    switch(model.type) {
        case "select":
            result = <SelectModuleView {...model} />
            break;
        case "log":
            result = <LogModuleView {...model} />
            break;
    }

    return result;
}

export default function CreateNewPostView(props:CreateNewPostViewProps) {

    let modules = props.modules
                        .map(m => {
                            let component = createModuleComponent(m);
                            return component && <li key={m.key}><div className="module">{component}</div></li>
                        })
                        .filter(m => !!m);

    return  <div className={classnames("create-post", props.className)}>
                <ul>
                    {modules}
                </ul>
            </div>
}