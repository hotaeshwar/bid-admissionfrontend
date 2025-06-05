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
  FileText
} from 'lucide-react';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  // API Configuration
  const API_BASE = 'https://admissionapi.buildingindiadigital.com';
  
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
    fetchUsers();
  }, []);

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
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
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
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-semibold text-gray-900">User Management</h3>
                
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