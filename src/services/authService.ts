import users from '../data/users.json';

interface Credentials { username: string; password: string; }
interface Session { id: number; username: string; role: 'admin' | 'user'; expires: number; }

const SESSION_KEY = '@app/session';

export const login = ({ username, password }: Credentials): Session | null => {
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return null;

  const expires = Date.now() + 30 * 60 * 1000; // +30 min
  const session: Session = { id: user.id, username: user.username, role: user.role as any, expires };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getSession = (): Session | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  const session: Session = JSON.parse(raw);
  if (Date.now() > session.expires) {
    logout();
    return null;
  }
  return session;
};