import React from 'react';
import { Link } from 'react-router-dom';
import HighchartsLineChart from '../../components/HighchartsLineChart';
import HighchartsPieChart from '../../components/HighchartsPieChart';
import HighchartsBarChart from '../../components/HighchartsBarChart';
import HighchartsDonutChart from '../../components/HighchartsDonutChart';

const AdminStats = ({ stats, loading }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Bookings', value: stats.totalBookings, icon: 'fa-calendar', color: 'from-blue-500 to-blue-600', change: '+12%' },
        { title: 'Pending Bookings', value: stats.pendingBookings, icon: 'fa-clock', color: 'from-yellow-500 to-yellow-600', change: '-3%' },
        { title: 'Total Orders', value: stats.totalOrders, icon: 'fa-shopping-cart', color: 'from-green-500 to-green-600', change: '+18%' },
        { title: 'Total Products', value: stats.totalProducts, icon: 'fa-box', color: 'from-purple-500 to-purple-600', change: '+5%' },
        { title: 'Total Users', value: stats.totalUsers, icon: 'fa-users', color: 'from-indigo-500 to-indigo-600', change: '+8%' },
        { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: 'fa-rupee-sign', color: 'from-primary to-secondary', change: '+22%' }
    ];

    // Prepare data for charts
    const revenueData = stats.monthlyRevenue.length > 0 ? stats.monthlyRevenue : [
        { month: 'Jan', revenue: 0 }, { month: 'Feb', revenue: 0 }, { month: 'Mar', revenue: 0 },
        { month: 'Apr', revenue: 0 }, { month: 'May', revenue: 0 }, { month: 'Jun', revenue: 0 },
        { month: 'Jul', revenue: 0 }, { month: 'Aug', revenue: 0 }, { month: 'Sep', revenue: 0 },
        { month: 'Oct', revenue: 0 }, { month: 'Nov', revenue: 0 }, { month: 'Dec', revenue: 0 }
    ];

    const orderStatusData = stats.orderStatusData.length > 0 ? stats.orderStatusData : [
        { name: 'Pending', value: 0 }, { name: 'Processing', value: 0 },
        { name: 'Shipped', value: 0 }, { name: 'Delivered', value: 0 }, { name: 'Cancelled', value: 0 }
    ];

    const totalOrdersCount = stats.totalOrders;
    const deliveredOrders = stats.orderStatusData.find(s => s.name === 'delivered')?.value || 0;
    const pendingOrders = stats.orderStatusData.find(s => s.name === 'pending')?.value || 0;
    const cancelledOrders = stats.orderStatusData.find(s => s.name === 'cancelled')?.value || 0;

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray text-sm mb-1">{card.title}</p>
                                <p className="text-2xl font-bold text-dark dark:text-white">{card.value}</p>
                                <p className="text-green-500 text-xs mt-2">
                                    <i className="fas fa-arrow-up mr-1"></i> {card.change} from last month
                                </p>
                            </div>
                            <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                                <i className={`fas ${card.icon} text-white text-xl`}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Highcharts - Revenue Trend Line Chart */}
            <div className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft mb-6">
                <HighchartsLineChart 
                    data={revenueData}
                    title="Monthly Revenue Trend"
                    yAxisTitle="Revenue (₹)"
                    color="#d4a574"
                />
            </div>

            {/* Two Column Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Order Status Distribution - Pie Chart */}
                <div className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft">
                    <HighchartsPieChart 
                        data={orderStatusData}
                        title="Order Status Distribution"
                        colors={['#d4a574', '#8b7355', '#e8d3b9', '#b89464', '#a0845c']}
                    />
                </div>

                {/* Order Status - Donut Chart */}
                <div className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft">
                    <HighchartsDonutChart 
                        data={[
                            { name: 'Delivered', value: deliveredOrders },
                            { name: 'Pending', value: pendingOrders },
                            { name: 'Cancelled', value: cancelledOrders },
                            { name: 'Others', value: totalOrdersCount - deliveredOrders - pendingOrders - cancelledOrders }
                        ]}
                        title="Order Completion Rate"
                        total={`${totalOrdersCount} Total Orders`}
                    />
                </div>
            </div>

            {/* Monthly Orders Bar Chart */}
            <div className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft mb-6">
                <HighchartsBarChart 
                    data={revenueData.map(item => ({ name: item.month, value: item.revenue }))}
                    title="Monthly Revenue Breakdown"
                    xAxisTitle="Month"
                    yAxisTitle="Revenue (₹)"
                    color="#d4a574"
                />
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white dark:bg-dark rounded-2xl shadow-soft overflow-hidden">
                <div className="p-6 border-b border-light-gray dark:border-gray-700 flex justify-between items-center flex-wrap gap-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <i className="fas fa-clock text-primary"></i> Recent Orders
                    </h3>
                    <Link to="/admin/orders" className="text-primary text-sm hover:underline">View All Orders →</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-light dark:bg-dark-light">
                            <tr>
                                <th className="px-4 py-3 text-left">Order ID</th>
                                <th className="px-4 py-3 text-left">Customer</th>
                                <th className="px-4 py-3 text-left">Amount</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders.map(order => (
                                <tr key={order.id} className="border-t border-light-gray dark:border-gray-700 hover:bg-light dark:hover:bg-dark-light transition-all">
                                    <td className="px-4 py-3 font-mono text-sm text-primary">{order.order_number}</td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium">{order.customer_name}</p>
                                            <p className="text-xs text-gray">{order.customer_phone}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-semibold">₹{order.total_amount}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            order.order_status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                            order.order_status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>
                                            {order.order_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {stats.recentOrders.length === 0 && (
                    <div className="text-center py-8">
                        <i className="fas fa-inbox text-4xl text-gray-300 mb-2"></i>
                        <p className="text-gray">No orders found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminStats;