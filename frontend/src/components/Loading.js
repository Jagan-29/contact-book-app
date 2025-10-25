import React from 'react';

const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
