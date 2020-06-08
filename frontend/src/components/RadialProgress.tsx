import React from "react";
import classnames from "classnames";

import "./RadialProgress.scss";

type RadialProgressProps = {
  radius:number,
  stroke:number, 
  progress:number,
  className?:string,
  background?:boolean
}
export const RadialProgress:React.FC<RadialProgressProps> = ({radius, stroke, progress, background, className}) => {
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;
  return (
    <svg className={classnames("radial-progress", className)}
      height={radius * 2}
      width={radius * 2}
      >
     {background && <circle className="bg"
        strokeWidth={ stroke }
        r={ normalizedRadius }
        cx={ radius }
        cy={ radius }
        />}
      <circle className="fg"
        strokeWidth={ stroke }
        strokeDasharray={ circumference + ' ' + circumference }
        style={ { strokeDashoffset } }
        r={ normalizedRadius }
        cx={ radius }
        cy={ radius }
        />
    </svg>)
}