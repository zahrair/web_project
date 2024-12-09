import React, { useEffect, useState } from 'react';
import Widget from './widgets/Widget';
import './DashboardBody.css';

const renderInteractiveCalendar = () => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();

  return (
    <div>
      <div className="calendar-header">
        <h3>{currentMonth} {currentYear}</h3>
      </div>
      <div className="calendar-days">
        {Array.from({ length: 31 }, (_, i) => (
          <div
            key={i}
            className={`calendar-day ${i + 1 === currentDay ? 'highlight' : ''}`}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardBody = ({ teacherName }) => {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalAssignments: 0,
    totalCourses: 0,
    averageRating: 0,
    topRatedStudents: [], // Initialize as an empty array
  });
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const renderStars = (rating) => {
    const filledStars = Math.round(rating);
    return (
      <>
        {'★'.repeat(filledStars)}
        {'☆'.repeat(5 - filledStars)}
      </>
    );
  };


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard-data', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses/my-courses', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.msg || 'Failed to fetch courses');
          return;
        }
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('An error occurred while fetching courses');
      }
    };
    

    fetchDashboardData();
    fetchCourses();
  }, []);

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-content">
      <header className="dashboard-header">
  <div className="welcome-section">
    <h1>Welcome, {teacherName}</h1>
    <p>Access your tools and manage your resources efficiently.</p>
  </div>
  <div className="calendar-section">
    <div className="calendar">
      {renderInteractiveCalendar()}
    </div>
  </div>
</header>

        <div className="dashboard-cards">
          <div className="card">
            <h2>Total Students</h2>
            <p>{dashboardData.totalStudents}</p>
          </div>
          <div className="card">
            <h2>Total Assignments</h2>
            <p>{dashboardData.totalAssignments}</p>
          </div>
          <div className="card">
            <h2>Total Courses</h2>
            <p>{dashboardData.totalCourses}</p>
          </div>
          <div className="card">
            <h2>Average Rating</h2>
            <p>{dashboardData.averageRating}</p>
          </div>
        </div>

        <div className="widgets">
          <Widget title="Resource Management" description="Upload and organize resources." path="/resources" onNavigate={handleNavigation} />
          <Widget title="Study Sessions" description="Schedule and notify students." path="/schedule-meeting" onNavigate={handleNavigation} />
          <Widget title="Student Progress" description="Track student activity and performance." path="/student-progress" onNavigate={handleNavigation} />
          <Widget title="Feedback Management" description="Provide feedback and track student performance." path="/feedback" onNavigate={handleNavigation} />
          <Widget title="Assignment Management" description="Create and track assignments." path="/assignments" onNavigate={handleNavigation} />
        </div>

        <div className="courses-feedback-section">
          <div className="courses-section">
            <h2 className="courses-header">Your Courses</h2>
            <div className="course-cards">
              {error && <p className="error">{error}</p>}
              {courses.length > 0 ? (
                courses.map((course) => (
                  <div key={course._id} className="course-card">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                  </div>
                ))
              ) : (
                !error && <p>No courses found. Start adding courses!</p>
              )}
            </div>
          </div>

          <div className="top-rated-students">
            <h2>Top Rated Students</h2>
            <div className="student-cards">
              {dashboardData.topRatedStudents?.length > 0 ? (
                dashboardData.topRatedStudents.slice(0, 4).map((student) => (
                  <div key={student._id} className="student-card">
                    <h3>{student.fullName}</h3>
                    <p>Rating: {renderStars(student.averageRating)}</p>
                  </div>
                ))
              ) : (
                <p>No top-rated students available.</p>
              )}
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBody;
