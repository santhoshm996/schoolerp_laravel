import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SessionProvider } from './contexts/SessionContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import ToastContainer from './components/ui/ToastContainer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Schools from './pages/Schools';
import Sections from './pages/Sections';
import Classes from './pages/Classes';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import StudentAdmission from './pages/StudentAdmission';
import StudentView from './pages/StudentView';
import Parents from './pages/Parents';
import Sessions from './pages/Sessions';
import FeeGroups from './pages/FeeGroups';
import FeeMasterPage from './pages/FeeMaster';
import FeeAssignment from './pages/FeeAssignment';
import FeeCollection from './pages/FeeCollection';
import Layout from './components/Layout';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute />}>
                <Route element={
                  <SessionProvider>
                    <Layout />
                  </SessionProvider>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="schools" element={<Schools />} />
                  <Route path="sections" element={<Sections />} />
                  <Route path="classes" element={<Classes />} />
                  <Route path="teachers" element={<Teachers />} />
                  <Route path="students" element={<Students />} />
                  <Route path="student-admission" element={<StudentAdmission />} />
                  <Route path="students/:id" element={<StudentView />} />
                  <Route path="parents" element={<Parents />} />
                  <Route path="sessions" element={<Sessions />} />
                  <Route path="fee-groups" element={<FeeGroups />} />
                  <Route path="fee-master" element={<FeeMasterPage />} />
                  <Route path="fee-assignment" element={<FeeAssignment />} />
                  <Route path="fee-collection" element={<FeeCollection />} />
                </Route>
              </Route>
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
}

export default App;
