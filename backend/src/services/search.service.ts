import { SearchRepository } from "../repositories/search.repository.js";
import {
  SearchEntityType,
  SearchResultDTO,
  SearchResponseData,
  GroupedSearchResults,
} from "../types/search.types.js";

const ALL_ENTITY_TYPES: SearchEntityType[] = [
  "TASK",
  "GOAL",
  "MILESTONE",
  "TRANSACTION",
  "CALENDAR_EVENT",
  "FOCUS_SESSION",
  "NOTIFICATION",
];

export class SearchService {
  private searchRepository: SearchRepository;

  constructor(searchRepository = new SearchRepository()) {
    this.searchRepository = searchRepository;
  }

  /**
   * Computes a deterministic relevance score for a document against search query string
   */
  private calculateScore(title: string, secondaryText: string, queryStr: string): number {
    const qLower = queryStr.toLowerCase().trim();
    const tLower = (title || "").toLowerCase().trim();
    const sLower = (secondaryText || "").toLowerCase().trim();

    if (tLower === qLower) return 100;
    if (tLower.startsWith(qLower)) return 80;
    if (tLower.includes(qLower)) return 60;
    if (sLower.includes(qLower)) return 40;
    return 20;
  }

  /**
   * Maps MongoDB documents to normalized SearchResultDTO format
   */
  private mapToDTO(type: SearchEntityType, doc: any, queryStr: string): SearchResultDTO {
    const id = doc._id.toString();
    const createdAt = (doc.createdAt || doc.date || doc.startedAt || new Date()).toISOString();
    const updatedAt = (doc.updatedAt || doc.createdAt || new Date()).toISOString();

    let title = "";
    let description = "";
    let metadata: Record<string, any> = {};
    let url = "/";

    switch (type) {
      case "TASK":
        title = doc.title || "Untitled Task";
        description = doc.description || "";
        metadata = {
          status: doc.status,
          priority: doc.priority,
          category: doc.category,
          dueDate: doc.dueDate ? new Date(doc.dueDate).toISOString() : null,
        };
        url = "/tasks";
        break;

      case "GOAL":
        title = doc.title || "Untitled Goal";
        description = doc.description || "";
        metadata = {
          status: doc.status,
          priority: doc.priority,
          category: doc.category,
          progress: doc.progress ?? 0,
          targetDate: doc.targetDate ? new Date(doc.targetDate).toISOString() : null,
        };
        url = `/goals/${id}`;
        break;

      case "MILESTONE":
        title = doc.title || "Untitled Milestone";
        description = doc.description || "";
        metadata = {
          status: doc.status,
          dueDate: doc.dueDate ? new Date(doc.dueDate).toISOString() : null,
          goalId: doc.goalId ? doc.goalId.toString() : null,
        };
        url = doc.goalId ? `/goals/${doc.goalId.toString()}` : "/goals";
        break;

      case "TRANSACTION":
        title = doc.description || `${doc.type || "Transaction"} (${doc.category || ""})`;
        description = doc.notes || "";
        metadata = {
          type: doc.type,
          amount: doc.amount, // Stored in paise
          currency: doc.currency || "INR",
          category: doc.category,
          paymentMethod: doc.paymentMethod,
          date: doc.date ? new Date(doc.date).toISOString() : createdAt,
        };
        url = "/expenses";
        break;

      case "CALENDAR_EVENT":
        title = doc.title || "Untitled Event";
        description = doc.description || doc.location || "";
        metadata = {
          type: doc.type,
          status: doc.status,
          startDateTime: doc.startDateTime ? new Date(doc.startDateTime).toISOString() : null,
          endDateTime: doc.endDateTime ? new Date(doc.endDateTime).toISOString() : null,
          location: doc.location || "",
        };
        url = "/calendar";
        break;

      case "FOCUS_SESSION":
        title = doc.title || "Focus Session";
        description = doc.notes || "";
        metadata = {
          mode: doc.mode,
          status: doc.status,
          plannedDuration: doc.plannedDuration,
          actualDuration: doc.actualDuration,
          startedAt: doc.startedAt ? new Date(doc.startedAt).toISOString() : null,
        };
        url = "/focus";
        break;

      case "NOTIFICATION":
        title = doc.title || "Notification";
        description = doc.message || "";
        metadata = {
          type: doc.type,
          read: doc.read,
          channel: doc.channel,
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : createdAt,
        };
        url = "/";
        break;
    }

    const secondaryText = `${description} ${JSON.stringify(metadata)}`;
    const score = this.calculateScore(title, secondaryText, queryStr);

    return {
      id,
      type,
      title,
      description,
      metadata,
      score,
      createdAt,
      updatedAt,
      url,
    };
  }

  /**
   * Main global search entry point
   */
  async executeGlobalSearch(
    userId: string,
    queryStr: string,
    requestedTypes?: SearchEntityType[],
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResponseData> {
    const typesToSearch =
      requestedTypes && requestedTypes.length > 0
        ? requestedTypes
        : ALL_ENTITY_TYPES;

    // Fetch records from repository (fetching up to 50 per entity type to allow scoring)
    const rawResultsByEntity = await this.searchRepository.searchAllEntities(
      userId,
      queryStr,
      typesToSearch,
      50
    );

    const allMappedDTOs: SearchResultDTO[] = [];
    const groupedResults: GroupedSearchResults = {
      TASKS: [],
      GOALS: [],
      MILESTONES: [],
      TRANSACTIONS: [],
      CALENDAR_EVENTS: [],
      FOCUS_SESSIONS: [],
      NOTIFICATIONS: [],
    };

    for (const group of rawResultsByEntity) {
      const mapped = group.docs.map((doc) => this.mapToDTO(group.type, doc, queryStr));
      
      // Sort within category by score desc, then updatedAt desc
      mapped.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

      switch (group.type) {
        case "TASK":
          groupedResults.TASKS = mapped;
          break;
        case "GOAL":
          groupedResults.GOALS = mapped;
          break;
        case "MILESTONE":
          groupedResults.MILESTONES = mapped;
          break;
        case "TRANSACTION":
          groupedResults.TRANSACTIONS = mapped;
          break;
        case "CALENDAR_EVENT":
          groupedResults.CALENDAR_EVENTS = mapped;
          break;
        case "FOCUS_SESSION":
          groupedResults.FOCUS_SESSIONS = mapped;
          break;
        case "NOTIFICATION":
          groupedResults.NOTIFICATIONS = mapped;
          break;
      }

      allMappedDTOs.push(...mapped);
    }

    // Sort overall flat results by score descending, then updatedAt descending
    allMappedDTOs.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    const totalResults = allMappedDTOs.length;
    const totalPages = Math.ceil(totalResults / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedResults = allMappedDTOs.slice(startIndex, startIndex + limit);

    return {
      query: queryStr,
      totalResults,
      page,
      limit,
      totalPages,
      types: typesToSearch,
      groupedResults,
      results: paginatedResults,
    };
  }
}
