export default interface User {
    fullName: string;
    name: string;
    profileUrl:string;
    pictureUrl:string;
    email:string;

    modules: [[string, boolean]];
}