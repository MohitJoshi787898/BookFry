export interface IGeocodeResult {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IGeocodingProvider {
  reverseGeocode(lat: number, lon: number): Promise<IGeocodeResult>;
}

export class NominatimGeocodingProvider implements IGeocodingProvider {
  async reverseGeocode(lat: number, lon: number): Promise<IGeocodeResult> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BookFry-Marketplace/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || !data.address) {
      throw new Error('No address information returned from reverse geocoding');
    }

    const addr = data.address;
    const road = addr.road || addr.suburb || addr.neighbourhood || '';
    const house = addr.house_number || '';
    const street = house ? `${house}, ${road}` : road;

    return {
      street,
      city: addr.city || addr.town || addr.village || addr.municipality || '',
      state: addr.state || '',
      zipCode: addr.postcode || '',
      country: addr.country || 'India',
    };
  }
}
