import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GymProvider } from './context/GymContext';
import { ConversationProvider } from './context/ConversationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Workouts from './pages/Workouts';
import Arena from './pages/Arena';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';

function AppRoutes() {
    const { user } = useAuth();
    return (
        <ConversationProvider currentUserId={user?.id || ''}>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Onboarding (after signup) */}
                <Route path="/onboarding" element={
                    <ProtectedRoute>
                        <Onboarding />
                    </ProtectedRoute>
                } />

                {/* Protected Tab Routes under App Shell */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/workouts" element={<Workouts />} />
                    <Route path="/arena" element={<Arena />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>
            </Routes>
        </ConversationProvider>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <GymProvider>
                    <AppRoutes />
                </GymProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
