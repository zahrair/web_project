import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams to fetch quizId from the URL
import axios from 'axios';
import './QuizResultsPage.css';

const QuizResultsPage = () => {
  const { quizId } = useParams(); // Fetch quizId from URL parameters
  const [results, setResults] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [message, setMessage] = useState('');

  const fetchFullResults = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/quizzes/${quizId}/results`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Assuming the backend sends `quizTitle` and `results` in the response
      setQuizTitle(response.data.quizTitle); // Set quiz title
      setResults(response.data.results); // Set all student results
    } catch (error) {
      console.error('Error fetching quiz results:', error.message);
      setMessage('Failed to fetch results.');
    }
  };

  useEffect(() => {
    if (quizId) {
      fetchFullResults();
    }
  }, [quizId]);

  return (
    <div className="quiz-results-page">
    <header className="quiz-results-header">
      <h2>Quiz Results</h2>
      {message && <p className="quiz-results-message">{message}</p>}
    </header>
    
    <section className="quiz-title-section">
      <h3 className="quiz-title">{quizTitle}</h3> {/* Display Quiz Title */}
    </section>
  
    <section className="results-section">
      {results.length === 0 ? (
        <p className="no-results-message">No results available.</p>
      ) : (
        <table className="results-table">
          <thead>
            <tr className="results-table-header">
              <th className="results-table-header-cell">Student Name</th>
              <th className="results-table-header-cell">Score</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.studentId} className="results-table-row">
                <td className="results-table-cell">{result.fullName}</td>
                <td className="results-table-cell">{result.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  </div>
  
  );
};

export default QuizResultsPage;
 