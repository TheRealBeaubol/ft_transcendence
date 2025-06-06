import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export default function SignAndRegisterBox() {

    const navigate = useNavigate();

    return (
        <div className="bg-cyan-500 p-1 rounded-bl-full">
            <div className="bg-black bg-opacity-80 rounded-bl-full px-6 py-2 flex justify-center gap-4 font-mono text-sm text-white">
                <div className="flex flex-col items-center">
                    <button onClick={() => navigate('/login')} className="translate-x-3 px-6 py-5 cursor-pointer text-white font-bold underline text-base">
                        Sign-in or Log-in
                    </button>
                </div>
            </div>
        </div>
    );
}