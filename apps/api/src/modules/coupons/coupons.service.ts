import { CouponModel } from '../../models/coupon.model';
import { NotFoundError, ValidationError } from '../../utils/AppError';

export interface CouponValidationResult {
  valid: boolean;
  coupon: {
    code: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
    discountAmount: number;
    minOrderSubtotal: number;
    finalSubtotal: number;
  };
  message?: string;
}

export class CouponsService {
  /** Ensure popular standard coupons exist in MongoDB for smooth demo & production use */
  async ensureSeedCoupons() {
    const count = await CouponModel.countDocuments();
    if (count === 0) {
      await CouponModel.insertMany([
        {
          code: 'BOOKFRYNEW',
          discountType: 'flat',
          discountValue: 50,
          minOrderSubtotal: 199,
          maxUses: 5000,
          usedCount: 12,
        },
        {
          code: 'FESTIVE20',
          discountType: 'percentage',
          discountValue: 20,
          minOrderSubtotal: 299,
          maxUses: 1000,
          usedCount: 45,
        },
        {
          code: 'WELCOME10',
          discountType: 'percentage',
          discountValue: 10,
          minOrderSubtotal: 100,
          maxUses: 10000,
          usedCount: 88,
        },
        {
          code: 'FREESHIP',
          discountType: 'flat',
          discountValue: 40,
          minOrderSubtotal: 250,
          maxUses: 2000,
          usedCount: 3,
        },
      ]);
    }
  }

  async getActiveCoupons() {
    await this.ensureSeedCoupons();
    const now = new Date();
    const docs = await CouponModel.find({
      $or: [{ expiryDate: { $gt: now } }, { expiryDate: null }],
    }).sort({ createdAt: -1 });

    return docs.map((c) => ({
      id: c._id.toString(),
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderSubtotal: c.minOrderSubtotal,
      usedCount: c.usedCount,
      maxUses: c.maxUses,
      expiryDate: c.expiryDate ? c.expiryDate.toISOString() : null,
    }));
  }

  async validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
    if (!code || !code.trim()) {
      throw new ValidationError('Please provide a coupon promo code');
    }

    const cleanCode = code.trim().toUpperCase();
    await this.ensureSeedCoupons();

    let coupon = await CouponModel.findOne({ code: cleanCode });

    if (!coupon) {
      throw new NotFoundError(`Invalid promo code "${cleanCode}". Please check for typos.`);
    }

    // Check expiry
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      throw new ValidationError(`Coupon promo code "${cleanCode}" has expired.`);
    }

    // Check usage limits
    if (coupon.usedCount >= coupon.maxUses) {
      throw new ValidationError(`Coupon promo code "${cleanCode}" maximum usage limit reached.`);
    }

    // Check min order subtotal
    if (subtotal < coupon.minOrderSubtotal) {
      throw new ValidationError(
        `Coupon "${cleanCode}" requires a minimum cart subtotal of ₹${coupon.minOrderSubtotal}. (Current: ₹${subtotal})`
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = parseFloat(((subtotal * coupon.discountValue) / 100).toFixed(2));
    } else {
      discountAmount = coupon.discountValue;
    }

    // Cap discount to not exceed subtotal
    discountAmount = Math.min(subtotal, discountAmount);
    const finalSubtotal = parseFloat((subtotal - discountAmount).toFixed(2));

    return {
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        minOrderSubtotal: coupon.minOrderSubtotal,
        finalSubtotal,
      },
      message: `Coupon "${coupon.code}" applied! Saved ₹${discountAmount}.`,
    };
  }

  async incrementUsage(code: string) {
    const cleanCode = code.trim().toUpperCase();
    await CouponModel.updateOne({ code: cleanCode }, { $inc: { usedCount: 1 } });
  }
}
