import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

// Création du contexte
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Au chargement de l'application, on vérifie si un token existe déjà
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Vérifier si le token a expiré
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    // On restaure la session avec les données du token
                    setUser({ username: decoded.sub, role: decoded.role });
                }
            } catch (error) {
                console.error("Token invalide", error);
                logout();
            }
        }
        setLoading(false); // Fin du chargement initial
    }, []);

    // Fonction pour connecter l'utilisateur
    const login = (token) => {
        localStorage.setItem('token', token); // Sauvegarde dans le navigateur
        const decoded = jwtDecode(token);
        setUser({ username: decoded.sub, role: decoded.role });
    };

    // Fonction pour déconnecter l'utilisateur
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personnalisé pour utiliser le contexte facilement partout
export const useAuth = () => useContext(AuthContext);