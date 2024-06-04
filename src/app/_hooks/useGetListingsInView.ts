import axios, { type AxiosResponse } from "axios";

import { useEffect, useState } from "react";
import { type RentalProperty } from "~/app/_types/rental-prop";

export default function useGetListingsInView() {
  const [data, setData] = useState<AxiosResponse<RentalProperty[], unknown>>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    setIsLoading(true);
    async function getData() {
      try {
        const data = await axios.get<RentalProperty[]>("/api/get-rental-data");

        setData(data);
      } catch (error) {
        setError(error);
      }
    }
    setIsLoading(false);
    void getData();
  }, []);

  return { data, isLoading, error };
}
