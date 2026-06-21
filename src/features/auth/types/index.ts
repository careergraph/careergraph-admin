export type LoginPayload = {
  email: string;
  password: string;
  role: "ADMIN";
};

export type AdminSession = {
  id: string;
  email: string;
  role: string;
};
