import { Request, Response } from 'express';
import { ContactService } from './contact.service';
import { ApiResponse } from '../../utils/ApiResponse';

export class ContactController {
  private contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { name, email, subject, message } = req.body;

    const submission = await this.contactService.submitContactForm({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json(
      ApiResponse.success({
        id: submission._id.toString(),
        name: submission.name,
        email: submission.email,
        subject: submission.subject,
        message: submission.message,
        createdAt: submission.createdAt,
      })
    );
  };
}

export default ContactController;
