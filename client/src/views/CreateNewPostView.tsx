import React, {useState} from "react";
import {Post} from "../../common/models/post";
import classnames from "classnames";
import IViewProps from "./IViewProps";
import Module, { SelectModuleSettings, LogModuleSettings } from "../../common/models/module";
import Icon from "../components/Icon";
import useDebounce from "../utils/useDebounce";

interface CreateNewPostViewProps extends IViewProps {
    modules: Module[];
    onComplete?: (data:any) => void;
}

interface ModuleProps extends Module {
    onSelect: (val:any) => void;
}
function SelectModuleView(props:ModuleProps) {
    let data = props.data as SelectModuleSettings;

    const [value, setValue] = useState("");

    const doSelect = (c:string) => {
        props.onSelect(c);
        setValue(c);    
    }

    return  <>
                <header>{props.title}</header>
                <div className={classnames({"select": true, "has-value": !!value})}>
                    { data.options.map((c,i) => <div key={i} className={classnames({"option": true, "selected": value === c})}><Icon icon={c} onClick={doSelect.bind(null, c)} /></div>)}
                </div>                
            </>
}

function LogModuleView(props:ModuleProps) {
    let data = props.data as LogModuleSettings;

    const [value, setValue] = useState("");

    const doSelect = (p:string) => {
        props.onSelect({body: p});
        setValue(p);    
    }
    return  <>
                <div className={classnames({"select": true, "has-value": !!value})}>
                    { data.phrases.map((p,i) => <div key={i} className={classnames({"option": true, "selected": value === p})}><div className="clickable" onClick={doSelect.bind(null, p)}>{p}</div></div>)}
                </div>                
            </>
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
    let [hidden, setHidden] = useState({});
    let debouncedHidden = useDebounce(hidden, 500);

    const setModuleData = (key:string, value:any) => {
        let newData:any = {...data};
        newData[key] = value;

        if(key === "log") {
            props.onComplete(newData);
        }
        setData(newData);

        let newHidden:any = {...hidden};
        newHidden[key] = true;
        setHidden(newHidden);
    }

    let modules = props.modules
                        .map(m => {
                            let component = createModuleComponent(m, setModuleData);
                            return component && <li key={m.key}><div className={classnames("module", `module-${m.key}`, ((debouncedHidden as any)[m.key]) && "hidden" )}>{component}</div></li>
                        })
                        .filter(m => !!m);

    return  <div className={classnames("create-post", props.className)}>
                <ul>
                    {modules}
                </ul>
            </div>
}