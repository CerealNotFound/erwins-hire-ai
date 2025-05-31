"use client";

import { useState } from "react";
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { toast } from "sonner";

/**
 * Type-safe configuration for the API call
 *
 * @template T - Request body type
 * @template R - Response data type
 */

type ApiOptions<T = any, R = any> = {
  url: string; // Endpoint to call
  method?: AxiosRequestConfig["method"]; // HTTP method: GET, POST, etc.
  data?: T; // Request body payload (used for POST, PUT, etc.)
  params?: Record<string, any>; // URL query parameters (for filtering, etc.)
  headers?: Record<string, string>; // Optional headers
  loadingMessage?: string; // Message shown during the API call
  successMessage?: (response: R) => string; // Function to generate a success toast message based on response
  errorMessage?: string | ((error: AxiosError) => string); // Static or dynamic error message
  onSuccess?: (response: R) => void; // Optional success handler
  onError?: (error: AxiosError) => void; // Optional error handler
};

/**
 * useApiToast - A reusable hook for API calls with toast notifications
 * Usage:
 * const { callApi, isLoading } = useApiToast();
 *
 * callApi({
 *   url: '/api/users',
 *   method: 'GET',
 *   loadingMessage: 'Fetching users...',
 *   successMessage: (res) => `Loaded ${res.length} users!`,
 *   errorMessage: (err) => `Failed: ${err.message}`,
 *   onSuccess: (data) => console.log('Users:', data),
 * });
 */

export const useApiToast = () => {
  const [isLoading, setIsLoading] = useState(false);

  const callApi = async <T = any, R = any>(
    options: ApiOptions<T, R>
  ): Promise<R> => {
    const {
      url,
      method = "GET",
      data,
      params,
      headers,
      loadingMessage = "Loading...",
      successMessage = () => "Success! :D",
      errorMessage = "An error occurred :/",
      onSuccess = () => {},
      onError = () => {},
    } = options;

    setIsLoading(true);

    const apiPromise = new Promise<R>(async (resolve, reject) => {
        try {
          const response: AxiosResponse<R> = await axios({
            url,
            method,
            data,
            params,
            headers,
          });

          setIsLoading(false);
          onSuccess(response.data);
          resolve(response.data);
          // DEV-only success log
          if (process.env.NEXT_PUBLIC_ENVIRONMENT === "development") {
            console.log(
              `[useApiToast] API Success: ${method} ${url}`,
              response.data
            );
          }
        } catch (err) {
          const error = err as AxiosError;
          setIsLoading(false);
          onError(error);
          reject(error);
          // DEV-only error log
          if (process.env.NEXT_PUBLIC_ENVIRONMENT === "development") {
            console.error(`[useApiToast] API Error: ${method} ${url}`, error);
          }
        }
      });

    toast.promise(apiPromise, {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
    });

    return apiPromise;
  };

  return { callApi, isLoading };
};
