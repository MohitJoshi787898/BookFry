import { ContactModel, IContactDocument } from '../../models/contact.model';

export class ContactService {
  async submitContactForm(data: {
    name: string;
    email: string;
    subject: 'General' | 'Order Issue' | 'Selling Question' | 'Report a Listing' | 'Partnership';
    message: string;
  }): Promise<IContactDocument> {
    const submission = new ContactModel({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    });
    
    return await submission.save();
  }
}

export default ContactService;
