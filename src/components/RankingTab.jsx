import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Star, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';

const RankingTab = ({ user, allStudents = [] }) => { 
  
  const rankedStudentsToDisplay = allStudents
    .map(student => {
      const stats = student.stats || {};
      const scores = [
        stats.provaParana || 0,
        stats.saeb || 0,
        stats.provasInternas || 0,
        stats.provasExternas || 0,
        stats.plataformasDigitais || 0,
      ];
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / (scores.filter(s => typeof s === 'number').length || 1);
      return {
        ...student,
        averageScore: Math.round(averageScore),
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)], 
      };
    })
    .sort((a, b) => {
      if (b.averageScore !== a.averageScore) {
        return b.averageScore - a.averageScore;
      }
      // If average scores are the same, sort by name alphabetically
      return a.name.localeCompare(b.name);
    });


  const getMedalColor = (position) => {
    if (position === 1) return "text-yellow-400";
    if (position === 2) return "text-gray-400";
    if (position === 3) return "text-amber-600";
    return "text-gray-400";
  };
  
  const getMedalClass = (position) => {
    if (position === 1) return "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-yellow-500/50";
    if (position === 2) return "bg-gradient-to-br from-gray-400 to-slate-500 shadow-gray-500/50";
    if (position === 3) return "bg-gradient-to-br from-amber-600 to-orange-700 shadow-amber-600/50";
    return "bg-gray-100";
  };


  const getPodiumHeight = (position) => {
    if (position === 1) return "h-48"; 
    if (position === 2) return "h-40"; 
    if (position === 3) return "h-32"; 
    return "h-24";
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <CheckCircle className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="space-y-8 p-4 md:p-6 bg-gradient-to-br from-slate-100 via-gray-100 to-stone-100 rounded-xl shadow-inner min-h-[calc(100vh-10rem)]">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <Award className="w-16 h-16 mx-auto text-emerald-500 mb-3 drop-shadow-lg" />
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">Ranking Geral do 9º Ano</h2>
        <p className="text-gray-600 text-lg mt-2">
          Veja sua posição e o desempenho dos melhores alunos!
        </p>
      </motion.div>

      {rankedStudentsToDisplay.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-200 relative overflow-hidden card-hover"
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
          
          <h3 className="text-2xl font-bold text-center mb-8 text-emerald-700 relative z-10">🏆 Pódio dos Campeões 🏆</h3>
          
          <div className="flex flex-col sm:flex-row justify-around items-end space-y-6 sm:space-y-0 sm:space-x-4 relative z-10">
            {[rankedStudentsToDisplay[1], rankedStudentsToDisplay[0], rankedStudentsToDisplay[2]].map((student, index) => {
              if (!student) return null; // Add this check
              const originalIndex = student === rankedStudentsToDisplay[0] ? 0 : student === rankedStudentsToDisplay[1] ? 1 : 2;
              const position = originalIndex + 1;
              return (
                <motion.div
                  key={student.id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className={`text-center w-full sm:w-1/3 flex flex-col items-center order-${position === 1 ? 1 : (position === 2 ? 0 : 2)} sm:order-none`}
                >
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1.5 mb-3 shadow-lg ${getMedalClass(position)}`}>
                    <img 
                      src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`}
                      alt={student.name}
                      className="w-full h-full rounded-full object-cover border-2 border-white/50"
                    />
                  </div>
                  <div className={`bg-white/80 backdrop-blur-sm px-4 py-3 rounded-lg shadow-md w-full max-w-xs ${getPodiumHeight(position)} flex flex-col justify-between items-center border-t-4 ${getMedalClass(position).replace('bg-gradient-to-br from-', 'border-')}`}>
                    <div className="text-center">
                      {position === 1 && <Trophy className={`w-10 h-10 mx-auto mb-1 ${getMedalColor(position)}`} />}
                      {position === 2 && <Medal className={`w-10 h-10 mx-auto mb-1 ${getMedalColor(position)}`} />}
                      {position === 3 && <Award className={`w-10 h-10 mx-auto mb-1 ${getMedalColor(position)}`} />}
                      <p className={`font-bold text-lg ${getMedalColor(position).replace('text-', 'text-gray-')}`}>{student.name}</p>
                      <p className={`text-sm font-medium text-gray-600`}>{student.averageScore}%</p>
                    </div>
                    <div className={`font-bold text-3xl sm:text-4xl ${getMedalColor(position)}`}>{position}º</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: rankedStudentsToDisplay.length >=3 ? 0.3 : 0.1 }}
        className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-5">
          <h3 className="text-xl font-bold tracking-wide">Classificação Completa</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {rankedStudentsToDisplay.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.04, ease: "circOut" }}
              className={`p-4 sm:p-5 flex items-center justify-between transition-colors duration-200 card-hover ${
                user && student.id === user.uid ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${getMedalClass(index + 1)} ${index < 3 ? getMedalColor(index+1) : 'text-gray-700'}`}>
                  {index < 3 ? 
                   (index === 0 ? <Trophy className="w-6 h-6" /> : index === 1 ? <Medal className="w-6 h-6" /> : <Award className="w-6 h-6" />)
                   : `#${index + 1}`}
                </div>
                
                <img 
                  src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`}
                  alt={student.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-200 object-cover shadow-sm"
                />
                
                <div>
                  <p className="font-semibold text-gray-800 text-sm sm:text-base flex items-center">
                    {student.name}
                    {user && student.id === user.uid && (
                      <span className="ml-2 bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-medium">
                        Você
                      </span>
                    )}
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">Posição #{index + 1}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="text-right">
                  <p className="text-lg sm:text-xl font-bold text-emerald-600">{student.averageScore}%</p>
                  <p className="text-gray-500 text-xs sm:text-sm">Média</p>
                </div>
                
                <div className="hidden sm:flex items-center" title={`Tendência: ${student.trend}`}>
                  {getTrendIcon(student.trend)}
                </div>
              </div>
            </motion.div>
          ))}
          {rankedStudentsToDisplay.length === 0 && (
            <p className="p-6 text-center text-gray-500">Nenhum aluno no ranking ainda.</p>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale:0.95 }}
        animate={{ opacity: 1, scale:1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 rounded-xl p-6 text-white text-center shadow-xl card-hover"
      >
        <Star className="w-12 h-12 mx-auto mb-3 text-yellow-300 animate-pulse" />
        <h3 className="text-xl font-bold mb-1.5">Continue Brilhando!</h3>
        <p className="text-blue-100 text-sm">
          Cada ponto conquistado é um passo mais perto dos seus sonhos. Você é capaz!
        </p>
      </motion.div>
      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default RankingTab;