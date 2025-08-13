import React from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, CheckCircle2, ArrowRight, ChevronDown } from 'lucide-react';

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
  totalSteps: number;
}

const StepCard: React.FC<StepCardProps> = ({ 
  icon, 
  title, 
  description, 
  index, 
  totalSteps 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        delay: index * 0.2, 
        duration: 0.5,
        type: 'spring',
        stiffness: 100
      }}
      className="relative p-6 sm:p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center h-full border border-gray-100"
    >
      {/* Step Number */}
      <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
          {index + 1}
        </div>
      </div>

      {/* Icon */}
      <motion.div 
        className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4 sm:mb-6"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="w-6 h-6 sm:w-8 sm:h-8">
          {icon}
        </div>
      </motion.div>
      
      {/* Content */}
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
        {description}
      </p>

      {/* Connector Arrow (Desktop) */}
      {index < totalSteps - 1 && (
        <div className="hidden lg:flex items-center absolute -right-16 top-1/2 transform -translate-y-1/2">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + (index * 0.1) }}
          >
            <div className="w-2 h-2 rounded-full bg-blue-600 mr-2"></div>
            <div className="w-12 h-0.5 bg-blue-600 mr-2"></div>
            <ArrowRight className="w-5 h-5 text-blue-600" />
          </motion.div>
        </div>
      )}

      {/* Mobile step indicator */}
      {index < totalSteps - 1 && (
        <div className="lg:hidden w-full flex items-center justify-center mt-4 sm:mt-6">
          <div className="h-0.5 w-8 sm:w-16 bg-blue-200 mx-1 sm:mx-2"></div>
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 animate-bounce" />
          <div className="h-0.5 w-8 sm:w-16 bg-blue-200 mx-1 sm:mx-2"></div>
        </div>
      )}
    </motion.div>
  );
};

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: <User className="w-full h-full" />,
      title: 'Crie sua conta',
      description: 'Cadastre-se gratuitamente e complete seu perfil em poucos minutos com seus dados básicos.'
    },
    {
      icon: <Calendar className="w-full h-full" />,
      title: 'Agende sua consulta',
      description: 'Escolha o médico, data e horário que melhor se adequam à sua agenda. Visualize disponibilidade em tempo real.'
    },
    {
      icon: <CheckCircle2 className="w-full h-full" />,
      title: 'Pronto!',
      description: 'Receba a confirmação e compareça à consulta no horário marcado. Lembretes automáticos por WhatsApp.'
    }
  ];

  return (
    <section 
      id="como-funciona"
      className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-12 sm:mb-16"
        >
          <span className="block text-blue-600 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-2">
            COMO FUNCIONA
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Simples, rápido e sem complicação
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Agendar uma consulta nunca foi tão fácil. Siga estes três simples passos:
          </p>
        </motion.div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 relative">
            {steps.map((step, index) => (
              <StepCard 
                key={index}
                icon={step.icon}
                title={step.title}
                description={step.description}
                index={index}
                totalSteps={steps.length}
              />
            ))}
          </div>

          {/* Mobile progress indicator */}
          <div className="lg:hidden flex items-center justify-center mt-6 sm:mt-8 mb-4">
            {steps.map((_, i) => (
              <React.Fragment key={i}>
                <div 
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${i === 0 ? 'bg-blue-600' : 'bg-blue-200'}`}
                />
                {i < steps.length - 1 && (
                  <div className="w-6 h-0.5 sm:w-8 bg-blue-200 mx-1" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div 
          className="mt-12 sm:mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-base sm:text-lg shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            Comece Agora
          </motion.button>
          
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 px-4">
            <div className="flex items-center">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-1 sm:mr-1.5" />
              <span>100% gratuito</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-1 sm:mr-1.5" />
              <span>Sem cadastro complexo</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-1 sm:mr-1.5" />
              <span>Confirmação instantânea</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
