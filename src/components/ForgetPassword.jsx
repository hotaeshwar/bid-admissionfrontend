import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Request Reset, 2: Enter Token, 3: New Password
  const [formData, setFormData] = useState({
    username: '',
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState(''); // New state for reset token

  const API_BASE = 'https://admissionapi.buildingindiadigital.com'; // Update with your API URL

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const requestPasswordReset = async () => {
    if (!formData.username.trim()) {
      showMessage('error', 'Please enter your username');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/password-reset-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: formData.username.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetToken(data.reset_token); // Store the reset token
        setFormData(prev => ({
          ...prev,
          token: data.reset_token // Auto-fill the token field
        }));
        showMessage('success', 'Reset token generated successfully!');
        setStep(2);
      } else {
        showMessage('error', data.message || 'Failed to request password reset');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateToken = async () => {
    if (!formData.token.trim()) {
      showMessage('error', 'Please enter the reset token');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/password-reset/validate-token/${formData.token.trim()}`);
      const data = await response.json();

      if (data.success && data.data.valid) {
        showMessage('success', 'Token is valid! You can now set your new password.');
        setStep(3);
      } else {
        showMessage('error', data.message || 'Invalid or expired token');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    // Validation
    if (!formData.newPassword) {
      showMessage('error', 'Please enter a new password');
      return;
    }
    if (formData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: formData.token,
          new_password: formData.newPassword,
          confirm_password: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Password reset successfully! You can now log in with your new password.');
        // Reset form after successful password reset
        setTimeout(() => {
          setStep(1);
          setFormData({ username: '', token: '', newPassword: '', confirmPassword: '' });
          setResetToken(''); // Clear the stored token
        }, 3000);
      } else {
        showMessage('error', data.message || 'Failed to reset password');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep(step - 1);
    setMessage({ type: '', text: '' });
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showMessage('success', 'Token copied to clipboard!');
    } catch (err) {
      showMessage('error', 'Failed to copy token');
    }
  };

  const MessageAlert = ({ type, text }) => {
    if (!text) return null;
    
    const isError = type === 'error';
    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium mb-4 ${
        isError 
          ? 'bg-red-50 text-red-700 border border-red-200' 
          : 'bg-green-50 text-green-700 border border-green-200'
      }`}>
        {isError ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
        <span>{text}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-6 sm:py-8 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Enter Reset Token"}
            {step === 3 && "Set New Password"}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm px-2">
            {step === 1 && "Enter your username to receive a reset token"}
            {step === 2 && "Check your token and enter it below"}
            {step === 3 && "Create your new secure password"}
          </p>
        </div>

        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <MessageAlert type={message.type} text={message.text} />

          {step === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onKeyPress={(e) => handleKeyPress(e, requestPasswordReset)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </div>

              <button
                onClick={requestPasswordReset}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Sending Request...</span>
                    <span className="sm:hidden">Sending...</span>
                  </div>
                ) : (
                  'Send Reset Token'
                )}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 sm:space-y-6">
              {resetToken && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700 mb-2">Your Reset Token:</p>
                  <div className="flex items-center gap-2">
                    <code className="block p-2 bg-white rounded border border-blue-200 text-blue-600 font-mono text-sm break-all flex-1">
                      {resetToken}
                    </code>
                    <button
                      onClick={() => copyToClipboard(resetToken)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Please save this token. You'll need it to reset your password.
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                  Reset Token
                </label>
                <input
                  type="text"
                  id="token"
                  name="token"
                  value={formData.token}
                  onChange={handleInputChange}
                  onKeyPress={(e) => handleKeyPress(e, validateToken)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-xs sm:text-sm"
                  placeholder="Enter your reset token"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  The token expires in 1 hour
                </p>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
                <button
                  onClick={validateToken}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Validating...</span>
                      <span className="sm:hidden">Checking...</span>
                    </div>
                  ) : (
                    'Validate Token'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onKeyPress={(e) => handleKeyPress(e, resetPassword)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
                <button
                  onClick={resetPassword}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Resetting...</span>
                      <span className="sm:hidden">Updating...</span>
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-center mt-6 sm:mt-8">
            <div className="flex space-x-2">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    stepNum <= step ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;