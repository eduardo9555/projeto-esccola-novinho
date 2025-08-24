import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import HomePage from '@/components/HomePage';
import Dashboard from '@/components/Dashboard';
import LoginModal from '@/components/LoginModal';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, onSnapshot, collection, query, where, orderBy, limit } from "firebase/firestore";
import AccessDeniedModal from '@/components/AccessDeniedModal';
import StudentReportPage from '@/components/StudentReportPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginType, setLoginType] = useState('student');
  const [isLoading, setIsLoading] = useState(true);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [showReportPage, setShowReportPage] = useState(false);
  const [studentForReport, setStudentForReport] = useState(null);

  const adminEmails = [
    'izafantin26@gmail.com',
    'juniedu9@gmail.com',
    'josepsouza@escola.pr.gov.br'
  ];

  const authorizedStudentEmails = [
    'salles.alexandre@escola.pr.gov.br',
    'ana.miorini@escola.pr.gov.br',
    'ana.mirandola@escola.pr.gov.br',
    'batista.silva.giovanna@escola.pr.gov.br',
    'hemily.silva.costa@escola.pr.gov.br',
    'hiuriqui.santos@escola.pr.gov.br',
    'costa.silva.isabella@escola.pr.gov.br',
    'jordana.alves@escola.pr.gov.br',
    'santos.silva.jose2712@escola.pr.gov.br',
    'ketlyn.coelho.nascimento@escola.pr.gov.br',
    'lucas.pigentini.ventura@escola.pr.gov.br',
    'marcos.guilherme.soares@escola.pr.gov.br',
    'murilo.bispo.rosa@escola.pr.gov.br',
    'nicole.cassiolato@escola.pr.gov.br',
    'silva.souza.pedro1707@escola.pr.gov.br',
    'rauane.costa.silva@escola.pr.gov.br',
    'stefani.alcides.souza@escola.pr.gov.br',
    'vanessa.azarias@escola.pr.gov.br',
    'silva.eloisa28@escola.pr.gov.br',
    'heloa.requena@escola.pr.gov.br',
    'oliveira.teixeira.erick@escola.pr.gov.br',
    'silva.kemyli@escola.pr.gov.br',
    'turkiewicz.eduardo@escola.pr.gov.br',
    'fantin.izabel@escola.pr.gov.br', 
    'josepsouza@escola.pr.gov.br',
    'elainebfrod@gmail.com'
  ].map(email => email.toLowerCase());


  useEffect(() => {
    setIsLoading(true);
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        const userEmailLower = authUser.email.toLowerCase();
        const isPotentiallyAdmin = adminEmails.includes(userEmailLower);
        const isAuthorizedStudent = authorizedStudentEmails.includes(userEmailLower);

        if (!isPotentiallyAdmin && !isAuthorizedStudent) {
          setAccessDeniedMessage("Seu email não está autorizado para acessar este portal. Entre em contato com a secretaria.");
          setShowAccessDenied(true);
          firebaseSignOut(auth).catch(e => console.error("Error signing out on initial auth check:", e));
          setIsLoading(false);
          return;
        }

        const userDocRef = doc(db, 'users', authUser.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = { uid: authUser.uid, ...docSnap.data() };
             if (userData.type === 'student' && !isAuthorizedStudent && !adminEmails.includes(userEmailLower)) {
              setAccessDeniedMessage("Acesso de aluno não autorizado para este email. Contate a secretaria.");
              setShowAccessDenied(true);
              firebaseSignOut(auth).catch(e => console.error("Error signing out existing student not authorized:", e));
              setIsLoading(false);
              return;
            }
            setCurrentUser(userData);
            localStorage.setItem(`firebaseUser_${authUser.uid}`, JSON.stringify(userData));
            setIsLoading(false);
          } else {
            const newUserType = isPotentiallyAdmin ? 'admin' : 'student';

            if (newUserType === 'student' && !isAuthorizedStudent) {
              setAccessDeniedMessage("Este email não está na lista de alunos autorizados. Contate a secretaria.");
              setShowAccessDenied(true);
              firebaseSignOut(auth).catch(e => console.error("Error signing out new student not authorized:", e));
              setIsLoading(false);
              return;
            }
            
            const initialUserData = {
              email: authUser.email,
              name: authUser.displayName || authUser.email.split('@')[0],
              avatar: authUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${authUser.displayName || authUser.email.split('@')[0]}`,
              type: newUserType,
              stats: {
                ranking: 0, 
                provaParana: Math.floor(Math.random() * 40) + 60,
                provaParanaTrend: 'stable',
                saeb: Math.floor(Math.random() * 40) + 60,
                saebTrend: 'stable',
                provasInternas: Math.floor(Math.random() * 30) + 70,
                internasTrend: 'stable',
                provasExternas: Math.floor(Math.random() * 35) + 65,
                externasTrend: 'stable',
                frequencia: Math.floor(Math.random() * 15) + 85,
                frequenciaTrend: 'stable',
                plataformasDigitais: Math.floor(Math.random() * 30) + 70,
                plataformasDigitaisTrend: 'stable',
              },
              createdAt: serverTimestamp()
            };
            setDoc(userDocRef, initialUserData)
              .then(() => {
                setCurrentUser({ uid: authUser.uid, ...initialUserData });
                localStorage.setItem(`firebaseUser_${authUser.uid}`, JSON.stringify({ uid: authUser.uid, ...initialUserData }));
              })
              .catch(e => console.error("Error creating user doc: ", e))
              .finally(() => setIsLoading(false));
          }
        }, (error) => {
          console.error("Error listening to user document: ", error);
          setIsLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        setCurrentUser(null);
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('firebaseUser_')) {
            localStorage.removeItem(key);
          }
        });
        setIsLoading(false);
      }
    });

    const studentsCollectionRef = collection(db, 'users');
    const qStudents = query(studentsCollectionRef, where("type", "==", "student"));
    const unsubscribeStudents = onSnapshot(qStudents, (querySnapshot) => {
      const studentsList = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      
      const rankedStudents = studentsList
        .map(student => {
          const stats = student.stats || {};
          const scores = [
            stats.provaParana || 0,
            stats.saeb || 0,
            stats.provasInternas || 0,
            stats.provasExternas || 0,
            stats.plataformasDigitais || 0,
          ];
          const averageScore = scores.reduce((sum, score) => sum + (Number(score) || 0), 0) / (scores.filter(s => typeof s === 'number' && !isNaN(s)).length || 1);
          return {
            ...student,
            averageScore: Math.round(averageScore),
          };
        })
        .sort((a, b) => {
            if (b.averageScore !== a.averageScore) {
                return b.averageScore - a.averageScore;
            }
            return a.name.localeCompare(b.name);
        })
        .map((student, index) => ({ ...student, stats: { ...student.stats, ranking: index + 1 } }));
      
      setAllStudents(rankedStudents);

      // Update currentUser's ranking if they are in the list
      if (auth.currentUser && auth.currentUser.uid) {
        const currentUserInRankedList = rankedStudents.find(s => s.id === auth.currentUser.uid);
        if (currentUserInRankedList) {
          setCurrentUser(prevUser => {
            if (prevUser && prevUser.uid === auth.currentUser.uid) {
              const updatedUser = {
                ...prevUser,
                stats: {
                  ...prevUser.stats,
                  ranking: currentUserInRankedList.stats.ranking
                }
              };
              localStorage.setItem(`firebaseUser_${auth.currentUser.uid}`, JSON.stringify(updatedUser));
              return updatedUser;
            }
            return prevUser;
          });
        }
      }
    }, (error) => {
      console.error("Error fetching students for App.jsx:", error);
    });

    const newsCollectionRef = collection(db, 'news');
    const qNews = query(newsCollectionRef, orderBy("createdAt", "desc"), limit(5));
    const unsubscribeNews = onSnapshot(qNews, (querySnapshot) => {
      const newsList = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setAllNews(newsList);
    }, (error) => console.error("Error fetching news for App.jsx:", error));
    
    const eventsCollectionRef = collection(db, 'events');
    const qEvents = query(eventsCollectionRef, orderBy("date", "desc"), limit(5));
    const unsubscribeEvents = onSnapshot(qEvents, (querySnapshot) => {
      const eventsList = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setAllEvents(eventsList);
    }, (error) => console.error("Error fetching events for App.jsx:", error));

    const timer = setTimeout(() => {
      if (isLoading && !currentUser) setIsLoading(false);
    }, 3500);

    return () => {
      unsubscribeAuth();
      unsubscribeStudents();
      unsubscribeNews();
      unsubscribeEvents();
      clearTimeout(timer);
    };
  }, []); // Removed currentUser?.uid dependency to allow initial fetch

  const handleLogin = (userDataFromModal, isFirebaseLogin = false) => {
    const userEmailLower = userDataFromModal.email.toLowerCase();

    if (userDataFromModal.type === 'unauthorized') { 
        setAccessDeniedMessage("Seu email não está autorizado para acessar esta área. Contate a secretaria.");
        setShowAccessDenied(true);
        return;
    }

    if (userDataFromModal.type === 'admin' && !adminEmails.includes(userEmailLower) && isFirebaseLogin) {
      setAccessDeniedMessage("Esta conta Google não tem permissão para acessar a área da secretaria.");
      setShowAccessDenied(true);
      firebaseSignOut(auth).catch(error => console.error("Error signing out after access denied:", error));
      return;
    }

    if (userDataFromModal.type === 'student' && !authorizedStudentEmails.includes(userEmailLower) && isFirebaseLogin) {
        setAccessDeniedMessage("Seu email não está autorizado para login como aluno. Contate a secretaria.");
        setShowAccessDenied(true);
        firebaseSignOut(auth).catch(error => console.error("Error signing out student access denied:", error));
        return;
    }
    
    setShowLogin(false);
  };

  const handleLogout = async () => {
    try {
      const userToClearUID = auth.currentUser?.uid;
      await firebaseSignOut(auth);
      if (userToClearUID) {
        localStorage.removeItem(`firebaseUser_${userToClearUID}`);
        localStorage.removeItem(`viewedNotifications_${userToClearUID}`);
      }
      setCurrentUser(null); 
    } catch (error) {
      console.error("Error signing out: ", error);
      setCurrentUser(null);
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('firebaseUser_') || key.startsWith('viewedNotifications_')) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  const openLogin = (type) => {
    setLoginType(type);
    setShowLogin(true);
  };

  const handleOpenReport = (student) => {
    setStudentForReport(student);
    setShowReportPage(true);
  };

  const handleCloseReport = () => {
    setShowReportPage(false);
    setStudentForReport(null);
  };

  if (showReportPage && studentForReport) {
    return <StudentReportPage student={studentForReport} onClose={handleCloseReport} />;
  }

  if (isLoading) { 
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="relative w-28 h-28"
        >
          <motion.img 
            src="https://storage.googleapis.com/hostinger-horizons-assets-prod/5106ab5f-59ac-4270-81fc-d7e48fdc8ddd/d3e82f464b6bd1fa35d02a534ff070fd.png" 
            alt="Carregando..." 
            className="w-full h-full drop-shadow-2xl"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, repeat: Infinity, repeatType: 'mirror' }}
          />
          <div className="absolute inset-0 border-4 border-emerald-300 rounded-full animate-ping opacity-50"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence mode="wait">
        {currentUser ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          >
            <Dashboard 
              user={currentUser} 
              onLogout={handleLogout} 
              allStudents={allStudents}
              allNews={allNews}
              allEvents={allEvents}
              onOpenReport={handleOpenReport} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="homepage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HomePage onLogin={openLogin} latestNews={allNews.slice(0,3)} latestEvents={allEvents.slice(0,3)} />
          </motion.div>
        )}
      </AnimatePresence>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLogin}
        type={loginType}
        adminEmails={adminEmails}
        authorizedStudentEmails={authorizedStudentEmails}
      />
      <AccessDeniedModal
        isOpen={showAccessDenied}
        onClose={() => setShowAccessDenied(false)}
        onRedirect={() => {
          setShowAccessDenied(false);
        }}
        message={accessDeniedMessage}
      />
      <Toaster />
    </div>
  );
}

export default App;