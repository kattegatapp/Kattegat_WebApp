import { ApiRequestError } from "@/lib/api/client";

const GENERIC_SIGN_IN =
  "We couldn't sign you in. Please check your email and password and try again.";

const GENERIC_REGISTER =
  "We couldn't create your account. Please check your details and try again.";

export function loginErrorMessage(error: unknown) {
  if (!(error instanceof ApiRequestError)) {
    return GENERIC_SIGN_IN;
  }

  switch (error.code) {
    case "ACCOUNT_PENDING_VERIFICATION":
      return "Please verify your email, then sign in again.";
    case "ADMIN_PORTAL_REQUIRED":
      return "This account must sign in through the staff portal.";
    case "AUTH_RATE_LIMITED":
    case "RATE_LIMITED":
      return "Too many attempts. Please wait a moment and try again.";
    case "BACKEND_UNREACHABLE":
    case "NETWORK_ERROR":
      return "We couldn't reach the server. Please try again shortly.";
    case "INVALID_CREDENTIALS":
    case "LOGIN_FAILED":
    default:
      return GENERIC_SIGN_IN;
  }
}

export function registerErrorMessage(error: unknown) {
  if (!(error instanceof ApiRequestError)) {
    return GENERIC_REGISTER;
  }

  switch (error.code) {
    case "SIGNUP_DISABLED":
      return "Sign-up is temporarily unavailable. Please try again later.";
    case "EMAIL_DOMAIN_BLOCKED":
      return "This email domain isn't allowed. Try a different email address.";
    case "REGISTRATION_FAILED":
    default:
      return GENERIC_REGISTER;
  }
}
