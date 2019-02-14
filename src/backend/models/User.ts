
export interface IUser
{
    fullName: string;    //OIDC_CLAIM_name	    Niklas Andersson 363TEGY
    name: string;       //OIDC_CLAIM_given_name	Niklas
    profileUrl:string;  //OIDC_CLAIM_profile	https://plus.google.com/108993789665707522983
    pictureUrl:string;  //OIDC_CLAIM_picture	https://lh3.googleusercontent.com/-Y29VGDp_tiA/AAAAAAAAAAI/AAAAAAAAAAQ/G6shmElDO6M/s96-c/photo.jpg
    email:string;       //OIDC_CLAIM_email	    nikand001@utb.vaxjo.se
}

export class User implements IUser
{
    constructor(model:IUser)
    {
        this.fullName = model.fullName;
        this.name = model.name;
        this.profileUrl = model.profileUrl;
        this.pictureUrl = model.pictureUrl;
        this.email = model.email;
    }

    fullName: string;
    name: string;
    profileUrl:string;
    pictureUrl:string;
    email:string;
}