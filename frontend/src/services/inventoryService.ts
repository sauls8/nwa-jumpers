/**
 * Inventory Service
 * Handles CRUD operations for inflatables inventory
 */

import { getApiUrl } from '../config/api';

const API_BASE_URL = getApiUrl('inventory');

export interface Inflatable {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  price: number;
  category: string;
  features?: string[] | null;
  dimensions?: string | null;
  capacity?: string | null;
  is_active?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateInflatableRequest {
  id?: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  category: string;
  features?: string[];
  dimensions?: string;
  capacity?: string;
  is_active?: boolean;
}

export interface UpdateInflatableRequest {
  name?: string;
  description?: string;
  image?: string;
  price?: number;
  category?: string;
  features?: string[];
  dimensions?: string;
  capacity?: string;
  is_active?: boolean;
}

/**
 * Get all inflatables
 */
export const fetchInflatables = async (activeOnly: boolean = false): Promise<Inflatable[]> => {
  try {
    const url = activeOnly ? `${API_BASE_URL}?active_only=true` : API_BASE_URL;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching inflatables:', error);
    throw error;
  }
};

/**
 * Get inflatables by category
 */
export const fetchInflatablesByCategory = async (category: string): Promise<Inflatable[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/category/${encodeURIComponent(category)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching inflatables by category:', error);
    throw error;
  }
};

/**
 * Get single inflatable by ID
 */
export const fetchInflatableById = async (id: string): Promise<Inflatable> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Inflatable not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching inflatable:', error);
    throw error;
  }
};

/**
 * Create new inflatable
 */
export const createInflatable = async (data: CreateInflatableRequest): Promise<Inflatable> => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create inflatable');
    }

    const result = await response.json();
    return result.inflatable;
  } catch (error) {
    console.error('Error creating inflatable:', error);
    throw error;
  }
};

/**
 * Update inflatable
 */
export const updateInflatable = async (id: string, data: UpdateInflatableRequest): Promise<Inflatable> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update inflatable');
    }

    const result = await response.json();
    return result.inflatable;
  } catch (error) {
    console.error('Error updating inflatable:', error);
    throw error;
  }
};

/**
 * Delete inflatable (soft delete)
 */
export const deleteInflatable = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete inflatable');
    }
  } catch (error) {
    console.error('Error deleting inflatable:', error);
    throw error;
  }
};

/**
 * Bulk create inflatables
 */
export const bulkCreateInflatables = async (inflatables: CreateInflatableRequest[]): Promise<{
  created: Array<{ id: string; name: string; success: boolean }>;
  errors?: Array<{ item: any; error: string }>;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inflatables }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to bulk create inflatables');
    }

    return await response.json();
  } catch (error) {
    console.error('Error bulk creating inflatables:', error);
    throw error;
  }
};



