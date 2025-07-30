import { NextResponse } from 'next/server';

type ApiResponseData = Record<string, any> | null;

export class ApiResponseUtil {
  static success(data: ApiResponseData, message: string = 'Success', headers?: Record<string, string>, status: number = 200) {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      { status, headers }
    );
  }

  static error(errorData: Record<string, any> | string, status: number = 400, headers?: Record<string, string>) {
    const error = typeof errorData === 'string' ? { message: errorData } : errorData;
    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status, headers }
    );
  }

  static unauthorized(message: string = 'Unauthorized', headers?: Record<string, string>) {
    return this.error({ message }, 401, headers);
  }

  static internalError(message: string = 'Internal Server Error', headers?: Record<string, string>) {
    return this.error({ message }, 500, headers);
  }

  static methodNotAllowed(message: string = 'Method Not Allowed', headers?: Record<string, string>) {
    return this.error({ message }, 405, headers);
  }
}