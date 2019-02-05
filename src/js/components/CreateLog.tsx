import React from "react";
import MultiChoiceModule from "./modules/MultiChoiceModule";
import LogModule from "./modules/LogModule";

export interface CreateLogProps {
    modules: string[]
}

export interface CreateLogState {

}

export default class CreateLog extends React.Component<CreateLogProps, CreateLogState>
{
    constructor(props:CreateLogProps) {
        super(props);
    }

    render() {
        return  <div className="create-post">
                    <MultiChoiceModule name="weather" choices={["sun", "cloud-sun", "cloud", "drizzle", "rain", "cloud-flash", "snow", "snow-heavy"]} itemsPerRow={4} />
                    <MultiChoiceModule name="mood" choices={["grin", "happy", "sleep", "unhappy", "cry", "angry"]} itemsPerRow={3} />
                </div>
    }
}