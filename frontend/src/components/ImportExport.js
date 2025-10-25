import React, { useState } from 'react';
import { contactAPI } from '../services/api';

const ImportExport = ({ onImportSuccess, showToast }) => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleImportJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const response = await contactAPI.importJSON(file);
      showToast(response.data.message, 'success');
      onImportSuccess();
    } catch (error) {
      showToast(error.response?.data?.detail || 'Import failed', 'error');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const response = await contactAPI.importCSV(file);
      showToast(response.data.message, 'success');
      onImportSuccess();
    } catch (error) {
      showToast(error.response?.data?.detail || 'Import failed', 'error');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleExportJSON = async () => {
    setExporting(true);
    try {
      const response = await contactAPI.exportJSON();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'contacts.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Contacts exported successfully!', 'success');
    } catch (error) {
      showToast('Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await contactAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'contacts.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Contacts exported successfully!', 'success');
    } catch (error) {
      showToast('Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Import Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📥 Import Contacts</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Import contacts from JSON or CSV files. Duplicate contacts will be skipped.
        </p>
        
        <div className="space-y-3">
          <div>
            <label className="block">
              <span className="sr-only">Import JSON</span>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload JSON</span>
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    disabled={importing}
                    className="hidden"
                  />
                </label>
              </div>
            </label>
          </div>

          <div>
            <label className="block">
              <span className="sr-only">Import CSV</span>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload CSV</span>
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    disabled={importing}
                    className="hidden"
                  />
                </label>
              </div>
            </label>
          </div>
        </div>
        
        {importing && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">Importing contacts...</p>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      {/* Export Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📤 Export Contacts</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Download all your contacts in JSON or CSV format.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={handleExportJSON}
            disabled={exporting}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
          >
            {exporting ? 'Exporting...' : 'Export as JSON'}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
          >
            {exporting ? 'Exporting...' : 'Export as CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
