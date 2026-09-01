import { ICourierProvider } from './courier-provider.interface';
import { MockCourierProvider } from './mock-courier.provider';
import { ShiprocketCourierProvider } from './shiprocket-courier.provider';

let courierProviderInstance: ICourierProvider | null = null;

export function getCourierProvider(): ICourierProvider {
  if (!courierProviderInstance) {
    if (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD) {
      courierProviderInstance = new ShiprocketCourierProvider();
    } else {
      courierProviderInstance = new MockCourierProvider();
    }
  }
  return courierProviderInstance;
}
