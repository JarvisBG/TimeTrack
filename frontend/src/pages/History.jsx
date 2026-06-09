import { useState, useEffect } from 'react';
import { ClipboardList, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

const History = () => {
    const [attendances, setAttendances] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Requêtes simultanées pour gagner du temps
            const [attRes, empRes] = await Promise.all([
                api.get('/attendance/today'),
                api.get('/employees/')
            ]);
            setAttendances(attRes.data);
            setEmployees(empRes.data);
        } catch (error) {
            console.error("Erreur de chargement", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Fonctions utilitaires pour croiser les données
    const getEmployeeName = (id) => {
        const emp = employees.find(e => e.id === id);
        return emp ? `${emp.prenom} ${emp.nom}` : 'Inconnu';
    };

    const getEmployeeMatricule = (id) => {
        const emp = employees.find(e => e.id === id);
        return emp ? emp.matricule : '-';
    };

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <ClipboardList className="w-6 h-6 mr-3 text-primary" />
                        Historique du Jour
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Consultez tous les pointages d'aujourd'hui en temps réel</p>
                </div>
                <button 
                    onClick={fetchData}
                    className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualiser
                </button>
            </div>

            {/* Tableau des pointages */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                                <th className="p-4 font-semibold">Employé</th>
                                <th className="p-4 font-semibold text-center">Arrivée</th>
                                <th className="p-4 font-semibold text-center">Départ</th>
                                <th className="p-4 font-semibold text-center">Retard</th>
                                <th className="p-4 font-semibold text-center">Heures</th>
                                <th className="p-4 font-semibold text-center">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Chargement des données...</td></tr>
                            ) : attendances.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center">
                                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Aucun pointage enregistré aujourd'hui.</p>
                                    </td>
                                </tr>
                            ) : (
                                attendances.map((att) => (
                                    <tr key={att.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4">
                                            <p className="font-medium text-gray-800">{getEmployeeName(att.employee_id)}</p>
                                            <p className="text-xs text-gray-500">{getEmployeeMatricule(att.employee_id)}</p>
                                        </td>
                                        <td className="p-4 text-center font-medium text-gray-700">
                                            {att.heure_arrivee ? att.heure_arrivee.substring(0, 5) : '-'}
                                        </td>
                                        <td className="p-4 text-center font-medium text-gray-700">
                                            {att.heure_depart ? att.heure_depart.substring(0, 5) : <span className="text-gray-400">En poste</span>}
                                        </td>
                                        <td className="p-4 text-center">
                                            {att.retard > 0 ? (
                                                <span className="inline-flex items-center text-orange-600 text-sm font-medium bg-orange-50 px-2 py-1 rounded-md">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {att.retard} h
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center font-bold text-gray-800">
                                            {att.heures_travaillees > 0 ? `${att.heures_travaillees} h` : '-'}
                                        </td>
                                        <td className="p-4 text-center">
                                            {att.heure_depart ? (
                                                <span className="inline-flex items-center text-gray-500 text-sm font-medium">
                                                    <CheckCircle className="w-4 h-4 mr-1" /> Terminé
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-md border border-green-100">
                                                    En cours
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default History;