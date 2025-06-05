import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGraduationCap,
    faCalendarAlt,
    faPercent,
    faEye,
    faDownload,
    faSearch,
    faFilter,
    faTrophy,
    faClipboardList,
    faUserGraduate,
    faCheckCircle,
    faTimesCircle,
    faInfoCircle,
    faSort,
    faFilePdf,
    faCertificate,
    faAward,
    faStar,
    faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

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

    // Auto-clear old meetings and quiz results
    useEffect(() => {
        clearOldMeetingsAndResults();
    }, []);

    // Load quiz results from localStorage
    useEffect(() => {
        loadQuizResults();
        
        // Listen for storage events to update in real-time
        const handleStorageChange = () => {
            loadQuizResults();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for custom events
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
    const clearOldMeetingsAndResults = () => {
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
                console.log(`Cleared ${allResults.length - recentResults.length} old quiz results`);
            }

            // Clear old meeting data if exists
            const meetingData = JSON.parse(localStorage.getItem('meetingData') || '[]');
            const recentMeetings = meetingData.filter(meeting => {
                const meetingDate = new Date(meeting.date || meeting.start_time || meeting.created_at);
                return meetingDate > thirtyDaysAgo;
            });

            if (recentMeetings.length !== meetingData.length) {
                localStorage.setItem('meetingData', JSON.stringify(recentMeetings));
                console.log(`Cleared ${meetingData.length - recentMeetings.length} old meetings`);
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
        if (percentage >= 80) return 'text-green-600 bg-green-50';
        if (percentage >= 60) return 'text-blue-600 bg-blue-50';
        if (percentage >= 40) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
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
    const generatePDFMarksheet = (result) => {
        const grade = getGrade(result.score_percentage);
        const performance = getPerformanceLabel(result.score_percentage);
        const completionDate = new Date(result.completed_date);
        
        // Create HTML content for the marksheet
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
                    font-family: 'Times New Roman', serif;
                    line-height: 1.6;
                    color: #333;
                    background: #fff;
                }
                
                .marksheet {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 40px;
                    border: 3px solid #2563eb;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #2563eb;
                    padding-bottom: 20px;
                }
                
                .institution {
                    font-size: 28px;
                    font-weight: bold;
                    color: #1e40af;
                    margin-bottom: 5px;
                    text-transform: uppercase;
                }
                
                .subtitle {
                    font-size: 16px;
                    color: #64748b;
                    margin-bottom: 10px;
                }
                
                .certificate-title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #dc2626;
                    margin: 15px 0;
                    text-decoration: underline;
                }
                
                .student-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin: 30px 0;
                    padding: 20px;
                    background: #fff;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }
                
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px dotted #cbd5e1;
                }
                
                .label {
                    font-weight: bold;
                    color: #374151;
                }
                
                .value {
                    color: #1f2937;
                }
                
                .performance-section {
                    margin: 30px 0;
                    padding: 25px;
                    background: #fff;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }
                
                .performance-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin: 20px 0;
                }
                
                .metric-card {
                    text-align: center;
                    padding: 15px;
                    border-radius: 8px;
                    border: 2px solid #e2e8f0;
                }
                
                .metric-value {
                    font-size: 32px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                
                .metric-label {
                    font-size: 12px;
                    text-transform: uppercase;
                    color: #64748b;
                }
                
                .grade-excellent {
                    background: #dcfce7;
                    border-color: #16a34a;
                    color: #15803d;
                }
                
                .grade-good {
                    background: #dbeafe;
                    border-color: #2563eb;
                    color: #1d4ed8;
                }
                
                .grade-average {
                    background: #fef3c7;
                    border-color: #f59e0b;
                    color: #d97706;
                }
                
                .grade-poor {
                    background: #fee2e2;
                    border-color: #dc2626;
                    color: #b91c1c;
                }
                
                .remarks {
                    margin: 30px 0;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 8px;
                    border-left: 4px solid #2563eb;
                }
                
                .signature-section {
                    margin-top: 50px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                }
                
                .signature-box {
                    text-align: center;
                    border-top: 1px solid #000;
                    padding-top: 10px;
                }
                
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #64748b;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 15px;
                }
                
                .watermark {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 72px;
                    color: rgba(37, 99, 235, 0.1);
                    z-index: -1;
                    font-weight: bold;
                }
                
                @media print {
                    body { margin: 0; }
                    .marksheet { margin: 0; box-shadow: none; }
                }
            </style>
        </head>
        <body>
            <div class="watermark">OFFICIAL MARKSHEET</div>
            <div class="marksheet">
                <div class="header">
                    <div class="institution">Digital Learning Academy</div>
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
                    <h3 style="text-align: center; margin-bottom: 20px; color: #1e40af;">PERFORMANCE SUMMARY</h3>
                    <div class="performance-grid">
                        <div class="metric-card ${result.score_percentage >= 80 ? 'grade-excellent' : result.score_percentage >= 60 ? 'grade-good' : result.score_percentage >= 40 ? 'grade-average' : 'grade-poor'}">
                            <div class="metric-value">${result.score_percentage}%</div>
                            <div class="metric-label">Overall Score</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value" style="color: #059669;">${result.correct_answers}</div>
                            <div class="metric-label">Correct Answers</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value" style="color: #dc2626;">${result.total_questions - result.correct_answers}</div>
                            <div class="metric-label">Incorrect</div>
                        </div>
                        <div class="metric-card ${result.score_percentage >= 80 ? 'grade-excellent' : result.score_percentage >= 60 ? 'grade-good' : result.score_percentage >= 40 ? 'grade-average' : 'grade-poor'}">
                            <div class="metric-value">${grade}</div>
                            <div class="metric-label">Grade Achieved</div>
                        </div>
                    </div>
                </div>
                
                <div class="remarks">
                    <h4 style="margin-bottom: 10px; color: #1e40af;">Performance Evaluation:</h4>
                    <p><strong>Grade:</strong> ${grade} (${performance})</p>
                    <p><strong>Assessment Result:</strong> ${result.score_percentage >= 60 ? 'PASSED' : 'NEEDS IMPROVEMENT'}</p>
                    <p><strong>Remarks:</strong> ${
                        result.score_percentage >= 90 ? 'Outstanding performance! Exceptional understanding of the subject matter.' :
                        result.score_percentage >= 80 ? 'Excellent work! Strong grasp of fundamental concepts.' :
                        result.score_percentage >= 70 ? 'Good performance! Shows solid understanding with room for improvement.' :
                        result.score_percentage >= 60 ? 'Satisfactory performance! Meeting basic requirements.' :
                        result.score_percentage >= 40 ? 'Below average performance. Additional study recommended.' :
                        'Needs significant improvement. Consider retaking the assessment.'
                    }</p>
                </div>
                
                <div class="signature-section">
                    <div class="signature-box">
                        <strong>Academic Coordinator</strong><br>
                        Digital Learning Academy
                    </div>
                    <div class="signature-box">
                        <strong>Principal</strong><br>
                        Digital Learning Academy
                    </div>
                </div>
                
                <div class="footer">
                    <p>This is a digitally generated certificate. For verification, please contact Digital Learning Academy.</p>
                    <p>Generated on: ${new Date().toLocaleString()} | Certificate ID: CERT-${result.id || Date.now()}</p>
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
                    <FontAwesomeIcon icon={faClipboardList} className="text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-600">Loading quiz results...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                        <FontAwesomeIcon icon={faGraduationCap} className="mr-3 text-blue-600" />
                        Quiz Results & Certificates
                    </h2>
                    <p className="text-gray-600 mt-1">View student performances and download official marksheets</p>
                </div>
                
                <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faCalendarCheck} className="text-green-600" />
                    <span className="text-sm text-gray-600">Auto-cleanup: 30 days</span>
                </div>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                        <div className="text-sm text-blue-700">Total Students</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600">{stats.average}%</div>
                        <div className="text-sm text-purple-700">Average Score</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600">{stats.excellent}</div>
                        <div className="text-sm text-green-700">Excellent (80%+)</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">{stats.good}</div>
                        <div className="text-sm text-blue-700">Good (60-79%)</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-600">{stats.average_count}</div>
                        <div className="text-sm text-yellow-700">Average (40-59%)</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-600">{stats.poor}</div>
                        <div className="text-sm text-red-700">Poor (&lt;40%)</div>
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
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                <div className="text-center py-12">
                    <FontAwesomeIcon icon={faClipboardList} className="text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Quiz Results Found</h3>
                    <p className="text-gray-500">
                        {quizResults.length === 0 
                            ? "No students have taken the quiz yet." 
                            : "No results match your current filters."}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="text-left p-4 font-semibold text-gray-700">Student</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Score & Grade</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Performance</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Date Completed</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Time Taken</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResults.map((result, index) => (
                                <motion.tr
                                    key={result.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-b hover:bg-gray-50 transition-colors"
                                >
                                    <td className="p-4">
                                        <div>
                                            <div className="font-semibold text-gray-800">{result.student_name}</div>
                                            <div className="text-sm text-gray-500 font-mono">{result.student_id}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <div>
                                                <div className="text-lg font-bold">{result.correct_answers}/{result.total_questions}</div>
                                                <div className="text-2xl font-bold text-blue-600">{result.score_percentage}%</div>
                                            </div>
                                            <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${
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
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(result.score_percentage)}`}>
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
                                            <span className="text-sm">
                                                {new Date(result.completed_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(result.completed_date).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-gray-600">
                                            {Math.round(result.time_taken / 60)} minutes
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleViewDetails(result)}
                                                className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                                title="View Details"
                                            >
                                                <FontAwesomeIcon icon={faEye} className="mr-1" />
                                                Details
                                            </button>
                                            <button
                                                onClick={() => generatePDFMarksheet(result)}
                                                className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
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

            {/* Quiz Details Modal */}
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
                                        <p>🌟 Outstanding performance! You have demonstrated exceptional understanding. Consider mentoring other students or taking advanced courses.</p>
                                    ) : selectedResult.score_percentage >= 80 ? (
                                        <p>🎯 Excellent work! You have a strong grasp of the material. Focus on maintaining this level of understanding.</p>
                                    ) : selectedResult.score_percentage >= 70 ? (
                                        <p>👍 Good performance! Review the areas where you made mistakes and practice similar problems to improve further.</p>
                                    ) : selectedResult.score_percentage >= 60 ? (
                                        <p>📚 Satisfactory performance. Spend more time studying the fundamental concepts and practice regularly.</p>
                                    ) : selectedResult.score_percentage >= 40 ? (
                                        <p>📖 Below average performance. Consider seeking additional help, reviewing study materials, and practicing more exercises.</p>
                                    ) : (
                                        <p>🔄 Significant improvement needed. It's recommended to retake the assessment after thorough preparation and additional study.</p>
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

export default QuizResults;