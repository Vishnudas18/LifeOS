import { apiClient } from "@/services/apiClient";
import type { SearchQueryParams, SearchResponseData } from "../types/search";

export const searchService = {
  async search(params: SearchQueryParams): Promise<SearchResponseData> {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append("q", params.q.trim());
    if (params.types) searchParams.append("types", params.types);
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.page) searchParams.append("page", params.page.toString());

    const queryString = searchParams.toString();
    const endpoint = `/search${queryString ? `?${queryString}` : ""}`;
    const res = await apiClient<SearchResponseData>(endpoint);

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to execute global search");
    }

    return res.data;
  },
};
