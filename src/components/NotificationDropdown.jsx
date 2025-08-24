import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, FileText, CalendarDays, Eye, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

const NotificationDropdown = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewedNotifications, setViewedNotifications] = useState([]);

  const NOTIFICATIONS_VIEWED_KEY_PREFIX = 'viewedNotifications_';

  useEffect(() => {
    if (!user || !user.uid) return;

    const storedViewed = localStorage.getItem(`${NOTIFICATIONS_VIEWED_KEY_PREFIX}${user.uid}`);
    if (storedViewed) {
      setViewedNotifications(JSON.parse(storedViewed));
    }

    const newsQuery = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(5));
    const eventsQuery = query(collection(db, 'events'), orderBy('createdAt', 'desc'), limit(5));

    const unsubNews = onSnapshot(newsQuery, (snapshot) => {
      const newsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'news', createdAt: doc.data().createdAt?.toDate() }));
      setNotifications(prev => sortAndMerge([...prev.filter(n => n.type !== 'news'), ...newsData]));
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching news notifications:", error);
      setIsLoading(false);
    });

    const unsubEvents = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'event', createdAt: doc.data().createdAt?.toDate() }));
      setNotifications(prev => sortAndMerge([...prev.filter(n => n.type !== 'event'), ...eventsData]));
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching events notifications:", error);
      setIsLoading(false);
    });
    
    return () => {
      unsubNews();
      unsubEvents();
    };
  }, [user]);

  const sortAndMerge = (items) => {
    return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 10);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark all current notifications as viewed when dropdown opens
      const currentNotificationIds = notifications.map(n => n.id);
      const newViewed = [...new Set([...viewedNotifications, ...currentNotificationIds])];
      setViewedNotifications(newViewed);
      if (user && user.uid) {
        localStorage.setItem(`${NOTIFICATIONS_VIEWED_KEY_PREFIX}${user.uid}`, JSON.stringify(newViewed));
      }
    }
  };

  const markAsViewed = (id) => {
    if (!viewedNotifications.includes(id)) {
      const newViewed = [...viewedNotifications, id];
      setViewedNotifications(newViewed);
      if (user && user.uid) {
        localStorage.setItem(`${NOTIFICATIONS_VIEWED_KEY_PREFIX}${user.uid}`, JSON.stringify(newViewed));
      }
    }
  };
  
  const unreadCount = notifications.filter(n => !viewedNotifications.includes(n.id)).length;

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleToggle} 
        className="text-emerald-600 hover:bg-emerald-100 rounded-full relative group"
        aria-label="Notificações"
      >
        <Bell className="w-6 h-6 transition-transform group-hover:rotate-12" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping group-hover:animate-none"></span>
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-slate-50">
              <h3 className="text-lg font-semibold text-gray-700">Notificações</h3>
              <Button variant="ghost" size="icon" onClick={handleToggle} className="text-gray-500 hover:bg-gray-200 rounded-full h-8 w-8">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Carregando...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <motion.div initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:0.1}}>
                  <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-3" />
                  <p className="font-medium">Tudo em dia!</p>
                  <p className="text-sm">Nenhuma notificação nova por enquanto.</p>
                </motion.div>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
                {notifications.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${!viewedNotifications.includes(item.id) ? 'bg-emerald-50/50 font-semibold' : 'opacity-80'}`}
                    onClick={() => markAsViewed(item.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 p-1.5 rounded-full text-white ${item.type === 'news' ? 'bg-sky-500' : 'bg-purple-500'}`}>
                        {item.type === 'news' ? <FileText className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${!viewedNotifications.includes(item.id) ? 'text-gray-800' : 'text-gray-700'}`}>{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recente'}
                          {' - '}
                          {item.type === 'news' ? 'Nova notícia' : 'Novo evento'}
                        </p>
                      </div>
                      {!viewedNotifications.includes(item.id) && (
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full mt-1.5 self-center shrink-0 animate-pulse"></div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
             <div className="p-2 bg-slate-50 border-t border-gray-100 text-center">
                <Button variant="link" size="sm" className="text-emerald-600 hover:text-emerald-700 text-xs">
                    Ver todas as atividades
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;