import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from "react";

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from "./context/ThemeContext";

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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('Invalid token');
                })
                .then(data => {
                    setUser(data);
                    setIsAuthenticated(true);
                })
                .catch(() => localStorage.removeItem("token"))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">Загрузка...</div>;
    }

    return (
        <ThemeProvider>
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route
                            path="/auth/login"
                            element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard" replace />}
                        />
                        <Route
                            path="/auth/register"
                            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />}
                        />

                        <Route path="/" element={isAuthenticated ? <MainLayout user={user} /> : <Navigate to="/auth/login" replace />}>
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
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;