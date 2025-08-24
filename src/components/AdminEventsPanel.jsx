import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Plus, Edit, Trash2, Search, Info, Clock, MapPin, AlignLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from "firebase/firestore";

const AdminEventsPanel = ({ user, isStudentView = false }) => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({ title: '', date: new Date().toISOString().split('T')[0], time: '09:00', location: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const eventsCollectionRef = collection(db, 'events');
  const currentUser = auth.currentUser;

  useEffect(() => {
    setIsLoading(true);
    const q = query(eventsCollectionRef, orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsList);
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao buscar eventos: ", error);
      toast({ title: "Erro ao carregar eventos", description: error.message, variant: "destructive" });
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
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
        toast({ title: "Campos obrigatórios", description: "Título, Data, Horário e Local são obrigatórios.", variant: "destructive"});
        return;
    }
    setIsLoading(true);
    const eventData = { 
        ...formData, 
        updatedAt: serverTimestamp(),
        authorEmail: currentUser ? currentUser.email : 'anonimo',
        authorName: currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : 'Secretaria'
    };

    if (editingEvent) {
      const eventDocRef = doc(db, 'events', editingEvent.id);
      try {
        await updateDoc(eventDocRef, eventData);
        toast({ title: "Evento Atualizado!", description: `"${formData.title}" foi atualizado.` });
      } catch (error) {
         toast({ title: "Erro ao atualizar evento", description: error.message, variant: "destructive" });
      }
    } else {
      try {
        await addDoc(eventsCollectionRef, { ...eventData, createdAt: serverTimestamp() });
        toast({ title: "Evento Adicionado!", description: `"${formData.title}" foi agendado.` });
      } catch (error) {
        toast({ title: "Erro ao adicionar evento", description: error.message, variant: "destructive" });
      }
    }
    setShowForm(false);
    setEditingEvent(null);
    setFormData({ title: '', date: new Date().toISOString().split('T')[0], time: '09:00', location: '', description: '' });
    setIsLoading(false);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({ title: event.title, date: event.date, time: event.time, location: event.location, description: event.description || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    const eventDocRef = doc(db, 'events', id);
    const eventToDelete = events.find(event => event.id === id);
    try {
      await deleteDoc(eventDocRef);
      toast({ title: "Evento Removido!", description: `"${eventToDelete?.title || 'O evento'}" foi removido.`, variant: "destructive" });
    } catch (error) {
      toast({ title: "Erro ao remover evento", description: error.message, variant: "destructive" });
    }
    setIsLoading(false);
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const panelTitle = isStudentView ? "Próximos Eventos" : "Gerenciamento de Eventos";
  const panelSubtitle = isStudentView ? "Fique por dentro das atividades da escola." : "Agende, edite ou remova eventos escolares.";
  const iconColor = isStudentView ? "text-blue-600" : "text-purple-600";
  const buttonColor = isStudentView ? "bg-blue-600 hover:bg-blue-700" : "bg-purple-600 hover:bg-purple-700";
  const ringColor = isStudentView ? "focus:ring-blue-500 focus:border-blue-500" : "focus:ring-purple-500 focus:border-purple-500";

  const formatDate = (dateString) => {
    if (!dateString) return 'Data indisponível';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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
          <CalendarDays className={`w-9 h-9 ${iconColor}`} />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">{panelTitle}</h2>
            <p className="text-gray-500 text-sm">{panelSubtitle}</p>
          </div>
        </div>
        {!isStudentView && (
          <Button
            onClick={() => { setEditingEvent(null); setFormData({ title: '', date: new Date().toISOString().split('T')[0], time: '09:00', location: '', description: '' }); setShowForm(true); }}
            className={`${buttonColor} shadow-lg hover:shadow-xl transition-all transform hover:scale-105 rounded-lg px-5 py-2.5`}
            disabled={isLoading}
          >
            <Plus className="w-5 h-5 mr-2" />
            Agendar Evento
          </Button>
        )}
      </motion.div>

      {!isStudentView && showForm && (
        <motion.form
          initial={{ opacity: 0, y: -15, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -15, height: 0 }}
          transition={{ duration: 0.4, ease: "circOut" }}
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-2xl space-y-5 border border-gray-200"
        >
          <h3 className="text-xl font-semibold text-gray-700 border-b pb-3">{editingEvent ? 'Editar Evento' : 'Novo Evento'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-1">Título do Evento</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} required className={`input-field ${ringColor}`} />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-600 mb-1">Data</label>
              <input type="date" name="date" id="date" value={formData.date} onChange={handleInputChange} required className={`input-field ${ringColor}`} />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-600 mb-1">Horário</label>
              <input type="time" name="time" id="time" value={formData.time} onChange={handleInputChange} required className={`input-field ${ringColor}`} />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-600 mb-1">Local</label>
              <input type="text" name="location" id="location" value={formData.location} onChange={handleInputChange} required className={`input-field ${ringColor}`} />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">Descrição (opcional)</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleInputChange} rows="3" className={`input-field ${ringColor}`}></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={isLoading} className="shadow-sm hover:shadow-md">Cancelar</Button>
            <Button type="submit" className={`${buttonColor} shadow-md hover:shadow-lg`} disabled={isLoading}>{isLoading ? "Salvando..." : (editingEvent ? 'Salvar Alterações' : 'Agendar Evento')}</Button>
          </div>
        </motion.form>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: showForm ? 0.3 : 0.1, duration: 0.5 }}
        className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-200"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-3">
          <h3 className="text-xl font-semibold text-gray-700">{isStudentView ? "Agenda de Eventos" : "Eventos Agendados"}</h3>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar evento..."
              className={`w-full sm:w-72 pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 ${ringColor} focus:border-transparent transition-all shadow-sm`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {isLoading && <p className="text-center text-gray-500 py-10">Carregando eventos...</p>}
        {!isLoading && filteredEvents.length > 0 ? (
          <div className="space-y-5">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden card-hover transform hover:-translate-y-1 border border-gray-100"
              >
                <div className={`p-5 border-l-4 ${isStudentView ? 'border-blue-500' : 'border-purple-500'}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                    <h4 className={`text-lg font-semibold ${iconColor}`}>{event.title}</h4>
                    {!isStudentView && (
                      <div className="flex space-x-1.5 mt-2 sm:mt-0 flex-shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(event)} className={`text-gray-600 hover:text-purple-700 hover:bg-purple-50`} disabled={isLoading} title="Editar">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(event.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50" disabled={isLoading} title="Remover">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 space-y-1.5">
                    <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 opacity-70" /> {formatDate(event.date)}</div>
                    <div className="flex items-center"><Clock className="w-4 h-4 mr-2 opacity-70" /> {event.time}</div>
                    <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 opacity-70" /> {event.location}</div>
                  </div>
                  {event.description && <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100 flex items-start"><AlignLeft className="w-4 h-4 mr-2 mt-0.5 opacity-70 flex-shrink-0" /> {event.description}</p>}
                
                  {isStudentView && (
                      <Button size="sm" variant="link" className={`mt-3 p-0 h-auto text-sm ${iconColor} hover:underline`}>
                          <Info className="w-4 h-4 mr-1" />
                          Mais detalhes
                      </Button>
                  )}
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
            <CalendarDays className="w-20 h-20 text-gray-300 mx-auto mb-5" />
            <h3 className="text-xl font-semibold text-gray-500">Nenhum evento encontrado.</h3>
            <p className="text-gray-400 mt-1.5">
              {searchTerm ? "Tente um termo de busca diferente." : (isStudentView ? "Ainda não há eventos agendados." : "Adicione novos eventos para começar.")}
            </p>
          </motion.div>
        )}
      </motion.div>
      <style jsx>{`
        .input-field {
          @apply mt-1 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-all;
        }
      `}</style>
    </div>
  );
};

export default AdminEventsPanel;