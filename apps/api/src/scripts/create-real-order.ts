import mongoose from 'mongoose';
import { env } from '../config/env';
import { UserModel } from '../models/user.model';
import { BookModel } from '../models/book.model';
import { CategoryModel } from '../models/category.model';
import { CartModel } from '../models/cart.model';
import { OrderModel } from '../models/order.model';
import { OrdersService } from '../modules/orders/orders.service';
import { NotificationsService } from '../modules/notifications/notifications.service';

async function simulateRealOrderPlacement() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Register mongoose schemas to prevent population missing schema errors
    const _catName = CategoryModel.modelName;
    console.log(`📦 Schema registered: ${_catName}`);

    // 1. Fetch participants
    const buyer = await UserModel.findOne({ email: 'ananya.roy@ku.ac.in' });
    const seller = await UserModel.findOne({ email: 'demouser@bookfry.com' });
    const admin = await UserModel.findOne({ email: 'admin@bookfry.com' });

    if (!buyer || !seller || !admin) {
      console.error('❌ Could not locate the seeded buyer, seller, or admin in database!');
      return;
    }

    console.log(`👤 Buyer found: ${buyer.name} (${buyer.email})`);
    console.log(`👤 Seller found: ${seller.name} (${seller.email})`);
    console.log(`👤 Admin found: ${admin.name} (${admin.email})`);

    // 2. Fetch a book listed by the seller
    const book = await BookModel.findOne({ sellerId: seller._id, status: 'active' });
    if (!book) {
      console.error('❌ No active book found for this seller! Run seeds first.');
      return;
    }

    console.log(`📚 Book selected: "${book.title}" (ISBN: ${book.isbn}) - Price: ₹${book.price}`);

    // 3. Prepare Cart
    console.log('🧹 Preparing buyer cart snapshot...');
    await CartModel.deleteMany({ userId: buyer._id });
    
    await CartModel.create({
      userId: buyer._id,
      items: [
        {
          bookId: book._id,
          quantity: 1,
          priceSnapshot: book.price,
        },
      ],
    });
    console.log('✅ Cart seeded with selected item');

    // 4. Create Order
    console.log('🛒 Creating order document through OrdersService...');
    const ordersService = new OrdersService();
    const orderDto = await ordersService.createOrder(
      buyer._id.toString(),
      {
        street: 'IIT Hostel, Block 4',
        city: 'New Delhi',
        state: 'Delhi',
        zipCode: '110016',
        country: 'India',
      }
    );

    console.log(`✅ Order generated successfully: ${orderDto.orderNumber}`);

    // 5. Update status to Confirmed & Paid (simulate Razorpay success callback)
    const orderDoc = await OrderModel.findById(orderDto.id);
    if (!orderDoc) {
      console.error('❌ Order document missing after creation!');
      return;
    }

    orderDoc.status = 'confirmed';
    orderDoc.paymentStatus = 'paid';
    orderDoc.paymentRef = `pay_mock_${Math.random().toString(36).substring(2, 10)}`;
    orderDoc.timeline.push({
      status: 'confirmed',
      note: 'Payment verified successfully via Razorpay UPI.',
      timestamp: new Date(),
    });
    await orderDoc.save();
    console.log('💳 Order payment statuses updated (Confirmed & Paid)');

    // 6. Send Notifications
    console.log('🔔 Triggering status alerts for buyer, seller, and administrator...');
    const notificationsService = new NotificationsService();

    // Notification 1: Buyer Order Confirmed
    await notificationsService.createNotification(
      buyer._id.toString(),
      'order_confirmed',
      'Order Confirmed! 🎉',
      `Your order ${orderDoc.orderNumber} for "${book.title}" was placed successfully.`,
      { orderId: orderDoc._id.toString() }
    );
    console.log('   - Notified Buyer');

    // Notification 2: Seller New Sale
    await notificationsService.createNotification(
      seller._id.toString(),
      'new_sale',
      'New Sale Received! 💰',
      `You sold "${book.title}" to ${buyer.name}. Prepare shipment for order ${orderDoc.orderNumber}.`,
      { orderId: orderDoc._id.toString() }
    );
    console.log('   - Notified Seller');

    // Notification 3: Admin Platform Order
    await notificationsService.createNotification(
      admin._id.toString(),
      'platform_order_created',
      'New Platform Order Alert 🛡️',
      `Order ${orderDoc.orderNumber} was placed by ${buyer.name} totaling ₹${orderDoc.total}.`,
      { orderId: orderDoc._id.toString() }
    );
    console.log('   - Notified Admin');

    console.log('🎉 E2E Simulation completed with 100% success!');
  } catch (err) {
    console.error('❌ Error executing simulation:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🚪 Connection closed.');
  }
}

simulateRealOrderPlacement();
