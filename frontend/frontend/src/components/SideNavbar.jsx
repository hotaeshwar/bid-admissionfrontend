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
  faHome
} from "@fortawesome/free-solid-svg-icons";

const SideNavbar = ({ role = "user", onToggle }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

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
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    setIsHovering(false);
  };

  // Safely get role with fallback
  const safeRole = role || "user";
  const isStudent = safeRole.toLowerCase() === "student";
  
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

        {/* Dashboard header - replaced tachometer with compass */}
        <div className="p-4 flex items-center justify-center md:justify-start space-x-3 border-b border-gray-700">
          <FontAwesomeIcon icon={faCompass} className="text-blue-400 text-xl" />
          <h2 className={`text-xl font-bold ${!isOpen && !isHovering && "md:hidden"}`}>
            {safeRole.charAt(0).toUpperCase() + safeRole.slice(1)} Dashboard
          </h2>
        </div>

        {/* Nav items */}
        <div className="p-4">
          <ul className="space-y-2">
            {/* Dashboard link - Updated to always use /student-dashboard */}
            <li>
              <Link
                to="/student-dashboard"
                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-all duration-200 text-gray-300 hover:text-white hover:translate-x-1 group"
              >
                <FontAwesomeIcon icon={faHome} className="text-lg text-gray-400 group-hover:text-white" />
                <span className={`ml-3 ${!isOpen && !isHovering && "md:hidden"}`}>Dashboard</span>
              </Link>
            </li>
            
            {/* Aptitude Quiz Link - Only for students */}
            {isStudent && (
              <li>
                <Link
                  to="/aptitude-quiz"
                  className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-all duration-200 text-gray-300 hover:text-white hover:translate-x-1 group relative"
                >
                  <FontAwesomeIcon icon={faBrain} className="text-lg text-blue-400 group-hover:text-white" />
                  <span className={`ml-3 ${!isOpen && !isHovering && "md:hidden"}`}>Aptitude Quiz</span>
                  {!isOpen && !isHovering && (
                    <div className="absolute left-14 bg-blue-600 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Aptitude Quiz
                    </div>
                  )}
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    New
                  </span>
                </Link>
              </li>
            )}
            
            {/* Logout button */}
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