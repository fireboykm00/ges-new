import { toast } from "sonner";

interface APIError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
    status?: number;
  };
  message?: string;
}

export function handleAPIError(
  error: unknown,
  defaultMessage = "An error occurred"
) {
  const apiError = error as APIError;

  // Handle validation errors
  if (apiError.response?.data?.errors) {
    const errors = Object.entries(apiError.response.data.errors)
      .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
      .join("\n");
    toast.error(errors);
    return;
  }

  // Handle specific error messages from the server
  if (apiError.response?.data?.message) {
    toast.error(apiError.response.data.message);
    return;
  }

  // Handle network errors
  if (apiError.message && apiError.message.includes("Network Error")) {
    toast.error(
      "Unable to connect to the server. Please check your connection."
    );
    return;
  }

  // Handle authentication errors
  if (apiError.response?.status === 401) {
    toast.error("Your session has expired. Please login again.");
    return;
  }

  // Handle forbidden errors
  if (apiError.response?.status === 403) {
    toast.error("You don't have permission to perform this action.");
    return;
  }

  // Handle not found errors
  if (apiError.response?.status === 404) {
    toast.error("The requested resource was not found.");
    return;
  }

  // Handle server errors
  if (apiError.response?.status && apiError.response.status >= 500) {
    toast.error("A server error occurred. Please try again later.");
    return;
  }

  // Default error message
  toast.error(defaultMessage);
}

export function handleAPISuccess(message: string) {
  toast.success(message);
}
