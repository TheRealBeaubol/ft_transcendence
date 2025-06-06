import React, { useEffect, useState } from 'react';

interface Tournament {
  id: number;
  name: string;
}

const BoxTournois: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        const res = await fetch('/api/tournaments', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Erreur lors du chargement des tournois');
        const data = await res.json();
        setTournaments(data);
      } catch (err: any) {
        setError(err.message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg max-h-[400px] overflow-auto">
      <h2 className="text-xl font-bold mb-4">Tournois disponibles</h2>

      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && tournaments.length === 0 && <p>Aucun tournoi trouvé.</p>}

      <ul>
        {tournaments.map((t) => (
          <li key={t.id} className="p-2 border-b border-gray-700">
            {t.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BoxTournois;