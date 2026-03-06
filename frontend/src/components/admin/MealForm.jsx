import React, { useEffect, useMemo, useState } from 'react';
import { X, Upload, Loader, ImagePlus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { Logger } from '../../utils/helpers';
import { resolveMediaUrl } from '../../utils/media';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const MealForm = ({ meal, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_available: '1',
    image_path: '',
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const previewSrc = useMemo(() => resolveMediaUrl(imagePreview), [imagePreview]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!meal) {
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        is_available: '1',
        image_path: '',
      });
      setImagePreview('');
      setImageFile(null);
      setErrors({});
      return;
    }

    setFormData({
      name: meal.name || '',
      description: meal.description || '',
      price: meal.price || '',
      category_id: String(meal.category_id || ''),
      is_available: meal.is_available ? '1' : '0',
      image_path: meal.image_path || '',
    });
    setImagePreview(meal.image_path || '');
    setImageFile(null);
    setErrors({});
  }, [meal]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      Logger.error('Error loading categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Only JPG, PNG, GIF, or WEBP images are allowed.' }));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((prev) => ({ ...prev, image: 'Image is too large. Max file size is 5MB.' }));
      return;
    }

    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    const localPreview = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(localPreview);
    setErrors((prev) => ({ ...prev, image: '' }));
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, image_path: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Meal name is required.';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Enter a valid meal price.';
    if (!formData.category_id) newErrors.category_id = 'Select a category.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, submit: '' }));

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('description', formData.description?.trim() || '');
      submitData.append('price', String(Number(formData.price)));
      submitData.append('category_id', String(formData.category_id));
      submitData.append('is_available', String(formData.is_available));

      if (imageFile) {
        submitData.append('image', imageFile);
      } else if (meal?.image_path && formData.image_path) {
        submitData.append('image_path', formData.image_path);
      }

      const token = localStorage.getItem('token');
      const headers = {
        Authorization: token ? `Bearer ${token}` : undefined,
        'Content-Type': 'multipart/form-data',
      };

      const response = meal
        ? await api.post(`/meals/${meal.id}`, submitData, { headers })
        : await api.post('/meals', submitData, { headers });

      if (!response.data.success) {
        setErrors((prev) => ({ ...prev, submit: response.data.message || 'Failed to save meal.' }));
        return;
      }

      Logger.info(meal ? `Meal updated: ${formData.name}` : `Meal created: ${formData.name}`);
      onSuccess();
      onClose();
    } catch (error) {
      Logger.error('Error saving meal:', error);
      setErrors((prev) => ({
        ...prev,
        submit: error?.data?.message || error?.message || 'Failed to save meal.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{meal ? 'Edit Meal' : 'Add New Meal'}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Meal Image</label>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="h-32 w-32 rounded-lg border-2 border-dashed border-gray-300 bg-white flex items-center justify-center overflow-hidden">
                {previewSrc ? (
                  <img src={previewSrc} alt="Meal preview" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-8 w-8 text-gray-400" />
                )}
              </div>

              <div className="space-y-2">
                <input type="file" id="image" accept="image/*" onChange={handleImageChange} className="hidden" />
                <label htmlFor="image" className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  {previewSrc ? 'Replace Image' : 'Choose Image'}
                </label>

                {previewSrc && (
                  <button type="button" onClick={handleRemoveImage} className="ml-2 inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100">
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                )}

                <p className="text-xs text-gray-500">JPG, PNG, GIF, WEBP. Max 5MB.</p>
              </div>
            </div>
            {errors.image && <p className="mt-2 text-sm text-red-600">{errors.image}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Meal Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="e.g., Grilled Chicken Salad"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Describe the meal..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (MK) *</label>
            <input
              type="number"
              id="price"
              name="price"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.price ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="0.00"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category *</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.category_id ? 'border-red-300' : 'border-gray-300'}`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input type="radio" name="is_available" value="1" checked={formData.is_available === '1'} onChange={handleInputChange} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300" />
              <span className="ml-2 text-sm text-gray-700">Available</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" name="is_available" value="0" checked={formData.is_available === '0'} onChange={handleInputChange} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300" />
              <span className="ml-2 text-sm text-gray-700">Out of Stock</span>
            </label>
          </div>
        </div>

        {errors.submit && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errors.submit}</div>
        )}

        <div className="mt-8 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isLoading} className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? (<><Loader className="animate-spin h-4 w-4 mr-2" /> Saving...</>) : meal ? 'Update Meal' : 'Create Meal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MealForm;
