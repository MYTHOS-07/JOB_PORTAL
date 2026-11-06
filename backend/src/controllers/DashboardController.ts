import type { Request, Response } from "express";
import { DashboardService } from "../services/DashboardService";
import { ApiResponse } from "../utils/ApiResponse";

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  seeker = async (req: Request, res: Response): Promise<void> => {
    const data = await this.dashboardService.seeker(req.user!.id);
    ApiResponse.success(res, data);
  };

  employer = async (req: Request, res: Response): Promise<void> => {
    const data = await this.dashboardService.employer(req.user!.id);
    ApiResponse.success(res, data);
  };

  admin = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.dashboardService.admin();
    ApiResponse.success(res, data);
  };
}
