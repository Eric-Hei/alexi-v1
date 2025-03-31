import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Validates request data against a Zod schema
 * @param request The Next.js request object
 * @param schema The Zod schema to validate against
 * @returns The validated data or throws an error response
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodType<T>,
): Promise<T> {
  try {
    const data = await request.json();
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }
    throw NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }
}

/**
 * Handles API errors and returns appropriate responses
 * @param error The error that occurred
 * @param message A custom error message
 * @returns A NextResponse with the error details
 */
export function handleApiError(
  error: unknown,
  message = "An error occurred",
): NextResponse {
  console.error(message, error);

  if (error instanceof NextResponse) {
    return error;
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: message, details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ error: message }, { status: 500 });
}
