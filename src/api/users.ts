import axios from "axios";

export type UserType = {
    id?: number;
    name?: string;
    username?: string;
    email?: string;
    address?: object;
    phone?: string;
    website?: string;
    company?: object;
  }

export function getUsers() {
    return axios
        .get<UserType[]>("http://localhost:3000/users")
        .then(res => res.data)
}