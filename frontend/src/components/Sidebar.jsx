import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, ScanLine, Clock, ClipboardList } from 'lucide-react';

const Sidebar = () => {
    const { user } = useAuth();

    // Liens de navigation avec icônes
    const navItems = [
        { path: '/dashboard', name: 'Tableau de bord', icon: LayoutDashboard, roles: ['admin', 'gestionnaire'] },
        { path: '/employees', name: 'Employés', icon: Users, roles: ['admin'] },
        { path: '/scanner', name: 'Scanner QR', icon: ScanLine, roles: ['admin', 'gestionnaire'] },
        { path: '/history', name: 'Historique', icon: ClipboardList, roles: ['admin', 'gestionnaire'] },
    ];

    return (
        <aside className="w-64 bg-primary text-white flex flex-col h-screen shadow-xl hidden md:flex">
            {/* En-tête du menu */}
            <div className="h-16 flex items-center px-6 border-b border-blue-800">
                <Clock className="w-6 h-6 mr-2" />
                <span className="text-xl font-bold tracking-wider">TimeTrack</span>
            </div>

            {/* Liens de navigation */}
            <nav className="flex-1 py-6 px-3 space-y-2">
                {navItems.map((item) => {
                    // Vérification des droits d'accès pour afficher le lien
                    if (!item.roles.includes(user?.role)) return null;

                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                                    isActive ? 'bg-blue-800 text-white font-semibold' : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;