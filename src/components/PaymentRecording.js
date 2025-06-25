import React, { useState, useEffect } from "react";

function PaymentRecording() {
  // Form state
  const [paymentData, setPaymentData] = useState({
    party: "",
    amount: "",
    invoice: "",
    mode_of_payment: "Cash",
    payment_date: new Date().toISOString().split('T')[0]
  });

  // Payment history state
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoices, setInvoices] = useState([]);

  // Dummy data for fallback
  const dummyPayments = [
    {
      name: "PAY-2023-001",
      party: "Acme Corporation",
      posting_date: "2023-06-01",
      paid_amount: 500.50,
      mode_of_payment: "Bank Transfer",
      reference_no: "INV-2023-001"
    },
    {
      name: "PAY-2023-002",
      party: "Globex Inc.",
      posting_date: "2023-06-05",
      paid_amount: 890.00,
      mode_of_payment: "Credit Card",
      reference_no: "INV-2023-002"
    }
  ];

  const dummyInvoices = [
    { name: "INV-2023-001", customer: "Acme Corporation", outstanding_amount: 500.50 },
    { name: "INV-2023-002", customer: "Globex Inc.", outstanding_amount: 0 },
    { name: "INV-2023-003", customer: "Wayne Enterprises", outstanding_amount: 4200.00 }
  ];

  // Fetch payment history and invoices
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch real data
        const [paymentsRes, invoicesRes] = await Promise.all([
          fetch("/api/resource/Payment%20Entry?fields=[%22name%22,%22party%22,%22posting_date%22,%22paid_amount%22,%22mode_of_payment%22,%22reference_no%22]"),
          fetch("/api/resource/Sales%20Invoice?fields=[%22name%22,%22customer%22,%22outstanding_amount%22]&filters=[[%22outstanding_amount%22,%22%3E%22,0]]")
        ]);

        // Process payments
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(paymentsData.data || dummyPayments);
        } else {
          setPayments(dummyPayments);
        }

        // Process invoices
        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json();
          setInvoices(invoicesData.data || dummyInvoices);
        } else {
          setInvoices(dummyInvoices);
        }

      } catch (err) {
        setError("Failed to load data. Showing sample payments.");
        setPayments(dummyPayments);
        setInvoices(dummyInvoices);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/resource/Payment%20Entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          party_type: "Customer",
          party: paymentData.party,
          paid_amount: parseFloat(paymentData.amount),
          payment_type: "Receive",
          mode_of_payment: paymentData.mode_of_payment,
          reference_date: paymentData.payment_date,
          references: [{
            reference_doctype: "Sales Invoice",
            reference_name: paymentData.invoice,
            allocated_amount: paymentData.amount
          }]
        }),
      });

      if (response.ok) {
        alert("Payment recorded successfully!");
        // Refresh payment list
        window.location.reload();
      } else {
        throw new Error("Failed to record payment");
      }
    } catch (err) {
      alert("Error recording payment: " + err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  return (
    <div className="payment-container">
      <div className="payment-form-section">
        <h2>Record New Payment</h2>
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label>Customer Name</label>
            <input
              value={paymentData.party}
              onChange={(e) => setPaymentData({...paymentData, party: e.target.value})}
              placeholder="Customer Name"
              required
            />
          </div>

          <div className="form-group">
            <label>Invoice Reference</label>
            <select
              value={paymentData.invoice}
              onChange={(e) => setPaymentData({...paymentData, invoice: e.target.value})}
              required
            >
              <option value="">Select Invoice</option>
              {invoices.map(inv => (
                <option key={inv.name} value={inv.name}>
                  {inv.name} - {inv.customer} ({formatCurrency(inv.outstanding_amount)})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                placeholder="Amount"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Payment Date</label>
              <input
                type="date"
                value={paymentData.payment_date}
                onChange={(e) => setPaymentData({...paymentData, payment_date: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select
              value={paymentData.mode_of_payment}
              onChange={(e) => setPaymentData({...paymentData, mode_of_payment: e.target.value})}
              required
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Check">Check</option>
              <option value="Online Payment">Online Payment</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">
            Record Payment
          </button>
        </form>
      </div>

      <div className="payment-history-section">
        <h2>Payment History</h2>
        {error && <div className="error-notice">{error}</div>}
        
        <div className="payment-cards">
          {(loading ? dummyPayments : payments).map(payment => (
            <div key={payment.name} className="payment-card">
              <div className="payment-card-header">
                <h3>{payment.name}</h3>
                <span className="payment-date">
                  {new Date(payment.posting_date).toLocaleDateString()}
                </span>
              </div>
              
              <div className="payment-card-body">
                <div className="payment-party">{payment.party}</div>
                
                <div className="payment-details">
                  <div>
                    <span className="detail-label">Amount:</span>
                    <span className="payment-amount">{formatCurrency(payment.paid_amount)}</span>
                  </div>
                  <div>
                    <span className="detail-label">Method:</span>
                    <span>{payment.mode_of_payment}</span>
                  </div>
                  {payment.reference_no && (
                    <div>
                      <span className="detail-label">Invoice:</span>
                      <span>{payment.reference_no}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PaymentRecording;