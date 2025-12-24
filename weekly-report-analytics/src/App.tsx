import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import AdminPage from './pages/AdminPage';
import InsightsPage from './pages/InsightsPage';

function App() {
  return (
    <BrowserRouter>
      <Navigation>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Navigation>
    </BrowserRouter>
  );
}

export default App;

