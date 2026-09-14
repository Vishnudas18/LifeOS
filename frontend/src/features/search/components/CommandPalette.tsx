import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, History, ArrowRight, Loader2, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "../hooks/useDebounce";
import { useGlobalSearch } from "../hooks/useGlobalSearch";
import { SearchResultItem } from "./SearchResultItem";
import type { SearchResultDTO } from "../types/search";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = "lifeos_recent_searches";
const MAX_RECENT_SEARCHES = 5;

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const { data: searchData, isLoading } = useGlobalSearch({
    q: debouncedQuery,
    limit: 10,
  });

  const results: SearchResultDTO[] = searchData?.results || [];

  // Load recent searches on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Save recent search
  const addRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    try {
      const updated = [
        trimmed,
        ...recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, MAX_RECENT_SEARCHES);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const handleSelectResult = (result: SearchResultDTO) => {
    addRecentSearch(query || result.title);
    onClose();
    navigate(result.url);
  };

  const handleViewAllResults = () => {
    if (!query.trim()) return;
    addRecentSearch(query);
    onClose();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  // Keyboard navigation inside command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0 && selectedIndex < results.length) {
        handleSelectResult(results[selectedIndex]);
      } else if (query.trim()) {
        handleViewAllResults();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
      >
        {/* Input Bar */}
        <div className="relative flex items-center px-4 py-3 border-b border-border/80 bg-muted/20">
          <Search className="w-5 h-5 text-muted-foreground mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type to search tasks, goals, expenses, calendar..."
            className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60 text-sm font-medium"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ESC to close
            </kbd>
          )}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* Empty Query State: Recent Searches */}
          {!query.trim() && (
            <div className="py-2 px-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium mb-3 px-2">
                <span className="flex items-center">
                  <History className="w-3.5 h-3.5 mr-1.5" /> Recent Searches
                </span>
                {recentSearches.length > 0 && (
                  <button
                    onClick={clearRecentSearches}
                    className="text-[11px] hover:text-foreground transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {recentSearches.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <Command className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  Search tasks, goals, expenses, calendar events, focus sessions & notifications.
                </div>
              ) : (
                <div className="space-y-1">
                  {recentSearches.map((term, idx) => (
                    <div
                      key={idx}
                      onClick={() => setQuery(term)}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/60 text-xs font-medium text-foreground cursor-pointer transition-colors"
                    >
                      <span className="truncate">{term}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {query.trim() && isLoading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs font-medium">Searching Life OS...</span>
            </div>
          )}

          {/* Search Results */}
          {query.trim() && !isLoading && (
            <>
              {results.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground space-y-1">
                  <p className="text-xs font-semibold text-foreground">
                    No results found for "{query}"
                  </p>
                  <p className="text-[11px]">
                    Try checking for typos or searching a different keyword.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {results.map((result, idx) => (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      isSelected={idx === selectedIndex}
                      onSelect={() => handleSelectResult(result)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer / View All Link */}
        {query.trim() && searchData && (
          <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Found {searchData.totalResults} result{searchData.totalResults === 1 ? "" : "s"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAllResults}
              className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10"
            >
              View all results on Search page
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
