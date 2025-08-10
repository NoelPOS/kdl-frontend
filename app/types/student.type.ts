export interface Student {
  id: string;
  nickname: string;
  name: string;
  dob: string;
  phone: string;
  gender?: string;
  school?: string;
  parent?: string;
  adConcent?: boolean;
  allergic: string[];
  doNotEat: string[];
  profilePicture: string;
  profileKey: string;
}
