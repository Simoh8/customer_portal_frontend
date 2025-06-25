import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Activity, CreditCard, AlertCircle, CheckCircle, DollarSign, Users, FileText, MessageSquare } from "react-feather";

function Dashboard() {
  const [stats, setStats] = useState({
    outstandingInvoices: 0,
    overdueInvoices: 0,
    recentPayments: 0,
    openTickets: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dummy data - replace with actual API calls
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate API calls
        setTimeout(() => {
          setStats({
            outstandingInvoices: 5420.75,
            overdueInvoices: 2150.50,
            recentPayments: 3280.25,
            openTickets: 3
          });
          
          setRecentActivity([
            { id: 1, type: 'payment', amount: 1250.00, reference: 'INV-2023-105', date: '2023-06-15', status: 'completed' },
            { id: 2, type: 'invoice', amount: 890.50, reference: 'INV-2023-106', date: '2023-06-14', status: 'pending' },
            { id: 3, type: 'ticket', subject: 'Login issues', date: '2023-06-13', status: 'open' },
            { id: 4, type: 'payment', amount: 420.75, reference: 'INV-2023-104', date: '2023-06-12', status: 'completed' },
          ]);
          
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="welcome-message">Welcome back! Here's what's happening with your account.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ffebee', color: '#f44336' }}>
            <DollarSign size={20} />
          </div>
          <div className="stat-info">
            <h3>Outstanding Invoices</h3>
            <p>{formatCurrency(stats.outstandingInvoices)}</p>
          </div>
          <Link to="/invoice" className="stat-link">View All</Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fff8e1', color: '#ffa000' }}>
            <AlertCircle size={20} />
          </div>
          <div className="stat-info">
            <h3>Overdue Invoices</h3>
            <p>{formatCurrency(stats.overdueInvoices)}</p>
          </div>
          <Link to="/invoice?status=overdue" className="stat-link">View All</Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e8f5e9', color: '#4caf50' }}>
            <CheckCircle size={20} />
          </div>
          <div className="stat-info">
            <h3>Recent Payments</h3>
            <p>{formatCurrency(stats.recentPayments)}</p>
          </div>
          <Link to="/payment" className="stat-link">View All</Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e3f2fd', color: '#2196f3' }}>
            <MessageSquare size={20} />
          </div>
          <div className="stat-info">
            <h3>Open Tickets</h3>
            <p>{stats.openTickets}</p>
          </div>
          <Link to="/support" className="stat-link">View All</Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/invoice/new" className="action-button">
            <FileText size={18} />
            <span>Create Invoice</span>
          </Link>
          <Link to="/payment/new" className="action-button">
            <CreditCard size={18} />
            <span>Record Payment</span>
          </Link>
          <Link to="/register" className="action-button">
            <Users size={18} />
            <span>Add Customer</span>
          </Link>
          <Link to="/support/new" className="action-button">
            <MessageSquare size={18} />
            <span>Create Ticket</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {recentActivity.length > 0 ? (
            recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'payment' && <CreditCard size={18} />}
                  {activity.type === 'invoice' && <FileText size={18} />}
                  {activity.type === 'ticket' && <MessageSquare size={18} />}
                </div>
                <div className="activity-details">
                  <div className="activity-main">
                    {activity.type === 'payment' && (
                      <p>Payment of {formatCurrency(activity.amount)} for {activity.reference}</p>
                    )}
                    {activity.type === 'invoice' && (
                      <p>New invoice {activity.reference} for {formatCurrency(activity.amount)}</p>
                    )}
                    {activity.type === 'ticket' && (
                      <p>Support ticket created: {activity.subject}</p>
                    )}
                    <span className={`activity-status ${activity.status}`}>{activity.status}</span>
                  </div>
                  <div className="activity-meta">
                    <time dateTime={activity.date}>{formatDate(activity.date)}</time>
                    {activity.type !== 'ticket' && (
                      <Link to={`/${activity.type === 'payment' ? 'payment' : 'invoice'}/${activity.reference}`} className="view-link">
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-activity">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;