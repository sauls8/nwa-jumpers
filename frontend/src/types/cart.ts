import type { Inflatable } from '../data/inflatables';

export interface CartItem {
  id: string; // Unique ID for this cart item
  inflatable: Inflatable;
  bookingData: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    event_date: string;
    event_start_time: string;
    event_end_time: string;
    bounce_house_type: string;
  };
}

