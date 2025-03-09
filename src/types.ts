export interface AuthUser {
  phoneNumber: string;
  uid: string;
  signed: boolean;
}

export interface User {
  name: string;
  choice: "first" | "second";
  options: { option1: boolean; option2: boolean };
}

export interface Item {
  title: string;
  id: string | number[];
}
