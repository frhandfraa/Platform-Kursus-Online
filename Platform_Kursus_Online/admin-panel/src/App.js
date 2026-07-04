import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Modules from './pages/Modules';
import Lessons from './pages/Lessons';
import Quiz from './pages/Quiz';
import Questions from './pages/Questions';
import Settings from './pages/Settings';
import Certificates from './pages/Certificates'; // <-- import

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/courses" element={<PrivateRoute><Courses /></PrivateRoute>} />
        <Route path="/courses/:courseId/modules" element={<PrivateRoute><Modules /></PrivateRoute>} />
        <Route path="/modules/:moduleId/lessons" element={<PrivateRoute><Lessons /></PrivateRoute>} />
        <Route path="/lessons/:lessonId/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />
        <Route path="/quizzes/:quizId/questions" element={<PrivateRoute><Questions /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
        <Route path="/certificates" element={<PrivateRoute><Certificates /></PrivateRoute>} /> {/* <-- tambahkan */}
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;