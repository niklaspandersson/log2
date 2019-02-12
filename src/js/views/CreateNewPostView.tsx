import React, {useState} from "react";
import Post from "../models/post";
import classnames from "classnames";
import IViewProps from "./IViewProps";
import Module, { SelectModuleData } from "../models/module";
import Icon from "../components/Icon";

interface CreateNewPostViewProps extends IViewProps {
    modules: Module[];
    onComplete?: (data:any) => void;
}

interface ModuleProps extends Module {
    onSelect: (val:any) => void;
}
function SelectModuleView(props:ModuleProps) {
    let data = props.data as SelectModuleData;

    return  <>
                <header>{props.title}</header>
                <div className="select">
                    { data.options.map((c,i) => <div key={i} className={"option"}><Icon icon={c} onClick={() => props.onSelect(c)} /></div>)}
                </div>                
            </>
}

function LogModuleView(props:ModuleProps) {
    return <div>log</div>
}

function createModuleComponent(model:Module, setter: (key:any, val:any) => void) {
    let result:JSX.Element = null;

    switch(model.type) {
        case "select":
            result = <SelectModuleView {...model} onSelect={(val:any) => setter(model.key, val)} />
            break;
        case "log":
            result = <LogModuleView {...model} onSelect={(val:any) => setter(model.key, val)} />
            break;
    }

    return result;
}

export default function CreateNewPostView(props:CreateNewPostViewProps) {
    let [data, setData] = useState({});

    const setModuleData = (key:string, value:any) => {
        let newData:any = {...data};
        newData[key] = value;
        console.log(newData);
        setData(newData);
    }

    let modules = props.modules
                        .map(m => {
                            let component = createModuleComponent(m, setModuleData);
                            return component && <li key={m.key}><div className="module">{component}</div></li>
                        })
                        .filter(m => !!m);

    return  <div className={classnames("create-post", props.className)}>
                <ul>
                    {modules}
                </ul>
            </div>
}