import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
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

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/auth">
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />
                    </Route>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <MainLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="profile" element={<ProfileSettings />} />

                        <Route path="projects" element={<ProjectList />} />
                        <Route path="projects/:id" element={<ProjectDetail />} />

                        <Route path="tasks" element={<TaskList />} />
                        <Route path="tasks/:id" element={<TaskDetail />} />

                        <Route path="notes" element={<NotesList />} />
                        <Route path="notes/:id" element={<NoteEditor />} />

                        <Route path="chats" element={<ChatList />} />

                        <Route
                            path="admin"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminPanel />
                                </ProtectedRoute>
                            }
                        />
                    </Route>

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
