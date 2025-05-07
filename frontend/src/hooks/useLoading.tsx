import { useState } from 'react';

export function useLoading() {
  const [loading, setLoading] = useState(false);

  const LoadingIndicator = () => (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-kage-purple"></div>
    </div>
  );

  return { loading, setLoading, LoadingIndicator };
}