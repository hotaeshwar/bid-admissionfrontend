import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield,
  Trash2,
  Menu,
  X,
  RefreshCw,
  AlertCircle,
  LogOut,
  UserCheck,
  GraduationCap,
  Phone,
  MapPin,
  Calendar,
  Eye,
  FileText,
  BookOpen,
  Plus,
  Edit,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Download
} from 'lucide-react';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('users'); // 'users' or 'questions' or 'test-results'
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');
  const [adminInfo, setAdminInfo] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [filters, setFilters] = useState({
    userRole: 'all',
    stateId: '',
    cityId: ''
  });

  // Test Question Management State
  const [questions, setQuestions] = useState([]);
  const [questionFilters, setQuestionFilters] = useState({
    subject: 'all'
  });
  const [subjects] = useState(['Mathematics', 'Science', 'English', 'Reasoning', 'Aptitude', 'Psychology']);

  // Test Results State
  const [testResults, setTestResults] = useState([]);
  const [testResultFilters, setTestResultFilters] = useState({
    status: 'all'
  });

  // API Configuration
  const API_BASE = 'http://127.0.0.1:8000';
  
  // Fixed: Get token from correct localStorage key
  const getAuthToken = () => {
    return localStorage.getItem('access_token') || localStorage.getItem('admin_token');
  };

  // PDF Generation Functions
  const generateUsersPDF = () => {
    setLoading(prev => ({ ...prev, downloadingPDF: true }));
    
    try {
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      
      // Generate HTML for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Users Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .header h1 { 
              color: #333; 
              margin: 0;
            }
            .header p { 
              color: #666; 
              margin: 5px 0 0 0;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
              vertical-align: top;
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold;
            }
            .role-teacher { 
              background-color: #d4edda; 
              color: #155724;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
            }
            .role-student { 
              background-color: #e2e3ff; 
              color: #383d9d;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            .summary {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .summary-item {
              display: inline-block;
              margin-right: 20px;
              font-weight: bold;
            }
            @media print {
              body { margin: 0; }
              .header { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Users Management Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Administrator: ${adminInfo?.username || 'Admin'}</p>
          </div>
          
          <div class="summary">
            <div class="summary-item">Total Users: ${users.length}</div>
            <div class="summary-item">Teachers: ${users.filter(u => u.role === 'teacher').length}</div>
            <div class="summary-item">Students: ${users.filter(u => u.role === 'student').length}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Age</th>
                <th>State</th>
                <th>City</th>
                <th>Mobile</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(user => `
                <tr>
                  <td>${user.id}</td>
                  <td>${user.username || 'N/A'}</td>
                  <td>${user.email || 'N/A'}</td>
                  <td><span class="role-${user.role}">${user.role || 'Unknown'}</span></td>
                  <td>${user.age || 'N/A'}</td>
                  <td>${user.location?.state || 'N/A'}</td>
                  <td>${user.location?.city || 'N/A'}</td>
                  <td>${user.mobile_number || 'N/A'}</td>
                  <td>${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This report contains ${users.length} user records. Report generated from Admin Dashboard.</p>
            <p>For questions regarding this report, please contact the system administrator.</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, downloadingPDF: false }));
    }
  };

  const generateUserDetailsPDF = (user) => {
    setLoading(prev => ({ ...prev, downloadingUserPDF: true }));
    
    try {
      const printWindow = window.open('', '_blank');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>User Details - ${user.user?.username}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 14px;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            .header h1 { 
              color: #333; 
              margin: 0;
            }
            .section {
              margin-bottom: 25px;
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
            }
            .section h3 {
              color: #333;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
              margin-top: 0;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-top: 10px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              color: #555;
              margin-bottom: 2px;
            }
            .info-value {
              color: #333;
            }
            .role-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            }
            .role-teacher {
              background-color: #d4edda;
              color: #155724;
            }
            .role-student {
              background-color: #e2e3ff;
              color: #383d9d;
            }
            .document-item {
              background-color: white;
              border: 1px solid #ddd;
              padding: 10px;
              margin-bottom: 10px;
              border-radius: 3px;
            }
            .status-verified {
              color: #155724;
              background-color: #d4edda;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 12px;
            }
            .status-unverified {
              color: #721c24;
              background-color: #f8d7da;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 12px;
            }
            .extracted-text {
              background-color: #f8f9fa;
              padding: 8px;
              border-radius: 3px;
              font-size: 12px;
              max-height: 100px;
              overflow-y: auto;
              border: 1px solid #e9ecef;
            }
            @media print {
              body { margin: 0; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>User Details Report</h1>
            <p>User: ${user.user?.username || 'Unknown'}</p>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <div class="section">
            <h3>Basic Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Username:</div>
                <div class="info-value">${user.user?.username || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email:</div>
                <div class="info-value">${user.user?.email || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Role:</div>
                <div class="info-value">
                  <span class="role-badge role-${user.user?.role}">${user.user?.role || 'Unknown'}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Age:</div>
                <div class="info-value">${user.user?.age || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Birthdate:</div>
                <div class="info-value">${user.user?.birthdate ? new Date(user.user.birthdate).toLocaleDateString() : 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">State:</div>
                <div class="info-value">${user.user?.state || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Mobile:</div>
                <div class="info-value">${user.user?.mobile_number || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Joined:</div>
                <div class="info-value">${user.user?.created_at ? new Date(user.user.created_at).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
          </div>

          ${user.documents && user.documents.length > 0 ? `
            <div class="section">
              <h3>Documents (${user.documents.length})</h3>
              ${user.documents.map((doc, index) => `
                <div class="document-item">
                  <div class="info-grid">
                    <div class="info-item">
                      <div class="info-label">Filename:</div>
                      <div class="info-value">${doc.filename || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Status:</div>
                      <div class="info-value">
                        <span class="status-${doc.verification_status === 'verified' ? 'verified' : 'unverified'}">
                          ${doc.verification_status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Extracted Age:</div>
                      <div class="info-value">${doc.age || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Extracted Birthdate:</div>
                      <div class="info-value">${doc.birthdate ? new Date(doc.birthdate).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>
                  ${doc.extracted_text ? `
                    <div style="margin-top: 10px;">
                      <div class="info-label">Extracted Text:</div>
                      <div class="extracted-text">${doc.extracted_text}</div>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
      
    } catch (error) {
      console.error('Error generating user PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, downloadingUserPDF: false }));
    }
  };

  const generateTestResultsPDF = () => {
    setLoading(prev => ({ ...prev, downloadingTestPDF: true }));
    
    try {
      const printWindow = window.open('', '_blank');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Results Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
              vertical-align: top;
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold;
            }
            .status-approved { 
              background-color: #d4edda; 
              color: #155724;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
            }
            .status-rejected { 
              background-color: #f8d7da; 
              color: #721c24;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
            }
            .status-pending { 
              background-color: #fff3cd; 
              color: #856404;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
            }
            .summary {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Test Results Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <div class="summary">
            <div><strong>Total Results:</strong> ${testResults.length}</div>
            <div><strong>Pending Reviews:</strong> ${testResults.filter(r => r.admin_review?.approval_status === 'pending').length}</div>
            <div><strong>Approved:</strong> ${testResults.filter(r => r.admin_review?.approval_status === 'approved').length}</div>
            <div><strong>Rejected:</strong> ${testResults.filter(r => r.admin_review?.approval_status === 'rejected').length}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Score</th>
                <th>Correct/Total</th>
                <th>Prediction</th>
                <th>Test Date</th>
                <th>Status</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              ${testResults.map(result => `
                <tr>
                  <td>${result.student?.username || 'N/A'}</td>
                  <td>${result.student?.email || 'N/A'}</td>
                  <td>${result.test_details?.score_percentage?.toFixed(1) || 'N/A'}%</td>
                  <td>${result.test_details?.correct_answers || 0}/${result.test_details?.total_questions || 0}</td>
                  <td>${result.test_details?.result_prediction?.replace('_', ' ') || 'N/A'}</td>
                  <td>${result.test_details?.start_time ? new Date(result.test_details.start_time).toLocaleDateString() : 'N/A'}</td>
                  <td><span class="status-${result.admin_review?.approval_status || 'pending'}">${result.admin_review?.approval_status || 'pending'}</span></td>
                  <td>${result.admin_review?.comments || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
      
    } catch (error) {
      console.error('Error generating test results PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, downloadingTestPDF: false }));
    }
  };

  const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();
    
    // Check if token exists before making request
    if (!token) {
      throw new Error('No authentication token found');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      // Handle 401/403 specifically for auth issues
      if (response.status === 401 || response.status === 403) {
        // Token might be expired or invalid
        localStorage.removeItem('access_token');
        localStorage.removeItem('admin_token');
        throw new Error('Authentication failed. Please login again.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      
      // If it's an auth error, redirect to login
      if (error.message.includes('Authentication failed') || error.message.includes('No authentication token')) {
        handleAuthError();
      }
      
      throw error;
    }
  };

  // Handle authentication errors
  const handleAuthError = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin_token');
    alert('Your session has expired. Please login again.');
    window.location.href = '/login';
  };

  // Get admin info from token or local storage
  const getAdminInfo = () => {
    const token = getAuthToken();
    if (token) {
      try {
        // Decode JWT token to get admin info
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        
        // Check if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          throw new Error('Token expired');
        }
        
        return payload;
      } catch (e) {
        console.error('Error decoding token:', e);
        handleAuthError();
        return null;
      }
    }
    return null;
  };

  // Fetch states for filter dropdown
  const fetchStates = async () => {
    try {
      const response = await apiRequest('/states');
      if (response.success && response.data) {
        setStates(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  };

  // Fetch cities for selected state
  const fetchCities = async (stateId) => {
    if (!stateId) {
      setCities([]);
      return;
    }
    
    try {
      const response = await apiRequest(`/states/${stateId}/cities`);
      if (response.success && response.data) {
        setCities(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      setCities([]);
    }
  };

  // Fetch current admin profile
  const fetchAdminProfile = async () => {
    try {
      const response = await apiRequest('/user/profile');
      if (response.success) {
        setAdminInfo(response.data.user);
      } else if (response.data?.user) {
        setAdminInfo(response.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch admin profile:', error);
      
      // Use decoded token info as fallback only if it's not an auth error
      if (!error.message.includes('Authentication failed')) {
        const tokenInfo = getAdminInfo();
        if (tokenInfo) {
          setAdminInfo({
            id: tokenInfo.sub,
            username: tokenInfo.username || 'Admin',
            role: tokenInfo.role
          });
        }
      }
      
      setError('Failed to load admin profile');
    }
  };

  // Fetch users with enhanced filtering
  const fetchUsers = async (role = '', stateId = '', cityId = '') => {
    setLoading(prev => ({ ...prev, users: true }));
    setError(''); // Clear previous errors
    
    try {
      let endpoint = '/admin/users';
      const params = new URLSearchParams();
      
      if (role && role !== 'all') {
        params.append('role', role);
      }
      if (stateId) {
        params.append('state_id', stateId);
      }
      if (cityId) {
        params.append('city_id', cityId);
      }
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      
      const response = await apiRequest(endpoint);
      
      if (response.success && response.data?.users) {
        setUsers(response.data.users);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (Array.isArray(response)) {
        setUsers(response);
      } else {
        setUsers([]);
      }
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Users fetch error:', error);
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  // Fetch individual user details
  const fetchUserDetails = async (userId) => {
    setLoading(prev => ({ ...prev, userDetails: true }));
    try {
      const response = await apiRequest(`/admin/users/${userId}`);
      if (response.success && response.data) {
        setSelectedUser(response.data);
        setShowUserDetails(true);
      }
    } catch (error) {
      setError('Failed to fetch user details');
      console.error('User details fetch error:', error);
    } finally {
      setLoading(prev => ({ ...prev, userDetails: false }));
    }
  };

  // Remove user function
  const removeUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to remove user "${username}"?`)) {
      return;
    }

    setLoading(prev => ({ ...prev, [`remove_${userId}`]: true }));
    try {
      // Try to call the delete endpoint
      await apiRequest(`/admin/users/${userId}`, {
        method: 'DELETE'
      });
      
      // Remove from local state on success
      setUsers(prev => prev.filter(user => user.id !== userId));
      alert(`User "${username}" has been removed successfully.`);
      
    } catch (error) {
      setError(`Failed to remove user: ${username}`);
      console.error('Remove user error:', error);
      
      // If endpoint doesn't exist, show appropriate message
      if (error.message.includes('404')) {
        alert(`Remove user functionality needs to be implemented in the backend for user: ${username}`);
      }
    } finally {
      setLoading(prev => ({ ...prev, [`remove_${userId}`]: false }));
    }
  };

  // NEW: Fetch test questions
  const fetchQuestions = async (subject = '') => {
    setLoading(prev => ({ ...prev, questions: true }));
    setError('');
    
    try {
      let endpoint = '/admin/questions';
      if (subject && subject !== 'all') {
        endpoint += `?subject=${encodeURIComponent(subject)}`;
      }
      
      const response = await apiRequest(endpoint);
      
      if (response.success && response.data) {
        if (response.data.all_questions) {
          setQuestions(response.data.all_questions);
        } else if (Array.isArray(response.data)) {
          setQuestions(response.data);
        } else {
          setQuestions([]);
        }
      }
    } catch (error) {
      setError('Failed to fetch test questions');
      console.error('Questions fetch error:', error);
      setQuestions([]);
    } finally {
      setLoading(prev => ({ ...prev, questions: false }));
    }
  };

  // NEW: Fetch test results
  const fetchTestResults = async (status = '') => {
    setLoading(prev => ({ ...prev, testResults: true }));
    setError('');
    
    try {
      let endpoint = '/admin/test-results';
      if (status && status !== 'all') {
        endpoint += `?status=${status}`;
      }
      
      const response = await apiRequest(endpoint);
      
      if (response.success && response.data?.test_results) {
        setTestResults(response.data.test_results);
      } else if (Array.isArray(response.data)) {
        setTestResults(response.data);
      } else {
        setTestResults([]);
      }
    } catch (error) {
      setError('Failed to fetch test results');
      console.error('Test results fetch error:', error);
      setTestResults([]);
    } finally {
      setLoading(prev => ({ ...prev, testResults: false }));
    }
  };

  // NEW: Approve/Reject test result
  const updateTestResult = async (attemptId, status, comments = '') => {
    setLoading(prev => ({ ...prev, [`test_${attemptId}`]: true }));
    
    try {
      await apiRequest(`/admin/test-results/${attemptId}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          result_status: status,
          comments: comments
        })
      });
      
      // Update local state
      setTestResults(prev => prev.map(result => 
        result.attempt_id === attemptId 
          ? {
              ...result,
              admin_review: {
                ...result.admin_review,
                approval_status: status,
                comments: comments,
                approved_at: new Date().toISOString()
              }
            }
          : result
      ));
      
      alert(`Test result ${status} successfully`);
    } catch (error) {
      setError(`Failed to ${status} test result`);
      console.error('Test result update error:', error);
    } finally {
      setLoading(prev => ({ ...prev, [`test_${attemptId}`]: false }));
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  // Check authentication on component mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      alert('No authentication token found. Please login.');
      window.location.href = '/login';
      return;
    }

    // Verify token is not expired
    const tokenInfo = getAdminInfo();
    if (!tokenInfo) {
      return; // getAdminInfo already handles auth error
    }

    // Fetch data
    fetchAdminProfile();
    fetchStates();
    
    // Load data based on active section
    if (activeSection === 'users') {
      fetchUsers();
    } else if (activeSection === 'questions') {
      fetchQuestions();
    } else if (activeSection === 'test-results') {
      fetchTestResults();
    }
  }, [activeSection]);

  // Handle state filter change
  useEffect(() => {
    if (filters.stateId) {
      fetchCities(filters.stateId);
      setFilters(prev => ({ ...prev, cityId: '' })); // Reset city when state changes
    } else {
      setCities([]);
    }
  }, [filters.stateId]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    // Apply filters
    fetchUsers(
      newFilters.userRole === 'all' ? '' : newFilters.userRole,
      newFilters.stateId,
      newFilters.cityId
    );
  };

  // Handle question filter changes
  const handleQuestionFilterChange = (filterType, value) => {
    const newFilters = { ...questionFilters, [filterType]: value };
    setQuestionFilters(newFilters);
    fetchQuestions(newFilters.subject === 'all' ? '' : newFilters.subject);
  };

  // Handle test result filter changes
  const handleTestResultFilterChange = (filterType, value) => {
    const newFilters = { ...testResultFilters, [filterType]: value };
    setTestResultFilters(newFilters);
    fetchTestResults(newFilters.status === 'all' ? '' : newFilters.status);
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
    </div>
  );

  const ErrorAlert = ({ message, onClose }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto pl-3"
        >
          <X className="h-5 w-5 text-red-400 hover:text-red-600" />
        </button>
      </div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  // User Details Modal
  const UserDetailsModal = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => generateUserDetailsPDF(user)}
                  disabled={loading.downloadingUserPDF}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                  title="Download PDF"
                >
                  {loading.downloadingUserPDF ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Download className="h-4 w-4 mr-1" />
                  )}
                  PDF
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Username</label>
                  <p className="text-gray-900">{user.user?.username || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{user.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.user?.role === 'teacher' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {user.user?.role || 'Unknown'}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Age</label>
                  <p className="text-gray-900">{user.user?.age || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Birthdate</label>
                  <p className="text-gray-900">
                    {user.user?.birthdate ? new Date(user.user.birthdate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">State</label>
                  <p className="text-gray-900">{user.user?.state || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Joined</label>
                  <p className="text-gray-900">
                    {user.user?.created_at ? new Date(user.user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents */}
            {user.documents && user.documents.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Documents</h4>
                <div className="space-y-3">
                  {user.documents.map((doc, index) => (
                    <div key={doc.id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Filename</label>
                          <p className="text-gray-900">{doc.filename || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            doc.verification_status === 'verified' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {doc.verification_status || 'Unknown'}
                          </span>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Extracted Age</label>
                          <p className="text-gray-900">{doc.age || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Extracted Birthdate</label>
                          <p className="text-gray-900">
                            {doc.birthdate ? new Date(doc.birthdate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-500">Extracted Text</label>
                          <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded mt-1 max-h-32 overflow-y-auto">
                            {doc.extracted_text || 'No text extracted'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // NEW: Navigation Tabs
  const NavigationTabs = () => (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveSection('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSection === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            User Management
          </button>
          <button
            onClick={() => setActiveSection('questions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSection === 'questions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BookOpen className="h-4 w-4 inline mr-2" />
            Test Questions
          </button>
          <button
            onClick={() => setActiveSection('test-results')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSection === 'test-results'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Target className="h-4 w-4 inline mr-2" />
            Test Results
          </button>
        </nav>
      </div>
    </div>
  );

  const teachersCount = users.filter(user => user.role === 'teacher').length;
  const studentsCount = users.filter(user => user.role === 'student').length;
  const totalQuestions = questions.length;
  const pendingResults = testResults.filter(result => result.admin_review?.approval_status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Title */}
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Shield className="h-8 w-8 text-blue-600 ml-2" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>

            {/* Right side - Admin info and logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {adminInfo?.username?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {adminInfo?.username || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <NavigationTabs />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-blue-900">
              Welcome, {adminInfo?.username || 'Admin'}!
            </h2>
            <p className="text-blue-700 mt-1">
              {activeSection === 'users' && 'Manage teachers and students from this dashboard.'}
              {activeSection === 'questions' && 'View and manage test questions across all subjects.'}
              {activeSection === 'test-results' && 'Review and approve student test results.'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard 
              title="Total Users" 
              value={users.length} 
              icon={Users} 
              color="blue" 
            />
            <StatCard 
              title="Teachers" 
              value={teachersCount} 
              icon={UserCheck} 
              color="green" 
            />
            <StatCard 
              title="Students" 
              value={studentsCount} 
              icon={GraduationCap} 
              color="purple" 
            />
            <StatCard 
              title={activeSection === 'questions' ? 'Total Questions' : 'Pending Reviews'} 
              value={activeSection === 'questions' ? totalQuestions : pendingResults} 
              icon={activeSection === 'questions' ? BookOpen : Clock} 
              color={activeSection === 'questions' ? 'indigo' : 'orange'} 
            />
          </div>

          {/* Conditional Content Based on Active Section */}
          {activeSection === 'users' && (
            <>
              {/* User Management Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-900">User Management</h3>
                      <button
                        onClick={generateUsersPDF}
                        disabled={loading.downloadingPDF}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        title="Download All Users PDF"
                      >
                        {loading.downloadingPDF ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Download PDF
                      </button>
                    </div>
                    
                    {/* Enhanced Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <select
                        value={filters.userRole}
                        onChange={(e) => handleFilterChange('userRole', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Roles</option>
                        <option value="teacher">Teachers Only</option>
                        <option value="student">Students Only</option>
                      </select>

                      <select
                        value={filters.stateId}
                        onChange={(e) => handleFilterChange('stateId', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All States</option>
                        {states.map(state => (
                          <option key={state.id} value={state.id}>{state.name}</option>
                        ))}
                      </select>

                      <select
                        value={filters.cityId}
                        onChange={(e) => handleFilterChange('cityId', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!filters.stateId}
                      >
                        <option value="">All Cities</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => fetchUsers(
                          filters.userRole === 'all' ? '' : filters.userRole,
                          filters.stateId,
                          filters.cityId
                        )}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                        disabled={loading.users}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading.users ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-6">
                    <ErrorAlert message={error} onClose={() => setError('')} />
                  </div>
                )}

                {loading.users ? (
                  <LoadingSpinner />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User Info
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Demographics
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                    user.role === 'teacher' ? 'bg-green-100' : 'bg-purple-100'
                                  }`}>
                                    <span className={`text-sm font-medium ${
                                      user.role === 'teacher' ? 'text-green-800' : 'text-purple-800'
                                    }`}>
                                      {user.username?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.username || 'Unknown User'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {user.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.email || 'N/A'}</div>
                              {user.mobile_number && (
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {user.mobile_number}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === 'teacher' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {user.role === 'teacher' ? (
                                  <UserCheck className="h-3 w-3 mr-1" />
                                ) : (
                                  <GraduationCap className="h-3 w-3 mr-1" />
                                )}
                                {user.role || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                <div>
                                  <div>{user.location?.state || 'N/A'}</div>
                                  <div className="text-xs text-gray-500">
                                    {user.location?.city || ''}{user.location?.district ? `, ${user.location.district}` : ''}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <div>Age: {user.age || 'N/A'}</div>
                                {user.birthdate && (
                                  <div className="text-xs text-gray-500 flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(user.birthdate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => fetchUserDetails(user.id)}
                                  disabled={loading.userDetails}
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                  title="View details"
                                >
                                  {loading.userDetails ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => removeUser(user.id, user.username)}
                                  disabled={loading[`remove_${user.id}`]}
                                  className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                                  title="Remove user"
                                >
                                  {loading[`remove_${user.id}`] ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {users.length === 0 && !loading.users && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No users found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your filters or refresh the page
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Applied Filters Info */}
              {(filters.userRole !== 'all' || filters.stateId || filters.cityId) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Active Filters:</h4>
                  <div className="flex flex-wrap gap-2">
                    {filters.userRole !== 'all' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Role: {filters.userRole}
                      </span>
                    )}
                    {filters.stateId && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        State: {states.find(s => s.id == filters.stateId)?.name || filters.stateId}
                      </span>
                    )}
                    {filters.cityId && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        City: {cities.find(c => c.id == filters.cityId)?.name || filters.cityId}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setFilters({ userRole: 'all', stateId: '', cityId: '' });
                        fetchUsers();
                      }}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Test Questions Section */}
          {activeSection === 'questions' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-semibold text-gray-900">Test Questions Management</h3>
                  
                  {/* Question Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={questionFilters.subject}
                      onChange={(e) => handleQuestionFilterChange('subject', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Subjects</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => fetchQuestions(questionFilters.subject === 'all' ? '' : questionFilters.subject)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      disabled={loading.questions}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading.questions ? 'animate-spin' : ''}`} />
                      Refresh Questions
                    </button>

                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                      onClick={() => alert('Add Question functionality can be implemented here')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-6">
                  <ErrorAlert message={error} onClose={() => setError('')} />
                </div>
              )}

              {loading.questions ? (
                <LoadingSpinner />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Question Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject & Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Options
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Answer & Difficulty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {questions.map((question) => (
                        <tr key={question.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 max-w-md">
                              {question.question}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {question.id} | Grade: {question.grade_level}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{question.subject}</div>
                            <div className="text-sm text-gray-500">{question.category}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-gray-700 space-y-1">
                              <div><strong>A:</strong> {question.options?.A || question.option_a}</div>
                              <div><strong>B:</strong> {question.options?.B || question.option_b}</div>
                              <div><strong>C:</strong> {question.options?.C || question.option_c}</div>
                              <div><strong>D:</strong> {question.options?.D || question.option_d}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Answer: {question.correct_answer}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Difficulty: {question.difficulty_level}/5
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Edit question"
                                onClick={() => alert('Edit Question functionality can be implemented here')}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Delete question"
                                onClick={() => alert('Delete Question functionality can be implemented here')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {questions.length === 0 && !loading.questions && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No questions found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your filters or add new questions
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Test Results Section */}
          {activeSection === 'test-results' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900">Test Results Management</h3>
                    <button
                      onClick={generateTestResultsPDF}
                      disabled={loading.downloadingTestPDF}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      title="Download Test Results PDF"
                    >
                      {loading.downloadingTestPDF ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Download PDF
                    </button>
                  </div>
                  
                  {/* Test Result Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={testResultFilters.status}
                      onChange={(e) => handleTestResultFilterChange('status', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>

                    <button
                      onClick={() => fetchTestResults(testResultFilters.status === 'all' ? '' : testResultFilters.status)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      disabled={loading.testResults}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading.testResults ? 'animate-spin' : ''}`} />
                      Refresh Results
                    </button>

                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {pendingResults} pending reviews
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-6">
                  <ErrorAlert message={error} onClose={() => setError('')} />
                </div>
              )}

              {loading.testResults ? (
                <LoadingSpinner />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Test Performance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Test Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admin Review
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {testResults.map((result) => (
                        <tr key={result.attempt_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-purple-800">
                                    {result.student?.username?.charAt(0).toUpperCase() || 'S'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {result.student?.username || 'Unknown Student'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {result.student?.email || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div className="font-medium">Score: {result.test_details?.score_percentage?.toFixed(1)}%</div>
                              <div className="text-xs text-gray-500">
                                {result.test_details?.correct_answers}/{result.test_details?.total_questions} correct
                              </div>
                            </div>
                            <div className="mt-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                result.test_details?.result_prediction === 'likely_pass' 
                                  ? 'bg-green-100 text-green-800' 
                                  : result.test_details?.result_prediction === 'borderline'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {result.test_details?.result_prediction?.replace('_', ' ') || 'Unknown'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>Started: {result.test_details?.start_time ? new Date(result.test_details.start_time).toLocaleDateString() : 'N/A'}</div>
                              <div className="text-xs text-gray-500">
                                Completed: {result.test_details?.end_time ? new Date(result.test_details.end_time).toLocaleDateString() : 'Not completed'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              result.admin_review?.approval_status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : result.admin_review?.approval_status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {result.admin_review?.approval_status === 'pending' ? 'Pending' : 
                               result.admin_review?.approval_status === 'approved' ? 'Approved' : 
                               result.admin_review?.approval_status === 'rejected' ? 'Rejected' : 'Unknown'}
                            </span>
                            {result.admin_review?.comments && (
                              <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={result.admin_review.comments}>
                                {result.admin_review.comments}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {result.admin_review?.approval_status === 'pending' ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    const comments = prompt('Add comments (optional):') || '';
                                    updateTestResult(result.attempt_id, 'approved', comments);
                                  }}
                                  disabled={loading[`test_${result.attempt_id}`]}
                                  className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50"
                                  title="Approve test"
                                >
                                  {loading[`test_${result.attempt_id}`] ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    const comments = prompt('Add rejection reason:') || 'Rejected by admin';
                                    updateTestResult(result.attempt_id, 'rejected', comments);
                                  }}
                                  disabled={loading[`test_${result.attempt_id}`]}
                                  className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                                  title="Reject test"
                                >
                                  {loading[`test_${result.attempt_id}`] ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400">
                                {result.admin_review?.approval_status === 'approved' ? 'Approved' : 'Rejected'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {testResults.length === 0 && !loading.testResults && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No test results found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your filters or check back later
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* User Details Modal */}
      <UserDetailsModal 
        user={selectedUser} 
        isOpen={showUserDetails} 
        onClose={() => {
          setShowUserDetails(false);
          setSelectedUser(null);
        }} 
      />
    </div>
  );
};

export default AdminDashboard;