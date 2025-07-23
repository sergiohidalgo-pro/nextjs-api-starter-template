import { NextResponse } from 'next/server';

type ApiResponseData = Record<string, any> | null;

export class ApiResponseUtil {
  static success(data: ApiResponseData, message: string = 'Success', status: number = 200) {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      { status }
    );
  }

  static error(errorData: Record<string, any> | string, status: number = 400) {
    const error = typeof errorData === 'string' ? { message: errorData } : errorData;
    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status }
    );
  }

  static unauthorized(message: string = 'Unauthorized') {
    return this.error({ message }, 401);
  }

  static internalError(message: string = 'Internal Server Error') {
    return this.error({ message }, 500);
  }

  static methodNotAllowed(message: string = 'Method Not Allowed') {
    return this.error({ message }, 405);
  }
}