import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Overview from './pages/Overview';
import DigitalTwin from './pages/DigitalTwin';
import PredictiveEngine from './pages/PredictiveEngine';
import AICouncil from './pages/AICouncil';
import EmergencyResponse from './pages/EmergencyResponse';
import KnowledgeCenter from './pages/KnowledgeCenter';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ProtectedRoute>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/digital-twin" element={<DigitalTwin />} />
            <Route path="/predictive-engine" element={<PredictiveEngine />} />
            <Route path="/ai-council" element={<AICouncil />} />
            <Route path="/emergency-response" element={<EmergencyResponse />} />
            <Route path="/knowledge-center" element={<KnowledgeCenter />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </ProtectedRoute>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;