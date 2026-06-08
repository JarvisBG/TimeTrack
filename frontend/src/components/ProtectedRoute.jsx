import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    // Pendant qu'on vérifie le token, on affiche un petit message
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 text-primary font-bold text-xl">
                Chargement de TimeTrack...
            </div>
        );
    }

    // Si l'utilisateur n'est pas connecté, on le renvoie vers /login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Si la route exige un rôle spécifique (ex: admin) et que l'utilisateur ne l'a pas
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />; 
    }

    // Tout est bon, on affiche la page demandée (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;