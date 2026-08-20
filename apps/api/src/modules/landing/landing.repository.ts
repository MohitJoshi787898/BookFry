import { LandingSectionModel, ILandingSectionDocument } from '../../models/landing-section.model';
import { LandingSeoModel, ILandingSeoDocument } from '../../models/landing-seo.model';

export class LandingSectionRepository {
  async findPublishedSections(): Promise<ILandingSectionDocument[]> {
    return LandingSectionModel.find({ enabled: true, status: 'published' })
      .sort({ order: 1 })
      .exec();
  }

  async findAllSections(): Promise<ILandingSectionDocument[]> {
    return LandingSectionModel.find().sort({ order: 1 }).exec();
  }

  async findSectionBySectionId(sectionId: string): Promise<ILandingSectionDocument | null> {
    return LandingSectionModel.findOne({ sectionId }).exec();
  }

  async findSectionById(id: string): Promise<ILandingSectionDocument | null> {
    return LandingSectionModel.findById(id).exec();
  }

  async createSection(data: Partial<ILandingSectionDocument>): Promise<ILandingSectionDocument> {
    const section = new LandingSectionModel(data);
    return section.save();
  }

  async updateSection(
    id: string,
    updateData: Partial<ILandingSectionDocument>
  ): Promise<ILandingSectionDocument | null> {
    return LandingSectionModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async deleteSection(id: string): Promise<ILandingSectionDocument | null> {
    return LandingSectionModel.findByIdAndDelete(id).exec();
  }

  async updateOrders(orders: { id: string; order: number }[]): Promise<void> {
    const bulkOps = orders.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } },
      },
    }));
    await LandingSectionModel.bulkWrite(bulkOps);
  }

  async getSeo(): Promise<ILandingSeoDocument> {
    let seo = await LandingSeoModel.findOne().exec();
    if (!seo) {
      seo = await LandingSeoModel.create({});
    }
    return seo;
  }

  async updateSeo(data: Partial<ILandingSeoDocument>): Promise<ILandingSeoDocument> {
    let seo = await LandingSeoModel.findOne().exec();
    if (!seo) {
      seo = new LandingSeoModel(data);
    } else {
      Object.assign(seo, data);
    }
    return seo.save();
  }
}

export default LandingSectionRepository;
