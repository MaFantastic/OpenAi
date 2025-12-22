import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  /** The base URL of the auth API */
  baseURL: "http://localhost:3000/api/auth",
});
