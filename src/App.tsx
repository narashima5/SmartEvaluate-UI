import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ParticipantLog from './pages/ParticipantLog.tsx';
import Evaluate from './pages/Evaluate.tsx';
import Login from './pages/Login.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/participants" replace />} />
            <Route path="participants" element={<ParticipantLog />} />
            <Route path="evaluate" element={<Evaluate />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
