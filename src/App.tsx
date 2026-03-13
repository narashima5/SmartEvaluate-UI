import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ParticipantLog from './pages/ParticipantLog.tsx';
import Evaluate from './pages/Evaluate.tsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/participants" replace />} />
        <Route path="participants" element={<ParticipantLog />} />
        <Route path="evaluate" element={<Evaluate />} />
      </Route>
    </Routes>
  );
}

export default App;
