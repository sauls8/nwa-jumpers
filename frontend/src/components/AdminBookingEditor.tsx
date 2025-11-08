import { useEffect, useMemo, useState } from 'react';
import './AdminBookingEditor.css';
import type { AdminBooking, AdminBookingItem, UpdateBookingPayload } from '../services/adminService';
import { fetchBookingById, updateBooking } from '../services/adminService';

interface AdminBookingEditorProps {
  bookingId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingUpdated: (booking: AdminBooking) => void;
}

type FormState = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  organization_name: string;
  event_address: string;
  event_surface: string;
  event_is_indoor: 'unknown' | 'indoor' | 'outdoor';
  event_date: string;
  setup_date: string;
  delivery_window: string;
  after_hours_window: string;
  event_start_time: string;
  event_end_time: string;
  invoice_number: string;
  contract_number: string;
  discount_percent: string;
  subtotal_amount: string;
  delivery_fee: string;
  tax_amount: string;
  total_amount: string;
  deposit_amount: string;
  balance_due: string;
  payment_method: string;
  bounce_house_type: string;
  internal_notes: string;
};

type ItemDraft = {
  id?: number;
  product_name: string;
  quantity: string;
  unit_price: string;
  total_price: string;
  product_category: string;
  notes: string;
};

const createEmptyFormState = (): FormState => ({
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  organization_name: '',
  event_address: '',
  event_surface: '',
  event_is_indoor: 'unknown',
  event_date: '',
  setup_date: '',
  delivery_window: '',
  after_hours_window: '',
  event_start_time: '',
  event_end_time: '',
  invoice_number: '',
  contract_number: '',
  discount_percent: '',
  subtotal_amount: '',
  delivery_fee: '',
  tax_amount: '',
  total_amount: '',
  deposit_amount: '',
  balance_due: '',
  payment_method: '',
  bounce_house_type: '',
  internal_notes: '',
});

const convertBookingToForm = (booking: AdminBooking): FormState => ({
  customer_name: booking.customer_name ?? '',
  customer_email: booking.customer_email ?? '',
  customer_phone: booking.customer_phone ?? '',
  organization_name: booking.organization_name ?? '',
  event_address: booking.event_address ?? '',
  event_surface: booking.event_surface ?? '',
  event_is_indoor:
    booking.event_is_indoor === null || booking.event_is_indoor === undefined
      ? 'unknown'
      : booking.event_is_indoor === 1
        ? 'indoor'
        : 'outdoor',
  event_date: booking.event_date ?? '',
  setup_date: booking.setup_date ?? '',
  delivery_window: booking.delivery_window ?? '',
  after_hours_window: booking.after_hours_window ?? '',
  event_start_time: booking.event_start_time ?? '',
  event_end_time: booking.event_end_time ?? '',
  invoice_number: booking.invoice_number ?? '',
  contract_number: booking.contract_number ?? '',
  discount_percent: booking.discount_percent?.toString() ?? '',
  subtotal_amount: booking.subtotal_amount?.toString() ?? '',
  delivery_fee: booking.delivery_fee?.toString() ?? '',
  tax_amount: booking.tax_amount?.toString() ?? '',
  total_amount: booking.total_amount?.toString() ?? '',
  deposit_amount: booking.deposit_amount?.toString() ?? '',
  balance_due: booking.balance_due?.toString() ?? '',
  payment_method: booking.payment_method ?? '',
  bounce_house_type: booking.bounce_house_type ?? '',
  internal_notes: booking.internal_notes ?? '',
});

const convertItemToDraft = (item: AdminBookingItem): ItemDraft => ({
  id: item.id,
  product_name: item.product_name ?? '',
  quantity: item.quantity?.toString() ?? '1',
  unit_price: item.unit_price?.toString() ?? '0',
  total_price: item.total_price?.toString() ?? '',
  product_category: item.product_category ?? '',
  notes: item.notes ?? '',
});

const convertDraftToPayloadItem = (item: ItemDraft) => ({
  id: item.id,
  product_name: item.product_name,
  quantity: item.quantity,
  unit_price: item.unit_price,
  total_price: item.total_price,
  product_category: item.product_category || null,
  notes: item.notes || null,
});

const AdminBookingEditor: React.FC<AdminBookingEditorProps> = ({
  bookingId,
  isOpen,
  onClose,
  onBookingUpdated,
}) => {
  const [formState, setFormState] = useState<FormState>(createEmptyFormState);
  const [items, setItems] = useState<ItemDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || bookingId === null) {
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    fetchBookingById(bookingId)
      .then((booking) => {
        if (!isActive) return;
        setFormState(convertBookingToForm(booking));
        setItems((booking.items ?? []).map(convertItemToDraft));
      })
      .catch((err: unknown) => {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : 'Failed to load booking details.');
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [bookingId, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFormState(createEmptyFormState());
      setItems([]);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index: number, field: keyof ItemDraft, value: string) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        product_name: '',
        quantity: '1',
        unit_price: '0',
        total_price: '',
        product_category: '',
        notes: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const numericFields: Array<keyof FormState> = useMemo(
    () => [
      'discount_percent',
      'subtotal_amount',
      'delivery_fee',
      'tax_amount',
      'total_amount',
      'deposit_amount',
      'balance_due',
    ],
    []
  );

  const buildPayload = (): UpdateBookingPayload => {
    const payload: UpdateBookingPayload = {
      customer_name: formState.customer_name || null,
      customer_email: formState.customer_email || null,
      customer_phone: formState.customer_phone || null,
      organization_name: formState.organization_name || null,
      event_address: formState.event_address || null,
      event_surface: formState.event_surface || null,
      event_is_indoor:
        formState.event_is_indoor === 'unknown'
          ? null
          : formState.event_is_indoor === 'indoor'
            ? 1
            : 0,
      event_date: formState.event_date || null,
      setup_date: formState.setup_date || null,
      delivery_window: formState.delivery_window || null,
      after_hours_window: formState.after_hours_window || null,
      event_start_time: formState.event_start_time || null,
      event_end_time: formState.event_end_time || null,
      invoice_number: formState.invoice_number || null,
      contract_number: formState.contract_number || null,
      payment_method: formState.payment_method || null,
      bounce_house_type: formState.bounce_house_type || null,
      internal_notes: formState.internal_notes || null,
      items: items
        .filter((item) => item.product_name.trim().length > 0)
        .map(convertDraftToPayloadItem),
    };

    numericFields.forEach((field) => {
      const value = formState[field];
      if (value.trim().length === 0) {
        (payload as Record<string, unknown>)[field] = null;
      } else {
        (payload as Record<string, unknown>)[field] = value;
      }
    });

    return payload;
  };

  const handleSave = async () => {
    if (!bookingId) return;
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = buildPayload();
      const updatedBooking = await updateBooking(bookingId, payload);
      onBookingUpdated(updatedBooking);
      setSuccessMessage('Booking updated successfully.');
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="admin-editor-overlay">
      <div className="admin-editor-modal">
        <div className="admin-editor-header">
          <div>
            <h3>Edit Booking Details</h3>
            {bookingId && <p>Booking ID #{bookingId}</p>}
          </div>
          <button className="admin-editor-close" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="admin-editor-loading">Loading booking details…</div>
        ) : (
          <>
            {error && <div className="admin-editor-error">{error}</div>}
            {successMessage && <div className="admin-editor-success">{successMessage}</div>}

            <div className="admin-editor-content">
              <section>
                <h4>Customer</h4>
                <div className="admin-editor-grid">
                  <label>
                    <span>Customer Name</span>
                    <input
                      type="text"
                      value={formState.customer_name}
                      onChange={(event) => handleInputChange('customer_name', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      value={formState.customer_email}
                      onChange={(event) => handleInputChange('customer_email', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Phone</span>
                    <input
                      type="tel"
                      value={formState.customer_phone}
                      onChange={(event) => handleInputChange('customer_phone', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Organization / Program</span>
                    <input
                      type="text"
                      value={formState.organization_name}
                      onChange={(event) =>
                        handleInputChange('organization_name', event.target.value)
                      }
                    />
                  </label>
                </div>
              </section>

              <section>
                <h4>Event</h4>
                <div className="admin-editor-grid">
                  <label>
                    <span>Event Date</span>
                    <input
                      type="date"
                      value={formState.event_date}
                      onChange={(event) => handleInputChange('event_date', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Setup Date</span>
                    <input
                      type="date"
                      value={formState.setup_date}
                      onChange={(event) => handleInputChange('setup_date', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Event Start Time</span>
                    <input
                      type="time"
                      value={formState.event_start_time}
                      onChange={(event) => handleInputChange('event_start_time', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Event End Time</span>
                    <input
                      type="time"
                      value={formState.event_end_time}
                      onChange={(event) => handleInputChange('event_end_time', event.target.value)}
                    />
                  </label>
                  <label className="admin-editor-wide">
                    <span>Event Address</span>
                    <input
                      type="text"
                      value={formState.event_address}
                      onChange={(event) => handleInputChange('event_address', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Surface Type</span>
                    <input
                      type="text"
                      value={formState.event_surface}
                      onChange={(event) => handleInputChange('event_surface', event.target.value)}
                      placeholder="Grass, Gym floor, Concrete…"
                    />
                  </label>
                  <label>
                    <span>Indoor / Outdoor</span>
                    <select
                      value={formState.event_is_indoor}
                      onChange={(event) =>
                        handleInputChange(
                          'event_is_indoor',
                          event.target.value as FormState['event_is_indoor']
                        )
                      }
                    >
                      <option value="unknown">Not specified</option>
                      <option value="indoor">Indoor</option>
                      <option value="outdoor">Outdoor</option>
                    </select>
                  </label>
                  <label>
                    <span>Delivery Window</span>
                    <input
                      type="text"
                      value={formState.delivery_window}
                      onChange={(event) => handleInputChange('delivery_window', event.target.value)}
                      placeholder="8:00am – 8:30am"
                    />
                  </label>
                  <label>
                    <span>After Hours Window</span>
                    <input
                      type="text"
                      value={formState.after_hours_window}
                      onChange={(event) =>
                        handleInputChange('after_hours_window', event.target.value)
                      }
                      placeholder="After 1pm"
                    />
                  </label>
                  <label>
                    <span>Primary Inflatable / Package</span>
                    <input
                      type="text"
                      value={formState.bounce_house_type}
                      onChange={(event) =>
                        handleInputChange('bounce_house_type', event.target.value)
                      }
                    />
                  </label>
                </div>
              </section>

              <section>
                <h4>Identifiers</h4>
                <div className="admin-editor-grid">
                  <label>
                    <span>Invoice #</span>
                    <input
                      type="text"
                      value={formState.invoice_number}
                      onChange={(event) => handleInputChange('invoice_number', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Contract #</span>
                    <input
                      type="text"
                      value={formState.contract_number}
                      onChange={(event) => handleInputChange('contract_number', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Payment Method</span>
                    <input
                      type="text"
                      value={formState.payment_method}
                      onChange={(event) => handleInputChange('payment_method', event.target.value)}
                      placeholder="Cash, Card, Check #, etc."
                    />
                  </label>
                </div>
              </section>

              <section>
                <h4>Pricing</h4>
                <div className="admin-editor-grid">
                  <label>
                    <span>Discount %</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formState.discount_percent}
                      onChange={(event) =>
                        handleInputChange('discount_percent', event.target.value)
                      }
                    />
                  </label>
                  <label>
                    <span>Subtotal</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formState.subtotal_amount}
                      onChange={(event) =>
                        handleInputChange('subtotal_amount', event.target.value)
                      }
                    />
                  </label>
                  <label>
                    <span>Delivery Fee</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formState.delivery_fee}
                      onChange={(event) => handleInputChange('delivery_fee', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Tax</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formState.tax_amount}
                      onChange={(event) => handleInputChange('tax_amount', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Total</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formState.total_amount}
                      onChange={(event) => handleInputChange('total_amount', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Deposit</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formState.deposit_amount}
                      onChange={(event) => handleInputChange('deposit_amount', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Balance Due</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formState.balance_due}
                      onChange={(event) => handleInputChange('balance_due', event.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section>
                <h4>Line Items</h4>
                <div className="admin-editor-items">
                  {items.length === 0 && (
                    <p className="admin-editor-items-empty">
                      No items yet. Add each inflatable, accessory, or service line.
                    </p>
                  )}

                  {items.map((item, index) => (
                    <div className="admin-editor-item-row" key={index}>
                      <div className="admin-editor-item-grid">
                        <label>
                          <span>Product</span>
                          <input
                            type="text"
                            value={item.product_name}
                            onChange={(event) =>
                              handleItemChange(index, 'product_name', event.target.value)
                            }
                            placeholder="Bounce House, Slide, Sand Bags…"
                          />
                        </label>
                        <label>
                          <span>Category</span>
                          <input
                            type="text"
                            value={item.product_category}
                            onChange={(event) =>
                              handleItemChange(index, 'product_category', event.target.value)
                            }
                          />
                        </label>
                        <label>
                          <span>Quantity</span>
                          <input
                            type="number"
                            step="0.01"
                            value={item.quantity}
                            onChange={(event) =>
                              handleItemChange(index, 'quantity', event.target.value)
                            }
                          />
                        </label>
                        <label>
                          <span>Unit Price</span>
                          <input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(event) =>
                              handleItemChange(index, 'unit_price', event.target.value)
                            }
                          />
                        </label>
                        <label>
                          <span>Total</span>
                          <input
                            type="number"
                            step="0.01"
                            value={item.total_price}
                            onChange={(event) =>
                              handleItemChange(index, 'total_price', event.target.value)
                            }
                            placeholder="Calculated automatically if empty"
                          />
                        </label>
                      </div>
                      <div className="admin-editor-item-notes">
                        <textarea
                          value={item.notes}
                          onChange={(event) => handleItemChange(index, 'notes', event.target.value)}
                          placeholder="Notes for this line (optional)"
                        />
                        <button
                          type="button"
                          className="admin-editor-remove-item"
                          onClick={() => handleRemoveItem(index)}
                        >
                          Remove Item
                        </button>
                      </div>
                    </div>
                  ))}

                  <button type="button" className="admin-editor-add-item" onClick={handleAddItem}>
                    + Add Line Item
                  </button>
                </div>
              </section>

              <section>
                <h4>Internal Notes</h4>
                <textarea
                  value={formState.internal_notes}
                  onChange={(event) => handleInputChange('internal_notes', event.target.value)}
                  placeholder="Special instructions, delivery reminders, power notes, etc."
                  rows={4}
                />
              </section>
            </div>

            <div className="admin-editor-footer">
              <button type="button" className="admin-editor-cancel" onClick={onClose} disabled={isSaving}>
                Cancel
              </button>
              <button type="button" className="admin-editor-save" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminBookingEditor;

