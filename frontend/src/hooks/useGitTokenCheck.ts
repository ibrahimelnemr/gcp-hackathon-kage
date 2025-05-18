import { useState } from "react";
import { BACKEND_URL } from "@/data/Data";
import HttpHook from "@/hooks/HttpHook";

export function useGitTokenCheck() {
  const [tokenExists, setTokenExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendRequest } = HttpHook();

  const checkToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sendRequest({
        method: "get",
        url: `${BACKEND_URL}/github/check-token/`,
      });
      setTokenExists(data?.exists || false);
    } catch (err) {
      setError("Failed to verify GitHub token.");
    } finally {
      setLoading(false);
    }
  };

  return { tokenExists, loading, error, checkToken };
}