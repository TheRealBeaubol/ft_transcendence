import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

export default function ProfileBox() {
    const navigate = useNavigate();

    return (
        <div className="fixed right-0 w-72 bg-cyan-500 p-1 rounded-bl-full">
            <div className="bg-black bg-opacity-80 rounded-bl-full px-6 py-2 flex justify-center gap-4 font-mono text-sm text-white">
                {/* <div className="w-16 h-16 rounded-full border-2 border-white bg-transparent"></div>
                <div className="flex flex-col justify-center">
                    <span className="text-sm">User19357</span>
                    <span onClick={() => navigate('/profile')} className="text-sm underline cursor-pointer">Edit profile</span>
                </div> */}
                <div className="flex flex-col items-center">
                    <button onClick={() => navigate('/login')} className="px-6 py-5 text-white font-bold underline text-base">
                        Sign-in or Log-in
                    </button>
                </div>
            </div>
        </div>

    );
}
