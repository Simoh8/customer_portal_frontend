import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CustomerRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_type: "Individual",
    email: "",
    phone: "",
    tax_id: "",
    website: "",
    territory: "",
    default_currency: "USD",
    default_price_list: "Standard Selling",
    customer_group: "Commercial",
    tax_category: "",
    payment_terms: "Net 30",
    credit_limit: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customer_name.trim()) newErrors.customer_name = "Customer name is required";
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (formData.phone && !/^[\d\s+-]+$/.test(formData.phone)) newErrors.phone = "Invalid phone number";
    if (formData.credit_limit && isNaN(formData.credit_limit)) newErrors.credit_limit = "Must be a number";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/resource/Customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Registration failed");
      
      alert("Customer registered successfully!");
      navigate("/"); // Redirect to home after successful registration
    } catch (error) {
      console.error("Registration error:", error);
      alert("Failed to register customer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registration-container">
      <h2>Customer Registration</h2>
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label>Customer Name*</label>
            <input
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              placeholder="Full name or company name"
              required
            />
            {errors.customer_name && <span className="error">{errors.customer_name}</span>}
          </div>

          <div className="form-group">
            <label>Customer Type</label>
            <select
              name="customer_type"
              value={formData.customer_type}
              onChange={handleChange}
            >
              <option value="Individual">Individual</option>
              <option value="Company">Company</option>
            </select>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="customer@example.com"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (123) 456-7890"
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>
        </div>

        <div className="form-section">
          <h3>Business Information</h3>
          <div className="form-group">
            <label>Tax ID</label>
            <input
              name="tax_id"
              value={formData.tax_id}
              onChange={handleChange}
              placeholder="Tax identification number"
            />
          </div>

          <div className="form-group">
            <label>Website</label>
            <input
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label>Territory</label>
            <select
              name="territory"
              value={formData.territory}
              onChange={handleChange}
            >
              <option value="">Select Territory</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="India">India</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Financial Information</h3>
          <div className="form-group">
            <label>Default Currency</label>
            <select
              name="default_currency"
              value={formData.default_currency}
              onChange={handleChange}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Default Price List</label>
            <select
              name="default_price_list"
              value={formData.default_price_list}
              onChange={handleChange}
            >
              <option value="Standard Selling">Standard Selling</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Retail">Retail</option>
            </select>
          </div>

          <div className="form-group">
            <label>Customer Group</label>
            <select
              name="customer_group"
              value={formData.customer_group}
              onChange={handleChange}
            >
              <option value="Commercial">Commercial</option>
              <option value="Government">Government</option>
              <option value="Non-Profit">Non-Profit</option>
              <option value="Individual">Individual</option>
            </select>
          </div>

          <div className="form-group">
            <label>Credit Limit</label>
            <input
              type="number"
              name="credit_limit"
              value={formData.credit_limit}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
            />
            {errors.credit_limit && <span className="error">{errors.credit_limit}</span>}
          </div>

          <div className="form-group">
            <label>Payment Terms</label>
            <select
              name="payment_terms"
              value={formData.payment_terms}
              onChange={handleChange}
            >
              <option value="Net 30">Net 30</option>
              <option value="Net 15">Net 15</option>
              <option value="Net 60">Net 60</option>
              <option value="Due on Receipt">Due on Receipt</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information..."
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/")} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? "Registering..." : "Register Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CustomerRegistration;