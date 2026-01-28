import api from '@/lib/api';

export interface Address {
  id: number;
  user_id: number;
  label: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressFormData {
  label: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    const response = await api.get('/addresses');
    return response.data;
  },

  async createAddress(data: AddressFormData): Promise<{ message: string; addresses: Address[] }> {
    const response = await api.post('/addresses', data);
    return response.data;
  },

  async updateAddress(id: number, data: AddressFormData): Promise<{ message: string; addresses: Address[] }> {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data;
  },

  async deleteAddress(id: number): Promise<{ message: string; addresses: Address[] }> {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },

  async setDefaultAddress(id: number): Promise<{ message: string; addresses: Address[] }> {
    const response = await api.put(`/addresses/${id}/default`);
    return response.data;
  },
};
