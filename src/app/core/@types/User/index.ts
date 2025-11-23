import { UserType } from '../../enum/UserType';

export interface User {
   id?: string;
   name: string;
   email: string;
   password?: string;
   userType: UserType;
   street: string;
   city: string;
   state: string;
   zip: string;
   createdAt?: string;
}
