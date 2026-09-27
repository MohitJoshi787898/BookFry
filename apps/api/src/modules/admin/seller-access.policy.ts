import { PlatformSettingsModel, IPlatformSettingsDocument } from '../../models/platform-settings.model';
import { PublicPlatformSettings } from '@bookmarket/types';

interface CachedSettings {
  settings: IPlatformSettingsDocument;
  cachedAt: number;
}

const CACHE_TTL_MS = 15 * 1000; // 15 seconds
let cachedSettings: CachedSettings | null = null;

export class SellerAccessPolicy {
  /**
   * Retrieves the current PlatformSettings document, utilizing a fast in-memory cache.
   */
  static async getSettings(): Promise<IPlatformSettingsDocument> {
    const now = Date.now();
    if (cachedSettings && now - cachedSettings.cachedAt < CACHE_TTL_MS) {
      return cachedSettings.settings;
    }

    let settings = await PlatformSettingsModel.findOne();
    if (!settings) {
      settings = await PlatformSettingsModel.create({
        sellerRegistrationEnabled: false,
        sellerLoginEnabled: false,
      });
    }

    cachedSettings = { settings, cachedAt: now };
    return settings;
  }

  /**
   * Immediately invalidates the in-memory cache when settings are mutated.
   */
  static invalidateCache(): void {
    cachedSettings = null;
  }

  /**
   * Checks whether public dedicated seller registration is currently enabled.
   */
  static async isSellerRegistrationEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.sellerRegistrationEnabled === true;
  }

  /**
   * Checks whether seller accounts are allowed to sign in.
   */
  static async isSellerLoginEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.sellerLoginEnabled === true;
  }

  /**
   * Returns safe platform settings intended for public client consumption.
   */
  static async getPublicSettings(): Promise<PublicPlatformSettings> {
    const settings = await this.getSettings();
    return {
      sellerRegistrationEnabled: settings.sellerRegistrationEnabled === true,
      sellerLoginEnabled: settings.sellerLoginEnabled === true,
      maintenanceMode: settings.maintenanceMode === true,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
    };
  }
}
