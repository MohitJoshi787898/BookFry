import { BookModel, IBookDocument } from '../../models/book.model';

export class BooksRepository {
  async findById(id: string): Promise<IBookDocument | null> {
    return BookModel.findById(id).populate('category').exec();
  }

  async findBySlug(slug: string): Promise<IBookDocument | null> {
    return BookModel.findOne({ slug }).populate('category').exec();
  }

  async findAndPaginate(
    filter: any,
    sort: any,
    page: number,
    limit: number
  ): Promise<{ docs: IBookDocument[]; total: number }> {
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      BookModel.find(filter).sort(sort).skip(skip).limit(limit).populate('category').exec(),
      BookModel.countDocuments(filter).exec(),
    ]);

    return { docs, total };
  }

  async create(data: Partial<IBookDocument>): Promise<IBookDocument> {
    const book = new BookModel(data);
    const saved = await book.save();
    return saved.populate('category');
  }

  async update(id: string, updateData: Partial<IBookDocument>): Promise<IBookDocument | null> {
    return BookModel.findByIdAndUpdate(id, updateData, { new: true }).populate('category').exec();
  }

  async delete(id: string): Promise<IBookDocument | null> {
    return BookModel.findByIdAndDelete(id).exec();
  }
}
export default BooksRepository;
