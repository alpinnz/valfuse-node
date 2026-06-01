export type Role = {
  id: string;
  name: string;
};

export type UserObjectFormValues = {
  name: string;
  email: string;
  role: Role | null;
};

export type UserIdFormValues = {
  name: string;
  email: string;
  roleId: string;
};

