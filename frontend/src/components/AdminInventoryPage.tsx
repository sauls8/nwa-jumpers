import React, { useEffect, useState } from 'react';
import './AdminInventoryPage.css';
import type { Inflatable, CreateInflatableRequest, UpdateInflatableRequest } from '../services/inventoryService';
import {
  fetchInflatables,
  createInflatable,
  updateInflatable,
  deleteInflatable,
} from '../services/inventoryService';

interface AdminInventoryPageProps {
  onBack: () => void;
}

const CATEGORIES = [
  { id: 'castle', name: 'Castle' },
  { id: 'superhero', name: 'Superhero' },
  { id: 'sports', name: 'Sports' },
  { id: 'toddler', name: 'Toddler' },
];

const AdminInventoryPage: React.FC<AdminInventoryPageProps> = ({ onBack }) => {
  const [inflatables, setInflatables] = useState<Inflatable[]>([]);
  const [filteredInflatables, setFilteredInflatables] = useState<Inflatable[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingInflatable, setEditingInflatable] = useState<Inflatable | null>(null);
  const [formData, setFormData] = useState<CreateInflatableRequest>({
    name: '',
    description: '',
    image: '',
    price: 0,
    category: 'castle',
    features: [],
    dimensions: '',
    capacity: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load inflatables
  useEffect(() => {
    loadInflatables();
  }, [showActiveOnly]);

  // Filter inflatables
  useEffect(() => {
    let filtered = [...inflatables];

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    setFilteredInflatables(filtered);
  }, [inflatables, categoryFilter, searchQuery]);

  const loadInflatables = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await fetchInflatables(!showActiveOnly);
      setInflatables(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inflatables');
      console.error('Error loading inflatables:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (inflatable?: Inflatable) => {
    if (inflatable) {
      setEditingInflatable(inflatable);
      setFormData({
        name: inflatable.name,
        description: inflatable.description || '',
        image: inflatable.image || '',
        price: inflatable.price,
        category: inflatable.category,
        features: inflatable.features || [],
        dimensions: inflatable.dimensions || '',
        capacity: inflatable.capacity || '',
        is_active: inflatable.is_active !== 0,
      });
    } else {
      setEditingInflatable(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        price: 0,
        category: 'castle',
        features: [],
        dimensions: '',
        capacity: '',
      });
    }
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingInflatable(null);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (formData.price === undefined || formData.price < 0) {
      errors.price = 'Price must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      if (editingInflatable) {
        await updateInflatable(editingInflatable.id, formData);
      } else {
        await createInflatable(formData);
      }

      await loadInflatables();
      handleCloseForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save inflatable');
      console.error('Error saving inflatable:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      setError('');
      await deleteInflatable(id);
      await loadInflatables();
      setDeleteConfirmId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete inflatable');
      console.error('Error deleting inflatable:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), ''],
    }));
  };

  const handleUpdateFeature = (index: number, value: string) => {
    setFormData(prev => {
      const features = [...(prev.features || [])];
      features[index] = value;
      return { ...prev, features };
    });
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => {
      const features = [...(prev.features || [])];
      features.splice(index, 1);
      return { ...prev, features };
    });
  };

  return (
    <div className="admin-inventory-container">
      <div className="admin-page-header">
        <div>
          <h2>Inventory Management</h2>
          <p>Manage your inflatables catalog</p>
        </div>
        <button className="back-button" onClick={onBack}>
          ← Back to Bookings
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="admin-controls">
        <div className="control-group">
          <input
            type="text"
            placeholder="Search inflatables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="control-group">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-filter"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
            />
            Show active only
          </label>
        </div>

        <button
          className="primary-button"
          onClick={() => handleOpenForm()}
        >
          + Add New Inflatable
        </button>
      </div>

      {isLoading && inflatables.length === 0 ? (
        <div className="loading-message">Loading inflatables...</div>
      ) : filteredInflatables.length === 0 ? (
        <div className="empty-message">
          {searchQuery || categoryFilter !== 'all' 
            ? 'No inflatables match your filters' 
            : 'No inflatables found. Add your first one!'}
        </div>
      ) : (
        <div className="inflatables-grid">
          {filteredInflatables.map((inflatable) => (
            <div
              key={inflatable.id}
              className={`inflatable-card ${inflatable.is_active === 0 ? 'inactive' : ''}`}
            >
              {inflatable.is_active === 0 && (
                <div className="inactive-badge">Inactive</div>
              )}
              {inflatable.image && (
                <div className="inflatable-image">
                  <img src={inflatable.image} alt={inflatable.name} />
                </div>
              )}
              <div className="inflatable-content">
                <h3>{inflatable.name}</h3>
                <div className="inflatable-meta">
                  <span className="category-badge">{inflatable.category}</span>
                  <span className="price-badge">${inflatable.price}</span>
                </div>
                {inflatable.description && (
                  <p className="inflatable-description">{inflatable.description}</p>
                )}
                <div className="inflatable-details">
                  {inflatable.dimensions && (
                    <div>📐 {inflatable.dimensions}</div>
                  )}
                  {inflatable.capacity && (
                    <div>👥 {inflatable.capacity}</div>
                  )}
                </div>
                {inflatable.features && inflatable.features.length > 0 && (
                  <div className="inflatable-features">
                    {inflatable.features.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="feature-tag">{feature}</span>
                    ))}
                    {inflatable.features.length > 3 && (
                      <span className="feature-tag">+{inflatable.features.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
              <div className="inflatable-actions">
                <button
                  className="edit-button"
                  onClick={() => handleOpenForm(inflatable)}
                >
                  Edit
                </button>
                {deleteConfirmId === inflatable.id ? (
                  <div className="delete-confirm">
                    <span>Delete?</span>
                    <button
                      className="confirm-button"
                      onClick={() => handleDelete(inflatable.id)}
                    >
                      Yes
                    </button>
                    <button
                      className="cancel-button"
                      onClick={() => setDeleteConfirmId(null)}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    className="delete-button"
                    onClick={() => setDeleteConfirmId(inflatable.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingInflatable ? 'Edit Inflatable' : 'Add New Inflatable'}</h3>
              <button className="close-button" onClick={handleCloseForm}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="inflatable-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={formErrors.name ? 'error' : ''}
                  />
                  {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={formErrors.category ? 'error' : ''}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {formErrors.category && <span className="error-text">{formErrors.category}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className={formErrors.price ? 'error' : ''}
                  />
                  {formErrors.price && <span className="error-text">{formErrors.price}</span>}
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dimensions</label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                    placeholder="15ft x 15ft x 12ft"
                  />
                </div>

                <div className="form-group">
                  <label>Capacity</label>
                  <input
                    type="text"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    placeholder="8-10 kids"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Features
                  <button
                    type="button"
                    className="add-feature-button"
                    onClick={handleAddFeature}
                  >
                    + Add Feature
                  </button>
                </label>
                {formData.features && formData.features.length > 0 ? (
                  <div className="features-list">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="feature-input-row">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleUpdateFeature(index, e.target.value)}
                          placeholder="Feature name"
                        />
                        <button
                          type="button"
                          className="remove-feature-button"
                          onClick={() => handleRemoveFeature(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="helper-text">No features added yet</p>
                )}
              </div>

              {editingInflatable && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_active !== false}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                    Active (visible to customers)
                  </label>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCloseForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : editingInflatable ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPage;

