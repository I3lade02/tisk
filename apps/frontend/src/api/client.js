export class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
export async function apiFetch(path, init) {
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
            const payload = (await response.json());
            throw new ApiError(response.status, payload.message ?? fallback);
        }
        catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(response.status, fallback);
        }
    }
    if (response.status === 204) {
        return undefined;
    }
    return (await response.json());
}
