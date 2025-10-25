import React from 'react';

const ContactCard = ({ contact, onEdit, onDelete }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Family': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      'Friends': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'Work': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'General': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[category] || colors['General'];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {contact.profile_picture ? (
            <img
              src={contact.profile_picture}
              alt={contact.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {getInitials(contact.name)}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {contact.name}
            </h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(contact.category)}`}>
              {contact.category}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(contact)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {contact.phones && contact.phones.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone Numbers</p>
            {contact.phones.map((phone, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span>📞</span>
                <span>{phone.number}</span>
                <span className="text-xs text-gray-500">({phone.label})</span>
              </div>
            ))}
          </div>
        )}

        {contact.emails && contact.emails.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email Addresses</p>
            {contact.emails.map((email, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span>✉️</span>
                <span className="truncate">{email.email}</span>
                <span className="text-xs text-gray-500">({email.label})</span>
              </div>
            ))}
          </div>
        )}

        {contact.notes && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {contact.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactCard;
