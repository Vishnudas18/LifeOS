import { useQuery } from "@tanstack/react-query";
import { searchService } from "../services/searchService";
import type { SearchQueryParams, SearchResponseData } from "../types/search";

export function useGlobalSearch(params: SearchQueryParams) {
  const query = params.q?.trim() || "";

  return useQuery<SearchResponseData, Error>({
    queryKey: ["global-search", params.q, params.types, params.page, params.limit],
    queryFn: () => searchService.search(params),
    enabled: query.length > 0,
    staleTime: 1000 * 30, // 30s cache
  });
}
