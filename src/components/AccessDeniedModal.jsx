import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, UserCheck } from 'lucide-react';

const AccessDeniedModal = ({ isOpen, onClose, onRedirect, adminEmails }) => {
  if (!isOpen) return null;

  const adminEmailsString = adminEmails && adminEmails.length > 0 
    ? adminEmails.join(', ') 
    : "a conta Google autorizada";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-lg z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 18, stiffness: 250 }}
          className="bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-red-400 text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Fechar modal"
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 15, -10, 5, 0] }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 10 }}
              className="mx-auto mb-6 w-20 h-20 bg-white/20 rounded-full flex items-center justify-center shadow-lg"
            >
              <AlertTriangle className="w-12 h-12 text-yellow-300" />
            </motion.div>

            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl font-extrabold mb-3 tracking-tight"
            >
              Acesso Negado!
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg text-white/90 mb-8 leading-relaxed"
            >
              Ops! Parece que você tentou acessar a área da Secretaria com uma conta não autorizada. 
              Esta seção é restrita.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                onClick={onRedirect}
                className="w-full bg-white text-rose-600 hover:bg-white/90 text-lg px-8 py-4 rounded-xl font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300 pulse-glow"
              >
                <UserCheck className="w-6 h-6 mr-3" />
                Ir para Login de Aluno
              </Button>
            </motion.div>
             <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xs text-white/70 mt-6"
            >
              Se você é da secretaria, por favor, use uma das seguintes contas Google autorizadas: <strong>{adminEmailsString}</strong>.
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AccessDeniedModal;