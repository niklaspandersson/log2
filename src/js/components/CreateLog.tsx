import React from "react";
import MultiChoiceModule from "./modules/MultiChoiceModule";
import LogModule from "./modules/LogModule";

export interface CreateLogProps {
    modules: string[]
}

export interface CreateLogState {
    weather: string|null;
    mood: string|null;
}

const phrases = [
    "Vad har jag gjort?",
    "Vad har jag sett?",
    "Hur har det gått?",
    "Hur känns det?",
    "Vad har hänt?",
    "Vad har jag hört?",
    ""
];

export default class CreateLog extends React.Component<CreateLogProps, CreateLogState>
{
    constructor(props:CreateLogProps) {
        super(props);

        this.state= {
            mood: null,
            weather: null
        }

        this.weatherSelected = this.weatherSelected.bind(this);
        this.moodSelected = this.moodSelected.bind(this);
    }

    weatherSelected(str:string) {
        this.setState({weather: str});
    }
    moodSelected(str:string) {
        this.setState({mood: str});
    }

    render() {
        return  <div className="create-post">
                    <MultiChoiceModule name="weather" done={this.state.weather != null} 
                        choices={["sun", "cloud-sun", "cloud", "drizzle", "rain", "cloud-flash", "snow-alt", "snow-heavy"]} 
                        onChoiceSelected={this.weatherSelected}
                        itemsPerRow={4} />
                    <MultiChoiceModule name="mood" done={this.state.mood != null} 
                        choices={["emo-grin", "emo-happy", "emo-sleep", "emo-unhappy", "emo-cry", "emo-angry"]} 
                        onChoiceSelected={this.moodSelected}
                        itemsPerRow={3} />
                    <LogModule name="log" phrases={phrases} itemsPerRow={2} />
                </div>
    }
}