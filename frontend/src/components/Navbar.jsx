import { useAuth } from '../context/AuthContext';
import { LogOut, UserCircle } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6 z-10 relative">
            <div className="text-lg font-medium text-gray-700">
                {/* On peut ajouter ici un titre dynamique en fonction de la page plus tard */}
            </div>

            <div className="flex items-center space-x-6">
                <div className="flex items-center">
                    <UserCircle className="w-8 h-8 text-gray-400 mr-2" />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800 leading-tight">
                            {user?.username}
                        </span>
                        <span className="text-xs text-gray-500 capitalize leading-tight">
                            {user?.role}
                        </span>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center text-sm text-red-600 hover:text-red-800 transition px-3 py-2 rounded-lg hover:bg-red-50"
                >
                    <LogOut className="w-4 h-4 mr-1.5" />
                    Déconnexion
                </button>
            </div>
        </header>
    );
};

export default Navbar;