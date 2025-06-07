// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThreeBackground from '../components/ThreeBackground/ThreeBackground';

export const Login = () => {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signin } = useContext(AuthContext);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (signin(u, p)) {
      nav('/', { replace: true });
    } else {
      setError(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden ">
      {/* Background 3D */}
      <ThreeBackground />

      {/* Login Form Container */}
      <div className="relative z-10 min-h-screen bg-gradient-to-br from-gray-500/40 to to-indigo-500/70 dark:from-neutral-700/90 dark:to-black/25 flex items-center justify-center p-4 ">
        <div className="max-w-md z-12  w-full bg-neutral-800/40 rounded-2xl shadow-xl p-8 relative overflow-hidden transition-all duration-300 hover:shadow-2xl  ">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-400 "></div>

          <div className="relative z-10 opacity-95">
            <div className="mb-8 text-center space-y-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r via-indigo-200 bg-clip-text text-transparent">
                Bem Vindo de Volta!
              </h1>
              <p className="text-gray-200 text-sm">Faça login na sua conta</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6 ">
              {/* Username */}
              <div className="group">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-200 mb-3 transition-all duration-300 group-focus-within:text-blue-400 pb-2"
                >
                  Nome de Usuário
                </label>
                <div className="relative">
                  <input
                    id="username"
                    className="bg-gray-100/80 text-gray-700 w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all duration-300 placeholder-gray-500"
                    placeholder="joao@dasa2025"
                    value={u}
                    onChange={e => setU(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-200 mb-3 transition-all duration-300 group-focus-within:text-blue-400 pb-2"
                >
                  Senha
                </label>
                <div className="relative text-gray-400">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="bg-gray-100/80 text-gray-700 w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all duration-300 placeholder-gray-500 pr-12 mb-10"
                    placeholder="••••••••"
                    value={p}
                    onChange={e => setP(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center justify-center gap-2 text-red-800 text-sm p-3 bg-red-50/70 rounded-lg animate-shake">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938
                        4h13.856c1.54 0 2.502-1.667
                        1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464
                        0L3.34 16c-.77 1.333.192 3 1.732
                        3z"
                    />
                  </svg>
                  Credenciais inválidas. Por favor, tente novamente
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] ease-out shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0
                          5.373 0 12h4zm2 5.291A7.962
                          7.962 0 014 12H0c0 3.042 1.135
                          5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Carregando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 text-center text-sm text-gray-500 space-y-4">
              <a
                href="#forgot-password"
                className="text-blue-200 hover:text-blue-500 hover:underline transition-colors flex items-center justify-center gap-1"
              >
                {/* ...icon */}
                Esqueceu a senha?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
