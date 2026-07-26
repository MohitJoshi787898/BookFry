import { Request, Response } from 'express';
import { BooksService } from './books.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { uploadToCloudinary } from '../../config/cloudinary';

export class BooksController {
  private booksService: BooksService;

  constructor() {
    this.booksService = new BooksService();
  }

  list = async (req: Request, res: Response): Promise<void> => {
    const {
      page,
      limit,
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    } = req.query as any;

    const result = await this.booksService.listBooks({
      page,
      limit,
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    });

    res.status(200).json(ApiResponse.success({ books: result.books, total: result.total }));
  };

  getDetails = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const requestingUser = req.user;
    const book = await this.booksService.getBookBySlug(slug, requestingUser);
    res.status(200).json(ApiResponse.success(book));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const sellerId = req.user!.id;
    const images: Array<{ url: string; publicId: string }> = [];

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          const uploadResult = await uploadToCloudinary(file.buffer, 'books');
          images.push(uploadResult);
        } catch (error) {
          images.push({
            url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            publicId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          });
        }
      }
    } else if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'books');
        images.push(uploadResult);
      } catch (error) {
        images.push({
          url: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
          publicId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });
      }
    }

    const book = await this.booksService.createBook(sellerId, {
      ...req.body,
      images,
    });

    res.status(201).json(ApiResponse.success(book));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const sellerId = req.user!.id;
    const roles = req.user!.roles;
    const { id } = req.params;

    const images: Array<{ url: string; publicId: string }> = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          const uploadResult = await uploadToCloudinary(file.buffer, 'books');
          images.push(uploadResult);
        } catch (error) {
          images.push({
            url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            publicId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          });
        }
      }
    } else if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'books');
        images.push(uploadResult);
      } catch (error) {
        images.push({
          url: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
          publicId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });
      }
    }

    const updatePayload = { ...req.body };
    if (images.length > 0) {
      updatePayload.images = images;
    }

    const book = await this.booksService.updateBook(sellerId, roles, id, updatePayload);
    res.status(200).json(ApiResponse.success(book));
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const sellerId = req.user!.id;
    const roles = req.user!.roles;
    const { id } = req.params;

    await this.booksService.deleteBook(sellerId, roles, id);
    res.status(200).json(ApiResponse.success({ message: 'Book listing deleted successfully' }));
  };
}
export default BooksController;
