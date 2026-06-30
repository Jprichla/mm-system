import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminOnlyRoute } from './components/AdminOnlyRoute';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { MaterialsPage } from './pages/MaterialsPage';
import { MaterialFormPage } from './pages/MaterialFormPage';
import MaterialDetailPage from './pages/MaterialDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectFormPage } from './pages/ProjectFormPage';
import ProjectDocumentsWorkspacePage from './pages/ProjectDocumentsWorkspacePage';
import TypicalDetailsPage from './pages/TypicalDetailsPage';
import TypicalDetailFormPage from './pages/TypicalDetailFormPage';
import TypicalDetailDetailPage from './pages/TypicalDetailDetailPage';
import TypicalDetailsGalleryPage from './pages/TypicalDetailsGalleryPage';
import DocumentsPage from './pages/DocumentsPage';
import DocumentDetailPage from './pages/DocumentDetailPage';
import DocumentsBalancePage from './pages/DocumentsBalancePage';
import AdminUsersAccessPage from './pages/AdminUsersAccessPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/materials/new" element={<MaterialFormPage />} />
          <Route path="/materials/:id/detail" element={<MaterialDetailPage />} />
          <Route path="/materials/:id/edit" element={<MaterialFormPage />} />
          <Route path="/typical-details" element={<TypicalDetailsPage />} />
          <Route path="/typical-details/new" element={<TypicalDetailFormPage />} />
          <Route path="/typical-details/:id/detail" element={<TypicalDetailDetailPage />} />
          <Route path="/typical-details/:id/edit" element={<TypicalDetailFormPage />} />
          <Route path="/typical-details/gallery" element={<TypicalDetailsGalleryPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/balance" element={<DocumentsBalancePage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<ProjectFormPage />} />
          <Route path="/projects/:id/edit" element={<ProjectFormPage />} />
          <Route path="/projects/:id/documents" element={<ProjectDocumentsWorkspacePage />} />
          <Route element={<AdminOnlyRoute />}>
            <Route path="/admin/users-access" element={<AdminUsersAccessPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
