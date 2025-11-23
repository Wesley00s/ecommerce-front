import { UserType } from '../../enum/UserType';

export interface LoginResponse {
   id: string;
   name: string;
   email: string;
   userType: UserType;
}
