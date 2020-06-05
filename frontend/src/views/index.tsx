import React from "react";
import classnames from "classnames";

type Props = {
  name?: string;
}

const View : React.FC<Props> = ({children, name}) => {
  return <div className={classnames({"view": true, [`id-${name}`]: !!name })}>{children}</div>
}

export default View;

export type ViewTypes = "dashboard" | "entry";