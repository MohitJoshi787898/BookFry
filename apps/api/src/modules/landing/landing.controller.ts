import { Request, Response } from 'express';
import { LandingService } from './landing.service';
import { ApiResponse } from '../../utils/ApiResponse';

export class LandingController {
  private landingService: LandingService;

  constructor() {
    this.landingService = new LandingService();
  }

  /** Public Endpoint: GET /api/v1/landing */
  getPublicLanding = async (req: Request, res: Response): Promise<void> => {
    const data = await this.landingService.getPublicLandingData();
    res.status(200).json(ApiResponse.success(data));
  };

  /** Admin: GET /api/v1/admin/landing/sections */
  getAdminSections = async (req: Request, res: Response): Promise<void> => {
    const sections = await this.landingService.getAllAdminSections();
    res.status(200).json(ApiResponse.success(sections));
  };

  /** Admin: POST /api/v1/admin/landing/sections */
  createSection = async (req: Request, res: Response): Promise<void> => {
    const section = await this.landingService.createSection(req.body);
    res.status(201).json(ApiResponse.success(section));
  };

  /** Admin: PATCH /api/v1/admin/landing/sections/:id */
  updateSection = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const section = await this.landingService.updateSection(id, req.body);
    res.status(200).json(ApiResponse.success(section));
  };

  /** Admin: DELETE /api/v1/admin/landing/sections/:id */
  deleteSection = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this.landingService.deleteSection(id);
    res.status(200).json(ApiResponse.success({ deleted: true }));
  };

  /** Admin: PATCH /api/v1/admin/landing/reorder */
  reorderSections = async (req: Request, res: Response): Promise<void> => {
    const { sections } = req.body;
    const updated = await this.landingService.reorderSections(sections);
    res.status(200).json(ApiResponse.success(updated));
  };

  /** Admin: GET /api/v1/admin/landing/seo */
  getAdminSeo = async (req: Request, res: Response): Promise<void> => {
    const seo = await this.landingService.getAdminSeo();
    res.status(200).json(ApiResponse.success(seo));
  };

  /** Admin: PATCH /api/v1/admin/landing/seo */
  updateAdminSeo = async (req: Request, res: Response): Promise<void> => {
    const seo = await this.landingService.updateSeo(req.body);
    res.status(200).json(ApiResponse.success(seo));
  };
}

export default LandingController;
