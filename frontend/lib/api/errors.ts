export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function parseApiError(res: Response): Promise<ApiError> {
  const body = await res.json().catch(() => ({ message: res.statusText }))
  return new ApiError(body.message || res.statusText, res.status, body.errors)
}
