import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSignOutAlt, 
  faBars, 
  faTimes,
  faChevronRight,
  faCompass,
  faBrain,
  faHome,
  faChalkboardTeacher,
  faUserShield,
  faUsers,
  faClipboardList,
  faVideo
} from "@fortawesome/free-solid-svg-icons";

const SideNavbar = ({ onToggle }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  
  // Get user data from localStorage to determine role
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "student"; // Default to student if no role found

  // For mobile toggle
  const handleToggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Handle mouse events for desktop hover functionality
  const handleMouseEnter = () => {
    if (!isOpen) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isOpen) {
      setIsHovering(false);
    }
  };

  // Notify parent component when sidebar state changes
  useEffect(() => {
    if (onToggle) {
      onToggle(isOpen);
    }
  }, [isOpen, onToggle]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    navigate("/"); // Navigate back to login page
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    setIsHovering(false);
  };

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    switch (userRole) {
      case "admin":
        return "/admin-dashboard";
      case "teacher":
        return "/teacher-dashboard";
      case "student":
        return "/student-dashboard";
      default:
        return "/student-dashboard";
    }
  };

  // Get dashboard title based on user role
  const getDashboardTitle = () => {
    switch (userRole) {
      case "admin":
        return "Admin Dashboard";
      case "teacher":
        return "Teacher Dashboard";
      case "student":
        return "Student Dashboard";
      default:
        return "Dashboard";
    }
  };

  // Get role-specific navigation items
  const getRoleSpecificNavItems = () => {
    const navItems = [];

    // Only admin gets navigation links, teachers and students only get logout
    if (userRole === "admin") {
      // Dashboard link for admin
      navItems.push(
        <li key="dashboard">
          <Link
            to={getDashboardRoute()}
            className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-all duration-200 text-gray-300 hover:text-white hover:translate-x-1 group"
          >
            <FontAwesomeIcon icon={faHome} className="text-lg text-gray-400 group-hover:text-white" />
            <span className={`ml-3 ${!isOpen && !isHovering && "md:hidden"}`}>Dashboard</span>
          </Link>
        </li>
      );

      navItems.push(
        <li key="users">
          <Link
            to="/admin/users"
            className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-all duration-200 text-gray-300 hover:text-white hover:translate-x-1 group"
          >
            <FontAwesomeIcon icon={faUsers} className="text-lg text-blue-400 group-hover:text-white" />
            <span className={`ml-3 ${!isOpen && !isHovering && "md:hidden"}`}>Manage Users</span>
          </Link>
        </li>
      );

      navItems.push(
        <li key="test-results">
          <Link
            to="/admin/test-results"
            className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-all duration-200 text-gray-300 hover:text-white hover:translate-x-1 group"
          >
            <FontAwesomeIcon icon={faClipboardList} className="text-lg text-yellow-400 group-hover:text-white" />
            <span className={`ml-3 ${!isOpen && !isHovering && "md:hidden"}`}>Test Results</span>
          </Link>
        </li>
      );

      navItems.push(
        <li key="meetings-admin">
          <Link
            to="/admin/meetings"
            className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-all duration-200 text-gray-300 hover:text-white hover:translate-x-1 group"
          >
            <FontAwesomeIcon icon={faVideo} className="text-lg text-green-400 group-hover:text-white" />
            <span className={`ml-3 ${!isOpen && !isHovering && "md:hidden"}`}>All Meetings</span>
          </Link>
        </li>
      );
    }

    // For teachers and students, no navigation links are added here
    // Only the logout button will be shown

    return navItems;
  };

  // Get role icon
  const getRoleIcon = () => {
    switch (userRole) {
      case "admin":
        return faUserShield;
      case "teacher":
        return faChalkboardTeacher;
      case "student":
        return faCompass;
      default:
        return faCompass;
    }
  };

  return (
    <>
      {/* Mobile toggle button - visible on small screens */}
      <button 
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white md:hidden shadow-lg hover:bg-blue-700 transition-colors duration-300"
        onClick={handleToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="text-xl" />
      </button>

      {/* Overlay when sidebar is open on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" 
          onClick={handleToggleSidebar}
        ></div>
      )}

      {/* Sidebar - now with hover functionality */}
      <div 
        className={`fixed top-0 left-0 z-40 pt-16 bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ease-in-out transform ${
          isOpen || isHovering ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${isOpen || isHovering ? "w-64" : "md:w-20"} h-full shadow-xl`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        
        {/* Desktop toggle button */}
        <button 
          className="absolute -right-3 top-20 bg-blue-600 text-white p-1 rounded-full hidden md:flex items-center justify-center w-6 h-6 shadow-md hover:bg-blue-700 transition-colors"
          onClick={toggleSidebar}
        >
          <FontAwesomeIcon 
            icon={faChevronRight} 
            className={`text-xs transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`} 
          />
        </button>

        {/* Dashboard header - Dynamic based on role */}
        <div className="p-4 flex items-center justify-center md:justify-start space-x-3 border-b border-gray-700">
          <FontAwesomeIcon icon={getRoleIcon()} className="text-blue-400 text-xl" />
          <h2 className={`text-xl font-bold ${!isOpen && !isHovering && "md:hidden"}`}>
            {getDashboardTitle()}
          </h2>
        </div>

        {/* User info section */}
        <div className={`p-4 border-b border-gray-700 ${!isOpen && !isHovering && "md:hidden"}`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={getRoleIcon()} className="text-white text-sm" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user.username || "User"}</p>
              <p className="text-xs text-gray-400 capitalize">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div className="p-4">
          <ul className="space-y-2">
            {getRoleSpecificNavItems()}
            
            {/* Logout button - Available for all roles */}
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center p-3 rounded-lg hover:bg-red-600 transition-all duration-200 text-gray-300 hover:text-white hover:translate-x-1 group"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="text-lg text-red-400 group-hover:text-white" />
                <span className={`ml-3 ${!isOpen && !isHovering && "md:hidden"}`}>Logout</span>
                {!isOpen && !isHovering && (
                  <div className="absolute left-14 bg-red-600 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Logout
                  </div>
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default SideNavbar;