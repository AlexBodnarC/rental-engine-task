import useGetListingsInView from "./useGetListingsInView";
import useGetPartnerData from "~/app/_hooks/useGetPartnerData";

import { type ResponseZumper } from "../_types/responseZumper";
import { type ZillowResponce } from "../_types/zillowResponce";

/**
 * This hook combines the data from different sources and maps it to a new data structure.
 *
 * @returns {Object} An object containing the combined data.
 */
export default function useDataWithStatus() {
  // Get the data from the 'useGetListingsInView' hook.
  const { data } = useGetListingsInView();

  // Get the data from the 'useGetPartnerData' hook for the 'zillow' provider.
  const {
    data: zillowData,
    error: zillowError,
    isLoading: zillowIsLoading,
  } = useGetPartnerData("zillow");

  // Get the data from the 'useGetPartnerData' hook for the 'zumper' provider.
  const {
    data: zumperData,
    error: zumperError,
    isLoading: zumperIsLoading,
  } = useGetPartnerData("zumper");

  // Combine the data from different sources.
  const dataWithStatus = data?.data.map((item) => {
    // Get the data from the 'zumperData' object.
    const dataZumper = zumperData?.data as ResponseZumper;

    // Get the data from the 'zillowData' object.
    const dataZillow = zillowData?.data as ZillowResponce;

    // Find the corresponding item in the 'zumperData' object.
    const zumperProperty = dataZumper?.properties.property;
    const zumperItem = zumperProperty?.find((f) => {
      if (String(item.id) === f.details["provider-listingid"]._text) return f;
    });

    // Find the corresponding item in the 'zillowData' object.
    const zillowProperty = dataZillow?.hotPadsItems.Listing;
    const zillowItem = zillowProperty?.find((f) => {
      if (String(item.id) === f._attributes.id) return f;
    });

    // Return a new object with the combined data.
    return { ...item, zumperItem: zumperItem, zillowItem: zillowItem };
  });

  // Return the combined data.
  return {
    dataWithStatus,
    zillowError,
    zumperError,
    zillowIsLoading,
    zumperIsLoading,
  };
}
