import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart3, FileText as FileTextIcon, CalendarDays as CalendarDaysIcon, Sparkles, UserCheck, Edit3, TrendingUp, Activity, Award, FileSpreadsheet, BarChartBig } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, query, where, getCountFromServer, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';

const StatCard = ({ label, value, icon, color, isLoading }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 25, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
    }}
    className={`bg-white p-5 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-4 card-hover transform hover:-translate-y-1.5 border-t-4 ${color}`}
  >
    <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('500', '100')} shadow-lg`}>
      {React.cloneElement(icon, { className: `w-7 h-7 ${color.replace('border-', 'text-')}` })}
    </div>
    <div>
      {isLoading ? (
        <div className="h-7 bg-gray-200 rounded w-16 animate-pulse mb-1"></div>
      ) : (
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      )}
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  </motion.div>
);

const AdminDashboard = ({ user, setActiveTab, allStudents }) => {
  const [stats, setStats] = useState({
    activeStudents: 0,
    averageScore: 0,
    publishedNews: 0,
    scheduledEvents: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [topStudent, setTopStudent] = useState(null);

  const adminUserNames = {
    'izafantin26@gmail.com': 'Diretora Iza',
    'juniedu9@gmail.com': 'Admin Juni',
    'josepsouza@escola.pr.gov.br': 'Pedagogo José',
  };
  const currentAdminName = adminUserNames[user.email.toLowerCase()] || user.name;

  const recordActivity = async (action) => {
    if (auth.currentUser) {
      try {
        await addDoc(collection(db, 'activities'), {
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email,
          userName: currentAdminName,
          action,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error("Error recording activity:", error);
      }
    }
  };


  useEffect(() => {
    setIsLoadingStats(true);
    
    // Use allStudents prop directly
    const studentsList = allStudents;
    let totalScore = 0;
    let validStudentsForAverage = 0;

    studentsList.forEach(student => {
      if (student.stats) {
        const { provaParana = 0, saeb = 0, provasInternas = 0, provasExternas = 0, plataformasDigitais = 0 } = student.stats;
        const studentAverage = (provaParana + saeb + provasInternas + provasExternas + plataformasDigitais) / 5;
        if (!isNaN(studentAverage)) {
           totalScore += studentAverage;
           validStudentsForAverage++;
        }
      }
    });
    
    const overallAverage = validStudentsForAverage > 0 ? Math.round(totalScore / validStudentsForAverage) : 0;
    setStats(prev => ({ ...prev, activeStudents: studentsList.length, averageScore: overallAverage }));

    if (studentsList.length > 0) {
        // The allStudents prop is already sorted by ranking (averageScore) in App.jsx
        setTopStudent(studentsList[0]); // The first student is the top student
    } else {
      setTopStudent(null);
    }
    setIsLoadingStats(false);


    const newsUnsub = onSnapshot(query(collection(db, 'news')), async (snapshot) => {
      setStats(prev => ({ ...prev, publishedNews: snapshot.size }));
    }, (error) => console.error("Error fetching news count:", error));

    const eventsUnsub = onSnapshot(query(collection(db, 'events')), async (snapshot) => {
      setStats(prev => ({ ...prev, scheduledEvents: snapshot.size }));
    }, (error) => console.error("Error fetching events count:", error));


    return () => {
        newsUnsub();
        eventsUnsub();
    }
  }, [allStudents]); // Depend on allStudents prop

 useEffect(() => {
    setIsLoadingActivities(true);
    const activitiesQuery = query(collection(db, 'activities'), orderBy('timestamp', 'desc'), limit(4));
    const unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
      const activitiesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        userName: adminUserNames[doc.data().userEmail.toLowerCase()] || doc.data().userEmail.split('@')[0],
      }));
      setRecentActivities(activitiesList);
      setIsLoadingActivities(false);
    }, (error) => {
      console.error("Error fetching activities: ", error);
      toast({ title: "Erro ao carregar atividades recentes", description: error.message, variant: "destructive"});
      setIsLoadingActivities(false);
    });

    return () => unsubscribeActivities();
  }, []);


  const welcomeMessages = [
    `Olá, ${currentAdminName}! Pronta para organizar o dia? 🗓️`,
    `Bem-vinda de volta, ${currentAdminName}! Que seu dia seja produtivo! ✨`,
    `E aí, ${currentAdminName}! Tudo pronto para mais um dia de sucesso na secretaria? 🚀`,
  ];
  const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

  const quickActions = [
    { icon: <Users />, label: "Gerenciar Alunos", description: "Adicionar, editar ou remover alunos e notas.", tab: "adminStudents" },
    { icon: <FileTextIcon />, label: "Gerenciar Notícias", description: "Publicar e editar comunicados importantes.", tab: "adminNews" },
    { icon: <CalendarDaysIcon />, label: "Gerenciar Eventos", description: "Agendar e atualizar eventos escolares.", tab: "adminEvents" },
    { icon: <FileSpreadsheet />, label: "Relatórios", description: "Visualizar relatórios e estatísticas.", tab: "adminReports" },
  ];

  const statCardsData = [
    { label: "Alunos Ativos", value: stats.activeStudents, icon: <Users />, color: "border-emerald-500" },
    { label: "Média Geral", value: `${stats.averageScore}%`, icon: <BarChart3 />, color: "border-sky-500" },
    { label: "Notícias Publicadas", value: stats.publishedNews, icon: <FileTextIcon />, color: "border-amber-500" },
    { label: "Eventos Agendados", value: stats.scheduledEvents, icon: <CalendarDaysIcon />, color: "border-purple-500" },
  ];
  
  const getActivityIcon = (action) => {
    if (action.includes('notas') || action.includes('aluno')) return <UserCheck className="w-5 h-5 text-blue-500" />;
    if (action.includes('notícia')) return <Edit3 className="w-5 h-5 text-orange-500" />;
    if (action.includes('evento')) return <CalendarDaysIcon className="w-5 h-5 text-purple-500" />;
    if (action.includes('acessou o painel')) return <Sparkles className="w-5 h-5 text-green-500" />;
    return <Activity className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 bg-gradient-to-br from-slate-100 via-gray-100 to-stone-100 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 sm:mb-10 flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">Painel da Secretaria</h1>
          <p className="text-gray-600 mt-1 flex items-center text-xs sm:text-sm md:text-base">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-500 animate-pulse" />
            {randomWelcome}
          </p>
        </div>
        <motion.div 
          className="relative mt-4 md:mt-0"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 120 }}
        >
          <motion.img 
            src="https://storage.googleapis.com/hostinger-horizons-assets-prod/5106ab5f-59ac-4270-81fc-d7e48fdc8ddd/d3e82f464b6bd1fa35d02a534ff070fd.png"
            alt="Mascote da Secretaria"
            className="w-24 h-auto sm:w-28 md:w-32 drop-shadow-xl floating-animation"
          />
          <motion.div 
            className="absolute -top-1 sm:-top-2 -right-2 sm:-right-3 bg-emerald-500 text-white text-[10px] sm:text-xs px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full shadow-xl border-2 border-white"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            Online!
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
        }}
      >
        {statCardsData.map((stat) => (
          <StatCard 
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            isLoading={isLoadingStats}
          />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-xl shadow-2xl border border-gray-200 space-y-5"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 border-b pb-3">Gerenciamento Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {quickActions.map((action) => (
              <QuickActionButton 
                key={action.tab}
                icon={action.icon} 
                label={action.label} 
                description={action.description} 
                onClick={() => setActiveTab(action.tab)}
              />
            ))}
          </div>
          
           <div className="mt-5 pt-4 sm:mt-6 sm:pt-5 border-t">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Destaque do Ranking</h3>
            {isLoadingStats ? (
                <div className="bg-gray-200 p-5 rounded-xl shadow-inner animate-pulse h-24"></div>
            ) : topStudent ? (
              <motion.div 
                className="bg-gradient-to-r from-yellow-400 to-amber-500 p-4 sm:p-5 rounded-xl shadow-lg text-white flex items-center space-x-3 sm:space-x-4"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <img src={topStudent.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${topStudent.name}`} alt={topStudent.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white shadow-md" />
                <div>
                  <p className="text-[10px] sm:text-xs opacity-80">1º Lugar Geral</p>
                  <p className="text-base sm:text-xl font-bold">{topStudent.name}</p>
                  <p className="text-xs sm:text-sm opacity-90">
                    Média: {Math.round(topStudent.averageScore || 0)}%
                  </p>
                </div>
                <Award className="w-8 h-8 sm:w-10 sm:h-10 ml-auto text-yellow-200 opacity-70" />
              </motion.div>
            ) : (
                <p className="text-gray-500 text-sm">Nenhum aluno no ranking ainda.</p>
            )}
          </div>


        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          className="bg-white p-5 sm:p-6 rounded-xl shadow-2xl border border-gray-200"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 sm:mb-5 border-b pb-3">Atividade Recente</h2>
          {isLoadingActivities ? (
             <div className="space-y-3 sm:space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                        <div className="p-2 bg-gray-200 rounded-full w-8 h-8 sm:w-9 sm:h-9 animate-pulse"></div>
                        <div className="flex-1 mt-1">
                            <div className="h-3.5 bg-gray-200 rounded w-3/4 animate-pulse mb-1.5"></div>
                            <div className="h-2.5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
          ) : recentActivities.length > 0 ? (
            <ul className="space-y-3 sm:space-y-4">
              {recentActivities.map((activity) => (
                <ActivityItem 
                  key={activity.id} 
                  user={activity.userName} 
                  action={activity.action} 
                  time={activity.timestamp ? new Date(activity.timestamp.toDate()).toLocaleString('pt-BR', { day: 'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) : 'Recente'} 
                  icon={getActivityIcon(activity.action)}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Nenhuma atividade recente registrada.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const QuickActionButton = ({ icon, label, description, onClick }) => (
  <motion.button 
    className="bg-slate-50 hover:bg-emerald-50 p-4 sm:p-5 rounded-xl text-left transition-all duration-300 shadow-lg hover:shadow-xl border border-transparent hover:border-emerald-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
    whileHover={{ scale: 1.03, y: -3 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
  >
    <div className="flex items-center space-x-3 mb-1">
      {React.cloneElement(icon, { className: "w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" })}
      <h3 className="font-semibold text-gray-700 text-sm sm:text-base">{label}</h3>
    </div>
    <p className="text-xs text-gray-500 ml-9 sm:ml-10">{description}</p>
  </motion.button>
);

const ActivityItem = ({ user, action, time, icon }) => (
  <li className="flex items-start space-x-3 text-xs sm:text-sm">
    <div className="p-1.5 sm:p-2 bg-gray-100 rounded-full shadow-sm mt-0.5">
     {icon || <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />}
    </div>
    <div>
      <span className="font-medium text-gray-700">{user}</span>
      <span className="text-gray-500"> {action}</span>
      <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{time}</p>
    </div>
  </li>
);

export default AdminDashboard;