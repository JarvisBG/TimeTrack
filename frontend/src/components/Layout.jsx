import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="flex h-screen bg-secondary overflow-hidden">
            {/* Menu à gauche */}
            <Sidebar />

            {/* Contenu principal à droite */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Barre du haut */}
                <Navbar />

                {/* Espace central où s'affichent les pages */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;