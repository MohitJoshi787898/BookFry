import { Request, Response } from 'express';
import { CategoriesService } from './categories.service';
import { ApiResponse } from '../../utils/ApiResponse';

export class CategoriesController {
  private categoriesService: CategoriesService;

  constructor() {
    this.categoriesService = new CategoriesService();
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    const categories = await this.categoriesService.getAllCategories();
    res.status(200).json(ApiResponse.success(categories));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const { name, parentId, imageUrl, order } = req.body;
    const category = await this.categoriesService.createCategory({
      name,
      parentId,
      imageUrl,
      order,
    });
    res.status(201).json(ApiResponse.success(category));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const category = await this.categoriesService.updateCategory(id, req.body);
    res.status(200).json(ApiResponse.success(category));
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this.categoriesService.deleteCategory(id);
    res.status(200).json(ApiResponse.success({ message: 'Category deleted successfully' }));
  };
}
export default CategoriesController;
