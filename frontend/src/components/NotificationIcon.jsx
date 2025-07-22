import React from 'react';

const NotificationIcon = ({ Icon, text, count }) => (
    <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
        <Icon className="text-yellow-600" />
        <span>{text}{count > 0 && ` (${count})`}</span>
    </div>
);

export default NotificationIcon;