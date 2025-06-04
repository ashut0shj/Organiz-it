import React from 'react';
import { Play, Code, Globe, Monitor } from 'lucide-react';

const ProfileCard = ({ profile, index, onLaunch }) => {
  const getAppTypeIcon = (type) => {
    switch (type) {
      case 'browser':
        return <Globe size={14} />;
      case 'code':
        return <Code size={14} />;
      case 'app':
        return <Monitor size={14} />;
      default:
        return <Monitor size={14} />;
    }
  };

  const getAppCount = (apps) => {
    let count = 0;
    apps.forEach((app) => {
      if (app.type === 'browser' && app.urls) {
        count += app.urls.length;
      } else {
        count += 1;
      }
    });
    return count;
  };

  const getGradientClass = (index) => {
    const gradients = [
      'bg-gradient-to-br from-blue-500 to-purple-600',
      'bg-gradient-to-br from-green-500 to-teal-600',
      'bg-gradient-to-br from-orange-500 to-red-600',
      'bg-gradient-to-br from-purple-500 to-pink-600',
      'bg-gradient-to-br from-teal-500 to-cyan-600',
      'bg-gradient-to-br from-indigo-500 to-blue-600',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div
      className={`${getGradientClass(index)} rounded-xl p-4 text-white cursor-pointer hover:scale-105 transition-transform shadow-lg h-48 flex flex-col`}
      onClick={() => onLaunch(profile)}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg truncate flex-1">{profile.name}</h3>
        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors">
          <Play size={14} />
        </div>
      </div>

      <div className="mb-3">
        <p className="text-white text-opacity-80 text-sm">
          {getAppCount(profile.apps)} items
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-auto">
        {profile.apps.slice(0, 3).map((app, appIndex) => (
          <span
            key={appIndex}
            className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs flex items-center gap-1"
          >
            {getAppTypeIcon(app.type)}
            <span className="hidden sm:inline capitalize">{app.type}</span>
          </span>
        ))}
        {profile.apps.length > 3 && (
          <span className="text-white text-opacity-80 text-xs">
            +{profile.apps.length - 3}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
