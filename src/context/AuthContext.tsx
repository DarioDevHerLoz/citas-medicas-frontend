import { createContext, useState } from 'react';
import type { Usuario } from '../interface/Usuario';
import { UserRole } from '../interface/Roles';
import { api, MOCK_USUARIOS } from '../config/api.mock';
import { showNotification } from '../helpers/notifications';

interface AuthContextType {
  user: Usuario | null;
  role: UserRole;
  login: (email: string, password: string) => Promise<void>;
  register: (u: Omit<Usuario, 'id'>) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);

  const login = async (email: string, password: string) => {
    const found = MOCK_USUARIOS.find(u => u.email === email && u.password === password);
    if (!found) return showNotification('Credenciales incorrectas', 'error');

    const { password: _, ...sessionUser } = found;
    setUser(sessionUser);
    showNotification(`Bienvenido ${sessionUser.nombre}`, 'success');
  };

  const register = async (data: Omit<Usuario, 'id'>) => {
    if (MOCK_USUARIOS.find(u => u.email === data.email)) {
      showNotification('Ese correo ya esta registrado', 'error');
      return false;
    }

    const user: Usuario = { ...data, id: 'U' + (MOCK_USUARIOS.length + 1) };
    MOCK_USUARIOS.push(user);
    showNotification('Registro exitoso', 'success');
    return true;
  };

  const logout = () => {
    setUser(null);
    showNotification('Sesión cerrada', 'info');
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.rol ?? UserRole.GUEST,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
