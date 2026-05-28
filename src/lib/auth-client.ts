import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  fetchOptions: {
    customFetch: async (url, options) => {
      return fetch(url, options);
    },
  },
});
