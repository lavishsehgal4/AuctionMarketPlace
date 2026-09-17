import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/authApi';
import './RegisterPage.css';

// ============================================
// Register Page
// ============================================
// User registration with email, password, name
// Validates password strength client-side
// Connects to backend auth API
// ============================================

function RegisterPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    display_name: '',
    account_type: 'BIDDER', // Default to BIDDER
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain an uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain a lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain a number';
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      newErrors.password = 'Password must contain a special character (!@#$%^&*)';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Full name validation
    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    // Display name validation
    if (!formData.display_name) {
      newErrors.display_name = 'Display name is required';
    } else if (formData.display_name.length < 2) {
      newErrors.display_name = 'Display name must be at least 2 characters';
    }

    // Account type validation
    if (!formData.account_type) {
      newErrors.account_type = 'Please select an account type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call register API
      const result = await registerUser({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        display_name: formData.display_name,
        account_type: formData.account_type,
      });

      // Success - call parent callback
      onLoginSuccess(result.user);

      // Redirect to home
      navigate('/');
    } catch (err) {
      // Check for specific error responses
      if (err.data?.errors) {
        // Server validation errors
        setErrors({ general: err.data.errors.join(', ') });
      } else if (err.message?.includes('already registered')) {
        setErrors({ email: 'Email already registered' });
      } else {
        setErrors({ general: err.message || 'Registration failed. Please try again.' });
      }
      console.error('Register error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <h1 className="register-title">Register</h1>
          <p className="register-subtitle">Create your account</p>

          {errors.general && <div className="error-message">{errors.general}</div>}

          <form onSubmit={handleSubmit} className="register-form">
            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            {/* Full Name Input */}
            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="John Doe"
                disabled={isLoading}
              />
              {errors.full_name && <span className="field-error">{errors.full_name}</span>}
            </div>

            {/* Display Name Input */}
            <div className="form-group">
              <label htmlFor="display_name">Display Name</label>
              <input
                type="text"
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                placeholder="John"
                disabled={isLoading}
              />
              {errors.display_name && <span className="field-error">{errors.display_name}</span>}
            </div>

            {/* Account Type Selection */}
            <div className="form-group">
              <label>Account Type</label>
              <div className="account-type-options">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="account_type_bidder"
                    name="account_type"
                    value="BIDDER"
                    checked={formData.account_type === 'BIDDER'}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <label htmlFor="account_type_bidder" className="radio-label">
                    Bidder - I want to bid on items
                  </label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="account_type_seller"
                    name="account_type"
                    value="SELLER"
                    checked={formData.account_type === 'SELLER'}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <label htmlFor="account_type_seller" className="radio-label">
                    Seller - I want to sell items
                  </label>
                </div>
              </div>
              {errors.account_type && <span className="field-error">{errors.account_type}</span>}
            </div>

            {/* Password Input with Show/Hide Toggle */}
            <div className="form-group">
              <div className="password-label-container">
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={toggleShowPassword}
                  disabled={isLoading}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️ Hide' : '👁️ Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {/* Confirm Password Input with Show/Hide Toggle */}
            <div className="form-group">
              <div className="password-label-container">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={toggleShowConfirmPassword}
                  disabled={isLoading}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? '👁️ Hide' : '👁️ Show'}
                </button>
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="register-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          {/* Login Link */}
          <div className="auth-link">
            <p>
              Already have an account?{' '}
              <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
