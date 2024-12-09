import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import axios from 'axios';
import './QuizManagement.css';

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    questions: [],
    startTime: '',
    endTime: '',
  });
  const [question, setQuestion] = useState({ questionText: '', options: [], correctOption: 0 });
  const [message, setMessage] = useState('');

  // Fetch All Quizzes
  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/quizzes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error.message);
      setMessage('Failed to fetch quizzes');
    }
  };

  // Fetch Submissions for Selected Quiz
  const fetchSubmissions = async (quizId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/quizzes/${quizId}/results`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error.message);
      setSubmissions([]);
    }
  };

  useEffect(() => {
    fetchQuizzes(); // Fetch quizzes on component mount
  }, []);
  // Handle Adding Question
  const handleAddQuestion = () => {
    if (question.questionText && question.options.length > 0 && question.correctOption >= 0) {
      setFormData({
        ...formData,
        questions: [...formData.questions, question],
      });
      setQuestion({ questionText: '', options: [], correctOption: 0 });
    } else {
      alert('Please provide valid question details!');
    }
  };

  // Handle Quiz Creation
  const handleCreateQuiz = async () => {
    if (!formData.title || formData.questions.length === 0 || !formData.startTime || !formData.endTime) {
      alert('Please fill all the required fields!');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/quizzes/create',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setMessage('Quiz created successfully!');
      fetchQuizzes(); // Refresh quizzes
      setFormData({ title: '', questions: [], startTime: '', endTime: '' });
    } catch (error) {
      console.error('Error creating quiz:', error.response?.data || error.message);
      setMessage('Failed to create quiz');
    }
  };

  return (
    <div className="quiz-management">
  <header className="quiz-management-header">
    <h2>Create Quiz</h2>
    {message && <p className="quiz-management-message">{message}</p>}
  </header>

  <section className="quiz-creation-section">
    <input
      type="text"
      className="quiz-title-input"
      placeholder="Quiz Title"
      value={formData.title}
      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
    />
    <input
      type="datetime-local"
      className="quiz-start-time-input"
      value={formData.startTime}
      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
      required
    />
    <input
      type="datetime-local"
      className="quiz-end-time-input"
      value={formData.endTime}
      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
      required
    />
  </section>

  <section className="add-questions-section">
    <h3>Add Questions</h3>
    <div className="question-form">
      <input
        type="text"
        className="question-text-input"
        placeholder="Question Text"
        value={question.questionText}
        onChange={(e) => setQuestion({ ...question, questionText: e.target.value })}
      />
      <textarea
        className="question-options-input"
        placeholder="Options (comma separated)"
        value={question.options.join(',')}
        onChange={(e) =>
          setQuestion({ ...question, options: e.target.value.split(',').map((o) => o.trim()) })
        }
      />
      <input
        type="number"
        className="correct-option-input"
        placeholder="Correct Option Index"
        value={question.correctOption}
        onChange={(e) => setQuestion({ ...question, correctOption: Number(e.target.value) })}
      />
      <button className="add-question-button" onClick={handleAddQuestion}>Add Question</button>
    </div>
  </section>

  <section className="create-quiz-section">
    <button className="create-quiz-button" onClick={handleCreateQuiz}>Create Quiz</button>
  </section>

  <section className="all-quizzes-section">
    <h3>All Quizzes</h3>
    <div className="all-quizzes">
      {quizzes.length === 0 ? (
        <p className="no-quizzes-message">No quizzes available yet.</p>
      ) : (
        quizzes.map((quiz) => (
          <div key={quiz._id} className="quiz-card">
            <h4 className="quiz-title">{quiz.title}</h4>
            <p className="quiz-questions-count">{quiz.questions.length} Questions</p>
            <p className="quiz-start-time">Start: {new Date(quiz.startTime).toLocaleString()}</p>
            <p className="quiz-end-time">End: {new Date(quiz.endTime).toLocaleString()}</p>
            <Link to={`/quizzes/${quiz._id}/results`} className="results-link">View Results</Link>
          </div>
        ))
      )}
    </div>
  </section>

  {selectedQuiz && (
    <section className="quiz-submissions-section">
      <h2 className="quiz-submissions-title">
        Submissions for Quiz: {quizzes.find((q) => q._id === selectedQuiz)?.title}
      </h2>
      {submissions.length === 0 ? (
        <p className="no-submissions-message">No quiz submitted</p>
      ) : (
        <ul className="submissions-list">
          {submissions.map((submission) => (
            <li key={submission.student._id} className="submission-item">
              {submission.student.fullName}: {submission.score} Marks
            </li>
          ))}
        </ul>
      )}
    </section>
  )}
</div>

  );
};

export default QuizManagement;
