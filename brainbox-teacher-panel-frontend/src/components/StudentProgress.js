import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './StudentProgress.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const StudentProgress = () => {
  const [progressData, setProgressData] = useState([]); // Ensure this is always an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/progress/progress', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (!response.ok) {
          const errorMessage = await response.json();
          throw new Error(errorMessage.msg || 'Failed to fetch student progress.');
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format. Expected an array.');
        }

        setProgressData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching student progress:', err.message);
        setError(err.message || 'An error occurred while fetching progress data.');
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  const generateChartData = (student) => ({
    labels: ['Assignments Completed', 'Quizzes Completed', 'Average Rating'],
    datasets: [
      {
        label: `${student.student.fullName}'s Performance`,
        data: [
          student.assignmentsCompleted || 0,
          student.quizzesCompleted || 0,
          student.averageRating || 0,
        ],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107'], // Colors for each section
        hoverOffset: 4,
      },
    ],
  });

  return (
    <div className="student-progress">
      <h1>Student Progress</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : progressData.length === 0 ? (
        <p>No student progress data available.</p>
      ) : (
        progressData.map((student, index) => (
          <div key={index} className="student-progress-chart">
            <h2>{student.student.fullName}</h2>
            <p>Email: {student.student.email}</p>
            <Pie
              data={generateChartData(student)}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default StudentProgress;
