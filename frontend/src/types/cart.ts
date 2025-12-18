import type { Inflatable } from '../services/inventoryService';

export interface CartItem {
  id: string; // Unique ID for this cart item
  inflatable: Inflatable;
  // Note: event_date, event_start_time, event_end_time are stored once in App state, not per item
}

export interface CustomerInfo {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  // Extended fields for order form
  company_name?: string;
  first_name?: string;
  last_name?: string;
  street_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

export interface EventInfo {
  event_date: string;
  event_start_time: string;
  event_end_time: string;
}

export interface QuoteInfo {
  organization_name?: string;
  event_address?: string;
  event_surface?: string;
  event_is_indoor?: boolean;
  overnight_pickup?: boolean;
  notes?: string;
  discount_percent?: number;
}

