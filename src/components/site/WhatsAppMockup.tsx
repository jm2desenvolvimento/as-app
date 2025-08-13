import React from 'react';
import { motion } from 'framer-motion';

const WhatsAppMockup: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="relative w-full max-w-[280px] md:max-w-[320px]"
    >
      {/* Phone Frame */}
      <svg className="w-full" viewBox="0 0 320 650" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="308" height="638" rx="36" fill="#1E1E1E" />
        <rect x="0.5" y="0.5" width="319" height="649" rx="39.5" stroke="#333333" strokeWidth="1" />
        <rect x="12" y="12" width="296" height="626" rx="32" fill="#FFFFFF" />
        
        {/* Phone Notch */}
        <rect x="120" y="6" width="80" height="6" rx="3" fill="#111111" />
      </svg>

      {/* WhatsApp Interface */}
      <div className="absolute top-[12px] left-[12px] right-[12px] bottom-[12px] rounded-[32px] overflow-hidden flex flex-col">
        {/* WhatsApp Header */}
        <div className="bg-blue-500 h-16 flex items-center px-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="text-white font-medium">Agenda Saúde</div>
              <div className="text-white/70 text-xs">Online</div>
            </div>
          </div>
          <div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" fill="white"/>
            </svg>
          </div>
        </div>

        {/* Chat Background */}
        <div className="flex-1 bg-[#E5DDD5] p-3 overflow-y-auto flex flex-col gap-3">
          {/* System Message */}
          <div className="bg-[#FFF5C4] text-center mx-auto px-3 py-1 rounded-md text-xs text-gray-600">
            Hoje
          </div>

          {/* Bot Message */}
          <div className="flex flex-col max-w-[80%]">
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <p className="text-sm">Olá! Bem-vindo ao Agenda Saúde. Como posso ajudar?</p>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 ml-1">11:02</span>
          </div>

          {/* User Message */}
          <div className="flex flex-col items-end self-end max-w-[80%]">
            <div className="bg-[#DCF8C6] rounded-lg p-2 shadow-sm">
              <p className="text-sm">Gostaria de agendar uma consulta com o clínico geral</p>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 mr-1">11:03</span>
          </div>

          {/* Bot Message */}
          <div className="flex flex-col max-w-[80%]">
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <p className="text-sm">Claro! Para qual UBS você deseja marcar?</p>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 ml-1">11:04</span>
          </div>

          {/* User Message */}
          <div className="flex flex-col items-end self-end max-w-[80%]">
            <div className="bg-[#DCF8C6] rounded-lg p-2 shadow-sm">
              <p className="text-sm">UBS Vila Nova</p>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 mr-1">11:05</span>
          </div>

          {/* Bot Message */}
          <motion.div 
            className="flex flex-col max-w-[80%]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <p className="text-sm">A consulta foi agendada para o dia 14 de junho, às 14:00. Algo mais?</p>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 ml-1">11:06</span>
          </motion.div>

          {/* Typing indicator */}
          <motion.div 
            className="flex flex-col max-w-[80%]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <div className="bg-white rounded-lg p-3 shadow-sm flex gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '200ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '400ms' }}></div>
            </div>
          </motion.div>
        </div>

        {/* Input Area */}
        <div className="bg-[#F0F0F0] p-2 flex items-center gap-2">
          <div className="flex-1 bg-white rounded-full px-4 py-2 text-sm text-gray-400">
            Digite uma mensagem
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.4 20.4L20.85 12.92C21.66 12.57 21.66 11.43 20.85 11.08L3.4 3.6C2.74 3.31 2.01 3.8 2.01 4.51L2 9.12C2 9.62 2.37 10.05 2.87 10.11L17 12L2.87 13.88C2.37 13.95 2 14.38 2 14.88L2.01 19.49C2.01 20.2 2.74 20.69 3.4 20.4Z" fill="white"/>
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WhatsAppMockup; 