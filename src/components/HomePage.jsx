import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, Award, Sparkles, Newspaper, CalendarDays, ArrowRight } from 'lucide-react';

const HomePage = ({ onLogin, latestNews = [], latestEvents = [] }) => {
  const welcomeMessages = [
    "Olá, futuro campeão! 🏆 Pronto para brilhar?",
    "Seja bem-vindo(a) ao portal da superação! ✨",
    "Aqui começa sua jornada rumo ao sucesso! 🚀",
    "Que bom ter você aqui! Vamos aprender e crescer juntos! 🌱"
  ];
  const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'Data indisponível';
    return new Date(timestamp.toDate()).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(7)].map((_, i) => (
          <motion.div 
            key={i}
            className={`absolute rounded-full blur-3xl ${i % 2 === 0 ? 'bg-emerald-300/10' : 'bg-white/10'}`}
            style={{
              width: Math.random() * 300 + 150,
              height: Math.random() * 300 + 150,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{ 
              scale: [1, 1.05 + Math.random() * 0.2, 1], 
              rotate: [0, Math.random() * 30 - 15, 0],
              x: Math.random() * 60 - 30,
              y: Math.random() * 60 - 30,
            }}
            transition={{ duration: 20 + Math.random() * 15, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <motion.header 
        className="relative z-10 p-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center glass-effect shadow-xl border border-white/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/5106ab5f-59ac-4270-81fc-d7e48fdc8ddd/fabd3a46ec76ba6fff9fec1d4c650677.jpg"
                alt="Logo da Escola"
                className="w-10 h-10 object-contain rounded-full"
              />
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Escola Estadual do Campo</h1>
              <p className="text-white/80 text-sm sm:text-base">Vinícius de Moraes - 9º Ano</p>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10 flex-grow flex items-center max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.div 
                className="inline-flex items-center space-x-2 bg-white/20 text-white px-4 py-2.5 rounded-full text-sm font-medium shadow-lg glass-effect border border-white/30"
                initial={{ opacity:0, y:10 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay: 0.3 }}
              >
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span>{randomMessage}</span>
              </motion.div>
              <motion.h2 
                className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              >
                Bem-vindos ao
                <span className="block bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 bg-clip-text text-transparent mt-1 sm:mt-2">
                  Portal do 9º Ano!
                </span>
              </motion.h2>
              
              <motion.p 
                className="text-lg sm:text-xl text-white/90 leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              >
                Acompanhe seu desempenho, veja rankings, conquiste medalhas e 
                mantenha-se motivado em sua jornada educacional! Juntos, vamos alcançar o sucesso!
              </motion.p>
            </div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            >
              <Button
                onClick={() => onLogin('student')}
                className="w-full sm:w-auto bg-white text-green-700 hover:bg-green-50 text-lg px-8 py-4 rounded-xl font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300 pulse-glow border-2 border-emerald-500"
              >
                <Users className="w-6 h-6 mr-3" />
                Entrar como Aluno
              </Button>
              
              <Button
                onClick={() => onLogin('admin')}
                variant="outline"
                className="w-full sm:w-auto bg-white/20 text-white hover:bg-white/30 border-white/50 hover:border-white text-lg px-8 py-4 rounded-xl font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300 glass-effect"
              >
                <Award className="w-6 h-6 mr-3" />
                Acesso da Secretaria
              </Button>
            </motion.div>
            <motion.p 
              className="text-sm text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Alunos: usem seu <strong>email da escola</strong> para fazer login.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 100 }}
            className="hidden lg:block"
          >
            <div className="relative glass-effect p-8 rounded-3xl shadow-2xl border-2 border-white/20">
              <motion.img 
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/5106ab5f-59ac-4270-81fc-d7e48fdc8ddd/d3e82f464b6bd1fa35d02a534ff070fd.png"
                alt="Mascote da escola apresentando"
                className="w-[380px] h-auto object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.3)] floating-animation"
                drag
                dragConstraints={{ left: -15, right: 15, top: -15, bottom: 15 }}
              />
              <motion.div
                className="absolute -top-5 -right-5 w-12 h-12 bg-yellow-300/50 rounded-full opacity-70"
                animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute -bottom-5 -left-5 w-10 h-10 bg-blue-300/50 rounded-full opacity-70"
                animate={{ y: [-12, 12, -12], x: [-4, 4, -4] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />
               <div className="absolute bottom-6 right-6 bg-white/30 backdrop-blur-sm p-3 rounded-lg shadow-lg text-white text-xs">
                  <Sparkles className="w-4 h-4 inline mr-1 text-yellow-300" />
                  Sempre aprendendo!
               </div>
            </div>
          </motion.div>
        </div>
      </main>

      {(latestNews.length > 0 || latestEvents.length > 0) && (
         <motion.section 
            className="relative z-10 py-12 px-4 sm:px-6 bg-white/5 backdrop-blur-md"
            initial={{ opacity:0, y:50 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          >
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
              {latestNews.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Newspaper className="w-7 h-7 mr-3 text-sky-300"/> Últimas Notícias
                  </h3>
                  <div className="space-y-3">
                    {latestNews.map(news => (
                      <motion.div 
                        key={news.id} 
                        className="bg-white/10 p-4 rounded-lg shadow-md hover:bg-white/20 transition-colors border border-white/20"
                        whileHover={{ scale: 1.02 }}
                      >
                        <h4 className="font-semibold text-white text-base truncate">{news.title}</h4>
                        <p className="text-sm text-white/80 truncate">{news.summary}</p>
                        <div className="text-xs text-white/70 mt-1">{formatDate(news.createdAt)}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              {latestEvents.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                     <CalendarDays className="w-7 h-7 mr-3 text-amber-300"/> Próximos Eventos
                  </h3>
                  <div className="space-y-3">
                    {latestEvents.map(event => (
                       <motion.div 
                        key={event.id} 
                        className="bg-white/10 p-4 rounded-lg shadow-md hover:bg-white/20 transition-colors border border-white/20"
                        whileHover={{ scale: 1.02 }}
                      >
                        <h4 className="font-semibold text-white text-base truncate">{event.title}</h4>
                        <p className="text-sm text-white/80 truncate">{event.location}</p>
                        <div className="text-xs text-white/70 mt-1">{new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })} às {event.time}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
         </motion.section>
      )}


      <motion.footer 
        className="relative z-10 border-t border-white/20 py-8"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/80 text-sm">
            © {new Date().getFullYear()} Escola Estadual do Campo Vinícius de Moraes - 9º Ano. 
            Desenvolvido com ❤️ para motivar nossos estudantes.
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default HomePage;