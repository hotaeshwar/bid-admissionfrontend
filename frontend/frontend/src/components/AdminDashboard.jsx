
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
  GraduationCap
} from 'lucide-react';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');
  const [adminInfo, setAdminInfo] = useState(null);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    userRole: 'all'
  });

  // API Configuration
  const API_BASE = 'http://localhost:8000';
  
  // Fixed: Get token from correct localStorage key
  const getAuthToken = () => {
    return localStorage.getItem('access_token') || localStorage.getItem('admin_token');
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

  // Fetch users
  const fetchUsers = async (role = '') => {
    setLoading(prev => ({ ...prev, users: true }));
    setError(''); // Clear previous errors
    
    try {
      const endpoint = role && role !== 'all' ? `/admin/users?role=${role}` : '/admin/users';
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
    fetchUsers();
  }, []);

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

  const teachersCount = users.filter(user => user.role === 'teacher').length;
  const studentsCount = users.filter(user => user.role === 'student').length;

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
              Manage teachers and students from this dashboard.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
          </div>

          {/* User Management Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-xl font-semibold text-gray-900">User Management</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={filters.userRole}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, userRole: e.target.value }));
                      fetchUsers(e.target.value);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="teacher">Teachers Only</option>
                    <option value="student">Students Only</option>
                  </select>
                  <button
                    onClick={() => fetchUsers(filters.userRole === 'all' ? '' : filters.userRole)}
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
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        State
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.state || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {users.length === 0 && !loading.users && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No users found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;