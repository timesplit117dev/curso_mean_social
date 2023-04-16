import { User } from "./user";

export class Follow{

  constructor(
    public _id: string,
    public user: User,
    public followed: User,
  ){



  }

}
