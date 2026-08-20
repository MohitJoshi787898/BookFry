import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import categoriesRoutes from '../modules/categories/categories.routes';
import booksRoutes from '../modules/books/books.routes';
import cartRoutes from '../modules/cart/cart.routes';
import paymentsRoutes from '../modules/payments/payments.routes';
import ordersRoutes from '../modules/orders/orders.routes';
import wishlistRoutes from '../modules/wishlist/wishlist.routes';
import reviewsRoutes from '../modules/reviews/reviews.routes';
import notificationsRoutes from '../modules/notifications/notifications.routes';
import sellerRoutes from '../modules/seller/seller.routes';
import adminRoutes from '../modules/admin/admin.routes';
import contactRoutes from '../modules/contact/contact.routes';
import usersRoutes from '../modules/users/users.routes';
import eventsRoutes from '../modules/events/events.routes';
import recommendationsRoutes from '../modules/recommendations/recommendations.routes';
import couponsRoutes from '../modules/coupons/coupons.routes';
import usedBookRequestsRoutes from '../modules/used-book-requests/used-book-requests.routes';

import { publicLandingRouter, adminLandingRouter } from '../modules/landing/landing.routes';

const router = Router();

router.use('/', publicLandingRouter);
router.use('/admin/landing', adminLandingRouter);

router.use('/auth', authRoutes);
router.use('/categories', categoriesRoutes);
router.use('/books', booksRoutes);
router.use('/cart', cartRoutes);
router.use('/payments', paymentsRoutes);
router.use('/orders', ordersRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/seller', sellerRoutes);
router.use('/admin', adminRoutes);
router.use('/contact', contactRoutes);
router.use('/users', usersRoutes);
router.use('/events', eventsRoutes);
router.use('/recommendations', recommendationsRoutes);
router.use('/coupons', couponsRoutes);
router.use('/used-book-requests', usedBookRequestsRoutes);

export default router;
