import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "FinGenius", // Unique app ID
  name: "FinGenius",
  retryFunction: async (attempt) => ({
    delay: Math.pow(2, attempt) * 1000, // Exponential backoff
    maxAttempts: 2,
  }),
});
