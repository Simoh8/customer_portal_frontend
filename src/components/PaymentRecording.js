import React, { useState, useEffect } from "react";

function PaymentRecording() {
  const [paymentData, setPaymentData] = useState({
    party: "",
    amount: "",
    invoice: "",
    mode_of_payment: "Cash",
    payment_date: new Date().toISOString().split("T")[0],
    mobile_number: "",
    mpesa_code: ""
  });

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [paymentsRes, invoicesRes] = await Promise.all([
          fetch("/api/resource/Payment%20Entry?fields=[%22name%22,%22party%22,%22posting_date%22,%22paid_amount%22,%22mode_of_payment%22,%22reference_no%22,%22remarks%22]"),
          fetch("/api/resource/Sales%20Invoice?fields=[%22name%22,%22customer%22,%22outstanding_amount%22]&filters=[[%22outstanding_amount%22,%22%3E%22,0]]")
        ]);

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(paymentsData.data || []);
        }

        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json();
          setInvoices(invoicesData.data || []);
        }
      } catch (err) {
        setError("Failed to load data. Showing sample payments.");
        setPayments([]);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const confirmSTKPush = async (transactionId) => {
    let attempts = 0;
    while (attempts < 10) {
      const res = await fetch(`/api/method/ledgerctrl.ledgerctrl.api.login_api.get_stk_status?transaction_id=${transactionId}`);
      const data = await res.json();
      if (data.success) return data;
      await new Promise((resolve) => setTimeout(resolve, 3000));
      attempts++;
    }
    throw new Error("M-Pesa payment not confirmed in time");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentData.mode_of_payment === "Mobile Money") {
      try {
          const stkRes = await fetch("/api/method/ledgerctrl.ledgerctrl.api.login_api.stkpush", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: paymentData.mobile_number,
            amount: parseFloat(paymentData.amount),
            invoice: paymentData.invoice
          }),
        });

        if (!stkRes.ok) throw new Error("STK Push failed");

        const stkData = await stkRes.json();
        const confirmed = await confirmSTKPush(stkData.transaction_id);

        if (!confirmed.success) throw new Error("M-Pesa payment failed");

        const mpesa_code = confirmed.mpesa_code;

        const paymentRes = await fetch("/api/resource/Payment%20Entry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            party_type: "Customer",
            party: paymentData.party,
            paid_amount: parseFloat(paymentData.amount),
            payment_type: "Receive",
            mode_of_payment: "Mobile Money",
            reference_date: paymentData.payment_date,
            reference_invoice: paymentData.name,
            reference_no: mpesa_code,
            remarks: `Paid via M-Pesa by ${paymentData.mobile_number}`,
            references: [{
              reference_doctype: "Sales Invoice",
              reference_name: paymentData.invoice,
              allocated_amount: paymentData.amount
            }]
          }),
        });

        if (paymentRes.ok) {
          alert("Payment recorded successfully!");
          window.location.reload();
        } else {
          throw new Error("Failed to record payment");
        }

      } catch (err) {
        alert("Mobile payment failed: " + err.message);
      }

      return;
    }

    // Non-M-Pesa
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
          reference_invoice: paymentData.name,
          references: [{
            reference_doctype: "Sales Invoice",
            reference_name: paymentData.invoice,
            allocated_amount: paymentData.amount
          }]
        }),
      });

      if (response.ok) {
        alert("Payment recorded successfully!");
        window.location.reload();
      } else {
        throw new Error("Failed to record payment");
      }
    } catch (err) {
      alert("Error recording payment: " + err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
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
              onChange={(e) => setPaymentData({ ...paymentData, party: e.target.value })}
              placeholder="Customer Name"
              required
            />
          </div>

          <div className="form-group">
            <label>Invoice Reference</label>
            <select
              value={paymentData.invoice}
              onChange={(e) => setPaymentData({ ...paymentData, invoice: e.target.value })}
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
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
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
                onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select
              value={paymentData.mode_of_payment}
              onChange={(e) => setPaymentData({ ...paymentData, mode_of_payment: e.target.value })}
              required
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Check">Check</option>
              <option value="Online Payment">Online Payment</option>
              <option value="Mobile Money">Mobile Money</option>
            </select>
          </div>

          {paymentData.mode_of_payment === "Mobile Money" && (
            <>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 254712345678"
                  value={paymentData.mobile_number}
                  onChange={(e) => setPaymentData({ ...paymentData, mobile_number: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>M-Pesa Transaction Code</label>
                <input
                  type="text"
                  placeholder="Will be auto-filled"
                  value={paymentData.mpesa_code}
                  readOnly
                />
              </div>
            </>
          )}

          <button type="submit" className="submit-btn">
            Record Payment
          </button>
        </form>
      </div>

      <div className="payment-history-section">
        <h2>Payment History</h2>
        {error && <div className="error-notice">{error}</div>}

        <div className="payment-cards">
          {(loading ? [] : payments).map(payment => (
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
                      <span className="detail-label">Transaction Code:</span>
                      <span>{payment.reference_no}</span>
                    </div>
                  )}
                  {payment.remarks && (
                    <div>
                      <span className="detail-label">Remarks:</span>
                      <span>{payment.remarks}</span>
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
