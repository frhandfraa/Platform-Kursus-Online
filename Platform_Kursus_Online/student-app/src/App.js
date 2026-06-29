import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CourseDetail from './pages/CourseDetail';
import StudentDashboard from './pages/StudentDashboard';
import CourseLearn from './pages/CourseLearn';
import QuizTake from './pages/QuizTake';
// import QuizTake from './pages/QuizTake';  // nanti

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
        <Route path="/learn/:enrollmentId" element={<PrivateRoute><CourseLearn /></PrivateRoute>} />
        {/* <Route path="/quiz/:lessonId" element={<PrivateRoute><QuizTake /></PrivateRoute>} /> */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/quiz/:lessonId" element={<PrivateRoute><QuizTake /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;