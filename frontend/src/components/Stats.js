import React from 'react';

const Stats = ({ stats }) => {
  if (!stats) return null;

  const categoryData = Object.entries(stats.by_category || {});

  return (
    <div className="space-y-6">
      <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg">
        <div className="text-5xl mb-2">📊</div>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {stats.total_contacts}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">Total Contacts</p>
      </div>

      {categoryData.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Contacts by Category
          </h4>
          <div className="space-y-2">
            {categoryData.map(([category, count]) => {
              const percentage = stats.total_contacts > 0 
                ? ((count / stats.total_contacts) * 100).toFixed(1) 
                : 0;
              
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{category}</span>
                    <span className="text-gray-600 dark:text-gray-400">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg text-center">
          <div className="text-2xl mb-1">✅</div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Active Contacts</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total_contacts}</p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg text-center">
          <div className="text-2xl mb-1">📁</div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Categories</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{categoryData.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Stats;
