import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GymProvider } from './context/GymContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Workouts from './pages/Workouts';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreateProfile from './pages/CreateProfile';

function App() {
    return (
        <Router>
            <AuthProvider>
                <GymProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        {/* Protected Route for Profile Setup */}
                        <Route path="/create-profile" element={
                            <ProtectedRoute>
                                <CreateProfile />
                            </ProtectedRoute>
                        } />

                        {/* Protected Tab Routes under App Shell */}
                        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                            <Route path="/" element={<Home />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/workouts" element={<Workouts />} />
                            <Route path="/messages" element={<Messages />} />
                            <Route path="/profile" element={<Profile />} />
                        </Route>
                    </Routes>
                </GymProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
