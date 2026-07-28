import { BookCatalogModel, IBookCatalogDocument } from '../../models/book-catalog.model';
import mongoose from 'mongoose';

export class CatalogRepository {
  async findById(id: string): Promise<IBookCatalogDocument | null> {
    return BookCatalogModel.findById(id).populate('category').exec();
  }

  async findBySlug(slug: string): Promise<IBookCatalogDocument | null> {
    return BookCatalogModel.findOne({ slug }).populate('category').exec();
  }

  async findByIsbn(isbn: string): Promise<IBookCatalogDocument | null> {
    return BookCatalogModel.findOne({ isbn: isbn.trim() }).populate('category').exec();
  }

  /**
   * Upsert: if a catalog entry with this ISBN exists, return it.
   * Otherwise create a new one. This is the deduplication entry point.
   */
  async findOrCreate(
    data: Partial<IBookCatalogDocument>
  ): Promise<{ doc: IBookCatalogDocument; created: boolean }> {
    const existing = await BookCatalogModel.findOne({ isbn: (data.isbn as string).trim() }).exec();
    if (existing) {
      if ((!existing.images || existing.images.length === 0) && data.images && data.images.length > 0) {
        existing.images = data.images;
        await existing.save();
      }
      return { doc: existing, created: false };
    }
    const created = new BookCatalogModel(data);
    const saved = await created.save();
    await saved.populate('category');
    return { doc: saved, created: true };
  }

  async update(
    id: string,
    data: Partial<IBookCatalogDocument>
  ): Promise<IBookCatalogDocument | null> {
    return BookCatalogModel.findByIdAndUpdate(id, data, { new: true })
      .populate('category')
      .exec();
  }

  /**
   * Paginated catalog browse — joins cheapest active listing price and listing count.
   */
  async findAndPaginate(
    filter: Record<string, unknown>,
    sort: Record<string, unknown>,
    page: number,
    limit: number
  ): Promise<{ docs: any[]; total: number }> {
    const skip = (page - 1) * limit;

    // Build match stage for text search / category
    const matchStage: Record<string, unknown> = { ...filter };

    const pipeline: object[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'booklistings',
          let: { cid: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$catalogId', '$$cid'] },
                status: 'active',
              },
            },
            { $sort: { price: 1 } },
          ],
          as: 'activeListings',
        },
      },
      // Only show catalogs that have at least one active listing
      { $match: { 'activeListings.0': { $exists: true } } },
      {
        $addFields: {
          lowestPrice: { $min: '$activeListings.price' },
          listingCount: { $size: '$activeListings' },
          primaryListingId: { $arrayElemAt: ['$activeListings._id', 0] },
        },
      },
      { $project: { activeListings: 0 } },
    ];

    // Apply sort
    const sortKeys = Object.keys(sort);
    if (sortKeys.length) {
      pipeline.push({ $sort: sort as any });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    // Count total (before skip/limit) using a facet
    const facet: any[] = [
      ...pipeline,
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          count: [{ $count: 'total' }],
        },
      },
    ];

    const result = await BookCatalogModel.aggregate(facet as any).exec();
    const data = result[0]?.data ?? [];
    const total = result[0]?.count?.[0]?.total ?? 0;

    // Populate category for each doc
    await BookCatalogModel.populate(data, { path: 'category' });

    return { docs: data, total };
  }

  async incrementViewCount(id: string): Promise<void> {
    await BookCatalogModel.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } }).exec();
  }

  async updateRating(
    id: string,
    newAvg: number,
    newCount: number
  ): Promise<void> {
    await BookCatalogModel.findByIdAndUpdate(id, {
      ratingAvg: newAvg,
      ratingCount: newCount,
    }).exec();
  }
}
export default CatalogRepository;
