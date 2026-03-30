export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const fallback = `Požadavek selhal (${response.status}).`;

    try {
      const payload = (await response.json()) as { message?: string };
      throw new ApiError(response.status, payload.message ?? fallback);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(response.status, fallback);
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
