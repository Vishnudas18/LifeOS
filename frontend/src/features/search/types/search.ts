export type SearchEntityType =
  | "TASK"
  | "GOAL"
  | "MILESTONE"
  | "TRANSACTION"
  | "CALENDAR_EVENT"
  | "FOCUS_SESSION"
  | "NOTIFICATION";

export interface SearchResultDTO {
  id: string;
  type: SearchEntityType;
  title: string;
  description: string;
  metadata: Record<string, any>;
  score: number;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface GroupedSearchResults {
  TASKS: SearchResultDTO[];
  GOALS: SearchResultDTO[];
  MILESTONES: SearchResultDTO[];
  TRANSACTIONS: SearchResultDTO[];
  CALENDAR_EVENTS: SearchResultDTO[];
  FOCUS_SESSIONS: SearchResultDTO[];
  NOTIFICATIONS: SearchResultDTO[];
}

export interface SearchResponseData {
  query: string;
  totalResults: number;
  page: number;
  limit: number;
  totalPages: number;
  types: SearchEntityType[];
  groupedResults: GroupedSearchResults;
  results: SearchResultDTO[];
}

export interface SearchQueryParams {
  q: string;
  types?: string;
  limit?: number;
  page?: number;
}
