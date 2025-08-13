import { useEffect } from 'react';
import AppRoutes from './routes';
import { useAuthStore } from './store/authStore';

function App() {
  const { initAuth, user, token, loading } = useAuthStore();

  useEffect(() => {
    console.log('[App] Inicializando autenticação...');
    console.log('[App] Estado atual antes da inicialização:', { user, token, loading });
    initAuth();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    console.log('[App] Estado atualizado:', { user, token, loading });
  }, [user, token, loading]);

  if (token && !user) {
    // Está autenticado mas ainda carregando perfil
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-blue-700 text-xl font-bold animate-pulse">Carregando perfil...</div>
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;
