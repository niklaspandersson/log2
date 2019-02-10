export default interface User {
    name: string;
    email: string;
    id: number;
    modules: [[string, boolean]];
}