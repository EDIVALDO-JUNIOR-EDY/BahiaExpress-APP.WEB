// C:/dev/frontend/src/components/shared/FeatureCard.jsx

import React from 'react';

const FeatureCard = ({ Icon, title }) => {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm group transition-transform duration-300 hover:scale-105 hover:shadow-lg">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-blue-500 text-white animate-pulse group-hover:animate-none">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
    </div>
  );
};

export default FeatureCard;