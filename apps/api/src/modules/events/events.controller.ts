import { Request, Response } from 'express';
import { pageViewQueue } from '../../jobs/queues';
import { ApiResponse } from '../../utils/ApiResponse';
import { ValidationError } from '../../utils/AppError';

export class EventsController {
  trackView = async (req: Request, res: Response): Promise<void> => {
    const { bookId, categoryId, authorId } = req.body;

    if (!bookId) {
      throw new ValidationError('bookId is required for view event tracking');
    }

    const userId = req.user?.id;
    const timestamp = new Date().toISOString();

    // Fire-and-forget push to BullMQ queue
    if (pageViewQueue) {
      pageViewQueue.add('track_page_view', {
        bookId,
        userId,
        categoryId,
        authorId,
        timestamp,
      }).catch(() => {
        // Non-blocking error fallback
      });
    }

    res.status(202).json(ApiResponse.success({ tracked: true }));
  };
}

export default EventsController;
