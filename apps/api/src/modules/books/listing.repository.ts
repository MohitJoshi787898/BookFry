import { BookListingModel, IBookListingDocument } from '../../models/book-listing.model';
import mongoose from 'mongoose';

export class ListingRepository {
  async findById(id: string): Promise<IBookListingDocument | null> {
    return BookListingModel.findById(id).populate('catalogId').exec();
  }

  async findBySellerAndCatalog(
    sellerId: string,
    catalogId: string
  ): Promise<IBookListingDocument | null> {
    return BookListingModel.findOne({
      sellerId: new mongoose.Types.ObjectId(sellerId),
      catalogId: new mongoose.Types.ObjectId(catalogId),
    }).exec();
  }

  async findByCatalogId(catalogId: string): Promise<IBookListingDocument[]> {
    return BookListingModel.find({
      catalogId: new mongoose.Types.ObjectId(catalogId),
      status: 'active',
    })
      .sort({ price: 1 }) // cheapest first
      .populate('sellerId', 'name email avatar')
      .exec();
  }

  async findBySellerId(
    sellerId: string,
    statusFilter?: string
  ): Promise<IBookListingDocument[]> {
    const query: Record<string, unknown> = {
      sellerId: new mongoose.Types.ObjectId(sellerId),
    };
    if (statusFilter) query.status = statusFilter;
    return BookListingModel.find(query)
      .sort({ createdAt: -1 })
      .populate('catalogId')
      .exec();
  }

  async findAll(statusFilter?: string): Promise<IBookListingDocument[]> {
    const query: Record<string, unknown> = {};
    if (statusFilter) query.status = statusFilter;
    return BookListingModel.find(query)
      .sort({ createdAt: -1 })
      .populate('catalogId')
      .exec();
  }

  async findPaginatedBySeller(
    sellerId: string,
    page: number,
    limit: number,
    search?: string,
    status?: string
  ): Promise<{ docs: IBookListingDocument[]; total: number }> {
    const query: Record<string, unknown> = {
      sellerId: new mongoose.Types.ObjectId(sellerId),
    };
    if (status) query.status = status;

    // Search via a lookup on catalog fields handled in SellerService via aggregation
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      BookListingModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: 'catalogId', populate: { path: 'category', select: 'name slug' } })
        .exec(),
      BookListingModel.countDocuments(query),
    ]);
    return { docs, total };
  }

  async create(data: Partial<IBookListingDocument>): Promise<IBookListingDocument> {
    const listing = new BookListingModel(data);
    const saved = await listing.save();
    await saved.populate('catalogId');
    return saved;
  }

  async update(
    id: string,
    data: Partial<IBookListingDocument>
  ): Promise<IBookListingDocument | null> {
    return BookListingModel.findByIdAndUpdate(id, data, { new: true })
      .populate('catalogId')
      .exec();
  }

  async delete(id: string): Promise<IBookListingDocument | null> {
    return BookListingModel.findByIdAndDelete(id).exec();
  }
}
export default ListingRepository;
