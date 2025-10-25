import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { contactAPI, categoryAPI, uploadAPI, statsAPI } from '../services/api';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ContactForm from '../components/ContactForm';
import ContactCard from '../components/ContactCard';
import CategoryManager from '../components/CategoryManager';
import ImportExport from '../components/ImportExport';
import Stats from '../components/Stats';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  
  const [contacts, setContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contactsRes, categoriesRes, statsRes] = await Promise.all([
        contactAPI.getAll(),
        categoryAPI.getAll(),
        statsAPI.get()
      ]);
      setContacts(contactsRes.data);
      setCategories(categoriesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleSearch = async () => {
    try {
      const params = {
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        sort_by: sortBy
      };
      const response = await contactAPI.getAll(params);
      setContacts(response.data);
    } catch (error) {
      showToast('Search failed', 'error');
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedCategory, sortBy]);

  const handleCreateContact = async (contactData) => {
    try {
      await contactAPI.create(contactData);
      showToast('Contact created successfully!', 'success');
      setShowContactModal(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.detail || 'Failed to create contact', 'error');
    }
  };

  const handleUpdateContact = async (contactData) => {
    try {
      await contactAPI.update(editingContact.contact_id, contactData);
      showToast('Contact updated successfully!', 'success');
      setShowContactModal(false);
      setEditingContact(null);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.detail || 'Failed to update contact', 'error');
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await contactAPI.delete(contactId);
      showToast('Contact deleted successfully!', 'success');
      fetchData();
    } catch (error) {
      showToast('Failed to delete contact', 'error');
    }
  };

  const handleEditClick = (contact) => {
    setEditingContact(contact);
    setShowContactModal(true);
  };

  const handleAddClick = () => {
    setEditingContact(null);
    setShowContactModal(true);
  };

  const handleImportSuccess = () => {
    showToast('Contacts imported successfully!', 'success');
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">📒</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Book</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {user?.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              
              <button
                onClick={() => setShowStatsModal(true)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="View statistics"
              >
                📊
              </button>
              
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                🏷️ Categories
              </button>
              
              <button
                onClick={() => setShowImportExportModal(true)}
                className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              >
                📥📤 Import/Export
              </button>
              
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="🔍 Search contacts by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="name">Sort by Name</option>
                <option value="created_at">Sort by Created</option>
                <option value="updated_at">Sort by Updated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Contacts ({contacts.length})
          </h2>
          <button
            onClick={handleAddClick}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Contact
          </button>
        </div>

        {contacts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No contacts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by adding your first contact!
            </p>
            <button
              onClick={handleAddClick}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Add Your First Contact
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map(contact => (
              <ContactCard
                key={contact.contact_id}
                contact={contact}
                onEdit={handleEditClick}
                onDelete={(contact) => setDeleteConfirm(contact)}
              />
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setEditingContact(null);
        }}
        title={editingContact ? 'Edit Contact' : 'Add New Contact'}
      >
        <ContactForm
          contact={editingContact}
          categories={categories}
          onSubmit={editingContact ? handleUpdateContact : handleCreateContact}
          onCancel={() => {
            setShowContactModal(false);
            setEditingContact(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Manage Categories"
        maxWidth="max-w-lg"
      >
        <CategoryManager
          categories={categories}
          onUpdate={fetchData}
          showToast={showToast}
        />
      </Modal>

      <Modal
        isOpen={showImportExportModal}
        onClose={() => setShowImportExportModal(false)}
        title="Import / Export Contacts"
        maxWidth="max-w-lg"
      >
        <ImportExport
          onImportSuccess={handleImportSuccess}
          showToast={showToast}
        />
      </Modal>

      <Modal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        title="Statistics"
        maxWidth="max-w-lg"
      >
        <Stats stats={stats} />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          handleDeleteContact(deleteConfirm.contact_id);
          setDeleteConfirm(null);
        }}
        title="Delete Contact"
        message={`Are you sure you want to delete ${deleteConfirm?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default Dashboard;
