import FetchService from "./FetchService";
import Module from "../../common/models/module";

export default class ModulesService extends FetchService<Module>
{
    constructor(url:string) {
        super(url);
    }
}