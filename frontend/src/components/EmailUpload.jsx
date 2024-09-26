import React, { useState } from 'react';
import { MdMarkEmailRead } from "react-icons/md";
import axios from 'axios';

const EmailUpload = () => {
    const [emailContent, setEmailContent] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateEmailContent = () => {
        if (!emailContent.trim()) {
            setError('Email content cannot be empty.');
            return false;
        }
        if (emailContent.length > 5000) {
            setError('Email content is too long. Maximum allowed is 5000 characters.');
            return false;
        }
        setError('');
        return true;
    };

    const analyzeEmail = async () => {
        if (!validateEmailContent()) {
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            const response = await axios.post(
                'http://localhost:5000/analyze-email',
                new URLSearchParams({ email_content: emailContent }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );
            setResult(response.data);
        } catch (error) {
            console.error('Error analyzing email:', error);
            setError('Failed to analyze email. Please try again.');
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center min-h-screen bg-gradient-to-br from-gray-950 to-gray-900">
            <div className="bg-gray-800 rounded-lg m-8 shadow-lg p-8 transform transition-all duration-300 hover:shadow-purple-600 hover:shadow-xl">

                {/* Header section with icon */}
                <div className="flex items-center justify-center mb-5">
                    <h1 className="lg:text-3xl text-xl font-extrabold text-white text-center mr-2">Phishing Email Detector</h1>
                    <MdMarkEmailRead className='text-white lg:text-4xl text-4xl' />
                </div>

                {/* Textarea input */}
                <textarea
                    rows="8"
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    placeholder="Paste your email here..."
                    className="w-full p-3 border border-gray-700 bg-gray-900 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                    aria-label="Email Content"
                />
                <p className="text-right text-gray-400">{emailContent.length}/5000</p>

                {/* Analyze Button */}
                <button
                    onClick={analyzeEmail}
                    className="mt-4 justify-center w-full p-2 bg-purple-600 text-white rounded-md hover:bg-purple-800 transition duration-300 flex items-center"
                >
                    {loading ? (
                        <svg
                            className="animate-spin h-5 w-5 mr-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                    ) : (
                        'Analyze Email'
                    )}
                </button>

                {/* Error Handling */}
                {error && <p className="mt-4 text-center text-red-400 transition duration-300">{error}</p>}

                {/* Analysis Result */}
                {result && (
                    <div className={`mt-6 p-6 rounded-lg shadow-lg ${result.risk_level === "High" ? 'bg-red-500' : result.risk_level === "Medium" ? 'bg-yellow-500' : 'bg-green-700'}`}>
                        <h2 className="text-2xl font-bold text-center text-white">Analysis Result</h2>
                        <hr />
                        <div className="mt-4">
                            <p className="text-white">
                                <span className="font-semibold">Is Phishing:</span>
                                <span className={`${result.is_phishing ? 'text-gray-200' : 'text-green-300'}`}>
                                    {result.is_phishing ? ' Yes' : ' No'}
                                </span>
                            </p>
                            <p className="text-white">
                                <span className="font-semibold">Email Type:</span>
                                <span className="font-bold">{result.email_type || ' Not classified'}</span>
                            </p>
                            <p className="text-white">
                                <span className="font-semibold">Risk Level:</span>
                                <span className={`font-bold ${result.risk_level === "High" ? 'text-red-300' : result.risk_level === "Medium" ? 'text-yellow-300' : 'text-green-300'}`}>
                                    {result.risk_level}
                                </span>
                            </p>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-white">Detected Phrases:</h3>
                            <p className="text-white">
                                {result.detected_phrases && result.detected_phrases.length > 0
                                    ? result.detected_phrases.join(' | ')
                                    : 'None'}
                            </p>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-white">Detected Phishing Keywords:</h3>
                            <ul className="mt-2 text-white list-disc list-inside">
                                {result.detected_phishing_keywords && result.detected_phishing_keywords.length > 0 ? (
                                    result.detected_phishing_keywords.map((keyword, index) => (
                                        <li key={index} className="text-gray-300">{keyword}</li>
                                    ))
                                ) : (
                                    <li className="text-white">None</li>
                                )}
                            </ul>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-white">Phishing URLs:</h3>
                            <ul className="mt-2">
                                {result.phishing_urls && result.phishing_urls.length > 0 ? (
                                    result.phishing_urls.map((urlInfo, index) => {
                                        const isNoneDetected = urlInfo.url === 'None Detected' && !urlInfo.is_phishing;

                                        return (
                                            <li key={index} className={`flex items-center justify-between p-4 mb-2 rounded-lg ${isNoneDetected ? 'bg-none' : 'bg-[#630f0f]'}`}>
                                                <span className='text-gray-200'>{urlInfo.url}</span>
                                                <span className={`font-bold ${urlInfo.is_phishing ? 'text-red-300' : 'text-green-300'}`}>
                                                    {urlInfo.is_phishing ? 'Not Safe' : 'Safe'}
                                                </span>
                                            </li>
                                        );
                                    })
                                ) : null}
                            </ul>   
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default EmailUpload;
