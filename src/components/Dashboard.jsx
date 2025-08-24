import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogOut, Bell, Home, Users, FileText, Award, Newspaper, CalendarDays, X, Menu, FileSpreadsheet } from 'lucide-react';
import DashboardContent from '@/components/DashboardContent';
import RankingTab from '@/components/RankingTab';
import AdminPanel from '@/components/AdminPanel';
import AdminNewsPanel from '@/components/AdminNewsPanel';
import AdminEventsPanel from '@/components/AdminEventsPanel';
import NotificationDropdown from '@/components/NotificationDropdown';
import AdminReportsPanel from '@/components/AdminReportsPanel';

const Dashboard = ({ user, onLogout, allStudents, allNews, allEvents, onOpenReport }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const commonTabsBase = [
    { id: 'dashboard', label: 'Meu Painel', icon: Home },
    { id: 'news', label: 'Notícias', icon: Newspaper },
    { id: 'events', label: 'Eventos', icon: CalendarDays },
  ];

  const studentTabs = [
    ...commonTabsBase,
    { id: 'ranking', label: 'Ranking Geral', icon: Award },
  ];
  
  const adminTabsSpecific = [
    { id: 'adminStudents', label: 'Gerenciar Alunos', icon: Users },
    { id: 'adminNews', label: 'Gerenciar Notícias', icon: FileText },
    { id: 'adminEvents', label: 'Gerenciar Eventos', icon: CalendarDays },
    { id: 'adminRanking', label: 'Ranking Geral', icon: Award },
    { id: 'adminReports', label: 'Relatórios', icon: FileSpreadsheet },
  ];

  const tabs = user.type === 'admin' ? [...commonTabsBase, ...adminTabsSpecific] : studentTabs;
  
  // Ensure initial tab is 'dashboard' for admin
  useEffect(() => {
    if (user.type === 'admin') {
      setActiveTab('dashboard');
    }
  }, [user.type]);


  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent user={user} setActiveTab={setActiveTab} allStudents={allStudents} allNews={allNews} allEvents={allEvents} />;
      case 'ranking':
        return user.type === 'student' ? <RankingTab user={user} allStudents={allStudents} /> : null; 
      case 'news':
        return <AdminNewsPanel user={user} isStudentView={user.type === 'student'} />;
      case 'events':
        return <AdminEventsPanel user={user} isStudentView={user.type === 'student'} />; 
      case 'adminStudents':
        return user.type === 'admin' ? <AdminPanel /> : null;
      case 'adminNews':
        return user.type === 'admin' ? <AdminNewsPanel user={user} isStudentView={false} /> : null;
      case 'adminEvents':
         return user.type === 'admin' ? <AdminEventsPanel user={user} isStudentView={false} /> : null;
      case 'adminRanking':
        return user.type === 'admin' ? <RankingTab user={user} allStudents={allStudents} /> : null;
      case 'adminReports':
        return user.type === 'admin' ? <AdminReportsPanel allStudents={allStudents} allNews={allNews} allEvents={allEvents} /> : null;
      default:
        setActiveTab('dashboard'); // Fallback to dashboard if tab is invalid
        return <DashboardContent user={user} setActiveTab={setActiveTab} allStudents={allStudents} allNews={allNews} allEvents={allEvents} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex flex-col">
      <motion.header 
        className="bg-white shadow-xl border-b-4 border-emerald-500 sticky top-0 z-40"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <motion.div 
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow cursor-pointer transform hover:scale-110"
                whileHover={{ rotate: 10 }}
                onClick={() => setActiveTab('dashboard')}
              >
                <img 
                  src="https://storage.googleapis.com/hostinger-horizons-assets-prod/5106ab5f-59ac-4270-81fc-d7e48fdc8ddd/fabd3a46ec76ba6fff9fec1d4c650677.jpg"
                  alt="Logo da Escola"
                  className="w-7 h-7 sm:w-9 sm:h-9 object-contain rounded-full p-0.5 bg-white"
                />
              </motion.div>
              <div className="hidden md:block">
                <h1 className="text-base sm:text-lg font-bold text-emerald-800">Escola Estadual do Campo</h1>
                <p className="text-xs sm:text-sm text-emerald-700">Vinícius de Moraes - Portal do 9º Ano</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              {user.type === 'admin' && (
                <div className="relative">
                  <NotificationDropdown user={user} />
                </div>
              )}
              
              <div className="flex items-center space-x-1.5 sm:space-x-3 bg-emerald-50 p-1 sm:p-1.5 rounded-full shadow-inner border border-emerald-200">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border-2 border-emerald-500 shadow-md object-cover"
                />
                <div className="hidden sm:block pr-1 sm:pr-2">
                  <p className="font-semibold text-emerald-800 text-xs sm:text-sm leading-tight">{user.name}</p>
                  <p className="text-[10px] sm:text-xs text-emerald-600">
                    {user.type === 'admin' ? 'Secretaria' : 'Aluno(a)'}
                  </p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Button 
                  onClick={onLogout}
                  variant="outline"
                  size="sm"
                  className="border-red-400 text-red-600 hover:bg-red-100 hover:border-red-500 hover:text-red-700 transition-all rounded-full px-2.5 sm:px-3 md:px-4 shadow-sm hover:shadow-md active:scale-95 h-8 sm:h-9 md:h-10"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0 sm:mr-1.5 md:mr-2" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Sair</span>
                </Button>
              </motion.div>
              <div className="lg:hidden">
                <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(!showMobileMenu)} className="text-emerald-600 hover:bg-emerald-100 rounded-full h-9 w-9 sm:h-10 sm:w-10">
                  {showMobileMenu ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>
      
      <div className="flex flex-1 overflow-hidden">
        <motion.nav 
          className="hidden lg:flex flex-col w-60 xl:w-64 bg-white shadow-2xl p-4 space-y-2 border-r-2 border-emerald-100"
          initial={{ x: -250, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "circOut", delay: 0.1 }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.div
                key={tab.id + "-desktop"}
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 300, duration: 0.1 }}
              >
                <Button
                  variant={activeTab === tab.id ? "secondary" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full justify-start text-xs xl:text-sm font-medium py-3 px-3 xl:px-4 rounded-lg transition-all duration-200 ease-in-out group shadow-sm hover:shadow-md
                    ${ activeTab === tab.id 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg scale-105 ring-1 ring-emerald-300 ring-offset-1' 
                      : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`
                  }
                >
                  <Icon className={`w-4 h-4 xl:w-5 xl:h-5 mr-2.5 xl:mr-3.5 transition-transform duration-200 ease-in-out ${activeTab === tab.id ? 'scale-110 text-white' : 'group-hover:scale-110 text-emerald-500'}`} />
                  {tab.label}
                </Button>
              </motion.div>
            );
          })}
        </motion.nav>

        <AnimatePresence>
          {showMobileMenu && (
            <motion.div 
              className="lg:hidden fixed inset-0 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)}></div>
              <motion.nav 
                className="fixed left-0 top-0 bottom-0 w-64 sm:w-72 bg-white shadow-2xl p-5 space-y-2.5 border-r-2 border-emerald-100 flex flex-col"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.4, ease: "circOut" }}
              >
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                    <img 
                        src="https://storage.googleapis.com/hostinger-horizons-assets-prod/5106ab5f-59ac-4270-81fc-d7e48fdc8ddd/fabd3a46ec76ba6fff9fec1d4c650677.jpg"
                        alt="Logo Escola Mobile"
                        className="w-10 h-10 rounded-full"
                    />
                    <h2 className="text-emerald-700 font-semibold">Menu Principal</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(false)} className="text-emerald-600 hover:bg-emerald-100 rounded-full h-9 w-9">
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Button
                      key={tab.id + "-mobile"}
                      variant={activeTab === tab.id ? "secondary" : "ghost"}
                      onClick={() => { setActiveTab(tab.id); setShowMobileMenu(false); }}
                      className={`w-full justify-start text-sm sm:text-base font-medium py-3.5 px-4 rounded-lg transition-all duration-200 ease-in-out group
                        ${ activeTab === tab.id 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg scale-105' 
                          : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`
                      }
                    >
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mr-3 sm:mr-4 transition-transform duration-200 ease-in-out ${activeTab === tab.id ? 'scale-110 text-white' : 'group-hover:scale-110 text-emerald-500'}`} />
                      {tab.label}
                    </Button>
                  );
                })}
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto bg-slate-50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;