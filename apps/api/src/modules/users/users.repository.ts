import { UserModel, IUserDocument } from '../../models/user.model';

export class UsersRepository {
  async findById(id: string): Promise<IUserDocument | null> {
    return UserModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async create(user: Partial<IUserDocument>): Promise<IUserDocument> {
    const newUser = new UserModel(user);
    return newUser.save();
  }

  async update(id: string, updateData: Partial<IUserDocument>): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }
}
