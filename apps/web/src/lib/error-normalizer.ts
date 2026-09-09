export interface NormalizedError {
  title: string;
  message: string;
  code?: string;
  status?: number;
}

export function normalizeApiError(error: unknown): NormalizedError {
  if (!error) {
    return {
      title: "Request couldn't be completed",
      message: 'An unexpected issue occurred. Please try again.',
    };
  }

  const err = error as {
    status?: number;
    code?: string;
    message?: string;
    details?: Array<{ field?: string; message?: string }>;
  };

  const status = err.status;
  const code = err.code;
  const rawMsg = err.message || '';

  // Network / Offline errors
  if (
    rawMsg.toLowerCase().includes('failed to fetch') ||
    rawMsg.toLowerCase().includes('networkerror') ||
    rawMsg.toLowerCase().includes('internet')
  ) {
    return {
      title: 'Connection interrupted',
      message: "We couldn't reach BookFry servers. Please check your internet connection and try again.",
      status: 0,
      code: 'NETWORK_ERROR',
    };
  }

  // HTTP Status normalization
  switch (status) {
    case 400:
      if (err.details && err.details.length > 0) {
        const detailMsgs = err.details
          .map((d) => (d.field ? `${d.field}: ${d.message}` : d.message))
          .filter(Boolean)
          .join(', ');
        return {
          title: 'Check your details',
          message: detailMsgs || 'Please review the highlighted fields and try again.',
          status: 400,
          code: 'VALIDATION_ERROR',
        };
      }
      return {
        title: 'Check your request',
        message: rawMsg || 'The request contains invalid details. Please check and try again.',
        status: 400,
        code: code || 'BAD_REQUEST',
      };

    case 401:
      return {
        title: 'Session expired',
        message: 'Your session has expired. Please sign in again to continue.',
        status: 401,
        code: 'UNAUTHORIZED',
      };

    case 403:
      return {
        title: 'Access restricted',
        message: "You don't have permission to perform this action on BookFry.",
        status: 403,
        code: 'FORBIDDEN',
      };

    case 404:
      return {
        title: 'Not found',
        message: rawMsg || "We couldn't find the requested book or resource.",
        status: 404,
        code: 'NOT_FOUND',
      };

    case 409:
      return {
        title: 'Information updated',
        message: 'This item was recently updated. Please refresh the page to view the latest details.',
        status: 409,
        code: 'CONFLICT',
      };

    case 422:
      return {
        title: 'Validation error',
        message: rawMsg || 'Some required information is missing or formatted incorrectly.',
        status: 422,
        code: 'UNPROCESSABLE_ENTITY',
      };

    case 429:
      return {
        title: 'Taking a quick breather',
        message: "You're making requests a little too quickly. Please wait a moment before trying again.",
        status: 429,
        code: 'RATE_LIMITED',
      };

    case 500:
    case 502:
    case 503:
    case 504:
      return {
        title: 'Server hiccup',
        message: 'Our servers encountered a temporary issue. Please try again in a few seconds.',
        status: status,
        code: 'SERVER_ERROR',
      };

    default:
      break;
  }

  // Fallback for standard Error objects
  if (error instanceof Error) {
    if (
      rawMsg.includes('E11000') ||
      rawMsg.includes('CastError') ||
      rawMsg.includes('Mongo') ||
      rawMsg.includes('ECONNREFUSED')
    ) {
      return {
        title: 'Unable to complete request',
        message: 'The requested operation could not be completed right now. Please try again.',
        code: 'DB_ERROR',
      };
    }

    return {
      title: 'Action could not be completed',
      message: rawMsg || 'Something unexpected occurred. Please try again.',
      code: code,
      status: status,
    };
  }

  return {
    title: 'Action could not be completed',
    message: String(error),
  };
}

