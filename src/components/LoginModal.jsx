import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, User, Shield, LogIn, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const LoginModal = ({ isOpen, onClose, onLogin, type, adminEmails, authorizedStudentEmails }) => {
  const [loading, setLoading] = useState(false);

  const handleFirebaseLoginSuccess = async (firebaseUser) => {
    const userEmailLower = firebaseUser.email.toLowerCase();
    const isPotentiallyAdmin = adminEmails.includes(userEmailLower);
    const isAuthorizedStudent = authorizedStudentEmails.includes(userEmailLower);
    let determinedUserType = 'student'; // Default

    if (isPotentiallyAdmin) {
      determinedUserType = 'admin';
    } else if (!isAuthorizedStudent) {
      // If not admin and not in the authorized student list
      toast({
        title: "Acesso Negado!",
        description: "Seu email não está na lista de alunos autorizados. Contate a secretaria.",
        variant: "destructive",
      });
      await auth.signOut().catch(e => console.error("Sign out error after unauthorized student email:", e));
      setLoading(false);
      onLogin({ email: userEmailLower, type: 'unauthorized' }, true); // Special type for App.jsx to handle
      return;
    }
    
    // User trying to log into admin area
    if (type === 'admin' && !isPotentiallyAdmin) {
      toast({
        title: "Acesso Negado!",
        description: "Esta conta Google não tem permissão para acessar a área da secretaria.",
        variant: "destructive",
      });
      await auth.signOut().catch(e => console.error("Sign out error after admin denial:", e));
      setLoading(false);
      onLogin({ email: userEmailLower, type: 'unauthorized' }, true);
      return;
    }

    // Admin trying to log into student area
    if (type === 'student' && isPotentiallyAdmin && !isAuthorizedStudent) { // Admins can also be in student list
       toast({
        title: "Login Incorreto",
        description: "Esta é uma conta de administrador. Por favor, acesse a área da secretaria.",
        variant: "destructive",
      });
      await auth.signOut().catch(e => console.error("Sign out error after student admin attempt:", e));
      setLoading(false);
      onLogin({ email: userEmailLower, type: 'unauthorized' }, true);
      return;
    }
    
    // Non-institutional email for student login (redundant if authorizedStudentEmails is the source of truth)
    if (type === 'student' && !userEmailLower.endsWith('@escola.pr.gov.br') && !isAuthorizedStudent) {
      toast({
        title: "Email Google Inválido",
        description: "Para login de aluno com Google, use seu email institucional (@escola.pr.gov.br).",
        variant: "destructive",
      });
      await auth.signOut().catch(e => console.error("Sign out error after invalid student email:", e));
      setLoading(false);
      onLogin({ email: userEmailLower, type: 'unauthorized' }, true);
      return;
    }
    
    onLogin({ email: firebaseUser.email, type: determinedUserType, uid: firebaseUser.uid }, true); 
  };


  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleFirebaseLoginSuccess(result.user); 
    } catch (error) {
      console.error("Firebase Google login error:", error);
      let errorMessage = "Não foi possível fazer login com Google.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Janela de login com Google fechada.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Múltiplas janelas de login abertas. Tente novamente.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Erro de rede. Verifique sua conexão e tente novamente.";
      }
      toast({
        title: "Erro no Login",
        description: error.message || errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalTitle = type === 'student' 
    ? 'Login do Aluno'
    : 'Acesso da Secretaria';
  const modalSubtitle = type === 'student' 
    ? 'Entre com sua conta Google institucional (@escola.pr.gov.br)'
    : 'Acesso restrito. Utilize sua conta Google autorizada.';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 18, stiffness: 250 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border-2 border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`p-6 text-white relative ${type === 'student' ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-slate-600 to-gray-800'}`}>
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 p-1.5 hover:bg-white/25 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3.5">
              {type === 'student' ? (
                <User className="w-9 h-9" />
              ) : (
                <Shield className="w-9 h-9" />
              )}
              <div>
                <h2 className="text-2xl font-bold">{modalTitle}</h2>
                <p className="text-white/80 text-sm">{modalSubtitle}</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-center text-gray-600 mb-6 text-sm">
              Para sua segurança e conveniência, o login é realizado exclusivamente através da sua conta Google.
            </p>

            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              disabled={loading}
              className={`w-full py-3.5 text-base rounded-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center
                ${type === 'student' ? 'border-green-500 text-green-700 hover:bg-green-50' : 'border-slate-500 text-slate-700 hover:bg-slate-50'}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2.5 animate-spin" /> 
                  Autenticando...
                </>
              ) : (
                <>
                  <img 
                    src="/google-logo.svg"
                    alt="Google"
                    className="w-5 h-5 mr-3"
                  />
                  Entrar com Google
                </>
              )}
            </Button>
            
            {type === 'student' && (
              <p className="mt-4 text-xs text-center text-gray-500">
                Lembre-se de usar seu email <strong className="text-green-600">@escola.pr.gov.br</strong> autorizado.
              </p>
            )}
             {type === 'admin' && (
                <p className="mt-4 text-xs text-center text-gray-500">
                 Use uma das contas Google autorizadas para a secretaria.
                </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginModal;