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
  faKey
} from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "student",
    state_id: ""
  });
  const [states, setStates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoleData, setSelectedRoleData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // API base URL
  const API_BASE_URL = "http://localhost:8000";

  // Check if user is already logged in
  useEffect(() => {
    const userData = localStorage.getItem("user");
    
    if (userData) {
      try {
<<<<<<< HEAD
        const user = JSON.parse(userData);
        // Check if user has access_token
        if (user.access_token) {
          // Redirect based on role
          redirectBasedOnRole(user.role);
        }
      } catch (e) {
        // Invalid JSON, clear localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
=======
        console.log("🔄 [LOGIN] Starting to fetch states...");
        const response = await axios.get("https://admissionapi.buildingindiadigital.com/auth/states");
        
        console.log("📡 [LOGIN] Full API Response:", response);
        console.log("📊 [LOGIN] Response Data:", response.data);
        console.log("✅ [LOGIN] Response Success Status:", response.data.success);
        console.log("🏛️ [LOGIN] States Data:", response.data.data);
        console.log("📏 [LOGIN] Number of states received:", response.data.data ? response.data.data.length : 0);
        
        if (response.data.success) {
          console.log("✅ [LOGIN] Setting states to state variable");
          setStates(response.data.data);
          console.log("🔍 [LOGIN] States after setting:", response.data.data);
        } else {
          console.log("❌ [LOGIN] API returned success: false");
          console.log("📝 [LOGIN] Error message from API:", response.data.message);
        }
      } catch (err) {
        console.error("❌ [LOGIN] Failed to fetch states:", err);
        console.error("📋 [LOGIN] Error details:", err.response);
        console.error("📋 [LOGIN] Error message:", err.message);
        if (err.response) {
          console.error("📋 [LOGIN] Error status:", err.response.status);
          console.error("📋 [LOGIN] Error data:", err.response.data);
        }
>>>>>>> f6d0c78ce464eef595e72cfc858025d0a9bd7623
      }
    }
  }, []);

<<<<<<< HEAD
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
      
      // Clear state_id when switching to admin role (admin doesn't need state)
      if (formData.role === "admin") {
        setFormData(prev => ({
          ...prev,
          state_id: ""
        }));
      }
    }
  }, [formData.role, roles]);

  const fetchStates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/states`);
      if (response.data.success) {
        setStates(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch states:", err);
      // Don't show error for states fetch failure in login
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
      console.error("Failed to fetch roles:", err);
      // Fallback to hardcoded roles
      const fallbackRoles = [
        {
          id: "admin",
          name: "Administrator",
          description: "System administrator with full access",
          requires_state: false
        },
        {
          id: "teacher", 
          name: "Teacher",
          description: "Teacher with meeting and student management access",
          requires_state: true
        },
        {
          id: "student",
          name: "Student", 
          description: "Student with test taking and meeting access",
          requires_state: true
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
        console.error("Unknown role:", role);
        setError("Unknown user role. Please contact support.");
    }
  };
=======
  // Add useEffect to monitor states changes
  useEffect(() => {
    console.log("🔄 [LOGIN] States updated:", states);
    console.log("📏 [LOGIN] Current states length:", states.length);
    if (states.length > 0) {
      console.log("🎯 [LOGIN] First state example:", states[0]);
      console.log("🔑 [LOGIN] Keys in first state:", Object.keys(states[0]));
    }
  }, [states]);
>>>>>>> f6d0c78ce464eef595e72cfc858025d0a9bd7623

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
    
    // State is required for teacher and student roles
    if (selectedRoleData?.requires_state && !formData.state_id) {
      setError("Please select your state");
      return false;
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
<<<<<<< HEAD
      // Prepare login data according to FastAPI UserLoginWithRole model
      const loginData = {
        username: formData.username.trim(),
        password: formData.password,
        role: formData.role
      };

      // Add state_id only if required for the role
      if (selectedRoleData?.requires_state) {
        loginData.state_id = parseInt(formData.state_id);
      }

      console.log("Sending login data:", loginData);

      const response = await axios.post(`${API_BASE_URL}/login`, loginData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check for successful response structure from FastAPI
=======
      const response = await axios.post("https://admissionapi.buildingindiadigital.com/auth/login", formData);
>>>>>>> f6d0c78ce464eef595e72cfc858025d0a9bd7623
      if (response.data.success) {
        const { access_token, token_type, user } = response.data.data;

        // Log the response data for debugging
        console.log("Login response:", response.data);

        // FIXED: Store token in user object (this is what TeacherDashboard expects)
        const userData = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          age: user.age,
          state: user.state || null,
          state_id: user.state_id || null,
          token_type: token_type,
          access_token: access_token  // ← FIXED: Added this line for TeacherDashboard compatibility
        };

        localStorage.setItem("user", JSON.stringify(userData));

        // KEEP this for admin dashboard compatibility (some components might still use it)
        localStorage.setItem("access_token", access_token);

        // Set axios default authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        // Show success message briefly before redirect
        const stateInfo = user.state ? ` from ${user.state}` : "";
        console.log(`Login successful! Welcome ${user.username} (${user.role})${stateInfo}`);

        // Small delay to ensure localStorage is set before redirect
        setTimeout(() => {
          redirectBasedOnRole(user.role);
        }, 100);

      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login failed:", err);
      
      // Handle specific error responses from FastAPI
      if (err.response?.status === 401) {
        setError("Invalid username, password, or role/state combination");
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
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
<<<<<<< HEAD
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
=======
                    <option value="" disabled>Select your state</option>
                    {/* Add debug info in the dropdown rendering */}
                    {console.log("🎯 [LOGIN] Rendering dropdown options. States array:", states)}
                    {states.length === 0 && console.log("⚠️ [LOGIN] States array is empty during render")}
                    {states.map((state, index) => {
                      console.log(`🏛️ [LOGIN] Rendering state ${index}:`, state);
                      return (
                        <option key={state.id} value={state.name}>
                          {state.name}
                        </option>
                      );
                    })}
>>>>>>> f6d0c78ce464eef595e72cfc858025d0a9bd7623
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

              {/* Submit Button */}
              <button
                type="submit"
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
            </form>
            
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
                    <span>Admin: Full system access (no state required)</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <FontAwesomeIcon icon={faChalkboardTeacher} className="text-green-600" />
                    <span>Teacher: Age ≥20 (requires state selection)</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600" />
                    <span>Student: Age &lt;20 (requires state selection)</span>
                  </div>
                </div>
                <p className="text-xs text-blue-500 mt-2 italic">
                  Select your role and state (if applicable) to login
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
