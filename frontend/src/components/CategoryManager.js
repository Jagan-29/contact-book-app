import React, { useState } from 'react';
import { categoryAPI } from '../services/api';

const CategoryManager = ({ categories, onUpdate, showToast }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#0ea5e9');
  const [loading, setLoading] = useState(false);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DFE6E9', '#74B9FF', '#A29BFE', '#FD79A8', '#FDCB6E'
  ];

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      await categoryAPI.create(newCategoryName, newCategoryColor);
      showToast('Category added successfully!', 'success');
      setNewCategoryName('');
      setNewCategoryColor('#0ea5e9');
      onUpdate();
    } catch (error) {
      showToast(error.response?.data?.detail || 'Failed to add category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Delete this category?')) return;

    try {
      await categoryAPI.delete(categoryId);
      showToast('Category deleted successfully!', 'success');
      onUpdate();
    } catch (error) {
      showToast('Failed to delete category', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing Categories */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Your Categories</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories.map(category => (
            <div
              key={category.category_id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
              </div>
              <button
                onClick={() => handleDeleteCategory(category.category_id)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Category */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add New Category</h4>
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Choose a color:</p>
            <div className="flex flex-wrap gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewCategoryColor(color)}
                  className={`w-10 h-10 rounded-full transition-transform ${
                    newCategoryColor === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryManager;
