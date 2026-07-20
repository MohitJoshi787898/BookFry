import { CategoryModel, ICategoryDocument } from '../../models/category.model';

export class CategoriesRepository {
  async findAll(): Promise<ICategoryDocument[]> {
    return CategoryModel.find().sort({ order: 1, name: 1 }).exec();
  }

  async findById(id: string): Promise<ICategoryDocument | null> {
    return CategoryModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<ICategoryDocument | null> {
    return CategoryModel.findOne({ slug }).exec();
  }

  async create(data: Partial<ICategoryDocument>): Promise<ICategoryDocument> {
    const category = new CategoryModel(data);
    return category.save();
  }

  async update(
    id: string,
    updateData: Partial<ICategoryDocument>
  ): Promise<ICategoryDocument | null> {
    return CategoryModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string): Promise<ICategoryDocument | null> {
    return CategoryModel.findByIdAndDelete(id).exec();
  }
}
export default CategoriesRepository;
