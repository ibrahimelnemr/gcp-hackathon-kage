// hooks/HttpHook.ts
import { useState } from "react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export default function HttpHook() {
  const [loading, setLoading] = useState<boolean>(false);
  const [httpError, setHttpError] = useState<string | null>(null);

  type Method = "post" | "get" | "put" | "delete" | "patch";

  const sendRequest = async ({
    method,
    url,
    body
  }: {
    method: Method;
    url: string;
    body?: any;
  }): Promise<any> => {
    setLoading(true);
    setHttpError(null);

    try {
      let response: AxiosResponse;

      switch (method) {
        case "get":
          response = await axios.get(url);
          break;
        case "post":
          response = await axios.post(url, body);
          break;
        case "put":
          response = await axios.put(url, body);
          break;
        case "patch":
          response = await axios.patch(url, body);
          break;
        case "delete":
          response = await axios.delete(url);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      console.log(`HttpHook - response`);
      console.log(response);
      console.log(response.data);

      return response.data;

    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setHttpError(errorMessage);
      console.error("Request error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    httpError,
    sendRequest,
  };
}
