import React, { useState, useEffect } from "react";

function CustomerSupport() {
  // Form state
  const [ticketData, setTicketData] = useState({
    subject: "",
    description: "",
    priority: "Medium",
    issue_type: "Technical"
  });

  // Ticket history state
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dummy data for fallback
  const dummyTickets = [
    {
      name: "ISS-2023-001",
      subject: "Login issues",
      description: "Unable to login to my account",
      status: "Open",
      priority: "High",
      creation: "2023-06-01 14:30:00",
      issue_type: "Technical"
    },
    {
      name: "ISS-2023-002",
      subject: "Invoice discrepancy",
      description: "Invoice amount doesn't match purchase order",
      status: "Resolved",
      priority: "Medium",
      creation: "2023-05-28 09:15:00",
      issue_type: "Billing"
    }
  ];

  // Fetch ticket history
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/resource/Issue?fields=[%22name%22,%22subject%22,%22description%22,%22status%22,%22priority%22,%22creation%22,%22issue_type%22]&filters=[[%22raised_by%22,%22=%22,%22user@example.com%22]]");
        
        if (response.ok) {
          const data = await response.json();
          setTickets(data.data || dummyTickets);
        } else {
          setTickets(dummyTickets);
          throw new Error("Failed to load tickets");
        }
      } catch (err) {
        setError("Couldn't connect to server. Showing sample tickets.");
        setTickets(dummyTickets);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/resource/Issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: ticketData.subject,
          description: ticketData.description,
          priority: ticketData.priority,
          issue_type: ticketData.issue_type,
          raised_by: "user@example.com" // This should be dynamic in a real app
        }),
      });

      if (response.ok) {
        alert("Support ticket created successfully!");
        // Refresh ticket list
        window.location.reload();
      } else {
        throw new Error("Failed to create ticket");
      }
    } catch (err) {
      alert("Error creating ticket: " + err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="support-container">
      <div className="new-ticket-section">
        <h2>Create Support Ticket</h2>
        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-group">
            <label>Subject</label>
            <input
              value={ticketData.subject}
              onChange={(e) => setTicketData({...ticketData, subject: e.target.value})}
              placeholder="Briefly describe your issue"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={ticketData.description}
              onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
              placeholder="Please provide detailed information about your issue"
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select
                value={ticketData.priority}
                onChange={(e) => setTicketData({...ticketData, priority: e.target.value})}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Issue Type</label>
              <select
                value={ticketData.issue_type}
                onChange={(e) => setTicketData({...ticketData, issue_type: e.target.value})}
                required
              >
                <option value="Technical">Technical</option>
                <option value="Billing">Billing</option>
                <option value="Sales">Sales</option>
                <option value="General">General Inquiry</option>
              </select>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Submit Ticket
          </button>
        </form>
      </div>

      <div className="ticket-history-section">
        <h2>Your Support Tickets</h2>
        {error && <div className="error-notice">{error}</div>}
        
        <div className="ticket-list">
          {(loading ? dummyTickets : tickets).map(ticket => (
            <div key={ticket.name} className={`ticket-card ${ticket.status.toLowerCase()}`}>
              <div className="ticket-header">
                <div>
                  <h3>{ticket.name}</h3>
                  <span className="ticket-date">{formatDate(ticket.creation)}</span>
                </div>
                <span className={`status-badge ${ticket.status.toLowerCase()}`}>
                  {ticket.status}
                </span>
              </div>
              
              <div className="ticket-body">
                <h4>{ticket.subject}</h4>
                <p className="ticket-description">{ticket.description}</p>
                
                <div className="ticket-meta">
                  <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
                    {ticket.priority} Priority
                  </span>
                  <span className="type-badge">{ticket.issue_type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CustomerSupport;