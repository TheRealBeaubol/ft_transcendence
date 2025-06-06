import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Profile from './pages/profile/Profile';
import { UserProvider } from './UserContext';
import Tournament from './pages/tournament/Tournament';

ReactDOM.createRoot(document.getElementById('root')!).render(

	<React.StrictMode>
		<UserProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/profile" element={<Profile />} />					
					<Route path="/tournament" element={<Tournament />} />
				</Routes>
			</BrowserRouter>
		</UserProvider>
	</React.StrictMode>

);
