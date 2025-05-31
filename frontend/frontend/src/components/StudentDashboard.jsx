import React, { useState, useEffect } from "react";
import SideNavbar from "./SideNavbar";

const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {
    id: "123",
    first_name: "Student",
    unique_code: "STU12345"
  };
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSubmission, setNewSubmission] = useState(null);
  const [showSubmissionAlert, setShowSubmissionAlert] = useState(false);

  // Function to receive sidebar state from SideNavbar
  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  // Load stored aptitude test results and check for new submission
  useEffect(() => {
    const loadQuizResults = async () => {
      try {
        setLoading(true);
        
        // Get stored aptitude test results
        const storedResults = localStorage.getItem('quizResults');
        let results = storedResults ? JSON.parse(storedResults) : [];
        
        // Check if there's a new aptitude test submission in localStorage
        const pendingSubmission = localStorage.getItem('pendingQuizSubmission');
        
        if (pendingSubmission) {
          // Process the new submission
          const submission = JSON.parse(pendingSubmission);
          
          // Add submission to results
          results = [submission, ...results];
          
          // Save updated results to localStorage
          localStorage.setItem('quizResults', JSON.stringify(results));
          
          // Clear the pending submission
          localStorage.removeItem('pendingQuizSubmission');
          
          // Set the new submission for notification
          setNewSubmission(submission);
          setShowSubmissionAlert(true);
          
          // Auto-hide the alert after 5 seconds
          setTimeout(() => {
            setShowSubmissionAlert(false);
          }, 5000);
        }
        
        setQuizResults(results);
      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };

    loadQuizResults();
    
    // Set up event listener for storage changes (simulating aptitude test submission)
    const handleStorageChange = (e) => {
      if (e.key === 'pendingQuizSubmission') {
        loadQuizResults();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // FIXED: Simulate aptitude test submission with correct quiz name
  const simulateQuizSubmission = () => {
    // Generate realistic mock score and status
    const mockScore = Math.floor(Math.random() * 100); // Random score 0-100
    
    const submission = {
      id: Date.now().toString(),
      quiz_name: "Aptitude Quiz", // ✅ FIXED: Changed from random quiz names to "Aptitude Quiz"
      score: mockScore,
      completed_date: new Date().toISOString(),
      candidate_name: user.first_name,
      student_id: user.id,
      student_code: user.unique_code
    };
    
    // Store the submission in localStorage
    localStorage.setItem('pendingQuizSubmission', JSON.stringify(submission));
    
    // Trigger storage event (since we're in the same tab)
    window.dispatchEvent(new Event('storage'));
  };

  // Determine pass/fail status based on score
  const getStatus = (score) => {
    if (score >= 70) return { label: 'Passed', class: 'bg-green-100 text-green-800' };
    if (score >= 50) return { label: 'Average', class: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Failed', class: 'bg-red-100 text-red-800' };
  };

  // Clear all results (for testing)
  const handleClearResults = () => {
    if (window.confirm("Are you sure you want to clear all aptitude test results?")) {
      localStorage.setItem('quizResults', JSON.stringify([]));
      setQuizResults([]);
      
      // Also clear any individual quiz result entries
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('quizResult_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Trigger storage event to update UI
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Navigation */}
      <SideNavbar role="student" onToggle={handleSidebarToggle} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        {/* Fixed Top Navbar - Fixed the conflicting CSS properties here */}
        <nav className="fixed top-0 right-0 left-0 bg-white shadow-sm z-10 w-full">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo with SVG person icon */}
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-blue-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                  />
                </svg>
                <span className="ml-2 text-lg font-semibold text-gray-800 hidden sm:block">StudentHub</span>
              </div>

              {/* User Info - responsive layout */}
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-sm font-medium text-gray-800">Welcome, {user.first_name}!</p>
                  <p className="text-xs text-gray-500">Code: {user.unique_code}</p>
                </div>
                <div className="sm:hidden flex flex-col items-end">
                  <p className="text-sm font-medium text-gray-800">{user.first_name}</p>
                  <p className="text-xs text-gray-500">{user.unique_code}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-blue-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content with padding for fixed navbar */}
        <main className="pt-20 px-4 sm:px-6 lg:px-8">
          {/* New Aptitude Test Submission Alert */}
          {showSubmissionAlert && newSubmission && (
            <div className={`mb-4 p-4 border-l-4 rounded-md shadow-sm ${
              newSubmission.score >= 70 
                ? 'bg-green-50 border-green-500' 
                : newSubmission.score >= 50 
                  ? 'bg-yellow-50 border-yellow-500' 
                  : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-start">
                <div className={`flex-shrink-0 pt-0.5 ${
                  newSubmission.score >= 70 
                    ? 'text-green-600' 
                    : newSubmission.score >= 50 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                }`}>
                  {newSubmission.score >= 70 ? (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${
                    newSubmission.score >= 70 
                      ? 'text-green-800' 
                      : newSubmission.score >= 50 
                        ? 'text-yellow-800' 
                        : 'text-red-800'
                  }`}>
                    New Aptitude Test Result: {newSubmission.quiz_name}
                  </h3>
                  <div className="mt-2 text-sm">
                    <p className={
                      newSubmission.score >= 70 
                        ? 'text-green-700' 
                        : newSubmission.score >= 50 
                          ? 'text-yellow-700' 
                          : 'text-red-700'
                    }>
                      You scored {newSubmission.score}% - {getStatus(newSubmission.score).label}
                    </p>
                  </div>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button 
                      onClick={() => setShowSubmissionAlert(false)}
                      className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="max-w-7xl mx-auto py-6">
            {/* Tricolor background card */}
            <div className="bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 overflow-hidden shadow-sm rounded-lg relative">
              {/* Decorative colored bands */}
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
              <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500"></div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-purple-500"></div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.first_name}!</h1>
                    <div className="bg-white bg-opacity-70 mt-2 p-3 inline-block rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-700">Your unique code: <span className="font-mono font-medium">{user.unique_code}</span></p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className="relative">
                      <img
                        src="http://localhost:5173/src/assets/images/bid.png"
                        alt="Student"
                        className="h-15 w-15 rounded-full border-4 border-white shadow-md"
                      />
                      <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-white">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 text-white" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Aptitude Test Results Section with tricolor theme */}
                <div className="mt-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Aptitude Test Results</h2>
                    <div className="flex space-x-2">
                      {/* Demo buttons - would be removed in production */}
                      <button 
                        onClick={simulateQuizSubmission}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                      >
                        Simulate Aptitude Test Submission
                      </button>
                      {quizResults.length > 0 && (
                        <button 
                          onClick={handleClearResults}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 bg-gradient-to-r from-blue-50 via-white to-indigo-50 shadow overflow-hidden rounded-md">
                    {loading ? (
                      <div className="p-6 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-2 text-gray-500">Loading aptitude test results...</p>
                      </div>
                    ) : quizResults.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aptitude Test</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {quizResults.map((result) => {
                              const status = getStatus(result.score);
                              return (
                                <tr key={result.id} className={result.id === newSubmission?.id ? "bg-blue-50" : ""}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{result.quiz_name}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{new Date(result.completed_date).toLocaleDateString()}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{result.score}%</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.class}`}>
                                      {status.label}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-12 w-12 text-gray-400 mx-auto" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" 
                          />
                        </svg>
                        <p className="mt-2 text-gray-500">No aptitude test results available yet.</p>
                        <p className="text-sm text-gray-500">Results will appear here automatically after completing an aptitude test.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
