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
    faFileExport
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

    const handleViewDetails = (result) => {
        setSelectedResult(result);
        setShowDetails(true);
    };

    const handleExportData = () => {
        const csvContent = [
            ['Student ID', 'Student Name', 'Quiz Name', 'Score', 'Percentage', 'Date Completed', 'Time Taken (minutes)'],
            ...filteredResults.map(result => [
                result.student_id,
                result.student_name,
                result.quiz_name,
                `${result.correct_answers}/${result.total_questions}`,
                `${result.score_percentage}%`,
                new Date(result.completed_date).toLocaleDateString(),
                Math.round(result.time_taken / 60)
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz_results_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
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
                        Quiz Results
                    </h2>
                    <p className="text-gray-600 mt-1">View and manage student quiz performances</p>
                </div>
                
                <button
                    onClick={handleExportData}
                    disabled={filteredResults.length === 0}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                    Export CSV
                </button>
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
                                <th className="text-left p-4 font-semibold text-gray-700">Score</th>
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
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg font-bold">{result.correct_answers}/{result.total_questions}</span>
                                            <span className="text-2xl font-bold text-blue-600">{result.score_percentage}%</span>
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
                                        <button
                                            onClick={() => handleViewDetails(result)}
                                            className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                                            Details
                                        </button>
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
                                    <h3 className="text-2xl font-bold text-gray-800">Quiz Details</h3>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-lg"><span className="font-semibold">Student:</span> {selectedResult.student_name}</p>
                                        <p className="text-sm text-gray-600 font-mono">ID: {selectedResult.student_id}</p>
                                        <p className="text-sm text-gray-600">
                                            Completed: {new Date(selectedResult.completed_date).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Score Summary */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{selectedResult.score_percentage}%</div>
                                        <div className="text-sm text-gray-600">Final Score</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{selectedResult.correct_answers}</div>
                                        <div className="text-sm text-gray-600">Correct Answers</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">{selectedResult.total_questions - selectedResult.correct_answers}</div>
                                        <div className="text-sm text-gray-600">Wrong Answers</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">{Math.round(selectedResult.time_taken / 60)}</div>
                                        <div className="text-sm text-gray-600">Minutes Taken</div>
                                    </div>
                                </div>
                            </div>

                            {/* Question-wise Performance */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Question-wise Performance</h4>
                                <div className="space-y-3">
                                    {Object.entries(selectedResult.answers || {}).map(([questionId, answer], index) => {
                                        // You would need to have the questions data available here
                                        // For now, showing a simple format
                                        return (
                                            <div key={questionId} className="border rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold">Question {questionId}</span>
                                                    <span className="text-sm text-gray-500">
                                                        Answer: {answer}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizResults;