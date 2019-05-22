import React, { useState } from "react";
import {Post} from "../../common/models/post";
import classnames from "classnames";
import IViewProps from "./IViewProps";
import Module from "../../common/models/module";

interface PostViewProps extends IViewProps {
    initialValue: any;
    modules: Module[],
    onSaveLog: (data:any) => void;
    onSaveModule: (key:string, data:any) => void;
}


export default function PostView(props:PostViewProps) {
    const [body, setBody] = useState((props.initialValue && props.initialValue["log"] && props.initialValue["log"].body) || "");

    return  <div className={classnames("post", props.className)}>
                <textarea className="body" spellCheck={false} value={body} onChange={ev => setBody(ev.target.value)}></textarea>
                <footer className="clickable" onClick={() => props.onSaveLog({body})}>save</footer>
            </div>
}