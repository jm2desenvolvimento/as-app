import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  ShieldCheck, 
  Users, 
  Smartphone,
  ArrowRight
} from 'lucide-react';

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon, title, description }) => {
  return (
    <div className="group p-8 bg-gray-50 rounded-xl transition-all duration-300 hover:bg-blue-600 hover:scale-105">
      <div className="mb-6 text-blue-600 group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-4 text-gray-900 group-hover:text-white transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-600 group-hover:text-gray-200 transition-colors duration-300">
        {description}
      </p>
    </div>
  );
};

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: <Users className="w-12 h-12" />,
      title: 'Profissionais experientes',
      description: 'Mais de 10 anos de experiência com foco na saúde pública de qualidade.'
    },
    {
      icon: <ShieldCheck className="w-12 h-12" />,
      title: 'Integração com o SUS',
      description: 'Conectado com a API do SUS e WhatsApp para agendamento rápido e fácil.'
    },
    {
      icon: <Clock className="w-12 h-12" />,
      title: 'Sem burocracia',
      description: 'Sem taxas escondidas. Plataforma simples, direta e transparente.'
    }
  ];

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
      {/* Curva superior */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
        <svg
          className="relative block w-[calc(100%+1.3px)] h-[60px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 500 60"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C150,60 350,60 500,0 L500,60 L0,60 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* Conteúdo da seção */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <span className="block text-blue-200 font-semibold text-sm uppercase tracking-widest mb-2">
            BENEFÍCIOS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Por que escolher o Agenda Saúde?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Confira os diferenciais que tornam nossa solução única e eficiente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-8 md:p-12 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Pronto para começar?
              </h3>
              <p className="text-blue-100 text-base md:text-lg">
                Junte-se a milhares de pacientes que já estão aproveitando uma forma mais inteligente de cuidar da saúde.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-full text-base md:text-lg hover:bg-gray-50 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Criar Conta
                <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Curva inferior */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg
          className="relative block w-[calc(100%+1.3px)] h-[60px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 500 60"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C150,60 350,60 500,0 L500,60 L0,60 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
};

export default BenefitsSection;
