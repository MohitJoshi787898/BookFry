import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { ValidationError } from '../../utils/AppError';
import { uploadToCloudinary } from '../../config/cloudinary';

export class UsersController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  getProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('User authentication failed');
    }

    const user = await this.usersService.getUserById(userId);
    res.status(200).json(ApiResponse.success(this.usersService.mapToDTO(user)));
  };

  uploadAvatar = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('User authentication failed');
    }

    if (!req.file) {
      throw new ValidationError('No avatar image file provided');
    }

    let avatarUrl = '';
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'avatars');
      avatarUrl = uploadResult.url;
    } catch (error) {
      avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const user = await this.usersService.updateProfile(userId, { avatarUrl });
    res.status(200).json(ApiResponse.success(this.usersService.mapToDTO(user)));
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('User authentication failed');
    }

    const { name, phone, avatarUrl } = req.body;
    const user = await this.usersService.updateProfile(userId, { name, phone, avatarUrl });
    res.status(200).json(ApiResponse.success(this.usersService.mapToDTO(user)));
  };

  addAddress = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('User authentication failed');
    }

    const { street, city, state, zipCode, country, isDefault } = req.body;
    if (!street || !city || !state || !zipCode || !country) {
      throw new ValidationError('All address fields are required');
    }

    const user = await this.usersService.addAddress(userId, {
      street,
      city,
      state,
      zipCode,
      country,
      isDefault,
    });
    res.status(200).json(ApiResponse.success(this.usersService.mapToDTO(user)));
  };

  updateAddress = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { id: addressId } = req.params;
    if (!userId) {
      throw new ValidationError('User authentication failed');
    }

    const { street, city, state, zipCode, country, isDefault } = req.body;
    const user = await this.usersService.updateAddress(userId, addressId, {
      street,
      city,
      state,
      zipCode,
      country,
      isDefault,
    });
    res.status(200).json(ApiResponse.success(this.usersService.mapToDTO(user)));
  };

  deleteAddress = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { id: addressId } = req.params;
    if (!userId) {
      throw new ValidationError('User authentication failed');
    }

    const user = await this.usersService.deleteAddress(userId, addressId);
    res.status(200).json(ApiResponse.success(this.usersService.mapToDTO(user)));
  };

  getAddresses = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('User authentication failed');
    }

    const addresses = await this.usersService.getAddresses(userId);
    res.status(200).json(ApiResponse.success(addresses));
  };

  setAddressDefault = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { id: addressId } = req.params;
    if (!userId) {
      throw new ValidationError('User authentication failed');
    }

    const user = await this.usersService.setAddressDefault(userId, addressId);
    res.status(200).json(ApiResponse.success(this.usersService.mapToDTO(user)));
  };

  reverseGeocode = async (req: Request, res: Response): Promise<void> => {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);

    if (isNaN(lat) || isNaN(lon)) {
      throw new ValidationError('Invalid latitude or longitude coordinates');
    }

    const result = await this.usersService.reverseGeocode(lat, lon);
    res.status(200).json(ApiResponse.success(result));
  };

  checkoutIntent = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('User authentication failed');
    }

    const { addressId } = req.body;
    if (!addressId) {
      throw new ValidationError('Shipping address ID is required for checkout');
    }

    await this.usersService.checkoutIntent(userId, addressId);
    res.status(200).json(ApiResponse.success({ message: 'Checkout interest registered' }));
  };
}

export default UsersController;
