export type UserRole = "danisan" | "psikolog" | "admin";

export type AppSession = {
  userId: number;
  email: string;
  role: UserRole;
};
