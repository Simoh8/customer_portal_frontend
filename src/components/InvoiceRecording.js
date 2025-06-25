import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Simplified API Utility
const fetchWithAuth = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include'
    });

    if (response.status === 401) {
      throw new Error("SESSION_EXPIRED");
    }

    if (!response.ok) {
      throw new Error(`HTTP_ERROR_${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

function InvoiceCards() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Dummy data for fallback
  const dummyInvoices = [
    {
      name: "INV-2023-001",
      customer: "Acme Corporation",
      posting_date: "2023-05-15",
      due_date: "2023-06-15",
      grand_total: 1250.75,
      outstanding_amount: 500.50,
      status: "Unpaid"
    },
    {
      name: "INV-2023-002",
      customer: "Globex Inc.",
      posting_date: "2023-05-20",
      due_date: "2023-05-30",
      grand_total: 890.00,
      outstanding_amount: 0.00,
      status: "Paid"
    },
    {
      name: "INV-2023-003",
      customer: "Wayne Enterprises",
      posting_date: "2023-04-01",
      due_date: "2023-05-01",
      grand_total: 4200.00,
      outstanding_amount: 4200.00,
      status: "Overdue"
    }
  ];

  const verifySession = async () => {
    try {
      await fetchWithAuth('/api/method/ledgerctrl.ledgerctrl.api.login_api.get_current_user');
    } catch (error) {
      if (error.message === "SESSION_EXPIRED") {
        localStorage.removeItem("isAuthenticated");
        navigate("/login", { state: { from: "invoices" } });
      }
      throw error;
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await verifySession();
      
      const data = await fetchWithAuth(
        "/api/method/ledgerctrl.ledgerctrl.api.login_api.get_sales_invoices"
      );
      
      if (data.message && data.message.success_key === 1) {
        setInvoices(data.message.sales_invoices.map(inv => ({
          ...inv,
          paid_amount: inv.grand_total - inv.outstanding_amount,
          customer: data.message.customer
        })));
      } else {
        throw new Error(data.message?.message || "Failed to fetch invoices");
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      
      const errorMessage = err.message === "SESSION_EXPIRED" 
        ? "Session expired. Please login again." 
        : "Failed to load invoices. Showing sample data.";
      
      setError(errorMessage);
      setInvoices(dummyInvoices);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("isAuthenticated")) {
      navigate("/login", { state: { from: "invoices" } });
      return;
    }
    
    fetchInvoices();
  }, [retryCount, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    return Math.max(0, Math.floor((today - due) / (1000 * 60 * 60 * 24)));
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handlePayNow = (invoiceId) => {
    navigate(`/payment?invoice=${invoiceId}`);
  };

  const handleViewDetails = (invoiceId) => {
    navigate(`/invoice/${invoiceId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your invoices...</p>
      </div>
    );
  }

  return (
    <div className="invoice-cards-container">
      <div className="invoice-header">
        <h2>Your Invoices</h2>
        <button 
          onClick={handleRetry} 
          className="refresh-button"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Invoices'}
        </button>
      </div>

      {error && (
        <div className={`error-notice ${error.includes("expired") ? "session-error" : ""}`}>
          <p>{error}</p>
          {error.includes("expired") ? (
            <a href="/login" className="login-link">Login Again</a>
          ) : (
            <p className="fallback-notice">Showing sample data</p>
          )}
        </div>
      )}

      <div className="invoice-cards-grid">
        {invoices.map((invoice) => (
          <div key={invoice.name} className={`invoice-card ${invoice.status?.toLowerCase()}`}>
            <div className="invoice-card-header">
              <h3>#{invoice.name}</h3>
              {invoice.status && (
                <span className={`status-badge ${invoice.status.toLowerCase()}`}>
                  {invoice.status}
                </span>
              )}
            </div>

            <div className="invoice-card-body">
              <div className="invoice-customer">{invoice.customer}</div>

              <div className="invoice-dates">
                <div>
                  <span className="date-label">Issued:</span>
                  <span>{new Date(invoice.posting_date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="date-label">Due:</span>
                  <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
                  {invoice.status === "Overdue" && (
                    <span className="overdue-days">
                      ({getDaysOverdue(invoice.due_date)} days overdue)
                    </span>
                  )}
                </div>
              </div>

              <div className="invoice-amounts">
                <div className="amount-row">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.grand_total)}</span>
                </div>
                <div className="amount-row">
                  <span>Paid:</span>
                  <span>{formatCurrency(invoice.paid_amount)}</span>
                </div>
                <div className="amount-row balance">
                  <span>Balance:</span>
                  <span>{formatCurrency(invoice.outstanding_amount)}</span>
                </div>
              </div>
            </div>

            <div className="invoice-card-footer">
              <button 
                className="pay-button"
                onClick={() => handlePayNow(invoice.name)}
                disabled={invoice.status === "Paid"}
              >
                {invoice.status === "Paid" ? "Paid" : "Pay Now"}
              </button>
              <button 
                className="details-button"
                onClick={() => handleViewDetails(invoice.name)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InvoiceCards;