import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BusinessTrainingPage from './pages/BusinessTrainingPage';
import InnovationFrameworkPage from './pages/InnovationFrameworkPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/training" replace />} />
        <Route path="/" element={<Layout />}>
          <Route path="training" element={<BusinessTrainingPage />} />
          <Route path="framework-lab" element={<InnovationFrameworkPage />} />
          <Route path="foundations" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
