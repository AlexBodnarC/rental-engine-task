import axios, { type AxiosResponse } from "axios";

import { useEffect, useState } from "react";

export default function useGetListingsInView(provider: "zillow" | "zumper") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<AxiosResponse<any, any>>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    setIsLoading(true);
    async function getData() {
      try {
        const data = await axios.get("/api/get-data", {
          params: { provider: provider },
        });

        setData(data);
      } catch (error) {
        setError(error);
      }
    }
    setIsLoading(false);
    void getData();
  }, [provider]);

  return { data, isLoading, error };
}
