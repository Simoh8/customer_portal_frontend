import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate
} from "react-router-dom";

import CustomerRegistration from "./components/CustomerRegistration";
import InvoiceRecording from "./components/InvoiceRecording";
import PaymentRecording from "./components/PaymentRecording";
import CustomerSupport from "./components/CustomerSupport";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

import "./App.css";

// ✅ Authentication Check
const isAuthenticated = () => {
  return localStorage.getItem("isAuthenticated") === "true";
};

// ✅ Route Guard
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// ✅ Landing Page Component
function LandingPage() {
  return (
    <div className="landing">
      <div className="hero-section">
        <h1>Streamline Your Business Operations</h1>
        <p className="subtitle">
          ERPNext Customer Portal - Your one-stop solution for customer management
        </p>
        <div className="cta-buttons">
          {isAuthenticated() ? (
            <Link to="/dashboard" className="cta-button primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/register" className="cta-button primary">Get Started</Link>
              <Link to="/login" className="cta-button secondary">Login</Link>
            </>
          )}
          <Link to="/support" className="cta-button secondary">Contact Support</Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <Feature icon="📝" title="Customer Registration" text="Quickly register new customers with our intuitive form." />
          <Feature icon="📄" title="Invoice Management" text="Create, track, and manage invoices effortlessly." />
          <Feature icon="💰" title="Payment Processing" text="Record payments and track financial transactions." />
          <Feature icon="📬" title="Customer Support" text="Get help whenever you need it with our support system." />
        </div>
      </div>

      <div className="testimonial-section">
        <h2>What Our Customers Say</h2>
        <div className="testimonial">
          <p>"The ERPNext portal has transformed how we manage customer relationships. Highly recommended!"</p>
          <p className="author">- Sarah Johnson, ABC Corp</p>
        </div>
      </div>
    </div>
  );
}

// ✅ Reusable Feature Card
function Feature({ icon, title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

// ✅ Navigation Bar Component
function Navbar() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">Customer Portal</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          {isAuthenticated() ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/invoice">Invoice</Link>
              <Link to="/payment">Payment</Link>
              <Link to="/support">Support</Link>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </>
          ) : (
            <>
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ✅ Main App Component
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <main className="App-main">
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<CustomerRegistration />} />

            {/* Protected Pages */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/invoice" element={
              <ProtectedRoute>
                <InvoiceRecording />
              </ProtectedRoute>
            } />
            <Route path="/payment" element={
              <ProtectedRoute>
                <PaymentRecording />
              </ProtectedRoute>
            } />
            <Route path="/support" element={
              <ProtectedRoute>
                <CustomerSupport />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="App-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Quick Links</h4>
              <Link to="/">Home</Link>
              <Link to="/register">Registration</Link>
              {isAuthenticated() && <Link to="/invoice">Invoices</Link>}
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <Link to="/support">Contact Us</Link>
              <Link to="/support">FAQs</Link>
              <Link to="/support">Documentation</Link>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <Link to="/support">Terms of Service</Link>
              <Link to="/support">Privacy Policy</Link>
            </div>
          </div>
          <div className="copyright">
            <p>© {new Date().getFullYear()} ERPNext Customer Portal. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
