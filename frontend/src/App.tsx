import React from 'react';
import { useNavigate } from 'react-router-dom';

const App: React.FC = () => {
	const navigate = useNavigate();

	return (
		
		<div className="min-h-screen flex items-center justify-center bg-gray-100">

			<div className = "flex flex-col items-center space-y-4">

				<button onClick={() => navigate('/game')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
					Aller au jeu
				</button>

				<button onClick={() => navigate('/login')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
					Sign-in or Log-in
				</button>

			</div>

		</div>
	);
};

export default App;
