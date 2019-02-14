export default interface Module {
    key: string;
    title?: string;
    type: string;
    data: MultiSelectModuleData|SelectModuleData | LogModuleData;
}

export interface SelectModuleData {
    options: string[];
}
export interface MultiSelectModuleData {
    annotated: boolean;
    options: string[];
}
export interface LogModuleData {
    phrases: string[];
}