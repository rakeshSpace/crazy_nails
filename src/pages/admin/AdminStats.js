import React from 'react';

const AdminStats = ({ stats }) => {
  const statCards = [
    { title: 'Total Bookings', value: stats.totalBookings || 0, icon: 'fa-calendar', color: 'text-primary' },
    { title: 'Pending Bookings', value: stats.pendingBookings || 0, icon: 'fa-clock', color: 'text-yellow-500' },
    { title: 'Total Orders', value: stats.totalOrders || 0, icon: 'fa-shopping-cart', color: 'text-primary' },
    { title: 'Total Users', value: stats.totalUsers || 0, icon: 'fa-users', color: 'text-primary' }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-dark-light rounded-xl p-6 shadow-soft hover:shadow-medium transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray text-sm mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-dark dark:text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-accent dark:bg-primary/20 rounded-full flex items-center justify-center ${stat.color}`}>
                <i className={`fas ${stat.icon} text-2xl`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminStats;