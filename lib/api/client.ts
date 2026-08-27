export const API_BASE_URL = "https://campers-api.goit.study";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`;
    const body = await response.text();
    let message = fallbackMessage;

    try {
      const data: unknown = JSON.parse(body);
      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        message = data.message;
      }
    } catch {
      // Error responses are allowed to have an empty or non-JSON body.
    }

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}
