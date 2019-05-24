import React, { useState } from "react";
import Module from "../models/module";
import {View} from "../components/Containers";
import DocumentContext from "../contexts/DocumentContext";

interface PostViewProps {
    postId:string;
    initialValue: any;
    modules: Module[];
}


export default function PostView(props:PostViewProps) {
    const [body, setBody] = useState((props.initialValue && props.initialValue["log"] && props.initialValue["log"].body) || "");

    return  <DocumentContext.Consumer>
            {document => <View name="post">
                            <textarea className="body" spellCheck={false} value={body} onChange={ev => setBody(ev.target.value)}></textarea>
                            <footer className="clickable" onClick={() => document.saveLog(props.postId, {body})}>save</footer>
                        </View>

            }
            </DocumentContext.Consumer>
}