import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ExperienceSuite from './pages/ExperienceSuite';
import Dashboard from './pages/Dashboard';
import Trends from './pages/Trends';
import Geographic from './pages/Geographic';
import Cohorts from './pages/Cohorts';
import Actions from './pages/Actions';
import SurveyManagement from './pages/SurveyManagement';
import Settings from './pages/Settings';
import SecurityCompliance from './pages/SecurityCompliance';
import Login from './pages/Login';
import Survey from './pages/Survey';

function App() {
  // Mock auth - you can implement real auth later
  const isAuthenticated = localStorage.getItem('token') !== null;
  const isSurveyPage = window.location.pathname.startsWith('/survey/');

  // Allow survey pages without authentication
  if (!isAuthenticated && window.location.pathname !== '/login' && !isSurveyPage) {
    return <Navigate to="/login" />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/survey/:token" element={<Survey />} />
      {/* Experience Suite - Landing page after login */}
      <Route path="/experience-suite" element={<ExperienceSuite />} />
      <Route path="/" element={<Layout />}>
        {/* Default redirect to Experience Suite */}
        <Route index element={<Navigate to="/experience-suite" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="trends" element={<Trends />} />
        <Route path="geographic" element={<Geographic />} />
        <Route path="cohorts" element={<Cohorts />} />
        <Route path="actions" element={<Actions />} />
        <Route path="surveys" element={<SurveyManagement />} />
        <Route path="settings" element={<Settings />} />
        <Route path="security" element={<SecurityCompliance />} />
      </Route>
    </Routes>
  );
}

export default App;
