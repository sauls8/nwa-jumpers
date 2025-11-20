import type { Inflatable } from '../data/inflatables';

export interface CartItem {
  id: string; // Unique ID for this cart item
  inflatable: Inflatable;
  // Note: event_date, event_start_time, event_end_time are stored once in App state, not per item
}

export interface CustomerInfo {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
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
}

