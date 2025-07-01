export interface Address {
  id: string;
  name: string;
  address: string;
  apartment?: string;
  city: string;
  district: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}
