/** @jest-environment node */
import { executeGroqWithRotation } from "./groq-executor";
import * as keyProvider from "./groq-key-provider";
import axios from "axios";
import { withRetry } from "../utils/withRetry";

// Mock dependencies
jest.mock("axios");
jest.mock("./groq-key-provider");
jest.mock("../utils/withRetry", () => ({
  withRetry: jest.fn((fn) => fn()),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedKeyProvider = keyProvider as jest.Mocked<typeof keyProvider>;

const mockRequestFn = jest.fn();

describe("executeGroqWithRotation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (withRetry as jest.Mock).mockImplementation((fn) => fn());

    // Mock the axios.create chain
    const mockAxiosInstance = {
      post: mockRequestFn,
    } as any;
    (mockedAxios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
  });

  it("should succeed on the first key", async () => {
    mockedKeyProvider.getAllKeys.mockReturnValue(["valid-key-1"]);
    mockRequestFn.mockResolvedValue({ data: "success" });

    const result = await executeGroqWithRotation((client) => client.post(""));

    expect(result.data).toBe("success");
    expect(mockedKeyProvider.getAllKeys).toHaveBeenCalledTimes(1);
    expect(mockedAxios.create).toHaveBeenCalledTimes(1);
    expect(mockRequestFn).toHaveBeenCalledTimes(1);
  });

  it("should failover to the next key on a 429 error", async () => {
    mockedKeyProvider.getAllKeys.mockReturnValue([
      "ratelimited-key",
      "valid-key-2",
    ]);

    const rateLimitError = {
      response: { status: 429 },
      message: "Rate limit exceeded",
    };
    mockRequestFn
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce({ data: "success on second key" });

    const result = await executeGroqWithRotation((client) => client.post(""));

    expect(result.data).toBe("success on second key");
    expect(mockedKeyProvider.getAllKeys).toHaveBeenCalledTimes(1);
    expect(mockedAxios.create).toHaveBeenCalledTimes(2);
    expect(mockRequestFn).toHaveBeenCalledTimes(2);
  });

  it("should throw an error if all keys fail", async () => {
    mockedKeyProvider.getAllKeys.mockReturnValue(["key1", "key2"]);
    const serverError = {
      response: { status: 500 },
      message: "Internal Server Error",
    };
    mockRequestFn.mockRejectedValue(serverError);

    await expect(
      executeGroqWithRotation((client) => client.post("")),
    ).rejects.toThrow(
      "All Groq API keys failed. Last error: Internal Server Error",
    );

    expect(mockedKeyProvider.getAllKeys).toHaveBeenCalledTimes(1);
    expect(mockRequestFn).toHaveBeenCalledTimes(2);
  });

  it("should fail fast on a non-retryable error like 400", async () => {
    mockedKeyProvider.getAllKeys.mockReturnValue(["key1", "key2"]);
    const badRequestError = {
      response: { status: 400 },
      message: "Bad Request",
    };
    mockRequestFn.mockRejectedValue(badRequestError);

    await expect(
      executeGroqWithRotation((client) => client.post("")),
    ).rejects.toEqual(badRequestError);

    // Should only try once
    expect(mockRequestFn).toHaveBeenCalledTimes(1);
  });
});