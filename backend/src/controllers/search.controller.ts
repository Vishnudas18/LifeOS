import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { SearchService } from "../services/search.service.js";
import { searchQuerySchema } from "../validators/search.validator.js";
import { sendSuccess } from "../utils/response.js";

const searchService = new SearchService();

export async function searchController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { q, types, page, limit } = searchQuerySchema.parse(req.query);

    const searchResults = await searchService.executeGlobalSearch(
      userId,
      q,
      types,
      page,
      limit
    );

    sendSuccess(res, searchResults, "Global search executed successfully");
  } catch (error) {
    next(error);
  }
}
