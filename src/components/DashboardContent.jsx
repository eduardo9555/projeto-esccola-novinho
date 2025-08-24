import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, Users, Calendar, TrendingUp, BarChart3, PieChart, ThumbsUp, AlertTriangle, MessageSquare, Sparkles, ArrowRight, Newspaper, CalendarDays, BookOpen } from 'lucide-react';
import AdminDashboard from '@/components/AdminDashboard';

const MotivationalMessage = ({ score, name }) => {
  let message = "";
  let icon = null;
  let bgColor = "";
  let textColor = "";
  let borderColor = "";
  let iconColor = "";

  if (score >= 90) {
    message = `UAU, ${name}! Seu desempenho é INCRÍVEL! Você é uma estrela! ✨ Continue assim!`;
    icon = <Sparkles className="w-10 h-10" />;
    bgColor = "bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500";
    textColor = "text-white";
    borderColor = "border-yellow-300";
    iconColor = "text-white";
  } else if (score >= 70) {
    message = `Parabéns, ${name}! Você está mandando MUITO BEM! Continue focado e o sucesso é garantido! 🚀`;
    icon = <ThumbsUp className="w-10 h-10" />;
    bgColor = "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500";
    textColor = "text-white";
    borderColor = "border-green-300";
    iconColor = "text-white";
  } else if (score >= 50) {
    message = `Continue firme, ${name}! O aprendizado é uma jornada. Acredite em você, estamos juntos nessa! 👍`;
    icon = <TrendingUp className="w-10 h-10" />;
    bgColor = "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500";
    textColor = "text-white";
    borderColor = "border-sky-300";
    iconColor = "text-white";
  } else {
    message = `Força, ${name}! Às vezes precisamos de um empurrãozinho. Conte conosco para decolar! ✈️ Cada passo conta!`;
    icon = <MessageSquare className="w-10 h-10" />;
    bgColor = "bg-gradient-to-r from-rose-400 via-red-500 to-pink-500";
    textColor = "text-white";
    borderColor = "border-rose-300";
    iconColor = "text-white";
  }

  return (
    <motion.div 
      className={`p-5 rounded-xl border-l-[10px] shadow-2xl flex items-center space-x-4 ${bgColor} ${textColor} ${borderColor}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "circOut" }}
      whileHover={{ scale: 1.03, boxShadow: "0px 12px 35px rgba(0,0,0,0.25)"}}
    >
      <motion.div
        className={`p-2 rounded-full bg-white/20 ${iconColor}`}
        animate={{ rotate: [0, -5, 5, -5, 5, 0], scale: [1, 1.1, 1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        {icon}
      </motion.div>
      <p className="text-base sm:text-lg font-semibold leading-tight">{message}</p>
    </motion.div>
  );
};

const MascotPrize = ({ userName, userRanking }) => {
  const mascotMessages = [
    `Continue assim, ${userName}, e este notebook incrível pode ser seu! ✨`,
    `Falta pouco, ${userName}! Mantenha o foco e conquiste este super prêmio! 💻`,
    `Imagine só, ${userName}, todas as coisas que você poderá fazer com este notebook! 🚀`,
    `Este notebook é um incentivo para você brilhar ainda mais, ${userName}! 🌟`
  ];
  const [currentMessage, setCurrentMessage] = useState(mascotMessages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentMessage(mascotMessages[Math.floor(Math.random() * mascotMessages.length)]);
    }, 6000);
    return () => clearInterval(intervalId);
  }, [userName]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.8, type: "spring", stiffness: 100, damping: 12 }}
      className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border-2 border-emerald-200 card-hover flex flex-col items-center justify-between h-full"
    >
      <div className="text-center w-full">
        <h3 className="text-2xl font-bold text-emerald-700 mb-1.5">Prêmio Final do Ano!</h3>
        <p className="text-gray-600 text-sm mb-4">
          O melhor aluno do 9º ano ganhará um <strong className="text-emerald-600">super notebook!</strong>
        </p>
        <motion.img 
          src="https://storage.googleapis.com/hostinger-horizons-assets-prod/5106ab5f-59ac-4270-81fc-d7e48fdc8ddd/afe9d6dd0519249cbc3144481b7f0413.png"
          alt="Notebook - Prêmio final"
          className="w-full max-w-[260px] sm:max-w-[280px] mx-auto mb-4 drop-shadow-[0_20px_30px_rgba(0,160,120,0.35)]"
          whileHover={{ scale: 1.08, rotate: 1.5 }}
          transition={{ type: "spring", stiffness: 250, damping: 10 }}
        />
      </div>
      <div className="flex items-center space-x-3 bg-emerald-50 p-3.5 rounded-xl shadow-inner w-full mt-2 border border-emerald-100">
        <motion.img
          src="https://storage.googleapis.com/hostinger-horizons-assets-prod/5106ab5f-59ac-4270-81fc-d7e48fdc8ddd/d3e82f464b6bd1fa35d02a534ff070fd.png"
          alt="Mascote"
          className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
          animate={{ y: [0, -6, 0], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <AnimatePresence mode="wait">
          <motion.p 
            key={currentMessage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-emerald-700 text-sm font-medium"
          >
            {currentMessage}
          </motion.p>
        </AnimatePresence>
      </div>
      <motion.div 
        className="mt-4 bg-gradient-to-tr from-emerald-600 to-green-500 text-white rounded-lg p-3 w-full text-center shadow-xl"
        whileHover={{ scale: 1.03 }}
      >
        <p className="font-semibold text-sm">
          Sua Posição Atual: <span className="text-lg font-bold tracking-wide">#{userRanking || "N/A"}</span>
        </p>
        <p className="text-xs text-emerald-100">Continue firme rumo ao topo!</p>
      </motion.div>
    </motion.div>
  );
};


const DashboardContent = ({ user, setActiveTab, allStudents, allNews, allEvents }) => {
  const [studentData, setStudentData] = useState(user);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    setStudentData(user);
    const welcomeMessages = [
      `Olá, ${user.name}! Pronto para mais um dia de conquistas? ✨`,
      `Bem-vindo(a) de volta, ${user.name}! Que seu dia seja produtivo e cheio de aprendizado! 🚀`,
      `E aí, ${user.name}! Feliz em te ver por aqui. Vamos juntos alcançar seus objetivos! 💪`,
      `Que bom te ver, ${user.name}! Continue se esforçando, você está no caminho certo! 🌟`
    ];
    setWelcomeMessage(welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]);
  }, [user]);

  if (user.type === 'admin') {
    return <AdminDashboard user={user} setActiveTab={setActiveTab} allStudents={allStudents} allNews={allNews} allEvents={allEvents} />;
  }
  
  const averageScore = studentData?.stats ? Math.round(
    ( (studentData.stats.provaParana || 0) + 
      (studentData.stats.saeb || 0) + 
      (studentData.stats.provasInternas || 0) + 
      (studentData.stats.provasExternas || 0) +
      (studentData.stats.plataformasDigitais || 0)
    ) / 5
  ) : 0;


  const performanceItems = [
    { label: 'Provas Externas', value: studentData?.stats?.provasExternas || 0, color: 'bg-gradient-to-r from-purple-500 to-indigo-600', icon: <BookOpen /> },
    { label: 'Provas Internas', value: studentData?.stats?.provasInternas || 0, color: 'bg-gradient-to-r from-sky-500 to-blue-600', icon: <Award /> },
    { label: 'Prova Paraná', value: studentData?.stats?.provaParana || 0, color: 'bg-gradient-to-r from-teal-500 to-cyan-600', icon: <Medal /> },
    { label: 'SAEB', value: studentData?.stats?.saeb || 0, color: 'bg-gradient-to-r from-emerald-500 to-green-600', icon: <Trophy /> },
    { label: 'Plataformas Digitais', value: studentData?.stats?.plataformasDigitais || 0, color: 'bg-gradient-to-r from-amber-500 to-orange-600', icon: <PieChart /> }
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-5 sm:p-6 border-2 border-emerald-200"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 mb-1.5 tracking-tight">Painel do Aluno</h1>
        <p className="text-emerald-600 text-base sm:text-lg">{welcomeMessage}</p>
      </motion.div>

      <div className="mb-6 md:mb-8">
        <MotivationalMessage score={averageScore} name={user.name} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        <div className="md:col-span-4 space-y-5">
          {performanceItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.15, duration: 0.6, ease: "circOut" }}
              className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl border border-gray-200 card-hover"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`p-1.5 rounded-full ${item.color} text-white shadow-sm`}>{React.cloneElement(item.icon, {className: "w-4 h-4"})}</span>
                  <span className="text-gray-700 font-semibold text-sm">{item.label}:</span>
                </div>
                <span className="text-xl font-bold text-gray-800">{item.value}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ delay: 0.5 + index * 0.15, duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
                  className={`h-full ${item.color} rounded-full progress-bar-animated`}
                />
                 <div className="progress-bar-shine"></div>
              </div>
            </motion.div>
          ))}
           <motion.div
            initial={{ opacity: 0, y:20 }}
            animate={{ opacity: 1, y:0 }}
            transition={{ delay: 1, duration: 0.5, ease: "easeOut" }}
            className="bg-gradient-to-tr from-emerald-500 to-green-600 rounded-xl p-4 text-white shadow-lg text-center card-hover"
          >
            <div className="flex items-center justify-center space-x-3">
              <motion.img
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/5106ab5f-59ac-4270-81fc-d7e48fdc8ddd/d3e82f464b6bd1fa35d02a534ff070fd.png"
                alt="Mascote da escola" 
                className="w-16 h-16 object-contain drop-shadow-lg"
                animate={{ rotate: [0, 3, -3, 0], scale: [1, 1.03, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror" }}
              />
              <div>
                <h3 className="text-lg font-bold">Você é TOP!</h3>
                <p className="text-emerald-100 text-xs font-medium">Continue assim!</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7, ease: "circOut" }}
          className="md:col-span-4 bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border-2 border-emerald-200 card-hover flex flex-col items-center justify-center"
        >
          <div className="text-center mb-5">
            <h3 className="text-xl font-bold text-gray-800 mb-1">Frequência Escolar</h3>
            <div className="text-sm text-gray-600">Dias Presente: {studentData?.stats?.frequencia || 0}%</div>
          </div>
          
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto">
            <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90 drop-shadow-lg">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#e9ecef" strokeWidth="26" />
              <motion.circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="url(#freqGradientDashboardContent)"
                strokeWidth="26"
                strokeLinecap="round"
                strokeDasharray={`${(studentData?.stats?.frequencia || 0) * 5.0265} ${502.65}`} 
                initial={{ strokeDashoffset: 502.65 }}
                animate={{ strokeDashoffset: 502.65 - ((studentData?.stats?.frequencia || 0) * 5.0265) }}
                transition={{ duration: 1.8, delay: 0.6, ease: [0.25, 1, 0.5, 1] }}
              />
              <defs>
                <linearGradient id="freqGradientDashboardContent" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                className="text-4xl font-bold text-emerald-700"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                {studentData?.stats?.frequencia || 0}%
              </motion.span>
              <span className="text-gray-600 font-medium text-sm mt-0.5">Frequência</span>
            </div>
          </div>
           <Button 
            variant="outline" 
            className="mt-5 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all group shadow-md hover:shadow-lg"
            onClick={() => setActiveTab('ranking')}
          >
            Ver Ranking Completo <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform" />
          </Button>
        </motion.div>

        <div className="md:col-span-4">
          <MascotPrize userName={user.name} userRanking={studentData?.stats?.ranking} />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7, ease: "circOut" }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 md:mt-8"
      >
        <motion.div 
          className="bg-gradient-to-br from-sky-500 to-blue-600 p-6 rounded-xl shadow-xl text-white card-hover cursor-pointer"
          whileHover={{ scale: 1.035, y: -3, boxShadow: "0px 10px 30px rgba(50,150,255,0.4)"}}
          onClick={() => setActiveTab('news')}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xl font-bold">Últimas Notícias</h4>
            <Newspaper className="w-7 h-7 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-3">Fique por dentro das novidades e comunicados.</p>
          <Button variant="outline" className="bg-white/20 border-white/30 hover:bg-white/30 text-white w-full backdrop-blur-sm shadow-md">
            Ver Notícias <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
        <motion.div 
          className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-xl shadow-xl text-white card-hover cursor-pointer"
          whileHover={{ scale: 1.035, y: -3, boxShadow: "0px 10px 30px rgba(255,150,50,0.4)"}}
          onClick={() => setActiveTab('events')}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xl font-bold">Próximos Eventos</h4>
            <CalendarDays className="w-7 h-7 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-3">Confira os eventos e atividades programadas.</p>
          <Button variant="outline" className="bg-white/20 border-white/30 hover:bg-white/30 text-white w-full backdrop-blur-sm shadow-md">
            Ver Eventos <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
      <style jsx>{`
        .progress-bar-animated {
          position: relative;
          overflow: hidden;
        }
        .progress-bar-shine {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
          animation: shine-animation 2s infinite linear;
          opacity: 0;
        }
        .card-hover:hover .progress-bar-shine {
          opacity: 1;
        }
        @keyframes shine-animation {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default DashboardContent;