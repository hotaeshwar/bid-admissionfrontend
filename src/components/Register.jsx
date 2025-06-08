import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/bid.png";
// Import Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faLock, 
  faEnvelope,
  faMapMarkerAlt,
  faIdCard,
  faEye, 
  faEyeSlash,
  faUserShield,
  faChalkboardTeacher,
  faGraduationCap,
  faUpload,
  faUserPlus,
  faInfoCircle,
  faKey,
  faExclamationTriangle,
  faUserCog,
  faPhone,
  faCity
} from "@fortawesome/free-solid-svg-icons";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    mobile_number: "",
    role: "student",
    state_id: "",
    city_id: "",
    document: null,
    admin_secret_key: ""
  });
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoleData, setSelectedRoleData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  // API base URL
  const API_BASE_URL = "http://127.0.0.1:8000"
  

  // Fetch states and roles on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/states`);
        
        if (response.data.success) {
          setStates(response.data.data);
        } else {
          setError("Failed to load states. Please refresh the page.");
        }
      } catch (err) {
        setError("Unable to connect to server. Please check if the backend is running on port 8000.");
        
        // Fallback states for development
        const fallbackStates = [
          { id: 1, name: "Delhi" },
          { id: 2, name: "Haryana" },
          { id: 3, name: "Punjab" },
          { id: 4, name: "Uttar Pradesh" },
          { id: 5, name: "Uttarakhand" },
          { id: 6, name: "Himachal Pradesh" },
          { id: 7, name: "Jammu and Kashmir" },
          { id: 8, name: "Rajasthan" }
        ];
        setStates(fallbackStates);
      }
    };

    fetchStates();
    fetchRoles();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (formData.state_id && selectedRoleData?.requires_state) {
        setCitiesLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/states/${formData.state_id}/cities`);
          
          if (response.data.success) {
            setCities(response.data.data);
          } else {
            setCities([]);
            setError("Failed to load cities for selected state.");
          }
        } catch (err) {
          setCities([]);
          setError("Unable to load cities. Please try selecting the state again.");
        } finally {
          setCitiesLoading(false);
        }
      } else {
        setCities([]);
        setFormData(prev => ({ ...prev, city_id: "" }));
      }
    };

    fetchCities();
  }, [formData.state_id, selectedRoleData]);

  // Update selected role data when role changes
  useEffect(() => {
    if (roles.length > 0 && formData.role) {
      const roleData = roles.find(r => r.id === formData.role);
      setSelectedRoleData(roleData);
      
      // Clear fields not needed for admin role (including mobile_number)
      if (formData.role === "admin") {
        setFormData(prev => ({
          ...prev,
          mobile_number: "", // Completely clear mobile number for admin
          state_id: "",
          city_id: "",
          document: null
        }));
        setCities([]);
      }
      
      // Clear admin_secret_key when switching from admin role
      if (formData.role !== "admin") {
        setFormData(prev => ({
          ...prev,
          admin_secret_key: ""
        }));
      }
    }
  }, [formData.role, roles]);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/roles`);
      if (response.data.success) {
        setRoles(response.data.data);
        // Set default role data
        const defaultRole = response.data.data.find(r => r.id === "student");
        setSelectedRoleData(defaultRole);
      }
    } catch (err) {
      // Enhanced fallback roles
      const fallbackRoles = [
        {
          id: "admin",
          name: "Administrator",
          description: "System administrator with full access",
          requirements: ["username", "email", "password", "admin_secret_key"], // No mobile for admin
          requires_document: false,
          requires_state: false,
          requires_admin_key: true,
          age_requirement: null
        },
        {
          id: "teacher", 
          name: "Teacher",
          description: "Teacher with meeting and student management access",
          requirements: ["username", "email", "password", "mobile", "state_id", "city_id", "document"],
          requires_document: true,
          requires_state: true,
          requires_admin_key: false,
          age_requirement: "Must be 20 years or older"
        },
        {
          id: "student",
          name: "Student", 
          description: "Student with test taking and meeting access",
          requirements: ["username", "email", "password", "mobile", "state_id", "city_id", "document"],
          requires_document: true,
          requires_state: true,
          requires_admin_key: false,
          age_requirement: "Must be 19 years or younger"
        }
      ];
      
      setRoles(fallbackRoles);
      const defaultRole = fallbackRoles.find(r => r.id === "student");
      setSelectedRoleData(defaultRole);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setFormData({ ...formData, document: file });
        if (error) setError("");
      } else {
        setError("Please upload only image files (JPG, PNG, etc.)");
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setFormData({ ...formData, document: file });
        if (error) setError("");
      } else {
        setError("Please upload only image files (JPG, PNG, etc.)");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleAdminKeyVisibility = () => {
    setShowAdminKey(!showAdminKey);
  };

  const validateForm = () => {
    if (!selectedRoleData) {
      setError("Please select a valid role");
      return false;
    }

    const missingFields = [];
    
    if (!formData.username.trim()) missingFields.push("Username");
    if (!formData.email.trim()) missingFields.push("Email");
    if (!formData.password.trim()) missingFields.push("Password");
    
    // Mobile number is only required for teacher and student roles, NOT for admin
    if (formData.role !== "admin" && !formData.mobile_number.trim()) {
      missingFields.push("Mobile Number");
    }
    
    // Validate mobile number format (Indian format) only for non-admin roles
    if (formData.role !== "admin" && formData.mobile_number.trim()) {
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(formData.mobile_number.trim())) {
        setError("Mobile number must be 10 digits starting with 6, 7, 8, or 9");
        return false;
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    // Password strength validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    
    if (selectedRoleData.requires_admin_key && !formData.admin_secret_key.trim()) {
      missingFields.push("Admin Secret Key");
    }
    
    if (selectedRoleData.requires_state && !formData.state_id) {
      missingFields.push("State");
    }
    
    // Validate city selection
    if (selectedRoleData.requires_state && !formData.city_id) {
      missingFields.push("City");
    }
    
    if (selectedRoleData.requires_document && !formData.document) {
      missingFields.push("ID Document");
    }

    if (missingFields.length > 0) {
      setError(`Please fill the following required fields: ${missingFields.join(", ")}`);
      return false;
    }

    if (selectedRoleData.requires_document && formData.document) {
      if (!formData.document.type.startsWith('image/')) {
        setError("Please upload a valid image file for ID document");
        return false;
      }
      
      // Check file size (max 10MB)
      if (formData.document.size > 10 * 1024 * 1024) {
        setError("File size should be less than 10MB");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      let response;

      if (formData.role === "admin") {
        // Admin registration using the dedicated admin endpoint - NO mobile_number
        const adminData = {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          admin_secret_key: formData.admin_secret_key.trim()
          // IMPORTANT: Do NOT include mobile_number for admin registration
        };

        console.log("Sending admin data:", adminData); // Debug log

        response = await axios.post(`${API_BASE_URL}/admin/register`, adminData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } else {
        // Teacher/Student registration - FormData to /register
        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.username.trim());
        formDataToSend.append('email', formData.email.trim());
        formDataToSend.append('password', formData.password);
        formDataToSend.append('mobile_number', formData.mobile_number.trim());
        formDataToSend.append('role', formData.role);
        formDataToSend.append('state_id', formData.state_id);
        formDataToSend.append('city_id', formData.city_id);
        formDataToSend.append('document', formData.document);

        response = await axios.post(`${API_BASE_URL}/register`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.data.success) {
        const userData = response.data.data;
        
        // Show success message based on role
        if (formData.role === "admin") {
          alert(`Admin registration successful! Welcome ${userData.username}. Admin ID: ${userData.admin_id || userData.id}. Please login to continue.`);
        } else {
          const ageInfo = userData.age ? ` Age detected: ${userData.age} years.` : "";
          const locationInfo = userData.location ? ` Location: ${userData.location.city}, ${userData.location.state}.` : "";
          alert(`Registration successful! You have been registered as a ${userData.role}.${ageInfo}${locationInfo} Please login to continue.`);
        }
        
        // Redirect to login
        navigate("/login");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err); // Debug log
      console.error("Error response:", err.response); // Debug log
      console.error("Error data:", err.response?.data); // Debug log
      console.error("Error status:", err.response?.status); // Debug log
      
      if (err.response?.status === 400) {
        const errorMessage = err.response.data.detail || err.response.data.message || "Registration failed. Please check your details.";
        setError(errorMessage);
      } else if (err.response?.status === 403) {
        setError("Access denied. Invalid admin secret key or admin registration limit exceeded. Please contact system administrator.");
      } else if (err.response?.status === 422) {
        const validationErrors = err.response.data.detail;
        if (Array.isArray(validationErrors)) {
          const errorMessages = validationErrors.map(err => err.msg).join(', ');
          setError(`Validation error: ${errorMessages}`);
        } else {
          setError("Please check your input data and try again.");
        }
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.code === 'ECONNREFUSED') {
        setError("Cannot connect to server. Please check if the backend server is running on port 8000.");
      } else if (err.code === 'ERR_NETWORK') {
        setError("Network error. Please check your internet connection and ensure the backend server is running.");
      } else {
        setError("Registration failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (roleId) => {
    switch (roleId) {
      case "admin":
        return faUserShield;
      case "teacher":
        return faChalkboardTeacher;
      case "student":
        return faGraduationCap;
      default:
        return faUser;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to check if we should show a field
  const shouldShowField = (fieldType) => {
    if (!selectedRoleData) return false;
    
    switch (fieldType) {
      case 'mobile':
        return formData.role !== "admin"; // Hide mobile field for admin role
      case 'state':
        return selectedRoleData.requires_state;
      case 'city':
        return selectedRoleData.requires_state && formData.state_id;
      case 'admin_key':
        return selectedRoleData.requires_admin_key;
      case 'document':
        return selectedRoleData.requires_document;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FF9933] to-[#FFFFFF] p-4">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl border border-[#FF9933] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF9933] to-[#138808] p-6 text-center">
          <img 
            src={logo} 
            alt="BID Admission Logo" 
            className="mx-auto max-h-16 object-contain mb-3"
          />
          <h2 className="text-2xl font-bold text-white">Join BiD Admission and start your journey</h2>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-center text-gray-800 mb-6">Registration Form</h3>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg mb-4">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Dropdown Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faUserCog} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF9933] text-sm z-10" 
                />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:border-[#138808] transition duration-300 text-sm appearance-none bg-white"
                  required
                  disabled={loading}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FontAwesomeIcon 
                    icon={getRoleIcon(formData.role)} 
                    className="text-[#FF9933] text-sm"
                  />
                </div>
              </div>
              
              {/* Role Information */}
              {selectedRoleData && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-medium text-blue-700 mb-1">
                        {selectedRoleData.name} Requirements:
                      </p>
                      <ul className="text-blue-600 space-y-1">
                        {selectedRoleData.requirements?.map((req, index) => (
                          <li key={index}>• {req.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                        ))}
                      </ul>
                      {selectedRoleData.age_requirement && (
                        <p className="text-blue-600 mt-1 font-medium">
                          Age: {selectedRoleData.age_requirement}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faUser} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF9933] text-sm z-10" 
                  />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:border-[#138808] transition duration-300 text-sm"
                    placeholder="Enter username"
                    required
                    disabled={loading}
                    minLength="3"
                    maxLength="50"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faEnvelope} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF9933] text-sm z-10" 
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:border-[#138808] transition duration-300 text-sm"
                    placeholder="Enter email address"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faLock} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF9933] text-sm z-10" 
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:border-[#138808] transition duration-300 text-sm"
                    placeholder="Create a strong password (min 6 chars)"
                    required
                    disabled={loading}
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FF9933] hover:text-[#138808] focus:outline-none"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-sm" />
                  </button>
                </div>
              </div>

              {/* Mobile Number - Hidden for admin, shown for teacher/student */}
              {shouldShowField('mobile') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faPhone} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF9933] text-sm z-10" 
                    />
                    <input
                      type="tel"
                      name="mobile_number"
                      value={formData.mobile_number}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:border-[#138808] transition duration-300 text-sm"
                      placeholder="Enter 10-digit mobile number"
                      required={shouldShowField('mobile')}
                      disabled={loading}
                      maxLength="10"
                      pattern="[6-9][0-9]{9}"
                      title="Mobile number should be 10 digits starting with 6, 7, 8, or 9"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter 10-digit Indian mobile number (starting with 6, 7, 8, or 9)
                  </p>
                </div>
              )}

              {/* State - Show if required */}
              {shouldShowField('state') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faMapMarkerAlt} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF9933] text-sm z-10" 
                    />
                    <select
                      name="state_id"
                      value={formData.state_id}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:border-[#138808] transition duration-300 text-sm appearance-none bg-white"
                      required={shouldShowField('state')}
                      disabled={loading}
                    >
                      <option value="">Select your state</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* City - Show if state is selected and required */}
              {shouldShowField('city') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faCity} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF9933] text-sm z-10" 
                    />
                    <select
                      name="city_id"
                      value={formData.city_id}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:border-[#138808] transition duration-300 text-sm appearance-none bg-white"
                      required={shouldShowField('city')}
                      disabled={loading || citiesLoading || cities.length === 0}
                    >
                      <option value="">
                        {citiesLoading ? "Loading cities..." : cities.length === 0 ? "No cities available" : "Select your city"}
                      </option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name} {city.is_major ? "(Major City)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  {citiesLoading && (
                    <p className="text-xs text-blue-600 mt-1 flex items-center">
                      <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading cities for selected state...
                    </p>
                  )}
                  {!citiesLoading && cities.length === 0 && formData.state_id && (
                    <p className="text-xs text-red-600 mt-1">
                      No cities found for selected state. Please try selecting a different state.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Admin Secret Key - Show for admin role only */}
            {shouldShowField('admin_key') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Secret Key <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faKey} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF9933] text-sm z-10" 
                  />
                  <input
                    type={showAdminKey ? "text" : "password"}
                    name="admin_secret_key"
                    value={formData.admin_secret_key}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:border-[#138808] transition duration-300 text-sm"
                    placeholder="Enter admin secret key"
                    required={shouldShowField('admin_key')}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={toggleAdminKeyVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FF9933] hover:text-[#138808] focus:outline-none"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={showAdminKey ? faEyeSlash : faEye} className="text-sm" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Contact system administrator for the admin secret key
                </p>
              </div>
            )}

            {/* ID Document Upload - Show if required */}
            {shouldShowField('document') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Document <span className="text-red-500">*</span>
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                    dragActive 
                      ? 'border-[#FF9933] bg-orange-50' 
                      : formData.document 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-[#FF9933]'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={loading}
                    required={shouldShowField('document')}
                  />
                  <FontAwesomeIcon icon={faIdCard} className="text-[#FF9933] text-2xl mb-2" />
                  {formData.document ? (
                    <div>
                      <p className="text-sm font-medium text-green-700">{formData.document.name}</p>
                      <p className="text-xs text-green-600">
                        {formatFileSize(formData.document.size)} - File selected successfully
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <FontAwesomeIcon icon={faUpload} className="mr-1" />
                        Choose File or Drag & Drop
                      </p>
                      <p className="text-xs text-gray-500">Upload a clear image of your ID document (max 10MB)</p>
                      {selectedRoleData?.age_requirement && (
                        <p className="text-xs text-blue-600 mt-1 font-medium">
                          {selectedRoleData.age_requirement}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-3 rounded-lg transition duration-300 transform flex items-center justify-center space-x-2 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#FF9933] to-[#138808] hover:from-[#FF7F00] hover:to-[#007F3D] hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUserPlus} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[#FF9933] font-bold hover:underline hover:text-[#138808] transition duration-300"
                disabled={loading}
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;