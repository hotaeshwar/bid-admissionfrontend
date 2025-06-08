import React, { useState, useEffect } from "react";
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
  faUsers,
  faCalendarAlt,
  faIdCard,
  faClock,
  faPlay,
  faDownload,
  faUserPlus,
  faHistory,
  faRefresh,
  faEye,
  faSpinner,
  faCopy,
  faShare,
  faEnvelope,
  faTimes
} from "@fortawesome/free-solid-svg-icons";

const TeacherDashboard = () => {
  // Get user data from localStorage (set during login)
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    
    if (user.access_token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.access_token}`;
    }
  }, [user]);

  // State variables
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState({
    topic: "",
    start_time: "",
    duration: 60
  });
  const [meetingResponse, setMeetingResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [participants, setParticipants] = useState({});
  const [recordings, setRecordings] = useState({});
  const [fetchingRecordings, setFetchingRecordings] = useState({});
  const [copySuccess, setCopySuccess] = useState({});

  const API_BASE_URL = "http://localhost:8000";

  // Load dashboard data on mount
  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (!user || !user.access_token) return;
      
      try {
        setDashboardLoading(true);
        setError("");
        
        const response = await axios.get(`${API_BASE_URL}/teacher/dashboard`, {
          headers: { 'Authorization': `Bearer ${user.access_token}` }
        });

        if (mounted && response.data.success) {
          setDashboardData(response.data.data);
        } else if (mounted) {
          setError("Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);
        if (mounted) {
          if (err.response?.status === 401) {
            localStorage.removeItem("user");
            window.location.href = "/login";
          } else {
            setError("Failed to load dashboard data. Please try refreshing.");
          }
        }
      } finally {
        if (mounted) setDashboardLoading(false);
      }
    };

    if (user && user.access_token) {
      loadData();
    }

    return () => { mounted = false; };
  }, []);

  // Functions
  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  const loadDashboardData = async () => {
    if (!user || !user.access_token) {
      setError("User not authenticated. Please login again.");
      return;
    }

    try {
      setDashboardLoading(true);
      setError("");
      
      const response = await axios.get(`${API_BASE_URL}/teacher/dashboard`, {
        headers: { 'Authorization': `Bearer ${user.access_token}` }
      });

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError("Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Dashboard loading error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else {
        setError("Failed to load dashboard data. Please try refreshing.");
      }
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeetingDetails({ ...meetingDetails, [name]: value });
    if (error) setError("");
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!user) {
      setError("User not authenticated. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const startDateTime = new Date(meetingDetails.start_time).toISOString();
      
      const requestData = {
        topic: meetingDetails.topic,
        start_time: startDateTime,
        duration: parseInt(meetingDetails.duration) || 60,
        student_ids: selectedStudents
      };

      const response = await axios.post(
        `${API_BASE_URL}/teacher/meetings`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setMeetingResponse(response.data.data);
        setIsModalOpen(false);
        setMeetingDetails({ topic: "", start_time: "", duration: 60 });
        setSelectedStudents([]);
        setShowStudentSelector(false);
        await loadDashboardData();
      } else {
        setError(response.data.message || "Failed to create meeting.");
      }
    } catch (err) {
      console.error("Meeting creation error:", err);
      
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 2000);
      } else if (err.response?.status === 403) {
        setError("You don't have permission to create meetings.");
      } else if (err.response?.status === 400) {
        setError(err.response.data.detail || "Invalid meeting data. Please check your input.");
      } else if (err.code === "ERR_NETWORK") {
        setError("Unable to connect to the server. Please check your internet connection.");
      } else {
        setError(err.response?.data?.detail || "An error occurred while creating the meeting.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getMeetingParticipants = async (meetingId) => {
    if (!user || !user.access_token) {
      setError("User not authenticated");
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/teacher/meetings/${meetingId}/participants`,
        { headers: { 'Authorization': `Bearer ${user.access_token}` } }
      );

      if (response.data.success) {
        setParticipants(prev => ({
          ...prev,
          [meetingId]: response.data.data.participants
        }));
      }
    } catch (err) {
      console.error("Error fetching participants:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else {
        setError("Failed to fetch participants");
      }
    }
  };

  const fetchMeetingRecordings = async (meetingId) => {
    if (!user || !user.access_token) {
      setError("User not authenticated");
      return;
    }

    try {
      setFetchingRecordings(prev => ({ ...prev, [meetingId]: true }));
      
      const response = await axios.post(
        `${API_BASE_URL}/teacher/meetings/${meetingId}/fetch-recordings`,
        {},
        { headers: { 'Authorization': `Bearer ${user.access_token}` } }
      );

      if (response.data.success) {
        setRecordings(prev => ({
          ...prev,
          [meetingId]: response.data.data.recordings_added
        }));
        await loadDashboardData();
      }
    } catch (err) {
      console.error("Error fetching recordings:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else {
        setError("Failed to fetch recordings");
      }
    } finally {
      setFetchingRecordings(prev => ({ ...prev, [meetingId]: false }));
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async (text, type, meetingId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(prev => ({ ...prev, [`${meetingId}-${type}`]: true }));
      setTimeout(() => {
        setCopySuccess(prev => ({ ...prev, [`${meetingId}-${type}`]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setError('Failed to copy to clipboard');
    }
  };

  // Generate share message for students
  const generateShareMessage = (meeting) => {
    const invitedStudentNames = selectedStudents.length > 0 && dashboardData?.students 
      ? dashboardData.students
          .filter(student => selectedStudents.includes(student.id))
          .map(student => student.username)
          .join(', ')
      : 'All Students';

    return `🎓 MEETING INVITATION

📚 Subject: ${meeting.topic}
👨‍🏫 Teacher: ${user.username || 'Teacher'} (ID: ${user.id})
📅 Date & Time: ${new Date(meeting.start_time).toLocaleString()}
⏰ Duration: ${meeting.duration} minutes
🆔 Meeting ID: ${meeting.zoom_meeting_id}

👥 Invited Students: ${invitedStudentNames}

🔗 JOIN MEETING:
${meeting.join_url}

📝 Instructions:
1. Click the join link 5-10 minutes before start time
2. Ensure you have a stable internet connection
3. Have your camera and microphone ready
4. Join with your real name for attendance

For any technical issues, contact your teacher.

---
Generated by TeacherHub System`;
  };

  const openShareModal = (meeting) => {
    setSelectedMeeting(meeting);
    setShareModalOpen(true);
  };

  const closeShareModal = () => {
    setSelectedMeeting(null);
    setShareModalOpen(false);
  };

  // WhatsApp sharing function
  const shareViaWhatsApp = (message) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // Email sharing function
  const shareViaEmail = (meeting, message) => {
    const subject = encodeURIComponent(`Meeting Invitation: ${meeting.topic}`);
    const body = encodeURIComponent(message);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(emailUrl);
  };

  // Return loading if no user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const displayName = user.username || "Teacher";
  const userCode = user.id || "N/A";
  const userAge = user.age ? `Age: ${user.age}` : "";
  const userState = user.state ? `State: ${user.state}` : "";
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SideNavbar role="teacher" onToggle={handleSidebarToggle} />

      <div className={`transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        {/* Top Navbar */}
        <nav className="fixed top-0 right-0 left-0 bg-white shadow-md z-10 w-full">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="bg-indigo-600 p-2 rounded-lg shadow-lg">
                  <FontAwesomeIcon icon={faGraduationCap} className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-lg font-bold text-gray-800 hidden sm:block">
                  TeacherHub
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-sm font-semibold text-gray-800">
                    Welcome, {displayName}!
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span className="font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                      {userCode}
                    </span>
                    {userAge && <span>• {userAge}</span>}
                    {userState && <span>• {userState}</span>}
                  </div>
                </div>
                <div className="sm:hidden flex flex-col items-end">
                  <p className="text-sm font-semibold text-gray-800">{displayName}</p>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    {userCode}
                  </span>
                </div>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-full shadow-md">
                  <span className="text-white font-bold text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-20 px-4 sm:px-6 lg:px-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto py-6">
            <div className="bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 overflow-hidden shadow-lg rounded-xl relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
              <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500"></div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-purple-500"></div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                    <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">
                      <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
                    </span>
                    Welcome, {displayName}!
                  </h1>
                  <button
                    onClick={loadDashboardData}
                    disabled={dashboardLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center"
                  >
                    <FontAwesomeIcon 
                      icon={faRefresh} 
                      className={`mr-2 ${dashboardLoading ? 'animate-spin' : ''}`} 
                    />
                    Refresh
                  </button>
                </div>
                
                {/* Teacher Info Card */}
                <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm mb-6">
                  <div className="flex items-center">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <FontAwesomeIcon icon={faGraduationCap} className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-indigo-700 flex items-center">
                            <FontAwesomeIcon icon={faIdCard} className="mr-2" />
                            Teacher ID:{" "}
                            <span className="font-mono font-bold bg-white bg-opacity-70 px-2 py-1 rounded-md border border-indigo-200 text-indigo-600 ml-2">
                              {userCode}
                            </span>
                          </p>
                        </div>
                        {user.email && (
                          <div>
                            <p className="text-sm text-indigo-600">Email: {user.email}</p>
                          </div>
                        )}
                        {userAge && (
                          <div>
                            <p className="text-sm text-indigo-600">{userAge}</p>
                          </div>
                        )}
                        {userState && (
                          <div>
                            <p className="text-sm text-indigo-600">{userState}</p>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-indigo-500 mt-2">Share your Teacher ID with students to connect</p>
                    </div>
                  </div>
                </div>

                {/* Create Meeting Button */}
                <div className="mb-6">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={loading}
                    className={`${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700'
                    } text-white px-6 py-3 rounded-lg transition duration-300 shadow-md flex items-center font-medium`}
                  >
                    <FontAwesomeIcon icon={faVideo} className="mr-2" />
                    {loading ? 'Creating...' : 'Create New Meeting'}
                  </button>
                </div>

                {/* Dashboard Loading */}
                {dashboardLoading && (
                  <div className="mb-6 bg-white bg-opacity-50 p-6 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin h-6 w-6 text-indigo-600 mr-3" />
                    <span className="text-indigo-600">Loading dashboard data...</span>
                  </div>
                )}

                {/* Students List */}
                {dashboardData && dashboardData.students && (
                  <div className="mb-6 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 p-6 rounded-xl border border-green-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FontAwesomeIcon icon={faUsers} className="mr-2 text-green-600" />
                      Available Students ({dashboardData.students.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dashboardData.students.map((student) => (
                        <div key={student.id} className="bg-white bg-opacity-60 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{student.username}</p>
                              <p className="text-xs text-gray-600">{student.email}</p>
                              <p className="text-xs text-gray-500">{student.state}</p>
                            </div>
                            <div className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                              {student.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meetings List */}
                {dashboardData && dashboardData.meetings && (
                  <div className="mb-6 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-6 rounded-xl border border-purple-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FontAwesomeIcon icon={faHistory} className="mr-2 text-purple-600" />
                      Your Meetings ({dashboardData.meetings.length})
                    </h3>
                    {dashboardData.meetings.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.meetings.map((meeting) => (
                          <div key={meeting.id} className="bg-white bg-opacity-70 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800 mb-2">{meeting.topic}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                                  <p><FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                                    Start: {new Date(meeting.start_time).toLocaleString()}
                                  </p>
                                  <p><FontAwesomeIcon icon={faClock} className="mr-1" />
                                    Duration: {meeting.duration} minutes
                                  </p>
                                  <p>Status: <span className={`font-medium ${
                                    meeting.status === 'scheduled' ? 'text-blue-600' : 
                                    meeting.status === 'started' ? 'text-green-600' : 'text-gray-600'
                                  }`}>{meeting.status}</span></p>
                                  <p>Meeting ID: <span className="font-mono text-indigo-600">{meeting.zoom_meeting_id}</span></p>
                                </div>
                                
                                {/* Meeting Action Buttons */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <a
                                    href={meeting.start_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md transition duration-300"
                                  >
                                    <FontAwesomeIcon icon={faPlay} className="mr-1" />
                                    Start Meeting
                                  </a>
                                  <button
                                    onClick={() => copyToClipboard(meeting.join_url, 'join', meeting.id)}
                                    className="inline-flex items-center text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md transition duration-300"
                                  >
                                    <FontAwesomeIcon icon={faCopy} className="mr-1" />
                                    {copySuccess[`${meeting.id}-join`] ? '✓ Copied!' : 'Copy Link'}
                                  </button>
                                  <button
                                    onClick={() => openShareModal(meeting)}
                                    className="inline-flex items-center text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md transition duration-300"
                                  >
                                    <FontAwesomeIcon icon={faShare} className="mr-1" />
                                    Share with Students
                                  </button>
                                  <button
                                    onClick={() => getMeetingParticipants(meeting.id)}
                                    className="inline-flex items-center text-xs font-medium text-white bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded-md transition duration-300"
                                  >
                                    <FontAwesomeIcon icon={faEye} className="mr-1" />
                                    View Participants
                                  </button>
                                  <button
                                    onClick={() => fetchMeetingRecordings(meeting.id)}
                                    disabled={fetchingRecordings[meeting.id]}
                                    className="inline-flex items-center text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-md transition duration-300 disabled:bg-gray-400"
                                  >
                                    <FontAwesomeIcon 
                                      icon={fetchingRecordings[meeting.id] ? faSpinner : faDownload} 
                                      className={`mr-1 ${fetchingRecordings[meeting.id] ? 'animate-spin' : ''}`} 
                                    />
                                    {fetchingRecordings[meeting.id] ? 'Fetching...' : 'Fetch Recordings'}
                                  </button>
                                </div>

                                {/* Show Participants if loaded */}
                                {participants[meeting.id] && (
                                  <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-2">
                                    <h5 className="font-medium text-green-800 mb-2">
                                      Participants ({participants[meeting.id].length})
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {participants[meeting.id].map((participant) => (
                                        <div key={participant.id} className="text-xs text-green-700">
                                          <span className="font-medium">{participant.username}</span>
                                          {participant.joined_at && (
                                            <span className="text-green-600 ml-2">
                                              (Joined: {new Date(participant.joined_at).toLocaleString()})
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Show Recording Status */}
                                {recordings[meeting.id] !== undefined && (
                                  <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
                                    <p className="text-xs text-purple-700">
                                      {recordings[meeting.id] > 0 
                                        ? `${recordings[meeting.id]} new recordings found and saved`
                                        : 'No new recordings found'
                                      }
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-4">No meetings created yet</p>
                    )}
                  </div>
                )}

                {/* Display Meeting Response */}
                {meetingResponse && (
                  <div className="mb-6 bg-gradient-to-r from-green-50 via-blue-50 to-green-50 p-6 rounded-xl border border-green-200 shadow-sm">
                    <div className="flex items-start">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <FontAwesomeIcon icon={faVideo} className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-green-700">
                          Meeting created successfully!
                        </p>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-green-600">
                          <p><FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />Topic: {meetingResponse.topic}</p>
                          <p><FontAwesomeIcon icon={faClock} className="mr-1" />Duration: {meetingResponse.duration || 60} minutes</p>
                          {meetingResponse.start_time && (
                            <p className="md:col-span-2">
                              <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                              Start Time: {new Date(meetingResponse.start_time).toLocaleString()}
                            </p>
                          )}
                          <p><FontAwesomeIcon icon={faUserPlus} className="mr-1" />
                            Students Invited: {meetingResponse.invited_students}
                          </p>
                        </div>
                        
                        {/* Host Link (start_url) */}
                        <div className="mt-4 mb-4 bg-white bg-opacity-60 p-3 rounded-lg border border-indigo-100">
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
                            <button
                              onClick={() => openShareModal(meetingResponse)}
                              className="ml-2 inline-flex items-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md transition duration-300"
                            >
                              Share with Students
                              <FontAwesomeIcon icon={faShare} className="ml-2 h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 bg-gradient-to-r from-red-50 via-pink-50 to-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
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
      </div>

      {/* Create Meeting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
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
                  Topic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="topic"
                  value={meetingDetails.topic}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
                  placeholder="Enter meeting topic"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={meetingDetails.start_time}
                  onChange={handleInputChange}
                  min={minDateTime}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <select
                  name="duration"
                  value={meetingDetails.duration}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
                  disabled={loading}
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              {/* Student Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Invite Students (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowStudentSelector(!showStudentSelector)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {showStudentSelector ? 'Hide Students' : 'Select Students'}
                  </button>
                </div>
                
                {showStudentSelector && dashboardData && dashboardData.students && (
                  <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                    <div className="space-y-2">
                      {dashboardData.students.map((student) => (
                        <label key={student.id} className="flex items-center space-x-3 cursor-pointer hover:bg-white hover:rounded-md hover:p-2 transition duration-200">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleStudentSelection(student.id)}
                            className="form-checkbox h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            disabled={loading}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">{student.username}</span>
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                {student.id.substring(0, 8)}...
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {student.email} • {student.state}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {selectedStudents.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-sm text-indigo-600 font-medium">
                          Selected: {selectedStudents.length} student(s)
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedStudents([]);
                    setShowStudentSelector(false);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300 font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded-lg transition duration-300 shadow-md font-medium ${
                    loading
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700'
                  }`}
                >
                  {loading ? 'Creating...' : 'Create Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Meeting Modal */}
      {shareModalOpen && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-30 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <FontAwesomeIcon icon={faShare} className="text-green-600 mr-2" />
                Share Meeting: {selectedMeeting.topic}
              </h3>
              <button
                onClick={closeShareModal}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            {/* Meeting Details Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Meeting Details:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p><span className="font-medium">Topic:</span> {selectedMeeting.topic}</p>
                <p><span className="font-medium">Date:</span> {new Date(selectedMeeting.start_time).toLocaleDateString()}</p>
                <p><span className="font-medium">Time:</span> {new Date(selectedMeeting.start_time).toLocaleTimeString()}</p>
                <p><span className="font-medium">Duration:</span> {selectedMeeting.duration} minutes</p>
                <p><span className="font-medium">Meeting ID:</span> <span className="font-mono text-indigo-600">{selectedMeeting.zoom_meeting_id}</span></p>
                <p><span className="font-medium">Status:</span> <span className="capitalize text-green-600">{selectedMeeting.status}</span></p>
              </div>
            </div>

            {/* Quick Share Options */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Quick Share Options:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => copyToClipboard(selectedMeeting.join_url, 'share-link', selectedMeeting.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition duration-300 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faCopy} className="mr-2" />
                  {copySuccess[`${selectedMeeting.id}-share-link`] ? '✓ Copied!' : 'Copy Join Link'}
                </button>
                
                <button
                  onClick={() => shareViaWhatsApp(generateShareMessage(selectedMeeting))}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition duration-300 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faShare} className="mr-2" />
                  Share via WhatsApp
                </button>
                
                <button
                  onClick={() => shareViaEmail(selectedMeeting, generateShareMessage(selectedMeeting))}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition duration-300 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  Share via Email
                </button>
              </div>
            </div>

            {/* Full Invitation Message */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Complete Invitation Message:</h4>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {generateShareMessage(selectedMeeting)}
                </pre>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => copyToClipboard(generateShareMessage(selectedMeeting), 'full-message', selectedMeeting.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center"
                >
                  <FontAwesomeIcon icon={faCopy} className="mr-2" />
                  {copySuccess[`${selectedMeeting.id}-full-message`] ? '✓ Copied Full Message!' : 'Copy Full Message'}
                </button>
              </div>
            </div>

            {/* Instructions for Teacher */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">📋 Sharing Instructions:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use "Copy Join Link" for quick sharing in group chats</li>
                <li>• Use "Copy Full Message" for detailed invitations with all info</li>
                <li>• WhatsApp button opens your WhatsApp with the message ready</li>
                <li>• Email button opens your default email client</li>
                <li>• Students can join 5-10 minutes before the scheduled time</li>
                <li>• Make sure to start the meeting using your "Start Meeting" link</li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeShareModal}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;