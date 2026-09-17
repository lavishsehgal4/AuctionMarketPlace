import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/authApi';
import './LoginPage.css';

// ============================================
// Login Page
// ============================================
// User login with email and password
// Connects to backend auth API
// ============================================

function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error on input change
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate inputs
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setIsLoading(false);
        return;
      }

      // Call login API
      const result = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      // Success - call parent callback
      onLoginSuccess(result.user);

      // Redirect to home
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Sign in to your account</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Register Link */}
          <div className="auth-link">
            <p>
              Don't have an account?{' '}
              <Link to="/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
