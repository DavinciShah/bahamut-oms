import { useEffect } from 'react';
import { useForm } from '../../hooks/useForm';
import ErrorAlert from '../Common/ErrorAlert';

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Books', 'Home & Garden', 'Sports', 'Other'];

function validateProductForm(values) {
  const errors = {};
  if (!values.name?.trim()) errors.name = 'Name is required.';
  if (!values.price || isNaN(values.price) || Number(values.price) < 0)
    errors.price = 'Valid price is required.';
  if (values.stock_quantity === '' || isNaN(values.stock_quantity) || Number(values.stock_quantity) < 0)
    errors.stock_quantity = 'Valid stock quantity is required.';
  return errors;
}

const INITIAL = { name: '', description: '', price: '', stock_quantity: '', category: '', sku: '' };

function ProductForm({ onSubmit, loading, initialValues, submitLabel = 'Save Product' }) {
  const { values, errors, handleChange, handleSubmit, setValues } = useForm(
    initialValues || INITIAL,
    validateProductForm
  );

  useEffect(() => {
    if (initialValues) setValues(initialValues);
  }, [initialValues, setValues]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="name">Product Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            className={`form-control${errors.name ? ' is-invalid' : ''}`}
            value={values.name}
            onChange={handleChange}
            placeholder="Product name"
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="sku">SKU</label>
          <input
            id="sku"
            name="sku"
            type="text"
            className="form-control"
            value={values.sku}
            onChange={handleChange}
            placeholder="ABC-001"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          className="form-control"
          rows={3}
          value={values.description}
          onChange={handleChange}
          placeholder="Product description…"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="price">Price ($) *</label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            className={`form-control${errors.price ? ' is-invalid' : ''}`}
            value={values.price}
            onChange={handleChange}
            placeholder="0.00"
          />
          {errors.price && <span className="form-error">{errors.price}</span>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="stock_quantity">Stock Quantity *</label>
          <input
            id="stock_quantity"
            name="stock_quantity"
            type="number"
            min="0"
            className={`form-control${errors.stock_quantity ? ' is-invalid' : ''}`}
            value={values.stock_quantity}
            onChange={handleChange}
            placeholder="0"
          />
          {errors.stock_quantity && <span className="form-error">{errors.stock_quantity}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          className="form-control"
          value={values.category}
          onChange={handleChange}
        >
          <option value="">Select a category…</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
