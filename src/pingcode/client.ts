import type { Config } from "../config.js";

interface TokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

export class PingCodeError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "PingCodeError";
  }
}

export class PingCodeClient {
  private accessToken?: string;
  private tokenExpiresAt = 0;

  constructor(private readonly config: Config) {
    this.accessToken = config.PINGCODE_ACCESS_TOKEN;
    if (this.accessToken) {
      this.tokenExpiresAt = Number.POSITIVE_INFINITY;
    }
  }

  async get<T>(path: string, query?: Record<string, unknown>): Promise<T> {
    return this.request<T>("GET", path, undefined, query);
  }

  async post<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async patch<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }

  private async request<T>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    body?: Record<string, unknown>,
    query?: Record<string, unknown>,
  ): Promise<T> {
    const token = await this.getAccessToken();
    const url = this.buildUrl(path, query);
    let response: Response;
    try {
      response = await fetchWithRetry(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      throw new PingCodeError(formatNetworkError(method, path, error));
    }

    const responseBody = await parseResponse(response);
    if (!response.ok) {
      throw new PingCodeError(formatApiError(response.status, responseBody), response.status, responseBody);
    }

    return responseBody as T;
  }

  private async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (this.accessToken && now < this.tokenExpiresAt - this.config.PINGCODE_TOKEN_REFRESH_SKEW_SECONDS) {
      return this.accessToken;
    }

    if (!this.config.PINGCODE_CLIENT_ID || !this.config.PINGCODE_CLIENT_SECRET) {
      throw new Error("PINGCODE_ACCESS_TOKEN is missing and client credentials are not configured.");
    }

    const url = this.buildUrl("/v1/auth/token", {
      grant_type: "client_credentials",
      client_id: this.config.PINGCODE_CLIENT_ID,
      client_secret: this.config.PINGCODE_CLIENT_SECRET,
    });
    let response: Response;
    try {
      response = await fetchWithRetry(url, { method: "GET", headers: { Accept: "application/json" } });
    } catch (error) {
      throw new PingCodeError(formatNetworkError("GET", "/v1/auth/token", error));
    }
    const body = await parseResponse(response);

    if (!response.ok) {
      throw new PingCodeError(formatApiError(response.status, body), response.status, body);
    }

    const token = body as TokenResponse;
    if (!token.access_token) {
      throw new PingCodeError("PingCode token response did not include access_token.", response.status, body);
    }

    this.accessToken = token.access_token;
    this.tokenExpiresAt = token.expires_in ?? now + 30 * 24 * 60 * 60;
    return this.accessToken;
  }

  private buildUrl(path: string, query?: Record<string, unknown>): string {
    const url = new URL(`${this.config.PINGCODE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);

    for (const [key, value] of Object.entries(query ?? {})) {
      if (value === undefined || value === null || value === "") {
        continue;
      }
      if (Array.isArray(value)) {
        url.searchParams.set(key, value.join(","));
      } else {
        url.searchParams.set(key, String(value));
      }
    }

    return url.toString();
  }
}

async function fetchWithRetry(url: string, init: RequestInit, attempts = 3): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }

  throw lastError;
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function formatApiError(status: number, body: unknown): string {
  if (typeof body === "object" && body && "message" in body && typeof body.message === "string") {
    return `PingCode API request failed (${status}): ${body.message}`;
  }

  return `PingCode API request failed (${status}).`;
}

function formatNetworkError(method: string, path: string, error: unknown): string {
  if (error instanceof Error) {
    const cause = error.cause instanceof Error ? ` Cause: ${error.cause.message}` : "";
    return `PingCode API network request failed for ${method} ${path}: ${error.message}.${cause}`;
  }

  return `PingCode API network request failed for ${method} ${path}: ${String(error)}`;
}
