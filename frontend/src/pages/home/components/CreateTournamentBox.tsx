import React, { useState } from 'react';

export default function CreateTournamentBox() {
  // État du nom de tournoi tapé
  const [tournamentName, setTournamentName] = useState('');
  // Message d'erreur ou de succès
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // Indicateur de chargement (bouton désactivé quand on envoie la requête)
  const [loading, setLoading] = useState(false);

  // Fonction appelée au clic sur    "Créer"
  const handleCreateTournament = async () => {
    // Reset des messages
    setError(null);
    setMessage(null);

    // Vérification simple : le nom ne doit pas être vide
    if (!tournamentName.trim()) {
      setError('Le nom du tournoi ne peut pas être vide');
      return;
    }

    setLoading(true); // on lance la requête

    try {
      const res = await fetch('/api/tournaments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // On ajoute le token JWT pour authentification
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({ name: tournamentName.trim() }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Si erreur renvoyée par le backend
        setError(data.error || 'Erreur inconnue');
      } else {
        // Succès, on affiche un message et on vide le champ
        setMessage(`Tournoi "${tournamentName}" créé avec succès !`);
        setTournamentName('');
      }
    } catch (err: any) {
      // Erreur réseau ou autre
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cyan-500 p-1 rounded-2xl max-w-md mx-auto">
        <div className="bg-black bg-opacity-80 rounded-2xl px-4 py-6 font-mono flex flex-col flex-grow overflow-hidden">
            <h2 className="text-white text-xl font-bold mb-4 text-center">Créer un tournoi</h2>

        <input
            type="text"
            placeholder="Nom du tournoi"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            className="w-full p-3 rounded-2xl border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 mb-4"
        />

            <button
                onClick={handleCreateTournament}
                disabled={loading}
                className={`w-full py-3 rounded-2xl font-bold ${loading ? 'bg-cyan-300 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'}`}
            >
                {loading ? 'Création...' : 'Créer'}
            </button>

            {/* Affichage des messages */}
            {error && <p className="mt-4 text-red-500 font-mono">{error}</p>}
            {message && <p className="mt-4 text-green-500 font-mono">{message}</p>}
        </div>
    </div>
  );
}