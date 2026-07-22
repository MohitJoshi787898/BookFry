import { CategoriesRepository } from './categories.repository';
import { ICategoryDocument } from '../../models/category.model';
import { ConflictError, NotFoundError } from '../../utils/AppError';
import { Category } from '@bookmarket/types';

export class CategoriesService {
  private categoriesRepository: CategoriesRepository;

  constructor() {
    this.categoriesRepository = new CategoriesRepository();
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async getAllCategories(): Promise<Category[]> {
    const docs = await this.categoriesRepository.findAll();
    return docs.map((doc) => this.mapToDTO(doc));
  }

  async createCategory(data: {
    name: string;
    description?: string;
    parentId?: string | null;
    imageUrl?: string;
    order?: number;
  }): Promise<Category> {
    const slug = this.generateSlug(data.name);
    const existing = await this.categoriesRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictError('A category with this name/slug already exists');
    }

    const doc = await this.categoriesRepository.create({
      name: data.name,
      slug,
      description: data.description,
      parentId: data.parentId ? (data.parentId as any) : null,
      imageUrl: data.imageUrl,
      order: data.order || 0,
    });

    return this.mapToDTO(doc);
  }

  async updateCategory(
    id: string,
    data: { name?: string; description?: string; parentId?: string | null; imageUrl?: string; order?: number }
  ): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const updateData: Partial<ICategoryDocument> = { ...data } as any;

    if (data.name && data.name !== category.name) {
      const slug = this.generateSlug(data.name);
      const existing = await this.categoriesRepository.findBySlug(slug);
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError('A category with this name already exists');
      }
      updateData.slug = slug;
    }

    const updatedDoc = await this.categoriesRepository.update(id, updateData);
    if (!updatedDoc) {
      throw new NotFoundError('Category not found for update');
    }

    return this.mapToDTO(updatedDoc);
  }

  async deleteCategory(id: string): Promise<void> {
    const deleted = await this.categoriesRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Category not found');
    }
  }

  mapToDTO(doc: ICategoryDocument): Category {
    return {
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      parentId: doc.parentId ? doc.parentId.toString() : null,
      imageUrl: doc.imageUrl,
      order: doc.order,
    };
  }
}
export default CategoriesService;
