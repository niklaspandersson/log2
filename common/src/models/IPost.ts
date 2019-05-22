import {ModuleData} from "./module";
export interface IPost {
    _id?: string;
    data: ModuleData;
    date: string;
    created?: string;
    updated?: string;
    user?: string;
}