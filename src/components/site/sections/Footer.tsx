import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Phone, 
  Mail, 
  Clock, 
  MapPin,
  Heart,
  MessageCircle
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer id="contato" className="bg-gradient-to-r from-gray-900 to-gray-800 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Sobre */}
          <div className="space-y-4">
            <div className="flex items-center">
              <MessageCircle className="w-8 h-8 text-blue-400 mr-3" />
              <h4 className="text-2xl font-bold text-blue-400">
                Agenda Saúde
              </h4>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Facilitando o acesso à saúde através de tecnologia e inovação. 
              Nossa missão é conectar pacientes e profissionais de saúde de forma eficiente e humanizada.
            </p>
          </div>

          {/* Links Úteis */}
          <div>
            <h4 className="text-xl font-bold text-blue-400 mb-6">
              Links Úteis
            </h4>
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group"
              >
                <span className="w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 mr-2"></span>
                Home
              </Link>
              <Link 
                to="/about" 
                className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group"
              >
                <span className="w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 mr-2"></span>
                Sobre Nós
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group"
              >
                <span className="w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 mr-2"></span>
                Contato
              </Link>
              <Link 
                to="/privacy" 
                className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group"
              >
                <span className="w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 mr-2"></span>
                Política de Privacidade
              </Link>
            </nav>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-xl font-bold text-blue-400 mb-6">
              Contato
            </h4>
            <div className="space-y-4">
              <div className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200">
                <Phone className="w-5 h-5 mr-3 text-blue-400" />
                <span>(11) 1234-5678</span>
              </div>
              <a 
                href="mailto:contato@agendasaude.com"
                className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                <Mail className="w-5 h-5 mr-3 text-blue-400" />
                contato@agendasaude.com
              </a>
              <div className="flex items-center text-gray-300">
                <Clock className="w-5 h-5 mr-3 text-blue-400" />
                <span>Seg - Sex: 8h às 18h</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-5 h-5 mr-3 text-blue-400" />
                <span>São Paulo, SP</span>
              </div>
            </div>
          </div>

          {/* Redes Sociais */}
          <div>
            <h4 className="text-xl font-bold text-blue-400 mb-6">
              Redes Sociais
            </h4>
            <p className="text-gray-300 mb-4">
              Siga-nos para ficar por dentro das novidades
            </p>
            <div className="flex space-x-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-blue-600 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-blue-400 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-pink-600 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-lg font-semibold text-blue-400 mb-2">
              Fique por dentro das novidades
            </h4>
            <p className="text-gray-300 mb-4">
              Receba atualizações sobre novos recursos e melhorias
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="flex-1 px-4 py-2 rounded-l-lg border-0 focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors duration-200">
                Inscrever
              </button>
            </div>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm text-center md:text-left mb-4 md:mb-0">
              © {currentYear} Agenda Saúde. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-200"
              >
                Termos de Uso
              </Link>
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-200"
              >
                Privacidade
              </Link>
            </div>
          </div>
          
          <div className="mt-6 text-center text-gray-500 text-sm">
            Feito com <Heart className="inline w-4 h-4 text-red-500 animate-pulse" /> para você
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
