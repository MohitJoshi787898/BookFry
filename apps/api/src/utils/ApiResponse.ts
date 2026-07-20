import { ApiResponse as IApiResponse } from '@bookmarket/types';

export class ApiResponse {
  static success<T>(data: T, meta?: any): IApiResponse<T> {
    return {
      success: true,
      data,
      meta,
      error: null,
    };
  }

  static error(message: string, code: string, details?: any[]): IApiResponse<null> {
    return {
      success: false,
      data: null,
      error: {
        code,
        message,
        details,
      },
    };
  }
}
