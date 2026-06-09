import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { CheckCircle2, XCircle, ScanLine, Clock, User } from 'lucide-react';
import api from '../services/api';

const ScannerPage = () => {
    const [scanStatus, setScanStatus] = useState(null); // 'success', 'error', ou null
    const [scanData, setScanData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    
    // Sécurités pour éviter les requêtes multiples
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastScannedCode, setLastScannedCode] = useState('');

    const handleDecode = async (text) => {
        // On ignore si on est déjà en train de traiter une requête ou si c'est le même code en boucle
        if (isProcessing || text === lastScannedCode) return;

        setIsProcessing(true);
        setLastScannedCode(text);
        setScanStatus(null);

        try {
            // Appel à notre API Backend
            const response = await api.post('/attendance/scan', { qr_code: text });
            
            setScanStatus('success');
            setScanData(response.data); // Contient : action, employee, time, message, heures_travaillees
            
        } catch (error) {
            setScanStatus('error');
            setErrorMessage(error.response?.data?.detail || "Code QR invalide ou non reconnu.");
        } finally {
            setIsProcessing(false);
            
            // On réinitialise le bloqueur après 4 secondes pour le prochain employé
            setTimeout(() => {
                setLastScannedCode('');
                if (scanStatus !== 'error') {
                    setScanStatus(null);
                }
            }, 4000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
                    <ScanLine className="w-8 h-8 mr-3 text-primary" />
                    Terminal de Pointage
                </h1>
                <p className="text-gray-500 mt-2">Présentez votre QR Code devant la caméra</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Colonne Gauche : La Caméra */}
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-full max-w-sm rounded-xl overflow-hidden border-4 border-gray-100 relative">
                        <Scanner 
                            onScan={(results) => {
                                // Code mis à jour pour la version 2.x de @yudiel/react-qr-scanner
                                if (results && results.length > 0) {
                                    handleDecode(results[0].rawValue);
                                }
                            }} 
                            onError={(error) => console.log(error?.message)}
                            components={{ tracker: true }}
                        />
                        {/* Overlay visuel quand le scan est en cours de traitement */}
                        {isProcessing && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-sm">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Colonne Droite : Le Résultat du Scan */}
                <div className="flex flex-col justify-center">
                    {scanStatus === null && !isProcessing && (
                        <div className="text-center p-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-500">En attente d'un scan...</h3>
                        </div>
                    )}

                    {scanStatus === 'success' && scanData && (
                        <div className="bg-green-50 p-8 rounded-2xl border border-green-200 shadow-sm transform transition-all animate-fade-in-up">
                            <div className="flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-16 h-16 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-center text-green-800 mb-2">
                                {scanData.message}
                            </h2>
                            
                            <div className="bg-white p-4 rounded-xl mt-6 space-y-3 shadow-sm">
                                <div className="flex items-center text-gray-700">
                                    <User className="w-5 h-5 mr-3 text-gray-400" />
                                    <span className="font-semibold text-lg">{scanData.employee}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <Clock className="w-5 h-5 mr-3 text-gray-400" />
                                    <span className="font-medium text-lg">
                                        {scanData.action} à <span className="text-primary">{scanData.time}</span>
                                    </span>
                                </div>
                                {scanData.heures_travaillees > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                                        <span className="text-sm text-gray-500">Temps de travail :</span>
                                        <p className="font-bold text-green-600 text-xl">{scanData.heures_travaillees} heures</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {scanStatus === 'error' && (
                        <div className="bg-red-50 p-8 rounded-2xl border border-red-200 shadow-sm animate-fade-in-up">
                            <div className="flex items-center justify-center mb-6">
                                <XCircle className="w-16 h-16 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-center text-red-800 mb-2">
                                Échec du pointage
                            </h2>
                            <p className="text-center text-red-600 font-medium">
                                {errorMessage}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScannerPage;