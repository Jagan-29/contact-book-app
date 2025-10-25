import React, { useState, useEffect } from 'react';
import { uploadAPI } from '../services/api';

const ContactForm = ({ contact, categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    phones: [{ number: '', label: 'mobile' }],
    emails: [{ email: '', label: 'personal' }],
    category: 'General',
    notes: '',
    profile_picture: null
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        phones: contact.phones?.length > 0 ? contact.phones : [{ number: '', label: 'mobile' }],
        emails: contact.emails?.length > 0 ? contact.emails : [{ email: '', label: 'personal' }],
        category: contact.category || 'General',
        notes: contact.notes || '',
        profile_picture: contact.profile_picture || null
      });
    }
  }, [contact]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (index, field, value) => {
    const newPhones = [...formData.phones];
    newPhones[index][field] = value;
    setFormData({ ...formData, phones: newPhones });
  };

  const addPhone = () => {
    setFormData({
      ...formData,
      phones: [...formData.phones, { number: '', label: 'mobile' }]
    });
  };

  const removePhone = (index) => {
    if (formData.phones.length > 1) {
      const newPhones = formData.phones.filter((_, i) => i !== index);
      setFormData({ ...formData, phones: newPhones });
    }
  };

  const handleEmailChange = (index, field, value) => {
    const newEmails = [...formData.emails];
    newEmails[index][field] = value;
    setFormData({ ...formData, emails: newEmails });
  };

  const addEmail = () => {
    setFormData({
      ...formData,
      emails: [...formData.emails, { email: '', label: 'personal' }]
    });
  };

  const removeEmail = (index) => {
    if (formData.emails.length > 1) {
      const newEmails = formData.emails.filter((_, i) => i !== index);
      setFormData({ ...formData, emails: newEmails });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const response = await uploadAPI.uploadProfilePicture(file);
      setFormData({ ...formData, profile_picture: response.data.url });
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    // Filter out empty phones and emails
    const cleanedData = {
      ...formData,
      phones: formData.phones.filter(p => p.number.trim()),
      emails: formData.emails.filter(e => e.email.trim())
    };

    setSubmitting(true);
    try {
      await onSubmit(cleanedData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center gap-4">
        {formData.profile_picture ? (
          <img
            src={formData.profile_picture}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
            {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
          </div>
        )}
        <div>
          <label className="block">
            <span className="sr-only">Choose profile photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </label>
          {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="John Doe"
        />
      </div>

      {/* Phone Numbers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Numbers
          </label>
          <button
            type="button"
            onClick={addPhone}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + Add Phone
          </button>
        </div>
        {formData.phones.map((phone, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="tel"
              value={phone.number}
              onChange={(e) => handlePhoneChange(index, 'number', e.target.value)}
              placeholder="Phone number"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <select
              value={phone.label}
              onChange={(e) => handlePhoneChange(index, 'label', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="mobile">Mobile</option>
              <option value="home">Home</option>
              <option value="work">Work</option>
            </select>
            {formData.phones.length > 1 && (
              <button
                type="button"
                onClick={() => removePhone(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Email Addresses */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Addresses
          </label>
          <button
            type="button"
            onClick={addEmail}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + Add Email
          </button>
        </div>
        {formData.emails.map((email, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="email"
              value={email.email}
              onChange={(e) => handleEmailChange(index, 'email', e.target.value)}
              placeholder="Email address"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <select
              value={email.label}
              onChange={(e) => handleEmailChange(index, 'label', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="personal">Personal</option>
              <option value="work">Work</option>
            </select>
            {formData.emails.length > 1 && (
              <button
                type="button"
                onClick={() => removeEmail(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          {categories.map(cat => (
            <option key={cat.category_id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Additional notes..."
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : contact ? 'Update Contact' : 'Add Contact'}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
