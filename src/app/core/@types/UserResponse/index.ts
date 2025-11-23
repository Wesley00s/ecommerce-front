import { UserType } from '../../enum/UserType';

export interface UserResponse {
   id: string;
   name: string;
   email: string;
   userType: UserType;
   street: string;
   city: string;
   state: string;
   zip: string;
   createdAt: string;
}
