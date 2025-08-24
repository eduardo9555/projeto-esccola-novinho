import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, User as UserIcon, Plus, Edit, Trash2, Eye, FileText, Search, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from "firebase/firestore";

const NewsTab = ({ user }) => {
  const [newsItems, setNewsItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', summary: '', image: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const newsCollectionRef = collection(db, 'news');
  const currentUser = auth.currentUser;

  useEffect(() => {
    setIsLoading(true);
    const q = query(newsCollectionRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNewsItems(newsList);
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao buscar notícias: ", error);
      toast({ title: "Erro ao carregar notícias", description: error.message, variant: "destructive" });
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.summary) {
        toast({ title: "Campos obrigatórios", description: "Título e Conteúdo são obrigatórios.", variant: "destructive"});
        return;
    }
    setIsLoading(true);
    const newsData = { 
        ...formData, 
        updatedAt: serverTimestamp(),
        authorEmail: currentUser ? currentUser.email : 'anonimo',
        authorName: currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : 'Secretaria'
    };

    if (editingItem) {
      const newsDocRef = doc(db, 'news', editingItem.id);
      try {
        await updateDoc(newsDocRef, newsData);
        toast({ title: "Notícia Atualizada!", description: `"${formData.title}" foi atualizada.` });
      } catch (error) {
         toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      }
    } else {
      try {
        await addDoc(newsCollectionRef, { ...newsData, createdAt: serverTimestamp() });
        toast({ title: "Notícia Adicionada!", description: `"${formData.title}" foi publicada.` });
      } catch (error) {
        toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
      }
    }
    setShowForm(false);
    setEditingItem(null);
    setFormData({ title: '', summary: '', image: '' });
    setIsLoading(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ title: item.title, summary: item.summary, image: item.image || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    const newsDocRef = doc(db, 'news', id);
    const itemToDelete = newsItems.find(item => item.id === id);
    try {
      await deleteDoc(newsDocRef);
      toast({ title: "Notícia Removida!", description: `"${itemToDelete?.title || 'A notícia'}" foi removida.`, variant: "destructive" });
    } catch (error) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    }
    setIsLoading(false);
  };

  const filteredNews = newsItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const panelTitle = "Notícias da Escola";
  const panelSubtitle = "Fique por dentro de tudo que acontece!";
  const iconColor = "text-sky-600";
  const buttonColor = "bg-sky-600 hover:bg-sky-700";
  const ringColor = "focus:ring-sky-500 focus:border-sky-500";

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'Data indisponível';
    return new Date(timestamp.toDate()).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };


  return (
    <div className="space-y-8 p-4 md:p-6 bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100 rounded-xl shadow-inner min-h-[calc(100vh-10rem)]">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-200"
      >
        <div className="flex items-center space-x-3.5">
          <FileText className={`w-9 h-9 ${iconColor}`} />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">{panelTitle}</h2>
            <p className="text-gray-500 text-sm">{panelSubtitle}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-200"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-3">
          <h3 className="text-xl font-semibold text-gray-700">Notícias Publicadas</h3>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar notícia..."
              className={`w-full sm:w-72 pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 ${ringColor} focus:border-transparent transition-all shadow-sm`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {isLoading && <p className="text-center text-gray-500 py-10">Carregando notícias...</p>}
        {!isLoading && filteredNews.length > 0 ? (
          <div className="space-y-6">
            {filteredNews.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden card-hover transform hover:-translate-y-1 border border-gray-100"
              >
                {item.image && (
                  <div className="w-full hfull h-48 sm:h-56 overflow-hidden">
                    <img-replace
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                    <h4 className={`text-xl font-bold ${iconColor} mb-1 sm:mb-0`}>{item.title}</h4>
                    {user.type === 'admin' && (
                      <div className="flex space-x-2 flex-shrink-0 mt-2 sm:mt-0">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className={`hover:border-sky-500 hover:text-sky-600`} disabled={isLoading}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)} className="text-red-500 hover:border-red-500 hover:bg-red-50" disabled={isLoading}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center">
                      <UserIcon className="w-3.5 h-3.5 mr-1.5" />
                      {item.authorName || 'Secretaria'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{item.summary}</p>
                   <Button variant="link" className={`p-0 h-auto text-sm mt-2 ${iconColor} hover:underline`}>
                    Ler mais <Eye className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FileText className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-500">Nenhuma notícia encontrada.</h3>
            <p className="text-gray-400 mt-2">
              {searchTerm ? "Tente um termo de busca diferente." : "Aguarde novas publicações da escola."}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default NewsTab;