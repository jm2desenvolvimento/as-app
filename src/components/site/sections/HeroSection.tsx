import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, useInView } from 'framer-motion';
import { MessageCircle, ChevronDown, ArrowRight, ChevronUp } from 'lucide-react';
import WhatsAppMockup from '../WhatsAppMockup';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const handleWhatsAppClick = () => {
    navigate('/whatsapp');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }; 

  return (
    <section 
      ref={ref}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20"
    >
      {/* Diagonal Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-white" />
        <div className="absolute top-0 right-0 bottom-0 w-full md:w-2/3 lg:w-3/5 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 clip-diagonal" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-2 sm:px-4 lg:px-8 min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-5rem)] grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center py-8 sm:py-12">
        {/* Left Content */}
        <motion.div 
          className="flex flex-col gap-4 sm:gap-6 md:pr-8"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >

          {/* Title */}
          <motion.div variants={itemVariants}>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Revitalize seu <span className="text-blue-500">bem-estar</span> com <span className="text-blue-500">agendamentos</span> <span className="text-gray-900">rápidos</span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p 
            className="text-base sm:text-xl text-gray-600 leading-relaxed"
            variants={itemVariants}
          >
            Agende consultas na UBS pelo WhatsApp em poucos minutos.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-2"
            variants={itemVariants}
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWhatsAppClick}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-3 py-2 sm:px-8 sm:py-4 rounded-md transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-lg w-full sm:w-auto"
            >
              Começar agora
            </motion.button>
            
            <motion.button
              whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-gray-700 border border-gray-300 font-medium px-3 py-2 sm:px-6 sm:py-4 rounded-md transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-lg w-full sm:w-auto mt-2 sm:mt-0"
            >
              Ver demonstração
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Content - WhatsApp Mockup */}
        <motion.div 
          className="flex justify-center md:justify-end items-center mt-6 md:mt-0"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <div className="w-full max-w-[220px] sm:max-w-[280px] md:max-w-[320px]">
            <WhatsAppMockup />
          </div>
        </motion.div>

        {/* Simple Scroll Indicator */}
        <motion.div 
          className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center group cursor-pointer"
          variants={itemVariants}
          onClick={() => document.getElementById('beneficios')?.scrollIntoView({ behavior: 'smooth' })}
          initial={{ y: 0 }}
          whileHover={{ y: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="relative w-8 h-12 sm:w-10 sm:h-14 flex flex-col items-center">
            {/* Mouse outline */}
            <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/80 rounded-full flex justify-center p-1">
              <motion.div 
                className="w-1 h-2 bg-white/80 rounded-full"
                animate={{
                  y: [0, 6, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'easeInOut',
                }}
              />
            </div>
            
            {/* Arrow */}
            <motion.div 
              className="mt-2 text-white/80"
              animate={{
                y: [0, 4, 0],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut',
                delay: 0.3
              }}
            >
              <ChevronDown size={18} className="sm:w-5 sm:h-5" />
            </motion.div>
          </div>
          
          <motion.span 
            className="mt-2 text-xs sm:text-sm font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            Role para baixo
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
