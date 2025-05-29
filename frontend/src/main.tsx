import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Game from './pages/Game';
import Login from './pages/Login';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(

	<React.StrictMode>

		<BrowserRouter>

			<Routes>

				<Route path="/" element={<App />} />
				<Route path="/game" element={<Game />} />
				<Route path="/login" element={<Login />} />

			</Routes>

		</BrowserRouter>

	</React.StrictMode>

);
