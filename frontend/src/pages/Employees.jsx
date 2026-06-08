import { useState, useEffect } from 'react';
import { Search, Plus, QrCode, X, Download, UserPlus } from 'lucide-react';
import api from '../services/api';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Gestion des modales (Pop-ups)
    const [showAddModal, setShowAddModal] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [selectedQr, setSelectedQr] = useState(null);
    const [selectedEmployeeName, setSelectedEmployeeName] = useState('');

    // Données du formulaire d'ajout
    const [formData, setFormData] = useState({
        matricule: '', nom: '', prenom: '', poste: '', telephone: ''
    });

    // Chargement initial des employés
    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees/');
            setEmployees(response.data);
        } catch (error) {
            console.error("Erreur lors du chargement des employés", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filtre de recherche dynamique
    const filteredEmployees = employees.filter(emp =>
        emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Soumission du formulaire de création
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/employees/', formData);
            setShowAddModal(false);
            setFormData({ matricule: '', nom: '', prenom: '', poste: '', telephone: '' });
            fetchEmployees(); // On met à jour le tableau
        } catch (error) {
            alert("Erreur lors de la création. Vérifiez que le matricule n'existe pas déjà.");
        }
    };

    // Récupération sécurisée du QR Code en tant qu'image (Blob)
    const handleViewQr = async (employee) => {
        try {
            const response = await api.get(`/employees/${employee.id}/qrcode`, { responseType: 'blob' });
            const qrUrl = URL.createObjectURL(response.data);
            setSelectedQr(qrUrl);
            setSelectedEmployeeName(`${employee.prenom} ${employee.nom}`);
            setShowQrModal(true);
        } catch (error) {
            alert("Impossible de générer le QR Code.");
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* En-tête de la page */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestion des Employés</h1>
                    <p className="text-gray-500 text-sm mt-1">Gérez votre personnel et leurs QR Codes</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 transition font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Ajouter un employé
                </button>
            </div>

            {/* Barre de recherche */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input 
                    type="text" 
                    placeholder="Rechercher par nom, prénom ou matricule..." 
                    className="flex-1 outline-none text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tableau des employés */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                                <th className="p-4 font-semibold">Matricule</th>
                                <th className="p-4 font-semibold">Employé</th>
                                <th className="p-4 font-semibold">Poste</th>
                                <th className="p-4 font-semibold">Téléphone</th>
                                <th className="p-4 font-semibold text-center">QR Code</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Chargement...</td></tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Aucun employé trouvé.</td></tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-800">{emp.matricule}</td>
                                        <td className="p-4 text-gray-700">{emp.prenom} {emp.nom}</td>
                                        <td className="p-4 text-gray-500 text-sm">{emp.poste}</td>
                                        <td className="p-4 text-gray-500 text-sm">{emp.telephone || '-'}</td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleViewQr(emp)}
                                                className="inline-flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                                title="Voir le QR Code"
                                            >
                                                <QrCode className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALE : Ajouter un employé */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <UserPlus className="w-6 h-6 mr-2 text-primary" />
                                Nouvel Employé
                            </h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                                    <input required type="text" name="prenom" value={formData.prenom} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                                    <input required type="text" name="nom" value={formData.nom} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Matricule (Unique) *</label>
                                <input required type="text" name="matricule" value={formData.matricule} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Poste *</label>
                                <input required type="text" name="poste" value={formData.poste} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                <input type="text" name="telephone" value={formData.telephone} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-primary" />
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Annuler</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 transition">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODALE : Afficher le QR Code */}
            {showQrModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-center">
                        <div className="flex justify-end p-4 pb-0">
                            <button onClick={() => setShowQrModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 pt-0">
                            <h2 className="text-xl font-bold text-gray-800 mb-1">Badge Virtuel</h2>
                            <p className="text-gray-500 mb-6">{selectedEmployeeName}</p>
                            
                            <div className="bg-gray-50 p-4 rounded-xl inline-block mb-6 border border-gray-100">
                                {selectedQr ? (
                                    <img src={selectedQr} alt="QR Code" className="w-48 h-48 object-contain" />
                                ) : (
                                    <div className="w-48 h-48 flex items-center justify-center text-gray-400">Chargement...</div>
                                )}
                            </div>

                            <a 
                                href={selectedQr} 
                                download={`QR_${selectedEmployeeName.replace(' ', '_')}.png`}
                                className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-800 transition font-medium"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                Télécharger le QR Code
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;