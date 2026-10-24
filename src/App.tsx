import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GymProvider } from './context/GymContext';
import { ConversationProvider } from './context/ConversationContext';
import { FriendsProvider } from './context/FriendsContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationsProvider } from './context/NotificationsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Workouts from './pages/Workouts';
import Arena from './pages/Arena';
import Login from './pages/Login';

// Lazy-loaded secondary routes to keep initial mobile cold-start bundle fast
const Search = lazy(() => import('./pages/Search'));
const Messages = lazy(() => import('./pages/Messages'));
const Profile = lazy(() => import('./pages/Profile'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const Signup = lazy(() => import('./pages/Signup'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Admin = lazy(() => import('./pages/Admin'));
const JoinSquad = lazy(() => import('./pages/JoinSquad'));

function RouteFallback() {
    return (
        <div className="min-h-screen bg-oled flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-lime border-t-transparent animate-spin" />
        </div>
    );
}

function AppRoutes() {
    const { user } = useAuth();
    return (
        <ConversationProvider currentUserId={user?.id || ''}>
            <FriendsProvider>
                <Suspense fallback={<RouteFallback />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/join" element={<JoinSquad />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

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
                            <Route path="/nutrition" element={<Nutrition />} />
                            <Route path="/arena" element={<Arena />} />
                            <Route path="/messages" element={<Messages />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/admin" element={<Admin />} />
                        </Route>
                    </Routes>
                </Suspense>
            </FriendsProvider>
        </ConversationProvider>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <NotificationsProvider>
                    <GymProvider>
                        <ToastProvider>
                            <AppRoutes />
                        </ToastProvider>
                    </GymProvider>
                </NotificationsProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
