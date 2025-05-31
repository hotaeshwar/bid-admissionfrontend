import React, { useState } from "react";
import SideNavbar from "./SideNavbar";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faGraduationCap, 
  faVideo, 
  faExternalLinkAlt,
  faExclamationCircle,
  faUserShield,
  faUsers
} from "@fortawesome/free-solid-svg-icons";

const TeacherDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState({
    topic: "",
    start_time: "",
  });
  const [meetingResponse, setMeetingResponse] = useState(null);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeetingDetails({ ...meetingDetails, [name]: value });
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8000/auth/create-meeting/",
        {
          teacher_id: user.unique_code,
          topic: meetingDetails.topic,
          start_time: meetingDetails.start_time,
        }
      );

      if (response.data.success) {
        setMeetingResponse(response.data.data);
        setIsModalOpen(false);
      } else {
        setError(response.data.message || "Failed to create meeting.");
      }
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        setError("Unable to connect to the server. Please check your internet connection.");
      } else {
        setError("An error occurred while creating the meeting.");
      }
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Fixed Top Navbar - Modernized */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-lg">
                <FontAwesomeIcon 
                  icon={faGraduationCap} 
                  className="h-6 w-6 text-white" 
                />
              </div>
              <span className="ml-3 text-lg font-bold text-gray-800 hidden sm:block">
                TeacherHub
              </span>
            </div>

            {/* User Info - Enhanced Responsive Layout */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-semibold text-gray-800">
                  Welcome, {user.first_name}!
                </p>
                <div className="flex items-center">
                  <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                    {user.unique_code}
                  </span>
                </div>
              </div>
              <div className="sm:hidden flex flex-col items-end">
                <p className="text-sm font-semibold text-gray-800">
                  {user.first_name}
                </p>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  {user.unique_code}
                </span>
              </div>
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-full shadow-md">
                <FontAwesomeIcon
                  icon={faUser}
                  className="h-5 w-5 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Side Navigation - Fixed positioning to align with top navbar */}
      <div className="fixed left-0 top-16 h-full z-10">
        <SideNavbar />
      </div>

      {/* Main Content with padding for fixed navbar and sidebar */}
      <main className="pt-20 sm:ml-64 px-4 sm:px-6 lg:px-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto py-6">
          {/* Tricolor main card - from blue to purple to indigo */}
          <div className="bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 overflow-hidden shadow-lg rounded-xl relative">
            {/* Decorative colored bands */}
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
            <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500"></div>
            <div className="absolute bottom-0 left-0 w-full h-2 bg-purple-500"></div>
            
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">
                  <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
                </span>
                Welcome, {user.first_name}!
              </h1>
              
              {/* Teacher Code Card - Tricolor theme */}
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <FontAwesomeIcon icon={faGraduationCap} className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-indigo-700">
                      Your unique code:{" "}
                      <span className="font-mono font-bold bg-white bg-opacity-70 px-2 py-1 rounded-md border border-indigo-200 text-indigo-600 ml-2">
                        {user.unique_code}
                      </span>
                    </p>
                    <p className="text-xs text-indigo-500 mt-1">Share this code with your students to connect</p>
                  </div>
                </div>
              </div>

              {/* Create Meeting Button - Tricolor gradient */}
              <div className="mt-6">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition duration-300 shadow-md flex items-center font-medium"
                >
                  <FontAwesomeIcon icon={faVideo} className="mr-2" />
                  Create Meeting
                </button>
              </div>

              {/* Display Meeting Response - Tricolor theme - MODIFIED to show both URLs */}
              {meetingResponse && (
                <div className="mt-6 bg-gradient-to-r from-green-50 via-blue-50 to-green-50 p-6 rounded-xl border border-green-200 shadow-sm">
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FontAwesomeIcon icon={faVideo} className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-green-700">
                        Meeting created successfully!
                      </p>
                      <p className="text-xs text-green-600 mt-1 mb-4">
                        Topic: {meetingResponse.topic}
                      </p>
                      
                      {/* Host Link (start_url) */}
                      <div className="mb-4 bg-white bg-opacity-60 p-3 rounded-lg border border-indigo-100">
                        <div className="flex items-center mb-2">
                          <FontAwesomeIcon icon={faUserShield} className="text-indigo-600 mr-2" />
                          <p className="text-sm font-medium text-indigo-800">Host Link (for you):</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="truncate flex-1 text-xs text-gray-600">
                            {meetingResponse.start_url?.substring(0, 45)}...
                          </div>
                          <a
                            href={meetingResponse.start_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-flex items-center text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md transition duration-300"
                          >
                            Start Meeting
                            <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 h-3 w-3" />
                          </a>
                        </div>
                      </div>
                      
                      {/* Participant Link (join_url) */}
                      <div className="bg-white bg-opacity-60 p-3 rounded-lg border border-blue-100">
                        <div className="flex items-center mb-2">
                          <FontAwesomeIcon icon={faUsers} className="text-blue-600 mr-2" />
                          <p className="text-sm font-medium text-blue-800">Student Link (to share):</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="truncate flex-1 text-xs text-gray-600">
                            {meetingResponse.join_url?.substring(0, 45)}...
                          </div>
                          <a
                            href={meetingResponse.join_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-flex items-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md transition duration-300"
                          >
                            Join Meeting
                            <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message - Tricolor theme */}
              {error && (
                <div className="mt-6 bg-gradient-to-r from-red-50 via-pink-50 to-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="ml-3 text-sm font-medium text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Meeting Modal - Tricolor theme */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 rounded-xl w-full max-w-md shadow-2xl relative">
            {/* Decorative colored bands for modal */}
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
            <div className="absolute top-0 right-0 w-1 h-full bg-indigo-400"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-400"></div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faVideo} className="text-indigo-600 mr-2" />
              Create New Meeting
            </h2>
            <form onSubmit={handleCreateMeeting}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  name="topic"
                  value={meetingDetails.topic}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
                  placeholder="Enter meeting topic"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={meetingDetails.start_time}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition duration-300 shadow-md font-medium"
                >
                  Create Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;