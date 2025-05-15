// types.ts
export interface Marketplace {
  [x: string]: any;
  _id: string;
  name: string;
  slug: string;
  colorScheme: {
    primary: string;
    secondary: string;
  };
  active: boolean;
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  discountPercentage: number;
  active: boolean;
  orderFormFields: FormField[];
  marketplace: Marketplace;
}

export interface FormField {
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  options?: string[];
}