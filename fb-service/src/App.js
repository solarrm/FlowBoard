import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from './context/AuthContext';

import MainLayout from './components/Layout/MainLayout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './pages/Dashboard';
import ProfileSettings from './pages/ProfileSettings';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import TaskList from './pages/TaskList';
import TaskDetail from './pages/TaskDetail';
import NotesList from './pages/NotesList';
import NoteEditor from './pages/NoteEditor';
import ChatList from './pages/ChatList';
import AdminPanel from './pages/AdminPanel';

function AppContent() {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                Загрузка...
            </div>
        );
    }

    return (
        <Routes>
            <Route
                path="/auth/login"
                element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
            />
            <Route
                path="/auth/register"
                element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />}
            />

            <Route
                path="/"
                element={isAuthenticated ? <MainLayout user={user} /> : <Navigate to="/auth/login" replace />}
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="projects" element={<ProjectList />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route path="tasks" element={<TaskList />} />
                <Route path="tasks/:id" element={<TaskDetail />} />
                <Route path="notes" element={<NotesList />} />
                <Route path="notes/:id" element={<NoteEditor />} />
                <Route path="chats" element={<ChatList />} />
                <Route path="admin/*" element={<AdminPanel />} />
            </Route>

            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth/login"} replace />} />
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;
