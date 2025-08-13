import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { User, Menu, X, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Modal from '../../common/Modal';
import { useAuthStore } from '../../../store/authStore';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, onClick }) => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <RouterLink 
      to={to}
      onClick={onClick}
      className={`font-semibold px-4 py-2 rounded-md transition-all duration-300 ${
        scrolled 
          ? 'text-white hover:text-blue-200 hover:bg-white/10' 
          : 'text-gray-800 hover:text-blue-600 hover:bg-white/80'
      }`}
    >
      {children}
    </RouterLink>
  );
};

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    setLoginModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LOGIN] Submit iniciado', formData);
    console.log('[LOGIN] Estado atual do authStore antes do login');
    
    try {
      await login(formData.identifier, formData.password, (role_type) => {
        console.log('[LOGIN] Login bem-sucedido, role_type:', role_type);
        console.log('[LOGIN] Estado do authStore após login bem-sucedido');
        
        if (role_type === 'MASTER') {
          console.log('[LOGIN] Redirecionando para /master/dashboard');
          navigate('/master/dashboard');
        } else if (role_type === 'ADMIN') {
          console.log('[LOGIN] Redirecionando para /admin/dashboard');
          navigate('/admin/dashboard');
        } else if (role_type === 'DOCTOR') {
          console.log('[LOGIN] Redirecionando para /doctor/dashboard');
          navigate('/doctor/dashboard');
        } else if (role_type === 'PATIENT') {
          console.log('[LOGIN] Redirecionando para /patient/dashboard');
          navigate('/patient/dashboard');
        } else {
          console.log('[LOGIN] Role não reconhecido, redirecionando para /');
          navigate('/');
        }
      });
      console.log('[LOGIN] login() chamado com:', formData.identifier, formData.password);
    } catch (err) {
      console.error('[LOGIN] Erro ao chamar login:', err);
    }
    console.log('[LOGIN] Submit finalizado');
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-14 sm:h-20 flex items-center ${
          scrolled ? 'bg-blue-800 shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-2 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-14 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-lg sm:text-2xl font-bold text-white">
                <span className={scrolled ? 'text-white' : 'text-blue-600'}>
                  Agenda Saúde
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              <NavLink to="/" onClick={() => scrollToSection('hero')}>Home</NavLink>
              <NavLink to="/#beneficios" onClick={() => scrollToSection('beneficios')}>Benefícios</NavLink>
              <NavLink to="/#como-funciona" onClick={() => scrollToSection('como-funciona')}>Como Funciona</NavLink>
              <NavLink to="/#depoimentos" onClick={() => scrollToSection('depoimentos')}>Depoimentos</NavLink>
              <NavLink to="/#contato" onClick={() => scrollToSection('contato')}>Contato</NavLink>
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Login Button */}
              <button
                onClick={handleLoginClick}
                className={`group flex items-center px-3 py-2 sm:px-6 sm:py-3 rounded-lg transition-all duration-300 
                  ${scrolled 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md hover:shadow-lg text-white' 
                    : 'bg-white/80 backdrop-blur-sm hover:bg-white/90 border border-gray-300 text-gray-800'} 
                  font-medium transform hover:-translate-y-0.5 hover:scale-105 text-sm sm:text-base`}
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="font-semibold">
                  Área de Acesso
                </span>
              </button>
              
              {/* Mobile menu button */}
              <button 
                className={`md:hidden p-2 rounded-md transition-colors ${
                  scrolled ? 'text-white hover:bg-white/10' : 'text-gray-800 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 py-3 border-t border-white/20 bg-white/95 backdrop-blur-sm rounded-lg">
              <div className="flex flex-col space-y-2">
                <NavLink to="/" onClick={() => scrollToSection('hero')}>Home</NavLink>
                <NavLink to="/#beneficios" onClick={() => scrollToSection('beneficios')}>Benefícios</NavLink>
                <NavLink to="/#como-funciona" onClick={() => scrollToSection('como-funciona')}>Como Funciona</NavLink>
                <NavLink to="/#depoimentos" onClick={() => scrollToSection('depoimentos')}>Depoimentos</NavLink>
                <NavLink to="/#contato" onClick={() => scrollToSection('contato')}>Contato</NavLink>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <Modal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        title="Área de Acesso"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Bem-vindo de volta!
            </h3>
            <p className="text-sm text-gray-600">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail ou CPF
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="seu@email.com ou 123.456.789-00"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Lembrar-me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                Esqueceu sua senha?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Entrar no Sistema
            </button>
          </form>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <button
                type="button"
                className="text-blue-600 hover:text-blue-500 font-semibold transition-colors"
              >
                Solicitar acesso
              </button>
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Header;
