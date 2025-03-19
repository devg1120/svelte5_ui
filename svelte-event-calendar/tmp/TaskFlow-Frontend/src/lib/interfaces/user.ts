export interface User {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  username: string;
  dp_url: string;
  email: string;
}

export interface UserMinimalForm {
  id: string;
  username: string;
  full_name: string;
  dp_url: string;
}

// for showing in scrollable member list in creation options
export interface UserMemberInfo {
  user_id: string;
  username: string;
  full_name: string;
  role: number;
  dp_url: string;
}

export interface SignInInfo {
  email: string;
  password: string;
}

export interface RegistrationInfo {
  first_name: string;
  middle_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}

export interface UserSuggestion {
  id: string;
  name: string;
  full_name: string;
  dp_url: string;
}
