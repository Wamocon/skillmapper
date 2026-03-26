import { NextResponse } from "next/server";

export function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function aiErrorResponse(
  message: string,
  status: number,
  code: string,
  retriable = false,
  detail?: string,
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      retriable,
      detail: detail ?? null,
    },
    { status },
  );
}
