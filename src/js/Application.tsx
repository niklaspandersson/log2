import React, {useState} from "react";
import classnames from "classnames";
import Loader from "./components/Loader";
import CreateLog from "./components/CreateLog";

export interface ApplicationProps {

};

export interface ApplicationState {

};

const modules = ["weather", "mood", "log"];

const Test : React.FunctionComponent<ApplicationProps> = props => {

    const [isToggled, setIsToggled] = useState(false);
    
    const onAnimationEnd:React.AnimationEventHandler = ev => {
        if(ev.animationName == "example")
            setIsToggled(false);
    };
    const onClick:React.MouseEventHandler = ev => setIsToggled(!isToggled);

    return  <div    id="test" 
                    onClick={onClick} 
                    className={classnames({"active": isToggled})} 
                    onAnimationEnd={onAnimationEnd}>
                DEMO!
            </div>
}

export default class Application extends React.Component<ApplicationProps, ApplicationState> {
    constructor(props:ApplicationProps) {
        super(props);
        
        this.state = {

        };
    }

    render() {
        return  <>
                    <Loader>
                        <Test />
                        <CreateLog modules={modules} />
                    </Loader>
                </>
    }
}