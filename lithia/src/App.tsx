import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import BusinessTrainingPage from './pages/BusinessTrainingPage';
import InnovationFrameworkPage from './pages/InnovationFrameworkPage';
import ProductDesignPage from './pages/ProductDesignPage';
import FunctionalSpecsPage from './pages/FunctionalSpecsPage';
import EvaluateRegulationsPage from './pages/EvaluateRegulationsPage';
import CreateDataPage from './pages/CreateDataPage';
import GenerateDocumentPage from './pages/GenerateDocumentPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/training" replace />} />
        <Route path="/" element={<Layout />}>
          <Route path="training" element={<BusinessTrainingPage />} />
          <Route path="design" element={<ProductDesignPage />} />
          <Route path="functional-specs" element={<FunctionalSpecsPage />} />
          <Route path="evaluate-regulations" element={<EvaluateRegulationsPage />} />
          <Route path="create-data" element={<CreateDataPage />} />
          <Route path="ai-design" element={<InnovationFrameworkPage />} />
          <Route path="generate-document" element={<GenerateDocumentPage />} />
          <Route path="foundations" element={<Navigate to="/design?phase=0" replace />} />
          <Route path="framework-lab" element={<Navigate to="/ai-design" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
