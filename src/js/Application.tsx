import React, {useState} from "react";
import classnames from "classnames";
import Loader from "./components/Loader";
import CreateLog from "./components/CreateLog";

export interface ApplicationProps {

};

export interface ApplicationState {

};

const modules = ["weather", "mood", "log"];

// const Test : React.FunctionComponent<ApplicationProps> = props => {

//     const [isToggled, setIsToggled] = useState(false);
    
//     const onAnimationEnd = (ev:React.AnimationEvent) => {
//         if(ev.animationName == "example")
//             setIsToggled(false);
//     };

//     return  <div    id="test" 
//                     onClick={ev => setIsToggled(!isToggled)} 
//                     className={classnames({"active": isToggled})} 
//                     onAnimationEnd={onAnimationEnd}>
//                 DEMO!
//             </div>
// }

export default class Application extends React.Component<ApplicationProps, ApplicationState> {
    constructor(props:ApplicationProps) {
        super(props);
        
        this.state = {

        };
    }

    render() {
        return  <>
                    <Loader>
                        <CreateLog modules={modules} />
                    </Loader>
                </>
    }
}