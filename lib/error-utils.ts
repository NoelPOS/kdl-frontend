
export const SKIP_GLOBAL_ERROR = Symbol.for('SKIP_GLOBAL_ERROR');

/**
 * Marks an error to skip global error handling
 * Use this when you want to handle errors locally in a component
 */
export function skipGlobalError(error: any): any {
  if (error && typeof error === 'object') {
    error[SKIP_GLOBAL_ERROR] = true;
  }
  return error;
}

/**
 * Checks if an error should skip global error handling
 */
export function shouldSkipGlobalError(error: any): boolean {
  return error && typeof error === 'object' && error[SKIP_GLOBAL_ERROR] === true;
}

/**
 * Enhanced error handler for components that want custom error handling
 * but still want to leverage the global error parsing logic
 */
export function parseApiError(error: any): {
  type: 'validation' | 'single' | 'network' | 'http' | 'unknown';
  messages: string[];
  status?: number;
  originalError: any;
} {
  const result: {
    type: 'validation' | 'single' | 'network' | 'http' | 'unknown';
    messages: string[];
    status?: number;
    originalError: any;
  } = {
    type: 'unknown',
    messages: [],
    status: undefined,
    originalError: error,
  };

  if (!error) {
    result.messages = ['Unknown error occurred'];
    return result;
  }

  // Handle structured validation errors
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    result.type = 'validation';
    result.status = error.response.status;
    
    error.response.data.errors.forEach((err: any) => {
      const fieldName = err.property || 'Field';
      const message = err.message || 'Validation failed';
      result.messages.push(`${fieldName}: ${message}`);
    });
    
    return result;
  }

  // Handle single error message
  if (error.response?.data?.message) {
    result.type = 'single';
    result.status = error.response.status;
    result.messages = [error.response.data.message];
    return result;
  }

  // Handle string error response
  if (typeof error.response?.data === 'string') {
    result.type = 'single';
    result.status = error.response.status;
    result.messages = [error.response.data];
    return result;
  }

  // Handle network errors
  if (!error.response) {
    result.type = 'network';
    result.messages = ['Network error. Please check your connection and try again.'];
    return result;
  }

  // Handle HTTP status codes
  result.type = 'http';
  result.status = error.response.status;
  
  const status = error.response.status;
  switch (status) {
    case 400:
      result.messages = ['Bad request. Please check your input and try again.'];
      break;
    case 404:
      result.messages = ['Resource not found.'];
      break;
    case 409:
      result.messages = ['Conflict error. The resource may have been modified by another user.'];
      break;
    case 422:
      result.messages = ['Validation error. Please check your input.'];
      break;
    case 500:
      result.messages = ['Internal server error. Please try again later.'];
      break;
    case 502:
    case 503:
    case 504:
      result.messages = ['Server temporarily unavailable. Please try again later.'];
      break;
    default:
      result.messages = [`Request failed with status ${status}. Please try again.`];
  }

  return result;
}

export async function handleApiCall<T>(
  apiCall: () => Promise<T>,
  customErrorHandler?: (error: any) => void
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    // Mark error to skip global handling
    const skippedError = skipGlobalError(error);
    
    if (customErrorHandler) {
      customErrorHandler(skippedError);
    }
    
    throw skippedError;
  }
}