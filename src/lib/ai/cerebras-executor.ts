import axios, { AxiosInstance } from "axios";
import { withRetry } from "../utils/withRetry";
import { getAllKeys } from "./cerebras-key-provider";
import { logger } from "../logger";

const CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions";

export async function executeCerebrasWithRotation<T>(
  requestFn: (client: AxiosInstance) => Promise<T>,
): Promise<T> {
  const allKeys = getAllKeys();
  if (allKeys.length === 0) {
    throw new Error("No Cerebras API keys provided in environment variables.");
  }

  // Fisher-Yates shuffle
  for (let i = allKeys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allKeys[i], allKeys[j]] = [allKeys[j], allKeys[i]];
  }

  let lastError: any;

  for (const apiKey of allKeys) {
    try {
      const client = axios.create({
        baseURL: CEREBRAS_API_URL,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      });

      return await withRetry(() => requestFn(client));
    } catch (error: any) {
      lastError = error;
      const status = error.response?.status;

      // Rotate on 429 (rate limit), 401/403 (auth errors), or 5xx server errors
      if (
        status === 429 ||
        status === 401 ||
        status === 403 ||
        (status >= 500 && status <= 599)
      ) {
        logger.warn(
          `Cerebras API key failed (status: ${status}). Rotating to next key. Error: ${error.message}`,
        );
        continue; // Try the next key
      }

      // For other errors (e.g., 400 bad request), fail fast.
      throw error;
    }
  }

  throw new Error(
    `All Cerebras API keys failed. Last error: ${lastError?.message}`,
  );
}