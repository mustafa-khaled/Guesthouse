import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { errorHandler, notFoundHandler } from "../errorHandler";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../common/errors/http.errors";

describe("errorHandler middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      log: {
        error: vi.fn(),
      },
      id: "test-request-id",
    } as any;

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      headersSent: false,
    };

    mockNext = vi.fn();
  });

  it("should pass to next if headers already sent", () => {
    mockResponse.headersSent = true;
    const error = new Error("Test error");

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it("should handle HttpError with correct status code", () => {
    const error = new BadRequestError("Invalid input");

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid input",
      error: "BadRequestError",
    });
  });

  it("should handle NotFoundError with 404 status", () => {
    const error = new NotFoundError("Resource not found");

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Resource not found",
      error: "NotFoundError",
    });
  });

  it("should handle UnauthorizedError with 401 status", () => {
    const error = new UnauthorizedError("Not authenticated");

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Not authenticated",
      error: "UnauthorizedError",
    });
  });

  it("should handle ZodError with 400 status and flattened errors", () => {
    const zodError = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: ["email"],
        message: "Expected string, received number",
      },
    ]);

    errorHandler(zodError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Validation failed",
      errors: zodError.flatten(),
    });
  });

  it("should handle unknown errors with 500 status and log the error", () => {
    const error = new Error("Unexpected error");

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.log?.error).toHaveBeenCalledWith({ err: error }, "Unhandled error");
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Internal server error",
      })
    );
  });
});

describe("notFoundHandler middleware", () => {
  it("should return 404 with route information", () => {
    const mockRequest = {
      method: "GET",
      path: "/api/v1/nonexistent",
    } as Request;

    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    notFoundHandler(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Route GET /api/v1/nonexistent not found",
    });
  });
});
