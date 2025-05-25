import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';


export const Login = () => {
  const [u, setU] = useState(''); const [p, setP] = useState('');
  const { signin } = useContext(AuthContext);
  const nav = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signin(u, p)) {
      nav('/', { replace: true });
    } else {
      alert('Credenciais inválidas');
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input 
        placeholder="Usuário" 
        value={u} onChange={e => setU(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Senha" 
        value={p} onChange={e => setP(e.target.value)} 
      />
      <button type="submit">Entrar</button>
    </form>
  );
};
