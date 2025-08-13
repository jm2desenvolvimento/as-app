import * as React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Star } from 'lucide-react';

// Importações CSS do Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface TestimonialCardProps {
  testimonial: {
    name: string;
    role: string;
    image: string;
    content: string;
    rating: number;
  };
  index: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 h-full flex flex-col"
  >
    <div className="flex items-center mb-6">
      <img
        src={testimonial.image}
        alt={testimonial.name}
        className="w-14 h-14 rounded-full object-cover border-2 border-orange-500"
      />
      <div className="ml-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {testimonial.name}
        </h3>
        <p className="text-sm text-gray-600">
          {testimonial.role}
        </p>
      </div>
    </div>
    
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          size={20}
        />
      ))}
    </div>
    
    <blockquote className="text-gray-600 italic flex-grow">
      "{testimonial.content}"
    </blockquote>
  </motion.div>
);

const testimonials = [
  {
    name: 'Carlos Silva',
    role: 'Paciente',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: 'Agendar minha consulta nunca foi tão fácil! Com apenas uma mensagem no WhatsApp, consegui marcar meu atendimento sem precisar enfrentar filas. O lembrete automático me ajudou a não esquecer o dia da consulta. Recomendo muito!',
    rating: 5
  },
  {
    name: 'Dra. Ana Santos',
    role: 'Médica',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: 'O sistema trouxe muito mais organização para o nosso posto de saúde. Agora conseguimos gerenciar os atendimentos de forma eficiente, reduzindo faltas e otimizando os horários dos médicos. A integração com o WhatsApp facilitou o contato direto com os pacientes.',
    rating: 5
  },
  {
    name: 'Roberto Costa',
    role: 'Cuidador',
    image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    content: 'Antes, eu passava horas no telefone tentando marcar uma consulta para minha mãe. Agora, faço tudo pelo WhatsApp em poucos segundos. O atendimento melhorou muito, e minha mãe recebe até o prontuário digital após a consulta!',
    rating: 5
  }
];

function TestimonialsSection() {
  return (
    <section className="py-16 bg-white overflow-visible relative">
        {/* Aspa decorativa posicionada atrás do primeiro card (Carlos Silva) */}
        <div className="absolute left-[calc(16.666%-5rem)] top-[40%] -translate-y-1/2 z-0 pointer-events-none" style={{
          opacity: 0.4,
          width: '156px',
          height: '160px'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 156 160" version="1.1">
            <path d="M 29.500 20.164 C 26.314 21.922, 21.943 26.268, 20.411 29.200 C 18.334 33.176, 18.366 78.874, 20.449 82.901 C 22.767 87.384, 28.635 91.918, 33.026 92.620 L 37 93.256 37 98.071 C 37 101.914, 36.551 103.201, 34.777 104.443 C 33.555 105.299, 31.711 106, 30.679 106 C 27.282 106, 22.445 108.977, 20.505 112.261 C 17.908 116.657, 17.806 133.529, 20.353 137.416 C 23.247 141.833, 26.416 143.228, 33.325 143.124 C 46.671 142.924, 59.432 135.589, 67.449 123.511 C 74.356 113.106, 74.500 112, 74.500 69.500 L 74.500 31.500 72.137 27.726 C 70.837 25.650, 67.873 22.838, 65.549 21.476 C 61.557 19.136, 60.504 19.002, 46.412 19.030 C 37.473 19.049, 30.699 19.503, 29.500 20.164 M 107.500 20.164 C 104.314 21.922, 99.943 26.268, 98.411 29.200 C 96.334 33.176, 96.366 78.874, 98.449 82.901 C 100.767 87.384, 106.635 91.918, 111.026 92.620 L 115 93.256 115 98.071 C 115 101.914, 114.551 103.201, 112.777 104.443 C 111.555 105.299, 109.711 106, 108.679 106 C 105.282 106, 100.445 108.977, 98.505 112.261 C 95.908 116.657, 95.806 133.529, 98.353 137.416 C 101.247 141.833, 104.416 143.228, 111.325 143.124 C 124.671 142.924, 137.432 135.589, 145.449 123.511 C 152.356 113.106, 152.500 112, 152.500 69.500 L 152.500 31.500 150.137 27.726 C 148.837 25.650, 145.873 22.838, 143.549 21.476 C 139.557 19.136, 138.504 19.002, 124.412 19.030 C 115.473 19.049, 108.699 19.503, 107.500 20.164 M 33 33 C 31.127 34.873, 31 36.333, 31 56 C 31 79.855, 31.083 80.118, 38.977 81.380 C 46.986 82.661, 50.923 89.563, 49.671 100.130 C 48.579 109.347, 42.716 116.294, 34.642 117.936 C 31.561 118.562, 31.494 118.698, 31.200 124.884 L 30.900 131.193 35.200 130.490 C 45.596 128.790, 54.254 122.472, 59.166 113 C 61.471 108.556, 61.504 108.036, 61.790 71.500 C 62.139 26.989, 63.664 31, 46.389 31 C 36.333 31, 34.766 31.234, 33 33 M 111 33 C 109.127 34.873, 109 36.333, 109 56 C 109 79.855, 109.083 80.118, 116.977 81.380 C 124.986 82.661, 128.923 89.563, 127.671 100.130 C 126.579 109.347, 120.716 116.294, 112.642 117.936 C 109.561 118.562, 109.494 118.698, 109.200 124.884 L 108.900 131.193 113.200 130.490 C 123.596 128.790, 132.254 122.472, 137.166 113 C 139.471 108.556, 139.504 108.036, 139.790 71.500 C 140.139 26.989, 141.664 31, 124.389 31 C 114.333 31, 112.766 31.234, 111 33" stroke="none" fill="#3B82F6" fillRule="evenodd"/>
          </svg>
        </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            O que dizem nossos usuários
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Depoimentos de profissionais que já utilizam nossa plataforma
          </p>
        </motion.div>

        <div className="relative z-10">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            initialSlide={0}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              el: '.testimonial-pagination',
              bulletClass: 'w-2.5 h-2.5 bg-gray-300 rounded-full inline-block mx-1 cursor-pointer',
              bulletActiveClass: 'bg-orange-500',
            }}
            navigation={{
              nextEl: '.testimonial-button-next',
              prevEl: '.testimonial-button-prev',
            }}
            className="pb-14"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <TestimonialCard testimonial={testimonial} index={index} />
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Custom pagination */}
          <div className="testimonial-pagination flex justify-center mt-8" />
          
          {/* Navigation buttons */}
          <button 
            className="testimonial-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-orange-500 hover:bg-orange-50 transition-colors -translate-x-1/2"
            aria-label="Anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button 
            className="testimonial-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-orange-500 hover:bg-orange-50 transition-colors translate-x-1/2"
            aria-label="Próximo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
