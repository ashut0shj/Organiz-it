
import React from 'react';

const ProfileStats = ({ profiles }) => {
  const getAppCount = (apps) => {
    let count = 0;
    apps.forEach(app => {
      if (app.type === 'browser' && app.urls) {
        count += app.urls.length;
      } else {
        count += 1;
      }
    });
    return count;
  };

  const totalApps = profiles.reduce((total, profile) => total + profile.apps.length, 0);
  const totalItems = profiles.reduce((total, profile) => total + getAppCount(profile.apps), 0);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="grid grid-cols-3 gap-6 text-center">
        <div>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {profiles.length}
          </div>
          <p className="text-gray-600 text-sm">Profiles</p>
        </div>
        <div>
          <div className="text-3xl font-bold text-green-600 mb-1">
            {totalApps}
          </div>
          <p className="text-gray-600 text-sm">Apps</p>
        </div>
        <div>
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {totalItems}
          </div>
          <p className="text-gray-600 text-sm">Items</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;