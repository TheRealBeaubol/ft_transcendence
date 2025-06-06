import React from 'react';

interface Player {
  id: number;
  username: string;
  avatar: string;
}

interface Match {
  id: number;
  round: number;
  player1: Player | null;
  player2: Player | null;
}

interface Props {
  matches: Match[];
}

const TournamentBracket: React.FC<Props> = ({ matches }) => {
  const rounds = [1, 2, 3]; // quart, demi, finale

  return (
    <div className="flex space-x-8 mt-16">
      {rounds.map((round) => (
        <div key={round} className="flex flex-col space-y-4">
          <h3 className="text-white text-center font-bold">
            {round === 1 ? 'Quarts' : round === 2 ? 'Demi-finales' : 'Finale'}
          </h3>
          {matches
            .filter((m) => m.round === round)
            .map((match) => (
              <div
                key={match.id}
                className="bg-cyan-600 p-3 rounded-xl shadow-lg w-48"
              >
                <div className="flex items-center space-x-2">
                  {match.player1 ? (
                    <>
                      <img src={match.player1.avatar} alt={match.player1.username} className="w-8 h-8 rounded-full" />
                      <span className="text-white">{match.player1.username}</span>
                    </>
                  ) : (
                    <span className="text-gray-300 italic">À venir</span>
                  )}
                </div>
                <div className="text-center text-white font-bold my-2">vs</div>
                <div className="flex items-center space-x-2">
                  {match.player2 ? (
                    <>
                      <img src={match.player2.avatar} alt={match.player2.username} className="w-8 h-8 rounded-full" />
                      <span className="text-white">{match.player2.username}</span>
                    </>
                  ) : (
                    <span className="text-gray-300 italic">À venir</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default TournamentBracket;
