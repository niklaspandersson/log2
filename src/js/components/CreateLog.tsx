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
                    <MultiChoiceModule name="weather" choices={["sun", "cloud-sun", "cloud", "drizzle", "rain", "cloud-flash", "snow-alt", "snow-heavy"]} itemsPerRow={4} />
                    <MultiChoiceModule name="mood" choices={["emo-grin", "emo-happy", "emo-sleep", "emo-unhappy", "emo-cry", "emo-angry"]} itemsPerRow={3} />
                </div>
    }
}