import { useState, useEffect } from 'react';
import { 
    Users, UserCheck, UserX, Clock, Download, FileText 
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import api from '../services/api';

const Dashboard = () => {
    // État pour stocker les statistiques venant du backend
    const [stats, setStats] = useState({
        total_employes: 0,
        presents: 0,
        absents: 0,
        taux_presence: 0,
        taux_retard: 0,
        moyenne_heures: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    // Fonction pour récupérer les données au chargement de la page
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/analytics/dashboard');
                setStats(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des statistiques:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // --- Fonctions de téléchargement des rapports ---
    const downloadReport = async (type) => {
        try {
            // responseType: 'blob' est crucial pour télécharger des fichiers (PDF/Excel)
            const response = await api.get(`/analytics/reports/daily/${type}`, { responseType: 'blob' });
            
            // Création d'un lien invisible pour forcer le téléchargement dans le navigateur
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            const date = new Date().toISOString().split('T')[0];
            const extension = type === 'excel' ? 'xlsx' : 'pdf';
            link.setAttribute('download', `Rapport_Presences_${date}.${extension}`);
            
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            alert(`Erreur lors du téléchargement du rapport ${type.toUpperCase()}`);
        }
    };

    // --- Données pour les graphiques (Recharts) ---
    // Graphique circulaire (Camembert) basé sur les VRAIES données du jour
    const pieData = [
        { name: 'Présents', value: stats.presents },
        { name: 'Absents', value: stats.absents },
    ];
    const COLORS = ['#10b981', '#ef4444']; // Vert pour présents, Rouge pour absents

    // Graphique en barres (Données simulées pour le prototype visuel de la semaine)
    const barData = [
        { jour: 'Lun', presents: 42, retards: 3 },
        { jour: 'Mar', presents: 45, retards: 1 },
        { jour: 'Mer', presents: 40, retards: 5 },
        { jour: 'Jeu', presents: 46, retards: 2 },
        { jour: 'Ven', presents: 43, retards: 4 },
    ];

    if (isLoading) {
        return <div className="flex justify-center items-center h-full">Chargement des statistiques...</div>;
    }

    return (
        <div className="space-y-6">
            {/* En-tête avec Titre et Boutons d'export */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Vue d'ensemble</h1>
                    <p className="text-gray-500 text-sm mt-1">Statistiques des présences d'aujourd'hui</p>
                </div>
                <div className="flex space-x-3 mt-4 sm:mt-0">
                    <button 
                        onClick={() => downloadReport('excel')}
                        className="flex items-center px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Excel
                    </button>
                    <button 
                        onClick={() => downloadReport('pdf')}
                        className="flex items-center px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                    </button>
                </div>
            </div>

            {/* Grille des Cartes KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Carte 1 : Total Employés */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-blue-100 p-4 rounded-lg mr-4">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Employés</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.total_employes}</h3>
                    </div>
                </div>

                {/* Carte 2 : Présents */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-green-100 p-4 rounded-lg mr-4">
                        <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Présents aujourd'hui</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.presents}</h3>
                        <p className="text-xs text-green-600 mt-1 font-medium">{stats.taux_presence}% de présence</p>
                    </div>
                </div>

                {/* Carte 3 : Absents */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-red-100 p-4 rounded-lg mr-4">
                        <UserX className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Absents aujourd'hui</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.absents}</h3>
                    </div>
                </div>

                {/* Carte 4 : Retards */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-orange-100 p-4 rounded-lg mr-4">
                        <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Taux de retard</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.taux_retard}%</h3>
                    </div>
                </div>
            </div>

            {/* Section des Graphiques (Recharts) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Graphique d'évolution (Prend 2 colonnes sur 3) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Présences de la semaine</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="jour" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: '#f3f4f6'}} />
                                <Legend />
                                <Bar dataKey="presents" name="Présents" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="retards" name="Retards" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Graphique de répartition (Prend 1 colonne sur 3) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Répartition du jour</h3>
                    <div className="h-72 flex flex-col items-center justify-center">
                        {stats.total_employes > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 text-sm">Aucune donnée à afficher</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;