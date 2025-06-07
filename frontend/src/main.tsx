import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Profile from './pages/profile/Profile';
import Site from './pages/site/site';
import Pong from './pages/pong/Pong';
import './i18n'
import { UserProvider } from './UserContext';
import Tournament from './pages/tournament/Tournament';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<UserProvider>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Site />} />
				<Route path="/home" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/profile" element={<Profile />} />					
				<Route path="/pong" element={<Pong />} />
				<Route path="/tournament" element={<Tournament />} />
			</Routes>
		</BrowserRouter>
	</UserProvider>
);
