import { NextResponse } from "next/server";
import { AppError } from "./errors";

export interface StandardApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, unknown>;
  };
  requestId: string;
  timestamp: string;
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function apiSuccess<T>(data: T, requestId?: string, status = 200): NextResponse<StandardApiResponse<T>> {
  const reqId = requestId || generateRequestId();
  const response: StandardApiResponse<T> = {
    success: true,
    data,
    requestId: reqId,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, {
    status,
    headers: {
      "X-Request-Id": reqId,
      "Content-Type": "application/json",
    },
  });
}

export function apiError(error: unknown, requestId?: string): NextResponse<StandardApiResponse<never>> {
  const reqId = requestId || generateRequestId();
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    const response: StandardApiResponse<never> = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
      },
      requestId: reqId,
      timestamp,
    };
    return NextResponse.json(response, {
      status: error.statusCode,
      headers: { "X-Request-Id": reqId },
    });
  }

  const message = error instanceof Error ? error.message : "An unexpected internal server error occurred";
  const response: StandardApiResponse<never> = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message,
      statusCode: 500,
    },
    requestId: reqId,
    timestamp,
  };

  return NextResponse.json(response, {
    status: 500,
    headers: { "X-Request-Id": reqId },
  });
}
