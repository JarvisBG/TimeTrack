import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import des véritables composants connectés
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees'; 

// --- Pages Temporaires restantes (que nous allons coder dans les étapes 13 et 14) ---
const Scanner = () => <div className="bg-white p-10 rounded-xl shadow-sm text-center font-bold text-xl text-gray-600">Scanner QR Code (En construction)</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route publique */}
          <Route path="/login" element={<Login />} />

          {/* Espace sécurisé */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Ici, on affiche maintenant le VÉRITABLE tableau de bord avec ses graphiques */}
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            
            {/* Route réservée exclusivement à l'administrateur */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
               <Route path="/employees" element={<Layout><Employees /></Layout>} />
            </Route>

            {/* Route pour le scanner de présence */}
            <Route path="/scanner" element={<Layout><Scanner /></Layout>} />
          </Route>

          {/* Sécurité si la route n'existe pas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;