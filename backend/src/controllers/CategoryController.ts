import type { Request, Response } from "express";
import { HTTP_STATUS } from "../constants/http-status";
import { MESSAGES } from "../constants/messages";
import { CategoryService } from "../services/CategoryService";
import { ApiResponse } from "../utils/ApiResponse";

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const categories = await this.categoryService.list();
    ApiResponse.success(res, categories);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const category = await this.categoryService.getById(Number(req.params.id));
    ApiResponse.success(res, category);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const category = await this.categoryService.create(req.body.name);
    ApiResponse.success(res, category, MESSAGES.CATEGORY.CREATED, HTTP_STATUS.CREATED);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const category = await this.categoryService.update(Number(req.params.id), req.body.name);
    ApiResponse.success(res, category, MESSAGES.CATEGORY.UPDATED);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.categoryService.delete(Number(req.params.id));
    ApiResponse.success(res, null, MESSAGES.CATEGORY.DELETED);
  };
}
