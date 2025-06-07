export type CheckoutStep = 'information' | 'shipping' | 'payment' | 'review';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  image: {
    url: string;
    alt: string;
  };
}

export interface ShippingOption {
  name: string;
  cost: number;
  description: string;
}

export interface AddressData {
  email: string;
  name: string;
  address: string;
  apartment?: string;
  city: string;
  district: string;
  postalCode: string;
  phone: string;
}

export interface PaymentData {
  method: 'bkash' | 'nagad' | 'cod';
}

export interface OrderData {
  cart: CartItem[];
  shipping: {
    address: AddressData;
    method: string;
    cost: number;
    freeShippingApplied: boolean;
  };
  payment: PaymentData;
  pricing: {
    subtotal: number;
    shippingCost: number;
    discount: {
      code: string;
      percentage: number;
      amount: number;
    };
    total: number;
  };
}
export interface SavedAddress {
  id: string;
  name: string;
  email: string;
  address: string;
  apartment?: string;
  city: string;
  district: string;
  postalCode: string;
  phone: string;
  label: string; // e.g., "Home", "Office", "Default"
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddressFormState {
  selectedAddressId: string | null;
  isEditing: boolean;
  addressLabel: string;
}
