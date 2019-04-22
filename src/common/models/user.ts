export default interface User {
    _id?: string;
    fullName: string;
    name: string;
    pictureUrl:string;
    email:string;

    modules: [[string, boolean]];
}