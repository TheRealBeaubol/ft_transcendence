import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();

  return (

	<div className="min-h-screen bg-green-100 relative">

    	<button onClick={() => navigate('/')} className="absolute top-4 left-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
    		← Back to Home
    	</button>

        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">

            <button onClick={() => navigate('/game')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Aller au jeu
            </button>

        	<h1 className="text-3xl font-bold">
        	    Register Here
        	</h1>

      	</div>

    </div>
  );
};

export default Login;
