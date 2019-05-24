import React from "react";
import classnames from "classnames";

export default function ContainerFactory(id:string) {
    const result:React.FunctionComponent<{name:string}> = ({name, children}) => {
        return <div className={classnames(id, `${name}-${id}`)}>{children}</div>
    }

    return result;
}

export const View = ContainerFactory("view");
export const Module = ContainerFactory("module");
