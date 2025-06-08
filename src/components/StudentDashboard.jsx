import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import SideNavbar from "./SideNavbar";

// Test Modal Component
const TestModal = ({ isOpen, onClose, testData, onSubmitTest }) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(testData?.duration_minutes * 60 || 3600); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!isOpen || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeRemaining]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && testData) {
      setAnswers({});
      setCurrentQuestion(0);
      setTimeRemaining(testData.duration_minutes * 60);
      setIsSubmitting(false);
    }
  }, [isOpen, testData]);

  if (!isOpen || !testData) return null;

  const questions = testData.questions || [];
  const totalQuestions = questions.length;
  const currentQ = questions[currentQuestion];

  // Format time remaining
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Navigate questions
  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Submit test
  const handleSubmitTest = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Format answers for API
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        question_id: parseInt(questionId),
        selected_answer: selectedAnswer,
        time_taken: Math.floor(Math.random() * 60) + 30 // Mock time taken per question
      }));

      // Call the submit function
      await onSubmitTest({
        answers: formattedAnswers
      });

      onClose();
    } catch (error) {
      console.error('Test submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get progress
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Aptitude Test</h2>
              <p className="text-blue-100">Question {currentQuestion + 1} of {totalQuestions}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono">{formatTime(timeRemaining)}</div>
              <div className="text-blue-100 text-sm">Time Remaining</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="bg-blue-500 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-blue-100 text-sm mt-1">
              {answeredCount} of {totalQuestions} questions answered
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[60vh]">
          {/* Questions Navigation Sidebar */}
          <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-700 mb-3">Questions</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(index)}
                  className={`w-10 h-10 rounded text-sm font-medium transition-colors ${
                    index === currentQuestion
                      ? 'bg-blue-600 text-white'
                      : answers[q.id]
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <div className="mt-4 text-xs text-gray-600">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                Answered
              </div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                Current
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-200 rounded mr-2"></div>
                Not Answered
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {currentQ && (
              <>
                <div className="mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {currentQ.subject} - {currentQ.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  {currentQ.question}
                </h3>

                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <label 
                      key={option}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        answers[currentQ.id] === option 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQ.id}`}
                        value={option}
                        checked={answers[currentQ.id] === option}
                        onChange={() => handleAnswerSelect(currentQ.id, option)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        answers[currentQ.id] === option 
                          ? 'border-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {answers[currentQ.id] === option && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-700 mr-2">{option}.</span>
                      <span className="text-gray-900">{currentQ[`option_${option.toLowerCase()}`]}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={nextQuestion}
                disabled={currentQuestion === totalQuestions - 1}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitting || answeredCount === 0}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Test ({answeredCount}/{totalQuestions})</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  // API base URL
  const API_BASE_URL = "http://127.0.0.1:8000";

  // Memoize user data to prevent unnecessary re-renders
  const user = useMemo(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  }, []);

  // Get token from localStorage
  const token = useMemo(() => {
    return localStorage.getItem("access_token");
  }, []);

  // State management
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  
  // Test Modal States
  const [showTestModal, setShowTestModal] = useState(false);
  const [currentTestData, setCurrentTestData] = useState(null);

  // Setup axios defaults with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  // Redirect if no user or token
  useEffect(() => {
    if (!user || !token) {
      window.location.href = "/login";
      return;
    }
  }, [user, token]);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !token) return;

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_BASE_URL}/student/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError(response.data.message || "Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        
        if (err.response?.status === 401) {
          // Token expired or invalid - redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        } else if (err.response?.status === 403) {
          setError("Access denied. Student role required.");
        } else if (err.response?.data?.detail) {
          setError(err.response.data.detail);
        } else {
          setError("Failed to load dashboard. Please check your connection.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token]);

  // Function to start aptitude test
  const startAptitudeTest = async () => {
    try {
      setTestLoading(true);
      setError("");

      const response = await axios.get(`${API_BASE_URL}/student/test`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Set test data and show modal
        setCurrentTestData(response.data.data);
        setShowTestModal(true);
      } else {
        setError(response.data.message || "Failed to start test");
      }
    } catch (err) {
      console.error("Test start error:", err);
      
      if (err.response?.status === 400) {
        setError(err.response.data.detail || "You have already taken the aptitude test");
      } else if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else {
        setError("Failed to start test. Please try again.");
      }
    } finally {
      setTestLoading(false);
    }
  };

  // Function to submit test
  const submitTest = async (testSubmission) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/student/test/submit`, testSubmission, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alert("Test submitted successfully! Your results are under admin review.");
        // Refresh dashboard data to show updated test status
        window.location.reload();
      } else {
        setError(response.data.message || "Failed to submit test");
      }
    } catch (err) {
      console.error("Test submission error:", err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to submit test. Please try again.");
      }
    }
  };

  // Function to join meeting
  const joinMeeting = (meetingUrl) => {
    if (meetingUrl) {
      window.open(meetingUrl, '_blank');
    }
  };

  // Function to handle sidebar toggle
  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  // Function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Function to get status badge
  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'likely_pass': 'bg-green-100 text-green-800',
      'borderline': 'bg-yellow-100 text-yellow-800',
      'likely_fail': 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  // Return loading or login redirect if no user
  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Extract user display info
  const displayName = user.username || "Student";
  const userCode = user.id || "N/A";
  const userAge = user.age ? `Age: ${user.age}` : "";
  const userState = user.state ? `State: ${user.state}` : "";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Navigation - Now using imported component */}
      <SideNavbar role="student" onToggle={handleSidebarToggle} />

      {/* Test Modal */}
      <TestModal 
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        testData={currentTestData}
        onSubmitTest={submitTest}
      />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        {/* Fixed Top Navbar */}
        <nav className="fixed top-0 right-0 left-0 bg-white shadow-sm z-10" style={{left: sidebarOpen ? '256px' : '80px'}}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-blue-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="ml-2 text-lg font-semibold text-gray-800 hidden sm:block">StudentHub</span>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-sm font-medium text-gray-800">Welcome, {displayName}!</p>
                  <div className="flex space-x-2 text-xs text-gray-500">
                    <span>Code: {userCode}</span>
                    {userAge && <span>• {userAge}</span>}
                    {userState && <span>• {userState}</span>}
                  </div>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-20 px-4 sm:px-6 lg:px-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 border-l-4 border-red-500 bg-red-50 rounded-md">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto py-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-500">Loading dashboard...</p>
              </div>
            ) : dashboardData ? (
              <>
                {/* Welcome Card */}
                <div className="bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 overflow-hidden shadow-sm rounded-lg relative mb-6">
                  <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                  <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500"></div>
                  <div className="absolute bottom-0 left-0 w-full h-2 bg-purple-500"></div>
                  
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-800">Welcome, {dashboardData.user.username}!</h1>
                        <div className="bg-white bg-opacity-70 mt-2 p-3 inline-block rounded-lg border border-blue-100">
                          <div className="text-sm text-blue-700 space-y-1">
                            <p>ID: <span className="font-mono font-medium">{dashboardData.user.id}</span></p>
                            <p>Email: {dashboardData.user.email}</p>
                            {dashboardData.user.age && <p>Age: {dashboardData.user.age}</p>}
                            {dashboardData.user.state && <p>State: {dashboardData.user.state}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <div className="h-16 w-16 rounded-full border-4 border-white shadow-md bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {dashboardData.user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Status Card */}
                <div className="bg-white shadow rounded-lg mb-6">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Aptitude Test Status</h2>
                    
                    {dashboardData.test_status.can_take_test ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-green-800">Ready to Take Test</h3>
                            <p className="text-green-600 mt-1">
                              Duration: {dashboardData.test_status.test_config.duration_minutes} minutes | 
                              Questions: {dashboardData.test_status.test_config.total_questions} | 
                              Passing Score: {dashboardData.test_status.test_config.passing_score}%
                            </p>
                          </div>
                          <button
                            onClick={startAptitudeTest}
                            disabled={testLoading}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {testLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>Loading...</span>
                              </>
                            ) : (
                              <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1M10 5l2-2 2 2" />
                                </svg>
                                <span>Start Test</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-blue-800">Test Completed</h3>
                        <p className="text-blue-600 mt-1">You have already taken the aptitude test. Results are shown below.</p>
                      </div>
                    )}

                    {/* Test Results */}
                    {dashboardData.test_result && (
                      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Your Test Results</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{dashboardData.test_result.correct_answers}</div>
                            <div className="text-sm text-gray-500">Correct</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">{dashboardData.test_result.total_questions}</div>
                            <div className="text-sm text-gray-500">Total</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Admin Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(dashboardData.test_result.admin_approval)}`}>
                              {dashboardData.test_result.final_status}
                            </span>
                          </div>
                          {dashboardData.test_result.admin_comments && (
                            <div className="mt-2 text-sm text-gray-600">
                              <strong>Comments:</strong> {dashboardData.test_result.admin_comments}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Meetings Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upcoming Meetings */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Meetings</h2>
                      {dashboardData.meetings.upcoming.length > 0 ? (
                        <div className="space-y-3">
                          {dashboardData.meetings.upcoming.map((meeting) => (
                            <div key={meeting.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium text-gray-900">{meeting.topic}</h3>
                                  <p className="text-sm text-gray-500">Host: {meeting.host_name} ({meeting.host_type})</p>
                                  <p className="text-sm text-gray-500">Start: {formatDate(meeting.start_time)}</p>
                                  <p className="text-sm text-gray-500">Duration: {meeting.duration} minutes</p>
                                </div>
                                <button
                                  onClick={() => joinMeeting(meeting.join_url)}
                                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                                >
                                  Join Meeting
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No upcoming meetings</p>
                      )}
                    </div>
                  </div>

                  {/* Past Meetings with Recordings */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Meetings & Recordings</h2>
                      {dashboardData.meetings.past_with_recordings.length > 0 ? (
                        <div className="space-y-3">
                          {dashboardData.meetings.past_with_recordings.map((meeting) => (
                            <div key={meeting.id} className="border border-gray-200 rounded-lg p-4">
                              <h3 className="font-medium text-gray-900">{meeting.topic}</h3>
                              <p className="text-sm text-gray-500">Host: {meeting.host_name} ({meeting.host_type})</p>
                              <p className="text-sm text-gray-500">Date: {formatDate(meeting.start_time)}</p>
                              {meeting.has_recording ? (
                                <button
                                  onClick={() => window.open(meeting.recording_url, '_blank')}
                                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                >
                                  View Recording
                                </button>
                              ) : (
                                <span className="mt-2 inline-block text-xs text-gray-500">No recording available</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No past meetings</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Failed to load dashboard data</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;