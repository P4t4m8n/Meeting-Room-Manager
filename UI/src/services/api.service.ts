import type { THttpErrorResponse, THttpMethod, THttpResponse } from "../models/Http.model";
import { AppError } from "../utils/AppError";
import buildQueryParams from "../utils/buildQueryParams";

const BASE_URL =
  import.meta.env.VITE_PUBLIC_API_BASE_URL || "http://localhost:5228/api";

interface IApiService {
  get: <T>(endpoint: string, data?: unknown) => Promise<THttpResponse<T>>;
  post: <T>(endpoint: string, data?: unknown) => Promise<THttpResponse<T>>;
  put: <T>(endpoint: string, data?: unknown) => Promise<THttpResponse<T>>;
  delete: <T>(endpoint: string, data?: unknown) => Promise<THttpResponse<T>>;
}

export const apiService: IApiService = {
  get(endpoint, data) {
    return ajax(endpoint, "GET", data);
  },
  post(endpoint, data) {
    return ajax(endpoint, "POST", data);
  },
  put(endpoint, data) {
    return ajax(endpoint, "PUT", data);
  },
  delete(endpoint, data) {
    return ajax(endpoint, "DELETE", data);
  },
};

const ajax = async <T>(
  endpoint: string,
  method: THttpMethod,
  data: unknown = null
): Promise<THttpResponse<T>> => {
  let url = `${BASE_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    credentials: "include",
    headers: {
      ...(data instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
    },
  };

  if (method !== "GET" && data) {
    if (data instanceof FormData) {
      options.body = data;
    } else {
      options.body = JSON.stringify(data);
    }
  } else if (method === "GET" && data) {
    const queryParams = buildQueryParams(data);
    url += `?${queryParams}`;
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    let errorBody: THttpErrorResponse;
    try {
      errorBody = await res.json();
    } catch {
      errorBody = {};
    }
    throw AppError.create(
      errorBody?.message || res.statusText,
      res.status,
      undefined,
      errorBody?.errors
    );
  }
  const httpResponse: THttpResponse<T> = await res.json();

  if (method === "GET" && Array.isArray(httpResponse.data)) {
    const currentPage = res.headers.get("x-Current-Page");
    const perPage = res.headers.get("x-Per-Page");
    const totalCount = res.headers.get("X-Total-Count");
    const totalPages = res.headers.get("X-Total-Pages");

    httpResponse.meta = {
      currentPage: Number(currentPage),
      perPage: Number(perPage),
      total: Number(totalCount),
      totalPages: Number(totalPages),
    };

    return httpResponse;
  }

  return httpResponse;
};
