import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Loader2, Filter, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/features/search/hooks/useDebounce";
import { useGlobalSearch } from "@/features/search/hooks/useGlobalSearch";
import { SearchResultItem } from "@/features/search/components/SearchResultItem";
import type { SearchResultDTO, SearchEntityType } from "@/features/search/types/search";

const CATEGORY_TABS: { label: string; value: string; entityType?: SearchEntityType }[] = [
  { label: "All", value: "ALL" },
  { label: "Tasks", value: "TASK", entityType: "TASK" },
  { label: "Goals", value: "GOAL", entityType: "GOAL" },
  { label: "Milestones", value: "MILESTONE", entityType: "MILESTONE" },
  { label: "Expenses", value: "TRANSACTION", entityType: "TRANSACTION" },
  { label: "Calendar", value: "CALENDAR_EVENT", entityType: "CALENDAR_EVENT" },
  { label: "Focus", value: "FOCUS_SESSION", entityType: "FOCUS_SESSION" },
  { label: "Notifications", value: "NOTIFICATION", entityType: "NOTIFICATION" },
];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialType = searchParams.get("type") || "ALL";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState(initialType);
  const [page, setPage] = useState(initialPage);

  const debouncedQuery = useDebounce(inputQuery, 300);

  // Sync state with URL search params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedQuery.trim()) params.q = debouncedQuery.trim();
    if (selectedType && selectedType !== "ALL") params.type = selectedType;
    if (page > 1) params.page = page.toString();
    setSearchParams(params, { replace: true });
  }, [debouncedQuery, selectedType, page, setSearchParams]);

  // Execute global search hook
  const {
    data: searchData,
    isLoading,
    isError,
    refetch,
  } = useGlobalSearch({
    q: debouncedQuery,
    types: selectedType !== "ALL" ? selectedType : undefined,
    page,
    limit: 20,
  });

  const handleTabChange = (typeVal: string) => {
    setSelectedType(typeVal);
    setPage(1);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputQuery(e.target.value);
    setPage(1);
  };

  const results = searchData?.results || [];
  const grouped = searchData?.groupedResults;
  const totalResults = searchData?.totalResults || 0;
  const totalPages = searchData?.totalPages || 1;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Search Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Search className="w-6 h-6 text-primary" /> Global Search
        </h1>
        <p className="text-xs text-muted-foreground">
          Search across tasks, goals, milestones, expenses, calendar events, focus sessions, and notifications.
        </p>
      </div>

      {/* Main Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={inputQuery}
          onChange={handleQueryChange}
          placeholder="Search everything in Life OS (e.g. Django, Study, Amazon, Meeting)..."
          className="w-full h-12 pl-12 pr-4 rounded-xl border border-input bg-card text-foreground text-sm font-medium shadow-xs outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-3.5 h-5 w-5 text-primary animate-spin" />
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-border">
        <Filter className="w-4 h-4 text-muted-foreground mr-1 flex-shrink-0" />
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedType === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Results Content */}
      <div className="space-y-6">
        {/* Initial Empty Query State */}
        {!debouncedQuery.trim() && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 border rounded-2xl border-dashed border-border/80 bg-muted/20">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Search your Life OS
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Find tasks, goals, expenses, calendar events, focus sessions, and notifications in one place.
            </p>
          </div>
        )}

        {/* Loading Skeletons */}
        {debouncedQuery.trim() && isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-border/40 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {debouncedQuery.trim() && !isLoading && isError && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 border rounded-2xl border-destructive/30 bg-destructive/5 text-destructive">
            <AlertCircle className="w-8 h-8" />
            <h3 className="text-sm font-semibold">Search is temporarily unavailable</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              An unexpected error occurred while processing your search request. Please try again.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry Search
            </Button>
          </div>
        )}

        {/* No Results State */}
        {debouncedQuery.trim() && !isLoading && !isError && results.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-2 border rounded-2xl border-border/60 bg-card">
            <h3 className="text-base font-semibold text-foreground">
              No results found for "{debouncedQuery}"
            </h3>
            <p className="text-xs text-muted-foreground max-w-md">
              Try adjusting your search terms or selecting a different category filter.
            </p>
          </div>
        )}

        {/* Results List / Grouped View */}
        {debouncedQuery.trim() && !isLoading && !isError && results.length > 0 && (
          <div className="space-y-6">
            {/* Header summary */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Found <strong className="text-foreground font-semibold">{totalResults}</strong> result{totalResults === 1 ? "" : "s"} for "{debouncedQuery}"
              </span>
              {totalPages > 1 && (
                <span>
                  Page {page} of {totalPages}
                </span>
              )}
            </div>

            {/* Display grouped results when "ALL" tab is selected and we are on page 1 */}
            {selectedType === "ALL" && page === 1 && grouped ? (
              <div className="space-y-6">
                {Object.entries(grouped).map(([groupKey, groupItems]: [string, SearchResultDTO[]]) => {
                  if (!groupItems || groupItems.length === 0) return null;
                  const groupTitle = groupKey.replace("_", " ");
                  return (
                    <div key={groupKey} className="space-y-2.5">
                      <div className="flex items-center space-x-2 border-b border-border/60 pb-1.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {groupTitle}
                        </h3>
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-medium">
                          {groupItems.length}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {groupItems.map((item) => (
                          <SearchResultItem key={item.id} result={item} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Flat paginated list for specific category tabs or page > 1 */
              <div className="space-y-2">
                {results.map((item) => (
                  <SearchResultItem key={item.id} result={item} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="text-xs"
                >
                  Previous
                </Button>

                <span className="text-xs text-muted-foreground font-medium">
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  className="text-xs"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
