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
  faTimes,
  faClipboardList,
  faPercent,
  faSearch,
  faFilter,
  faTrophy,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faSort,
  faFilePdf,
  faChartBar,
  faCertificate,
  faAward,
  faStar,
  faCalendarCheck
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced Quiz Results Component with PDF and Auto-cleanup
const QuizResults = () => {
  const [quizResults, setQuizResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBy, setFilterBy] = useState('all');
  const [loading, setLoading] = useState(true);

  // Auto-clear old data on component mount
  useEffect(() => {
    clearOldData();
  }, []);

  // Load quiz results from localStorage
  useEffect(() => {
    loadQuizResults();
    
    // Listen for storage events to update in real-time
    const handleStorageChange = () => {
      loadQuizResults();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('quizSubmitted', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('quizSubmitted', handleStorageChange);
    };
  }, []);

  // Filter and sort results when dependencies change
  useEffect(() => {
    filterAndSortResults();
  }, [quizResults, searchTerm, sortBy, sortOrder, filterBy]);

  // Auto-clear old meetings and quiz results (older than 30 days)
  const clearOldData = () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Clear old quiz results
      const allResults = JSON.parse(localStorage.getItem('allQuizResults') || '[]');
      const recentResults = allResults.filter(result => {
        const resultDate = new Date(result.completed_date);
        return resultDate > thirtyDaysAgo;
      });

      if (recentResults.length !== allResults.length) {
        localStorage.setItem('allQuizResults', JSON.stringify(recentResults));
        console.log(`Auto-cleared ${allResults.length - recentResults.length} old quiz results`);
      }

      // Clear old meeting data if exists
      const meetingData = JSON.parse(localStorage.getItem('meetingData') || '[]');
      const recentMeetings = meetingData.filter(meeting => {
        const meetingDate = new Date(meeting.date || meeting.start_time || meeting.created_at);
        return meetingDate > thirtyDaysAgo;
      });

      if (recentMeetings.length !== meetingData.length) {
        localStorage.setItem('meetingData', JSON.stringify(recentMeetings));
        console.log(`Auto-cleared ${meetingData.length - recentMeetings.length} old meetings`);
      }

    } catch (error) {
      console.error('Error clearing old data:', error);
    }
  };

  const loadQuizResults = () => {
    try {
      setLoading(true);
      const allResults = JSON.parse(localStorage.getItem('allQuizResults') || '[]');
      console.log('Loaded quiz results:', allResults);
      setQuizResults(allResults);
    } catch (error) {
      console.error('Error loading quiz results:', error);
      setQuizResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortResults = () => {
    let filtered = [...quizResults];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.student_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply performance filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(result => {
        const percentage = result.score_percentage;
        switch (filterBy) {
          case 'excellent':
            return percentage >= 80;
          case 'good':
            return percentage >= 60 && percentage < 80;
          case 'average':
            return percentage >= 40 && percentage < 60;
          case 'poor':
            return percentage < 40;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.student_name.toLowerCase();
          bValue = b.student_name.toLowerCase();
          break;
        case 'id':
          aValue = a.student_id.toLowerCase();
          bValue = b.student_id.toLowerCase();
          break;
        case 'score':
          aValue = a.score_percentage;
          bValue = b.score_percentage;
          break;
        case 'date':
        default:
          aValue = new Date(a.completed_date);
          bValue = new Date(b.completed_date);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredResults(filtered);
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getPerformanceLabel = (percentage) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Average';
    return 'Needs Improvement';
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 30) return 'D';
    return 'F';
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setShowDetails(true);
  };

  // Generate PDF Marksheet
  // Professional PDF Marksheet with Corporate Color Scheme
const generatePDFMarksheet = (result) => {
  const grade = getGrade(result.score_percentage);
  const performance = getPerformanceLabel(result.score_percentage);
  const completionDate = new Date(result.completed_date);
  
  // Create HTML content for the marksheet with professional colors
   const marksheetHTML = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Academic Marksheet - ${result.student_name}</title>
      <style>
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
          
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.4;
              color: #1a1a1a;
              background: #fff;
              font-size: 12px;
          }
          
          .marksheet {
              max-width: 800px;
              margin: 15px auto;
              padding: 25px;
              border: 2px solid #003366;
              border-radius: 8px;
              background: linear-gradient(135deg, #fafafa 0%, #ffffff 50%, #f8f8f8 100%);
              position: relative;
              min-height: 90vh;
              display: flex;
              flex-direction: column;
          }
          
          .marksheet::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, #003366, #0066cc, #004d99);
          }
          
          .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #003366;
              padding-bottom: 15px;
              position: relative;
          }
          
          .header::after {
              content: '';
              position: absolute;
              bottom: -2px;
              left: 50%;
              transform: translateX(-50%);
              width: 80px;
              height: 2px;
              background: linear-gradient(90deg, #0066cc, #0080ff);
          }
          
          .institution {
              font-size: 22px;
              font-weight: bold;
              margin-bottom: 4px;
              color: #003366;
              letter-spacing: 0.5px;
          }
          
          .bid-logo {
              background: linear-gradient(45deg, #003366, #0066cc);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              font-weight: 900;
              text-shadow: none;
          }
          
          .subtitle {
              font-size: 13px;
              color: #004d99;
              margin-bottom: 8px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.3px;
          }
          
          .certificate-title {
              font-size: 18px;
              font-weight: bold;
              color: #0066cc;
              margin: 10px 0;
              text-decoration: underline;
              text-decoration-color: #003366;
              text-underline-offset: 3px;
          }
          
          .student-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin: 20px 0;
              padding: 18px;
              background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
              border-radius: 6px;
              border: 1px solid #cccccc;
              box-shadow: 0 2px 6px rgba(0, 51, 102, 0.08);
          }
          
          .info-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 6px 0;
              border-bottom: 1px solid #eeeeee;
              font-size: 11px;
          }
          
          .info-item:last-child {
              border-bottom: none;
          }
          
          .label {
              font-weight: 600;
              color: #003366;
          }
          
          .value {
              color: #1a1a1a;
              font-weight: 600;
              background: #f0f0f0;
              padding: 3px 6px;
              border-radius: 3px;
          }
          
          .performance-section {
              margin: 20px 0;
              padding: 18px;
              background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%);
              border-radius: 6px;
              border: 1px solid #0066cc;
              box-shadow: 0 3px 8px rgba(0, 102, 204, 0.08);
          }
          
          .performance-title {
              text-align: center;
              margin-bottom: 15px;
              color: #003366;
              font-size: 14px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
          }
          
          .performance-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin: 15px 0;
          }
          
          .metric-card {
              text-align: center;
              padding: 12px 8px;
              border-radius: 6px;
              border: 1px solid #cccccc;
              background: #ffffff;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
              transition: all 0.3s ease;
          }
          
          .metric-value {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 4px;
              color: #003366;
          }
          
          .metric-label {
              font-size: 9px;
              text-transform: uppercase;
              color: #666666;
              font-weight: 600;
              letter-spacing: 0.3px;
          }
          
          .grade-excellent {
              background: linear-gradient(135deg, #e6f3e6, #f0f8f0);
              border-color: #008000;
              box-shadow: 0 2px 6px rgba(0, 128, 0, 0.15);
          }
          
          .grade-excellent .metric-value {
              color: #008000;
          }
          
          .grade-good {
              background: linear-gradient(135deg, #e6f0ff, #f0f7ff);
              border-color: #0066cc;
              box-shadow: 0 2px 6px rgba(0, 102, 204, 0.15);
          }
          
          .grade-good .metric-value {
              color: #0066cc;
          }
          
          .grade-average {
              background: linear-gradient(135deg, #fff8e6, #fffaf0);
              border-color: #ff8c00;
              box-shadow: 0 2px 6px rgba(255, 140, 0, 0.15);
          }
          
          .grade-average .metric-value {
              color: #ff8c00;
          }
          
          .grade-poor {
              background: linear-gradient(135deg, #ffe6e6, #fff0f0);
              border-color: #cc0000;
              box-shadow: 0 2px 6px rgba(204, 0, 0, 0.15);
          }
          
          .grade-poor .metric-value {
              color: #cc0000;
          }
          
          .remarks {
              margin: 20px 0;
              padding: 18px;
              background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%);
              border-radius: 6px;
              border-left: 4px solid #003366;
              border-top: 1px solid #cccccc;
              border-right: 1px solid #cccccc;
              border-bottom: 1px solid #cccccc;
              box-shadow: 0 2px 6px rgba(0, 51, 102, 0.08);
              flex-grow: 1;
          }
          
          .remarks h4 {
              margin-bottom: 10px;
              color: #003366;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
          }
          
          .remarks p {
              margin-bottom: 6px;
              color: #1a1a1a;
              line-height: 1.4;
              font-size: 11px;
          }
          
          .remarks strong {
              color: #003366;
              font-weight: 600;
          }
          
          .signature-section {
              margin-top: 25px;
              display: flex;
              justify-content: center;
          }
          
          .signature-box {
              text-align: center;
              border-top: 2px solid #003366;
              padding: 15px;
              width: 300px;
              background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
              border-radius: 6px;
              box-shadow: 0 3px 8px rgba(0,0,0,0.08);
              border: 1px solid #cccccc;
              border-top: 2px solid #003366;
          }
          
          .signature-name {
              color: #003366;
              font-size: 14px;
              font-weight: 700;
              margin-bottom: 3px;
          }
          
          .signature-title {
              color: #004d99;
              font-weight: 600;
              margin-bottom: 3px;
              font-size: 11px;
          }
          
          .signature-institution {
              color: #0066cc;
              font-weight: 600;
              font-size: 12px;
          }
          
          .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 9px;
              color: #666666;
              border-top: 1px solid #eeeeee;
              padding-top: 12px;
              background: #f9f9f9;
              margin-left: -25px;
              margin-right: -25px;
              margin-bottom: -25px;
              padding-left: 25px;
              padding-right: 25px;
              padding-bottom: 12px;
          }
          
          .footer p {
              margin-bottom: 3px;
          }
          
          .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 48px;
              background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              opacity: 0.03;
              z-index: -1;
              font-weight: bold;
              letter-spacing: 1px;
          }
          
          .professional-badge {
              position: absolute;
              top: 15px;
              right: 15px;
              background: linear-gradient(45deg, #003366, #004d99);
              color: white;
              padding: 5px 10px;
              border-radius: 15px;
              font-size: 8px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
          }
          
          .performance-indicator {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 9px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              margin-left: 8px;
          }
          
          .indicator-excellent {
              background: #e6f3e6;
              color: #008000;
              border: 1px solid #008000;
          }
          
          .indicator-good {
              background: #e6f0ff;
              color: #0066cc;
              border: 1px solid #0066cc;
          }
          
          .indicator-average {
              background: #fff8e6;
              color: #ff8c00;
              border: 1px solid #ff8c00;
          }
          
          .indicator-poor {
              background: #ffe6e6;
              color: #cc0000;
              border: 1px solid #cc0000;
          }
          
          @media print {
              body { 
                  margin: 0; 
                  font-size: 11px;
              }
              .marksheet { 
                  margin: 0; 
                  box-shadow: none; 
                  padding: 20px;
                  min-height: auto;
                  page-break-inside: avoid;
              }
              .professional-badge { display: none; }
              .watermark { display: none; }
          }
          
          @page {
              size: A4;
              margin: 0.5in;
          }
      </style>
  </head>
  <body>
      <div class="watermark">OFFICIAL CERTIFICATE</div>
      <div class="marksheet">
          <div class="professional-badge">Certified Document</div>
          
          <div class="header">
              <div class="institution">
                  <span class="bid-logo">Bid</span> Learning Academy
              </div>
              <div class="subtitle">Excellence in Digital Education</div>
              <div class="certificate-title">ACADEMIC PERFORMANCE CERTIFICATE</div>
          </div>
          
          <div class="student-info">
              <div>
                  <div class="info-item">
                      <span class="label">Student Name:</span>
                      <span class="value">${result.student_name}</span>
                  </div>
                  <div class="info-item">
                      <span class="label">Student ID:</span>
                      <span class="value">${result.student_id}</span>
                  </div>
                  <div class="info-item">
                      <span class="label">Assessment:</span>
                      <span class="value">${result.quiz_name || 'Aptitude Test'}</span>
                  </div>
              </div>
              <div>
                  <div class="info-item">
                      <span class="label">Date of Assessment:</span>
                      <span class="value">${completionDate.toLocaleDateString()}</span>
                  </div>
                  <div class="info-item">
                      <span class="label">Duration:</span>
                      <span class="value">${Math.round(result.time_taken / 60)} minutes</span>
                  </div>
                  <div class="info-item">
                      <span class="label">Certificate ID:</span>
                      <span class="value">CERT-${result.id || Date.now()}</span>
                  </div>
              </div>
          </div>
          
          <div class="performance-section">
              <h3 class="performance-title">Performance Analysis</h3>
              <div class="performance-grid">
                  <div class="metric-card ${result.score_percentage >= 80 ? 'grade-excellent' : result.score_percentage >= 60 ? 'grade-good' : result.score_percentage >= 40 ? 'grade-average' : 'grade-poor'}">
                      <div class="metric-value">${result.score_percentage}%</div>
                      <div class="metric-label">Overall Score</div>
                  </div>
                  <div class="metric-card">
                      <div class="metric-value" style="color: #008000;">${result.correct_answers}</div>
                      <div class="metric-label">Correct Answers</div>
                  </div>
                  <div class="metric-card">
                      <div class="metric-value" style="color: #cc0000;">${result.total_questions - result.correct_answers}</div>
                      <div class="metric-label">Incorrect</div>
                  </div>
                  <div class="metric-card ${result.score_percentage >= 80 ? 'grade-excellent' : result.score_percentage >= 60 ? 'grade-good' : result.score_percentage >= 40 ? 'grade-average' : 'grade-poor'}">
                      <div class="metric-value">${grade}</div>
                      <div class="metric-label">Grade Achieved</div>
                  </div>
              </div>
          </div>
          
          <div class="remarks">
              <h4>Performance Evaluation</h4>
              <p><strong>Grade Achieved:</strong> ${grade} 
                 <span class="performance-indicator ${
                   result.score_percentage >= 80 ? 'indicator-excellent' : 
                   result.score_percentage >= 60 ? 'indicator-good' : 
                   result.score_percentage >= 40 ? 'indicator-average' : 
                   'indicator-poor'
                 }">${performance}</span>
              </p>
              <p><strong>Assessment Result:</strong> ${result.score_percentage >= 60 ? 'PASSED ✓' : 'NEEDS IMPROVEMENT'}</p>
              <p><strong>Performance Analysis:</strong> ${
                  result.score_percentage >= 90 ? 'Outstanding performance demonstrating exceptional mastery of subject matter. Student shows excellent analytical skills and comprehensive understanding.' :
                  result.score_percentage >= 80 ? 'Excellent academic achievement with strong conceptual understanding. Demonstrates solid foundation and good problem-solving abilities.' :
                  result.score_percentage >= 70 ? 'Good performance indicating satisfactory grasp of fundamental concepts. Shows potential for improvement with focused study.' :
                  result.score_percentage >= 60 ? 'Satisfactory performance meeting minimum academic standards. Additional practice and review recommended for stronger foundation.' :
                  result.score_percentage >= 40 ? 'Below standard performance requiring additional academic support. Comprehensive review and extra guidance strongly recommended.' :
                  'Significant academic intervention required. Immediate additional support and reassessment recommended after intensive preparation.'
              }</p>
              <p><strong>Recommendations:</strong> ${
                  result.score_percentage >= 80 ? 'Continue excellent work. Consider advanced coursework and peer mentoring opportunities.' :
                  result.score_percentage >= 60 ? 'Focus on strengthening weaker areas through targeted practice and regular review sessions.' :
                  'Schedule additional tutoring sessions and consider retaking assessment after thorough preparation.'
              }</p>
          </div>
          
          <div class="signature-section">
              <div class="signature-box">
                  <div class="signature-name">Kamaljeet</div>
                  <div class="signature-title">Academic Coordinator</div>
                  <div class="signature-institution">Bid Learning Academy</div>
              </div>
          </div>
          
          <div class="footer">
              <p><strong>Official Academic Document</strong> • Digitally Generated Certificate</p>
              <p>For verification and inquiries, contact Bid Learning Academy Academic Office</p>
              <p>Generated: ${new Date().toLocaleString()} | Certificate ID: CERT-${result.id || Date.now()}</p>
              <p>This document is valid and certified by Bid Learning Academy</p>
          </div>
      </div>
  </body>
  </html>
  `;


  // Create a new window for PDF generation
  const printWindow = window.open('', '_blank');
  printWindow.document.write(marksheetHTML);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Close the window after printing
      printWindow.onafterprint = () => printWindow.close();
    }, 500);
  };
};
  const getStatistics = () => {
    if (filteredResults.length === 0) return null;

    const scores = filteredResults.map(r => r.score_percentage);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    
    const excellent = filteredResults.filter(r => r.score_percentage >= 80).length;
    const good = filteredResults.filter(r => r.score_percentage >= 60 && r.score_percentage < 80).length;
    const average_count = filteredResults.filter(r => r.score_percentage >= 40 && r.score_percentage < 60).length;
    const poor = filteredResults.filter(r => r.score_percentage < 40).length;

    return {
      total: filteredResults.length,
      average: Math.round(average),
      highest,
      lowest,
      excellent,
      good,
      average_count,
      poor
    };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-gray-400 mb-4 animate-spin" />
          <p className="text-gray-600">Loading quiz results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-6 rounded-xl border border-purple-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FontAwesomeIcon icon={faClipboardList} className="mr-2 text-purple-600" />
            Student Quiz Results ({quizResults.length})
          </h3>
          <p className="text-gray-600 mt-1 text-sm">Monitor performances and download official certificates</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faCalendarCheck} className="text-green-600" />
          <span className="text-xs text-gray-600">Auto-cleanup: 30 days</span>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-blue-200">
            <div className="text-xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-blue-700">Total Students</div>
          </div>
          <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-purple-200">
            <div className="text-xl font-bold text-purple-600">{stats.average}%</div>
            <div className="text-xs text-purple-700">Average Score</div>
          </div>
          <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-green-200">
            <div className="text-xl font-bold text-green-600">{stats.excellent}</div>
            <div className="text-xs text-green-700">Excellent (80%+)</div>
          </div>
          <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-blue-200">
            <div className="text-xl font-bold text-blue-600">{stats.good}</div>
            <div className="text-xs text-blue-700">Good (60-79%)</div>
          </div>
          <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-yellow-200">
            <div className="text-xl font-bold text-yellow-600">{stats.average_count}</div>
            <div className="text-xs text-yellow-700">Average (40-59%)</div>
          </div>
          <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-red-200">
            <div className="text-xl font-bold text-red-600">{stats.poor}</div>
            <div className="text-xs text-red-700">Poor (&lt;40%)</div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white bg-opacity-70"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white bg-opacity-70 text-sm"
          >
            <option value="all">All Performance</option>
            <option value="excellent">Excellent (80%+)</option>
            <option value="good">Good (60-79%)</option>
            <option value="average">Average (40-59%)</option>
            <option value="poor">Poor (&lt;40%)</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white bg-opacity-70 text-sm"
          >
            <option value="date-desc">Latest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="score-desc">Highest Score</option>
            <option value="score-asc">Lowest Score</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="id-asc">ID A-Z</option>
            <option value="id-desc">ID Z-A</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      {filteredResults.length === 0 ? (
        <div className="text-center py-12 bg-white bg-opacity-50 rounded-lg">
          <FontAwesomeIcon icon={faClipboardList} className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Quiz Results Found</h3>
          <p className="text-gray-500">
            {quizResults.length === 0 
              ? "No students have taken the quiz yet." 
              : "No results match your current filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white bg-opacity-60 rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white bg-opacity-80 border-b">
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Student</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Score & Grade</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Performance</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Date Completed</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Time Taken</th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result, index) => (
                <motion.tr
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b hover:bg-white hover:bg-opacity-50 transition-colors"
                >
                  <td className="p-4">
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{result.student_name}</div>
                      <div className="text-xs text-gray-500 font-mono">{result.student_id}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="text-sm font-bold">{result.correct_answers}/{result.total_questions}</div>
                        <div className="text-lg font-bold text-blue-600">{result.score_percentage}%</div>
                      </div>
                      <div className={`text-xl font-bold px-2 py-1 rounded-lg ${
                        result.score_percentage >= 80 ? 'bg-green-100 text-green-700' :
                        result.score_percentage >= 60 ? 'bg-blue-100 text-blue-700' :
                        result.score_percentage >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {getGrade(result.score_percentage)}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPerformanceColor(result.score_percentage)}`}>
                      <FontAwesomeIcon 
                        icon={result.score_percentage >= 60 ? faCheckCircle : faTimesCircle} 
                        className="mr-1" 
                      />
                      {getPerformanceLabel(result.score_percentage)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                      <span className="text-xs">
                        {new Date(result.completed_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(result.completed_date).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-gray-600">
                      {Math.round(result.time_taken / 60)} minutes
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(result)}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} className="mr-1" />
                        Details
                      </button>
                      <button
                        onClick={() => generatePDFMarksheet(result)}
                        className="flex items-center px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        title="Download PDF Marksheet"
                      >
                        <FontAwesomeIcon icon={faFilePdf} className="mr-1" />
                        PDF
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Enhanced Quiz Details Modal */}
      <AnimatePresence>
        {showDetails && selectedResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FontAwesomeIcon icon={faCertificate} className="mr-2 text-blue-600" />
                    Performance Details
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-lg"><span className="font-semibold">Student:</span> {selectedResult.student_name}</p>
                    <p className="text-sm text-gray-600 font-mono">ID: {selectedResult.student_id}</p>
                    <p className="text-sm text-gray-600">
                      Completed: {new Date(selectedResult.completed_date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => generatePDFMarksheet(selectedResult)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                    Download Marksheet
                  </button>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Enhanced Score Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg mb-6 border border-blue-200">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{selectedResult.score_percentage}%</div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${
                    selectedResult.score_percentage >= 80 ? 'bg-green-100 text-green-700' :
                    selectedResult.score_percentage >= 60 ? 'bg-blue-100 text-blue-700' :
                    selectedResult.score_percentage >= 40 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    <FontAwesomeIcon icon={faAward} className="mr-2" />
                    Grade: {getGrade(selectedResult.score_percentage)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">{selectedResult.correct_answers}</div>
                    <div className="text-sm text-gray-600">Correct Answers</div>
                  </div>
                  <div className="text-center bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-red-600">{selectedResult.total_questions - selectedResult.correct_answers}</div>
                    <div className="text-sm text-gray-600">Wrong Answers</div>
                  </div>
                  <div className="text-center bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(selectedResult.time_taken / 60)}</div>
                    <div className="text-sm text-gray-600">Minutes Taken</div>
                  </div>
                  <div className="text-center bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">{selectedResult.total_questions}</div>
                    <div className="text-sm text-gray-600">Total Questions</div>
                  </div>
                </div>
              </div>

              {/* Performance Analysis */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <FontAwesomeIcon icon={faTrophy} className="mr-2 text-yellow-500" />
                  Performance Analysis
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Overall Performance:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      selectedResult.score_percentage >= 80 ? 'bg-green-100 text-green-700' :
                      selectedResult.score_percentage >= 60 ? 'bg-blue-100 text-blue-700' :
                      selectedResult.score_percentage >= 40 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {getPerformanceLabel(selectedResult.score_percentage)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Assessment Result:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      selectedResult.score_percentage >= 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedResult.score_percentage >= 60 ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Accuracy Rate:</span>
                    <span className="font-bold text-blue-600">
                      {((selectedResult.correct_answers / selectedResult.total_questions) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold mb-3 text-blue-800 flex items-center">
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                  Recommendations
                </h4>
                <div className="text-blue-700">
                  {selectedResult.score_percentage >= 90 ? (
                    <p>🌟 Outstanding performance! Student has demonstrated exceptional understanding. Consider mentoring other students or advanced courses.</p>
                  ) : selectedResult.score_percentage >= 80 ? (
                    <p>🎯 Excellent work! Student has a strong grasp of the material. Focus on maintaining this level of understanding.</p>
                  ) : selectedResult.score_percentage >= 70 ? (
                    <p>👍 Good performance! Review the areas where mistakes were made and practice similar problems to improve further.</p>
                  ) : selectedResult.score_percentage >= 60 ? (
                    <p>📚 Satisfactory performance. Student should spend more time studying fundamental concepts and practice regularly.</p>
                  ) : selectedResult.score_percentage >= 40 ? (
                    <p>📖 Below average performance. Consider providing additional help, reviewing study materials, and more practice exercises.</p>
                  ) : (
                    <p>🔄 Significant improvement needed. Recommend retaking the assessment after thorough preparation and additional study.</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Certificate ID: CERT-{selectedResult.id || Date.now()}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => generatePDFMarksheet(selectedResult)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                    Download PDF Marksheet
                  </button>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState('overview'); // New state for tabs

  const API_BASE_URL = "https://admissionapi.buildingindiadigital.com";

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

                {/* Tab Navigation */}
                <div className="mb-6">
                  <div className="flex space-x-1 bg-white bg-opacity-60 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium ${
                        activeTab === 'overview'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      <FontAwesomeIcon icon={faUser} className="mr-2" />
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('meetings')}
                      className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium ${
                        activeTab === 'meetings'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      <FontAwesomeIcon icon={faVideo} className="mr-2" />
                      Meetings
                    </button>
                    <button
                      onClick={() => setActiveTab('quiz-results')}
                      className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium ${
                        activeTab === 'quiz-results'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                      Quiz Results
                    </button>
                  </div>
                </div>

                {/* Dashboard Loading */}
                {dashboardLoading && (
                  <div className="mb-6 bg-white bg-opacity-50 p-6 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin h-6 w-6 text-indigo-600 mr-3" />
                    <span className="text-indigo-600">Loading dashboard data...</span>
                  </div>
                )}

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <>
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
                  </>
                )}

                {/* Meetings Tab */}
                {activeTab === 'meetings' && (
                  <div className="mb-6 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-6 rounded-xl border border-purple-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FontAwesomeIcon icon={faHistory} className="mr-2 text-purple-600" />
                      Your Meetings ({dashboardData?.meetings?.length || 0})
                    </h3>
                    {dashboardData && dashboardData.meetings && dashboardData.meetings.length > 0 ? (
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

                {/* Quiz Results Tab */}
                {activeTab === 'quiz-results' && (
                  <QuizResults />
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