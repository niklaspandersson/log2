export default interface Module {
    key: string;
    title?: string;
    type: string;
    data: MultiSelectModuleSettings|SelectModuleSettings | LogModuleSettings;
}

type ModuleTypes = "select"|"log"|"multiselect";

export interface ModuleData {

}
export interface SelectModuleSettings {
    options: string[];
}
export interface MultiSelectModuleSettings {
    annotated: boolean;
    options: string[];
}
export interface LogModuleSettings {
    phrases: string[];
}