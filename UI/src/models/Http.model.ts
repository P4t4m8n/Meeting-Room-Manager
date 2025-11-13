export type THttpResponse<T> = {
  massage?: string;
  data: T;
  meta?: unknown;
};

export type THttpErrorResponse = {
  message?: string;
  errors?: Record<string, string>;
};

export const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
export type THttpMethod = (typeof HTTP_METHODS)[number];
