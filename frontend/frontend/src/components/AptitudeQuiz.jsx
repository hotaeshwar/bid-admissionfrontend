import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock,
    faCheck,
    faTimes,
    faSpinner,
    faArrowRight,
    faArrowLeft,
    faList,
    faBrain,
    faQuestionCircle,
    faTrophy,
    faIdCard
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const AptitudeQuiz = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [showInstructions, setShowInstructions] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState(5);
    const [studentId, setStudentId] = useState("");
    const [studentName, setStudentName] = useState("");
    const [authError, setAuthError] = useState("");
    const [showAuthScreen, setShowAuthScreen] = useState(true);
    const [error, setError] = useState(null);
    const timerRef = useRef(null);
    const redirectTimerRef = useRef(null);
    const submitTimeoutRef = useRef(null);
    const [hasAttemptedQuiz, setHasAttemptedQuiz] = useState(false);

    const questions = [
        {
            id: 1,
            category: "Reasoning",
            question: "If TRIANGLE is coded as 27958431, how is QUADRILATERAL coded using the same pattern?",
            options: ["12957315879", "13258914768", "12597418536", "13697418523"],
            correctAnswer: "12597418536",
            explanation: "Each letter is assigned a value based on its position in reverse alphabetical order: T(20)=2, R(18)=7, I(9)=9, etc. For QUADRILATERAL: Q(17)=1, U(21)=2, A(1)=5, etc."
        },
        {
            id: 2,
            category: "Mathematics",
            question: "A spherical balloon is being inflated and its radius is increasing at a constant rate of 2 cm/min. At what rate is the volume increasing when the radius is 10 cm?",
            options: ["800π cm³/min", "1200π cm³/min", "400π cm³/min", "600π cm³/min"],
            correctAnswer: "800π cm³/min",
            explanation: "V = (4/3)πr³. Rate of change: dV/dt = 4πr²(dr/dt). When r = 10 and dr/dt = 2, dV/dt = 4π(10)²(2) = 800π cm³/min."
        },
        {
            id: 3,
            category: "English",
            question: "Select the word with the most precise and specific meaning among the following options:",
            options: ["Discourse", "Soliloquy", "Speech", "Conversation"],
            correctAnswer: "Soliloquy",
            explanation: "Soliloquy is the most specific term, referring specifically to a character speaking their thoughts aloud when alone or acting as if alone, particularly in a dramatic context."
        },
        {
            id: 4,
            category: "Distance and Direction",
            question: "A person walks 24 meters South, then 10 meters East, then 24 meters North, then 18 meters East. If the person finally turns 135° counterclockwise and walks 20√2 meters, what are the coordinates of their final position relative to starting point?",
            options: ["(8, -20)", "(28, 0)", "(48, -20)", "(28, -20)"],
            correctAnswer: "(28, -20)",
            explanation: "Starting at (0,0), moving to (0,-24), then (10,-24), then (10,0), then (28,0). After turning 135° counterclockwise, they move 20√2 meters southwest, ending at (28,-20)."
        },
        {
            id: 5,
            category: "Physics",
            question: "A uniform rod of length L and mass M is pivoted at one end and held horizontally. When released, what is the initial angular acceleration of the rod?",
            options: ["g/L", "2g/L", "3g/L", "3g/2L"],
            correctAnswer: "3g/2L",
            explanation: "The moment of inertia of a rod about one end is I = ML²/3. The torque due to gravity is τ = Mg(L/2). Using τ = Iα, we get α = 3g/2L."
        },
        {
            id: 6,
            category: "Chemistry",
            question: "Which orbital has the highest probability of finding an electron at the nucleus?",
            options: ["2p", "3s", "3d", "1s"],
            correctAnswer: "1s",
            explanation: "Only s-orbitals have non-zero probability at the nucleus (r=0). Among s-orbitals, the 1s has the highest probability at the nucleus due to having the smallest average radius."
        },
        {
            id: 7,
            category: "Reasoning",
            question: "Find the next number in the sequence: 3, 8, 15, 24, 35, 48, ?",
            options: ["63", "58", "60", "66"],
            correctAnswer: "63",
            explanation: "The differences between consecutive terms form the sequence 5, 7, 9, 11, 13, which increases by 2 each time. The next difference is 15, so 48 + 15 = 63."
        },
        {
            id: 8,
            category: "Mathematics",
            question: "In how many ways can 7 people be seated around a circular table if two specific people must sit adjacent to each other?",
            options: ["720", "5040", "240", "1440"],
            correctAnswer: "720",
            explanation: "Treat the two specific people as one unit. This gives us 6 objects to arrange in a circle, which is (6-1)! = 5! = 120 ways. The two people can be arranged in 2! = 2 ways within their unit, so total = 120 × 2 × 3 = 720 ways."
        },
        {
            id: 9,
            category: "Biology",
            question: "During which phase of mitosis do the chromosomes align at the metaphase plate due to the action of spindle fibers attached to the kinetochores?",
            options: ["Prophase", "Anaphase", "Metaphase", "Telophase"],
            correctAnswer: "Metaphase",
            explanation: "During metaphase, chromosomes align at the cell's equator (metaphase plate) as spindle fibers from opposite poles attach to the kinetochores of sister chromatids."
        },
        {
            id: 10,
            category: "Distance and Direction",
            question: "A ship sails 40 km east, then 30 km south, then 50 km east, then 60 km north, and finally 10 km west. What is the straight-line distance from its starting point?",
            options: ["80 km", "100 km", "90 km", "70 km"],
            correctAnswer: "80 km",
            explanation: "The final position relative to the start is (40+50-10, -30+60) = (80, 30). Using the Pythagorean theorem, the distance is √(80²+30²) = √(6400+900) = √7300 ≈ 85.4 km, closest to 80 km."
        },
        {
            id: 11,
            category: "English",
            question: "Identify the sentence with correct parallel structure:",
            options: [
                "The professor not only praised the student's research but also her writing style.",
                "The professor praised not only the student's research but also her writing style.",
                "The professor not only praised the student's research but also praised her writing style.",
                "Not only did the professor praise the student's research, but her writing style also."
            ],
            correctAnswer: "The professor not only praised the student's research but also praised her writing style.",
            explanation: "This sentence maintains parallelism with 'not only praised X but also praised Y' structure, keeping the same grammatical form on both sides of the correlative conjunction."
        },
        {
            id: 12,
            category: "Computer Science",
            question: "What is the time complexity of finding the height of a balanced binary search tree with n nodes?",
            options: ["O(n²)", "O(n log n)", "O(log n)", "O(n)"],
            correctAnswer: "O(log n)",
            explanation: "In a balanced BST, the height is logarithmic with respect to the number of nodes. Finding the height requires traversing the longest path from root to leaf, which is O(log n) in a balanced tree."
        },
        {
            id: 13,
            category: "Reasoning",
            question: "If the pattern continues, what is the value of x? 5, 13, 29, 61, 125, x",
            options: ["253", "251", "249", "261"],
            correctAnswer: "253",
            explanation: "Each term follows the pattern: multiply by 2 and add 3. So 5×2+3=13, 13×2+3=29, 29×2+3=61, 61×2+3=125, 125×2+3=253."
        },
        {
            id: 14,
            category: "Mathematics",
            question: "In a certain population, height follows a normal distribution with mean 175 cm and standard deviation 8 cm. What percentage of the population has height greater than 191 cm?",
            options: ["2.5%", "5%", "10%", "16%"],
            correctAnswer: "2.5%",
            explanation: "191 cm is 2 standard deviations above the mean (175 + 2×8 = 191). For a normal distribution, approximately 2.5% of values lie beyond 2 standard deviations above the mean."
        },
        {
            id: 15,
            category: "Physics",
            question: "A certain radioactive isotope has a half-life of 10 days. If you start with 1 gram, approximately how much will remain after 50 days?",
            options: ["0.5 grams", "0.125 grams", "0.031 grams", "0.063 grams"],
            correctAnswer: "0.031 grams",
            explanation: "After 50 days (5 half-lives), the amount remaining is 1×(1/2)^5 = 1×(1/32) ≈ 0.031 grams."
        }
    ];

    // Validation functions
    const validateStudentId = (id) => {
        // Allow alphanumeric student IDs, minimum 3 characters
        return id.trim().length >= 3 && /^[a-zA-Z0-9]+$/.test(id.trim());
    };

    const validateStudentName = (name) => {
        return name.trim().length >= 2 && name.trim().length <= 50;
    };

    const handleError = (error, context) => {
        console.error(`Error in ${context}:`, error);
        setError(`Something went wrong: ${error.message}`);
    };

    // Format time (seconds) to MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Fixed handleSubmit with useCallback
    const handleSubmit = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setIsSubmitted(true);
        
        submitTimeoutRef.current = setTimeout(() => {
            setShowResults(true);
        }, 1500);
    }, []);

    // Start timer when quiz begins
    useEffect(() => {
        if (!showAuthScreen && !showInstructions && !isSubmitted) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        handleSubmit();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [showAuthScreen, showInstructions, isSubmitted, handleSubmit]);

    // Calculate score when submitted
    useEffect(() => {
        if (isSubmitted) {
            let totalScore = 0;
            questions.forEach((question) => {
                if (selectedAnswers[question.id] === question.correctAnswer) {
                    totalScore++;
                }
            });
            setScore(totalScore);
        }
    }, [isSubmitted, selectedAnswers]);

    // Enhanced saveQuizResult - saves to a format teachers can access
    const saveQuizResult = useCallback(() => {
        try {
            const percentage = Math.round((score / questions.length) * 100);
            const currentDate = new Date();
            
            const quizResult = {
                id: Date.now().toString(),
                student_id: studentId,
                student_name: studentName,
                quiz_name: "Aptitude Quiz",
                total_questions: questions.length,
                correct_answers: score,
                score_percentage: percentage,
                time_taken: (30 * 60) - timeLeft, // Time taken in seconds
                completed_date: currentDate.toISOString(),
                completed_date_formatted: currentDate.toLocaleDateString() + ' ' + currentDate.toLocaleTimeString(),
                answers: selectedAnswers,
                status: 'completed'
            };

            // Save individual result
            const quizResultKey = `quizResult_${studentId}_${Date.now()}`;
            
            // Get existing quiz results array or create new one
            const existingResults = JSON.parse(localStorage.getItem('allQuizResults') || '[]');
            existingResults.push(quizResult);
            
            // Save updated results array
            localStorage.setItem('allQuizResults', JSON.stringify(existingResults));
            localStorage.setItem(quizResultKey, JSON.stringify(quizResult));
            
            // Also save for student dashboard
            localStorage.setItem('pendingQuizSubmission', JSON.stringify(quizResult));
            
            // Trigger storage event for real-time updates
            window.dispatchEvent(new Event('storage'));
            
            console.log('Quiz result saved:', quizResult);
        } catch (error) {
            handleError(error, "saveQuizResult");
        }
    }, [score, questions.length, studentName, studentId, timeLeft, selectedAnswers]);

    // Redirect countdown with proper cleanup
    useEffect(() => {
        if (showResults) {
            saveQuizResult();

            redirectTimerRef.current = setInterval(() => {
                setRedirectCountdown((prevCount) => {
                    if (prevCount <= 1) {
                        clearInterval(redirectTimerRef.current);
                        navigate("/student-dashboard");
                        return 0;
                    }
                    return prevCount - 1;
                });
            }, 1000);
        }

        return () => {
            if (redirectTimerRef.current) {
                clearInterval(redirectTimerRef.current);
            }
            if (submitTimeoutRef.current) {
                clearTimeout(submitTimeoutRef.current);
            }
        };
    }, [showResults, navigate, saveQuizResult]);

    const handleOptionSelect = (questionId, option) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: option
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    // Enhanced authentication - now uses student ID instead of code
    const handleAuthenticate = () => {
        setAuthError("");
        setError(null);

        // Validate inputs
        if (!validateStudentId(studentId)) {
            setAuthError("Please enter a valid student ID (minimum 3 alphanumeric characters).");
            return;
        }

        if (!validateStudentName(studentName)) {
            setAuthError("Please enter a valid name (2-50 characters).");
            return;
        }

        try {
            // Check if student has already taken the quiz
            const existingResults = JSON.parse(localStorage.getItem('allQuizResults') || '[]');
            const hasAlreadyTaken = existingResults.some(result => 
                result.student_id.toLowerCase() === studentId.toLowerCase().trim()
            );

            if (hasAlreadyTaken) {
                setHasAttemptedQuiz(true);
                setShowAuthScreen(false);
                return;
            }

            // Set student data and continue
            setStudentId(studentId.trim());
            setStudentName(studentName.trim());
            setShowAuthScreen(false);
            setShowInstructions(true);
        } catch (error) {
            handleError(error, "authentication");
        }
    };

    const progressPercent = ((currentQuestion + 1) / questions.length) * 100;

    // Different card colors for different categories
    const getCategoryColor = (category) => {
        const colors = {
            "Reasoning": "bg-blue-100 text-blue-800",
            "Aptitude": "bg-green-100 text-green-800",
            "Mathematics": "bg-purple-100 text-purple-800",
            "Physics": "bg-red-100 text-red-800",
            "Chemistry": "bg-yellow-100 text-yellow-800",
            "Biology": "bg-teal-100 text-teal-800",
            "Computer Science": "bg-indigo-100 text-indigo-800",
            "English": "bg-pink-100 text-pink-800",
            "Distance and Direction": "bg-orange-100 text-orange-800"
        };
        return colors[category] || "bg-gray-100 text-gray-800";
    };

    // Error display
    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-lg my-4 md:my-8"
            >
                <div className="text-center mb-6">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">Error</h1>
                    <p className="text-red-500 mt-2 text-sm md:text-base">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            navigate("/student-dashboard");
                        }}
                        className="mt-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 text-sm md:text-base"
                    >
                        Go Back
                    </button>
                </div>
            </motion.div>
        );
    }

    // Authentication screen - Enhanced with Student ID input
    if (showAuthScreen) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-lg my-2 sm:my-4 md:my-8"
            >
                <div className="text-center mb-4 md:mb-6">
                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Student Quiz Portal</h1>
                    <p className="text-gray-600 mt-2 text-xs sm:text-sm md:text-base lg:text-lg">Enter your details to take the aptitude quiz</p>
                </div>

                <div className="mb-4 sm:mb-6 md:mb-8">
                    <div className="bg-blue-50 p-3 md:p-4 lg:p-5 rounded-lg flex items-start sm:items-center mb-4 md:mb-6">
                        <FontAwesomeIcon icon={faIdCard} className="text-blue-500 text-sm sm:text-base md:text-lg lg:text-xl mr-2 md:mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <p className="text-blue-700 text-xs sm:text-sm md:text-base">
                            Enter your student ID and name to begin the quiz. Your results will be visible to your teachers.
                        </p>
                    </div>

                    {authError && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-3 md:p-4 mb-4 md:mb-6">
                            <p className="text-red-700 text-xs sm:text-sm md:text-base">{authError}</p>
                        </div>
                    )}

                    <div className="space-y-3 sm:space-y-4">
                        <div>
                            <label htmlFor="studentName" className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 sm:mb-2">
                                Your Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="studentName"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                className="w-full p-2 sm:p-3 md:p-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm md:text-base lg:text-lg"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="studentId" className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 sm:mb-2">
                                Student ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="studentId"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                className="w-full p-2 sm:p-3 md:p-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm md:text-base lg:text-lg font-mono"
                                placeholder="e.g., STU001, 2024CS001, etc."
                                required
                            />
                            <p className="mt-1 text-xs sm:text-sm text-gray-500">
                                Enter your unique student ID (minimum 3 characters, letters and numbers only)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleAuthenticate}
                        disabled={!studentId || !studentName}
                        className={`w-full sm:w-auto bg-blue-600 text-white py-2 sm:py-2.5 md:py-3 lg:py-4 px-4 sm:px-6 md:px-8 lg:px-10 rounded-lg font-medium shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-xs sm:text-sm md:text-base lg:text-lg ${(!studentId || !studentName) ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                            }`}
                    >
                        Continue to Quiz <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                    </motion.button>
                    <button
                        onClick={() => navigate("/student-dashboard")}
                        className="block mx-auto mt-3 md:mt-4 text-blue-600 hover:text-blue-800 text-xs sm:text-sm md:text-base"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </motion.div>
        );
    }

    // Quiz already attempted screen
    if (hasAttemptedQuiz) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-lg my-2 sm:my-4 md:my-8"
            >
                <div className="text-center mb-4 md:mb-6">
                    <FontAwesomeIcon icon={faCheck} className="text-4xl text-green-500 mb-4" />
                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Quiz Already Completed</h1>
                    <p className="text-gray-600 mt-2 text-xs sm:text-sm md:text-base lg:text-lg">
                        Student ID <span className="font-mono font-semibold">{studentId}</span> has already completed this quiz.
                    </p>
                    <p className="text-gray-500 mt-1 text-xs sm:text-sm md:text-base">
                        Each student can only take the quiz once. Your results have been recorded.
                    </p>
                </div>
                <div className="text-center">
                    <button
                        onClick={() => navigate("/student-dashboard")}
                        className="bg-blue-600 text-white py-2 sm:py-2.5 md:py-3 lg:py-4 px-4 sm:px-6 md:px-8 lg:px-10 rounded-lg text-xs sm:text-sm md:text-base lg:text-lg hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </motion.div>
        );
    }

    // Instructions screen
    if (showInstructions) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 bg-white rounded-lg shadow-lg my-2 sm:my-4 md:my-8"
            >
                <div className="text-center mb-4 md:mb-8">
                    <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800">Aptitude Quiz</h1>
                    <p className="text-gray-600 mt-1 md:mt-2 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">Test your knowledge across various subjects</p>
                    <div className="mt-2 bg-green-50 p-2 lg:p-3 rounded-lg inline-block text-xs sm:text-sm md:text-base">
                        <p className="text-green-700">
                            Student: <span className="font-semibold">{studentName}</span> | 
                            ID: <span className="font-mono font-semibold">{studentId}</span>
                        </p>
                    </div>
                </div>

                <div className="bg-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 rounded-lg mb-4 md:mb-8 border border-blue-200">
                    <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold flex items-center text-blue-700 mb-2 md:mb-4">
                        <FontAwesomeIcon icon={faQuestionCircle} className="mr-2 lg:mr-3 text-sm sm:text-base md:text-lg lg:text-xl" />
                        Instructions
                    </h2>
                    <ul className="space-y-2 md:space-y-3 lg:space-y-4 text-xs sm:text-sm md:text-base lg:text-lg text-gray-700">
                        <li className="flex items-start">
                            <FontAwesomeIcon icon={faClock} className="text-blue-500 mt-1 mr-2 md:mr-3 flex-shrink-0 text-xs sm:text-sm md:text-base" />
                            <span>You have <span className="font-semibold">30 minutes</span> to complete the quiz.</span>
                        </li>
                        <li className="flex items-start">
                            <FontAwesomeIcon icon={faList} className="text-blue-500 mt-1 mr-2 md:mr-3 flex-shrink-0 text-xs sm:text-sm md:text-base" />
                            <span>The quiz consists of <span className="font-semibold">{questions.length} questions</span> from various categories.</span>
                        </li>
                        <li className="flex items-start">
                            <FontAwesomeIcon icon={faBrain} className="text-blue-500 mt-1 mr-2 md:mr-3 flex-shrink-0 text-xs sm:text-sm md:text-base" />
                            <span>Questions include reasoning, aptitude, and topics from grades 10-12.</span>
                        </li>
                        <li className="flex items-start">
                            <FontAwesomeIcon icon={faCheck} className="text-blue-500 mt-1 mr-2 md:mr-3 flex-shrink-0 text-xs sm:text-sm md:text-base" />
                            <span>Each correct answer is worth <span className="font-semibold">1 point</span>.</span>
                        </li>
                        <li className="flex items-start">
                            <FontAwesomeIcon icon={faTimes} className="text-blue-500 mt-1 mr-2 md:mr-3 flex-shrink-0 text-xs sm:text-sm md:text-base" />
                            <span>There is <span className="font-semibold">no negative marking</span> for wrong answers.</span>
                        </li>
                        <li className="flex items-start">
                            <FontAwesomeIcon icon={faIdCard} className="text-blue-500 mt-1 mr-2 md:mr-3 flex-shrink-0 text-xs sm:text-sm md:text-base" />
                            <span>Your results will be recorded and visible to your teachers.</span>
                        </li>
                    </ul>
                </div>

                <div className="text-center">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowInstructions(false)}
                        className="w-full sm:w-auto bg-blue-600 text-white py-2 sm:py-2.5 md:py-3 lg:py-4 px-4 sm:px-6 md:px-8 lg:px-10 rounded-lg font-medium shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-xs sm:text-sm md:text-base lg:text-lg"
                    >
                        Start Quiz <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    // Results screen
    if (showResults) {
        const percentage = Math.round((score / questions.length) * 100);

        let resultMessage = "";
        let resultColor = "";

        if (percentage >= 80) {
            resultMessage = "Excellent! You have a strong understanding of these topics.";
            resultColor = "text-green-600";
        } else if (percentage >= 60) {
            resultMessage = "Good job! You have a solid grasp of most concepts.";
            resultColor = "text-blue-600";
        } else if (percentage >= 40) {
            resultMessage = "Not bad! With a bit more study, you'll improve significantly.";
            resultColor = "text-yellow-600";
        } else {
            resultMessage = "Keep practicing! Focus on understanding the fundamental concepts.";
            resultColor = "text-red-600";
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 bg-white rounded-lg shadow-lg my-2 sm:my-4 md:my-8"
            >
                <div className="text-center mb-4 md:mb-8">
                    <FontAwesomeIcon icon={faTrophy} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-yellow-500 mb-2 md:mb-4" />
                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800">Quiz Completed!</h1>
                    <div className="mt-2 bg-blue-50 p-2 lg:p-3 rounded-lg inline-block text-xs sm:text-sm md:text-base">
                        <p className="text-blue-700">
                            Student: <span className="font-semibold">{studentName}</span> | 
                            ID: <span className="font-mono font-semibold">{studentId}</span>
                        </p>
                    </div>
                    <div className="mt-3 md:mt-4 mb-4 md:mb-6">
                        <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">{score}/{questions.length}</div>
                        <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold mt-1 md:mt-2">{percentage}%</div>
                        <p className={`mt-2 md:mt-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl ${resultColor}`}>{resultMessage}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4">
                        <p className="text-green-700 text-sm">
                            ✅ Your quiz has been submitted successfully! Your teacher will be able to see your results.
                        </p>
                    </div>
                </div>

                <div className="mb-4 md:mb-8">
                    <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-3 md:mb-4 text-gray-700">Question Review</h2>
                    <div className="space-y-3 sm:space-y-4 md:space-y-6">
                        {questions.map((question) => {
                            const isCorrect = selectedAnswers[question.id] === question.correctAnswer;
                            const wasAnswered = selectedAnswers[question.id] !== undefined;

                            return (
                                <motion.div
                                    key={question.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="border rounded-lg overflow-hidden"
                                >
                                    <div className="p-3 sm:p-4 md:p-5 lg:p-6 border-b bg-gray-50">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                                            <div className="flex flex-wrap gap-1 sm:gap-2">
                                                <span className={`inline-block px-2 sm:px-3 md:px-4 py-1 rounded-full text-xs sm:text-sm md:text-base font-medium ${getCategoryColor(question.category)}`}>
                                                    {question.category}
                                                </span>
                                                <span className={`inline-block px-2 sm:px-3 md:px-4 py-1 rounded-full text-xs sm:text-sm md:text-base font-medium ${!wasAnswered ? "bg-gray-100 text-gray-800" : isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                    {!wasAnswered ? "Not Answered" : isCorrect ? "Correct" : "Incorrect"}
                                                </span>
                                            </div>
                                            <span className="text-xs sm:text-sm md:text-base text-gray-500">Question {question.id}</span>
                                        </div>
                                        <h3 className="mt-2 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium text-gray-800">{question.question}</h3>
                                    </div>

                                    <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                                            {question.options.map((option, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`p-2 sm:p-3 md:p-4 border rounded-lg ${option === question.correctAnswer ? "bg-green-50 border-green-200" :
                                                        option === selectedAnswers[question.id] ? "bg-red-50 border-red-200" :
                                                            "bg-white"
                                                        }`}
                                                >
                                                    <div className="flex items-center">
                                                        {option === question.correctAnswer && (
                                                            <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-2 flex-shrink-0 text-xs sm:text-sm md:text-base" />
                                                        )}
                                                        {option === selectedAnswers[question.id] && option !== question.correctAnswer && (
                                                            <FontAwesomeIcon icon={faTimes} className="text-red-500 mr-2 flex-shrink-0 text-xs sm:text-sm md:text-base" />
                                                        )}
                                                        <span className="text-xs sm:text-sm md:text-base lg:text-lg">{option}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-3 md:mt-4 lg:mt-5 bg-blue-50 p-2 sm:p-3 md:p-4 lg:p-5 rounded border border-blue-100">
                                            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-blue-800">
                                                <span className="font-medium">Explanation:</span> {question.explanation}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="text-center mb-4 md:mb-6">
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg">
                        You'll be redirected to the dashboard in <span className="font-semibold">{redirectCountdown}</span> seconds
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate("/student-dashboard")}
                        className="mt-2 w-full sm:w-auto bg-blue-600 text-white py-2 sm:py-2.5 md:py-3 lg:py-4 px-4 sm:px-6 md:px-8 lg:px-10 rounded-lg font-medium shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-xs sm:text-sm md:text-base lg:text-lg"
                    >
                        Go to Dashboard Now <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    // Main quiz screen
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 bg-white rounded-lg shadow-lg my-2 sm:my-4 md:my-8"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3 sm:gap-0">
                <div className="w-full sm:w-auto">
                    <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800">Aptitude Quiz</h1>
                    <div className="mt-1 flex items-center flex-wrap gap-1 sm:gap-2">
                        <span className={`inline-block px-2 sm:px-3 md:px-4 py-1 rounded-full text-xs sm:text-sm md:text-base font-medium ${getCategoryColor(questions[currentQuestion].category)}`}>
                            {questions[currentQuestion].category}
                        </span>
                        <span className="text-xs sm:text-sm md:text-base text-gray-500">
                            Question {currentQuestion + 1} of {questions.length}
                        </span>
                        <span className="text-xs sm:text-sm text-blue-600 font-mono">
                            {studentId}
                        </span>
                    </div>
                </div>

                <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                    <div className={`flex items-center px-3 sm:px-4 md:px-5 py-1 sm:py-2 md:py-3 rounded-full ${timeLeft < 300 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                        <FontAwesomeIcon icon={faClock} className="mr-2 text-xs sm:text-sm md:text-base lg:text-lg" />
                        <span className="font-mono font-medium text-xs sm:text-sm md:text-base lg:text-lg">{formatTime(timeLeft)}</span>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4 md:mb-6 bg-gray-200 rounded-full h-2 sm:h-2.5 md:h-3 lg:h-4">
                <div
                    className="bg-blue-600 h-2 sm:h-2.5 md:h-3 lg:h-4 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>

            {/* Question */}
            <div className="mb-5 md:mb-8">
                <motion.h2
                    key={currentQuestion}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium text-gray-800 mb-4 md:mb-6 leading-relaxed"
                >
                    {questions[currentQuestion].question}
                </motion.h2>

                {/* Options */}
                <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
                    {questions[currentQuestion].options.map((option, index) => (
                        <motion.div
                            key={`${currentQuestion}-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleOptionSelect(questions[currentQuestion].id, option)}
                            className={`p-3 sm:p-4 md:p-5 lg:p-6 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${selectedAnswers[questions[currentQuestion].id] === option
                                ? "border-blue-500 bg-blue-50 shadow-md"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex items-center">
                                <div className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-3 sm:mr-4 md:mr-5 rounded-full flex items-center justify-center border ${selectedAnswers[questions[currentQuestion].id] === option
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-gray-300"
                                    }`}>
                                    {selectedAnswers[questions[currentQuestion].id] === option && (
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <span className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed">{option}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                    className={`w-full sm:w-auto order-2 sm:order-1 flex items-center justify-center py-2 sm:py-2.5 md:py-3 lg:py-4 px-4 sm:px-6 md:px-8 rounded-lg text-xs sm:text-sm md:text-base lg:text-lg ${currentQuestion === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Previous
                </motion.button>

                <div className="flex gap-2 md:gap-3 order-1 sm:order-2">
                    {currentQuestion === questions.length - 1 ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            disabled={isSubmitted}
                            className={`flex items-center justify-center py-2 sm:py-2.5 md:py-3 lg:py-4 px-4 sm:px-6 md:px-8 lg:px-10 rounded-lg font-medium text-xs sm:text-sm md:text-base lg:text-lg ${isSubmitted
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                                }`}
                        >
                            {isSubmitted ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Quiz
                                    <FontAwesomeIcon icon={faCheck} className="ml-2" />
                                </>
                            )}
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleNextQuestion}
                            className="flex items-center justify-center py-2 sm:py-2.5 md:py-3 lg:py-4 px-4 sm:px-6 md:px-8 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm md:text-base lg:text-lg"
                        >
                            Next
                            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Question navigation dots */}
            <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-3">
                {questions.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-200 ${currentQuestion === index
                            ? "bg-blue-600 scale-125"
                            : selectedAnswers[questions[index].id]
                                ? "bg-green-500"
                                : "bg-gray-300 hover:bg-gray-400"
                            }`}
                        aria-label={`Go to question ${index + 1}`}
                    ></button>
                ))}
            </div>
        </motion.div>
    );
};

export default AptitudeQuiz;