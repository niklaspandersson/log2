import React, { useContext } from "react";
import {UserInfo} from "../models/user";

export const UserContext = React.createContext<UserInfo|undefined>(undefined);

export function useCurrentUser() {
  const user = useContext(UserContext);
  return user;
}