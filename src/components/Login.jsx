import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/bid.png";
// Import Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faLock, 
  faSignInAlt, 
  faEye, 
  faEyeSlash,
  faUserShield,
  faChalkboardTeacher,
  faGraduationCap,
  faMapMarkerAlt,
  faUserCog,
  faInfoCircle,
  faExclamationTriangle,
  faKey,
  faPhone,
  faCity
} from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "student",
    state_id: "",
    city_id: "",
    mobile_number: "" // Added mobile_number field
  });
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoleData, setSelectedRoleData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // API base URL
  const API_BASE_URL = "https://admissionapi.buildingindiadigital.com";

  // Check if user is already logged in
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");
    
    if (userData && token) {
      const user = JSON.parse(userData);
      // Redirect based on role
      redirectBasedOnRole(user.role);
    }
  }, []);

  // Fetch states and roles on component mount
  useEffect(() => {
    fetchStates();
    fetchRoles();
  }, []);

  // Update selected role data when role changes
  useEffect(() => {
    if (roles.length > 0 && formData.role) {
      const roleData = roles.find(r => r.id === formData.role);
      setSelectedRoleData(roleData);
      
      // Clear state_id and city_id when switching to admin role (admin doesn't need state/city)
      if (formData.role === "admin") {
        setFormData(prev => ({
          ...prev,
          state_id: "",
          city_id: ""
        }));
        setCities([]);
      }
      // Clear mobile_number when switching from admin role (if not needed for other roles)
      if (formData.role !== "admin") {
        setFormData(prev => ({
          ...prev,
          mobile_number: ""
        }));
      }
    }
  }, [formData.role, roles]);

  // Fetch cities when state changes
  useEffect(() => {
    if (formData.state_id && selectedRoleData?.requires_state) {
      fetchCities(formData.state_id);
    } else {
      setCities([]);
      setFormData(prev => ({ ...prev, city_id: "" }));
    }
  }, [formData.state_id, selectedRoleData]);

  const fetchStates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/states`);
      if (response.data.success) {
        setStates(response.data.data);
      }
    } catch (err) {
      // Don't show error for states fetch failure in login
    }
  };

  const fetchCities = async (stateId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/states/${stateId}/cities`);
      if (response.data.success) {
        setCities(response.data.data);
      }
    } catch (err) {
      setCities([]);
    }
  };

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
      // Fallback to hardcoded roles
      const fallbackRoles = [
        {
          id: "admin",
          name: "Administrator",
          description: "System administrator with full access",
          requires_state: false,
          requires_mobile: true // Added mobile requirement for admin
        },
        {
          id: "teacher", 
          name: "Teacher",
          description: "Teacher with meeting and student management access",
          requires_state: true,
          requires_mobile: false
        },
        {
          id: "student",
          name: "Student", 
          description: "Student with test taking and meeting access",
          requires_state: true,
          requires_mobile: false
        }
      ];
      
      setRoles(fallbackRoles);
      const defaultRole = fallbackRoles.find(r => r.id === "student");
      setSelectedRoleData(defaultRole);
    }
  };

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case "admin":
        navigate("/admin-dashboard");
        break;
      case "teacher":
        navigate("/teacher-dashboard");
        break;
      case "student":
        navigate("/student-dashboard");
        break;
      default:
        setError("Unknown user role. Please contact support.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Please enter your username");
      return false;
    }
    
    if (!formData.password.trim()) {
      setError("Please enter your password");
      return false;
    }
    
    if (!formData.role) {
      setError("Please select your role");
      return false;
    }
    
    // Mobile number validation for admin
    if (selectedRoleData?.requires_mobile || formData.role === "admin") {
      if (!formData.mobile_number.trim()) {
        setError("Please enter your mobile number");
        return false;
      }
      // Validate mobile number format (Indian format)
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(formData.mobile_number.trim())) {
        setError("Mobile number must be 10 digits starting with 6, 7, 8, or 9");
        return false;
      }
    }
    
    // State and city are required for teacher and student roles
    if (selectedRoleData?.requires_state) {
      if (!formData.state_id) {
        setError("Please select your state");
        return false;
      }
      if (!formData.city_id) {
        setError("Please select your city");
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
      // Prepare login data according to FastAPI UserLoginWithRole model
      const loginData = {
        username: formData.username.trim(),
        password: formData.password,
        role: formData.role
      };

      // Add mobile_number for admin
      if (formData.role === "admin" && formData.mobile_number.trim()) {
        loginData.mobile_number = formData.mobile_number.trim();
      }

      // Add state_id and city_id only if required for the role
      if (selectedRoleData?.requires_state) {
        loginData.state_id = parseInt(formData.state_id);
        loginData.city_id = parseInt(formData.city_id);
      }

      const response = await axios.post(`${API_BASE_URL}/login`, loginData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check for successful response structure from FastAPI
      if (response.data.success) {
        const { access_token, token_type, user } = response.data.data;

        // Store token separately for all components to access
        localStorage.setItem("access_token", access_token);

        // Save user data to localStorage WITH the token included
        const userData = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          age: user.age,
          token_type: token_type,
          access_token: access_token // Include token in user data
        };

        // Add location data if available
        if (user.location) {
          userData.location = user.location;
          userData.state = user.location.state;
          userData.city = user.location.city;
          userData.state_id = user.location.state_id;
          userData.city_id = user.location.city_id;
        }

        // Add mobile number for all users
        if (user.mobile_number) {
          userData.mobile_number = user.mobile_number;
        }

        localStorage.setItem("user", JSON.stringify(userData));

        // Set axios default authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        // Redirect based on role
        redirectBasedOnRole(user.role);
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      // Handle specific error responses from FastAPI
      if (err.response?.status === 401) {
        setError("Invalid username, password, or role/location combination");
      } else if (err.response?.status === 400) {
        const errorMessage = err.response.data.detail || "Invalid login data";
        setError(errorMessage);
      } else if (err.response?.status === 422) {
        // Handle validation errors
        const validationErrors = err.response.data.detail;
        if (Array.isArray(validationErrors)) {
          const errorMessages = validationErrors.map(err => err.msg).join(', ');
          setError(`Validation error: ${errorMessages}`);
        } else {
          setError("Please check your input and try again");
        }
      } else if (err.response?.data?.detail) {
        // FastAPI validation error or custom error
        if (typeof err.response.data.detail === 'string') {
          setError(err.response.data.detail);
        } else {
          setError("Please check your input and try again");
        }
      } else if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        setError("Cannot connect to server. Please check if the server is running.");
      } else {
        setError("Login failed. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
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

  const getRoleRequirements = (role) => {
    switch (role) {
      case "admin":
        return "Full system access (requires mobile number)";
      case "teacher":
        return "Age ≥20 (requires state & city selection)";
      case "student":
        return "Age <20 (requires state, city & mobile during registration)";
      default:
        return "";
    }
  };

  // Helper function to check if mobile field should be shown
  const shouldShowMobileField = () => {
    return formData.role === "admin" || selectedRoleData?.requires_mobile;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 to-white p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-3xl bg-white shadow-2xl rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-lg">
        <div className="grid md:grid-cols-2">
          {/* Left Side - Decorative Background */}
          <div className="hidden md:flex bg-gradient-to-br from-orange-400 to-green-600 opacity-90 items-center justify-center p-8">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
              <p className="text-lg mb-6">Log in to access your account</p>
              <div className="mx-auto max-h-32 mb-8 flex items-center justify-center">
                <img 
                  src={logo} 
                  alt="BID Logo" 
                  className="max-h-20 max-w-full object-contain"
                />
              </div>
              
              {/* Role indicators */}
              <div className="mt-8 space-y-2">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <FontAwesomeIcon icon={faUserShield} />
                  <span>Admin Portal</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <FontAwesomeIcon icon={faChalkboardTeacher} />
                  <span>Teacher Portal</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <FontAwesomeIcon icon={faGraduationCap} />
                  <span>Student Portal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-6 sm:p-8 md:p-10 space-y-6">
            {/* Mobile Logo */}
            <div className="md:hidden flex justify-center mb-6">
              <div className="bg-orange-100 rounded-lg p-4 flex items-center justify-center">
                <img 
                  src={logo} 
                  alt="BID Logo" 
                  className="max-h-16 max-w-full object-contain"
                />
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-green-600">
              Login to Your Account
            </h2>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faUserCog} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 z-10" 
                  />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-green-600 transition duration-300 appearance-none bg-white hover:border-green-600"
                    required
                    disabled={loading}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FontAwesomeIcon 
                      icon={getRoleIcon(formData.role)} 
                      className="text-orange-400"
                    />
                  </div>
                </div>
                
                {/* Role Information */}
                {selectedRoleData && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 text-xs text-blue-600">
                      <FontAwesomeIcon icon={faInfoCircle} />
                      <span>{selectedRoleData.description}</span>
                    </div>
                    {formData.role === "admin" && (
                      <div className="mt-1 text-xs text-orange-600 flex items-center space-x-1">
                        <FontAwesomeIcon icon={faPhone} />
                        <span>Admin requires mobile number for login</span>
                      </div>
                    )}
                    {formData.role === "student" && (
                      <div className="mt-1 text-xs text-orange-600 flex items-center space-x-1">
                        <FontAwesomeIcon icon={faPhone} />
                        <span>Students need mobile number & location during registration</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faUser} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" 
                  />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-green-600 transition duration-300 hover:border-green-600"
                    placeholder="Enter your username"
                    required
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Mobile Number Input - Show for admin */}
              {shouldShowMobileField() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faPhone} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" 
                    />
                    <input
                      type="tel"
                      name="mobile_number"
                      value={formData.mobile_number}
                      onChange={handleChange}
                      className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-green-600 transition duration-300 hover:border-green-600"
                      placeholder="Enter your 10-digit mobile number"
                      required={shouldShowMobileField()}
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

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-orange-400 hover:text-green-600 hover:underline transition duration-300 flex items-center space-x-1"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faKey} className="text-xs" />
                    <span>Forgot Password?</span>
                  </button>
                </div>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faLock} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" 
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 p-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-green-600 transition duration-300 hover:border-green-600"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-green-600 focus:outline-none"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {/* State Selection - Only show if required */}
              {selectedRoleData?.requires_state && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faMapMarkerAlt} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 z-10" 
                    />
                    <select
                      name="state_id"
                      value={formData.state_id}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-green-600 transition duration-300 appearance-none bg-white hover:border-green-600"
                      required={selectedRoleData?.requires_state}
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

              {/* City Selection - Only show if state is selected and required */}
              {selectedRoleData?.requires_state && formData.state_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faCity} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 z-10" 
                    />
                    <select
                      name="city_id"
                      value={formData.city_id}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-green-600 transition duration-300 appearance-none bg-white hover:border-green-600"
                      required={selectedRoleData?.requires_state}
                      disabled={loading || cities.length === 0}
                    >
                      <option value="">Select your city</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name} {city.is_major && "(Major City)"}
                        </option>
                      ))}
                    </select>
                  </div>
                  {cities.length === 0 && formData.state_id && (
                    <p className="text-xs text-gray-500 mt-1">Loading cities...</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full text-white py-3 rounded-lg transition duration-300 transform flex items-center justify-center space-x-2 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-400 to-green-600 hover:from-orange-500 hover:to-green-700 hover:scale-105'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSignInAlt} />
                    <span>Login</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-orange-400 font-bold hover:underline hover:text-green-600 transition duration-300"
                  disabled={loading}
                >
                  Register here
                </button>
              </p>
              
              {/* System info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 font-medium mb-2">System Roles:</p>
                <div className="text-xs text-blue-600 space-y-1">
                  <div className="flex items-center justify-center space-x-2">
                    <FontAwesomeIcon icon={faUserShield} className="text-red-600" />
                    <span>{getRoleRequirements("admin")}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <FontAwesomeIcon icon={faChalkboardTeacher} className="text-green-600" />
                    <span>{getRoleRequirements("teacher")}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600" />
                    <span>{getRoleRequirements("student")}</span>
                  </div>
                </div>
                <p className="text-xs text-blue-500 mt-2 italic">
                  Select your role and enter required information to login
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;