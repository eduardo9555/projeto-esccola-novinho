import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, Plus, Edit, Trash2, Search, ChevronDown, ChevronUp, BarChartHorizontal, TrendingUp, TrendingDown, Minus, Activity, PieChart, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import StudentForm from '@/components/StudentForm';
import StudentTable from '@/components/StudentTable';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp, addDoc } from "firebase/firestore";

const ScoreCard = ({ label, value, icon, color, trend }) => {
  let TrendIcon;
  let trendColor = "text-gray-500";
  const displayValue = value === null || typeof value === 'undefined' ? 0 : value;


  if (trend === 'up') {
    TrendIcon = TrendingUp;
    trendColor = "text-green-500";
  } else if (trend === 'down') {
    TrendIcon = TrendingDown;
    trendColor = "text-red-500";
  } else {
    TrendIcon = Minus;
  }

  return (
    <motion.div 
      className={`bg-white p-4 rounded-xl shadow-lg border-l-4 ${color} card-hover`}
      whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2 text-gray-600">
          {React.cloneElement(icon, { className: "w-5 h-5" })}
          <span className="text-sm font-medium">{label}</span>
        </div>
        {TrendIcon && <TrendIcon className={`w-5 h-5 ${trendColor}`} />}
      </div>
      <p className="text-3xl font-bold text-gray-800">{displayValue}%</p>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
        <motion.div 
          className={`h-1.5 rounded-full ${color.replace('border-l-4', '').replace('border-', 'bg-')}`}
          initial={{ width: 0 }}
          animate={{ width: `${displayValue}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};


const AdminPanel = () => {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [selectedStudentForScores, setSelectedStudentForScores] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setFirestoreError(null);
    const usersCollectionRef = collection(db, 'users');
    // This query requires a composite index on 'type' (asc) and 'name' (asc)
    const q = query(usersCollectionRef, where("type", "==", "student"), orderBy("name"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const studentsList = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setStudents(studentsList);
      if (studentsList.length > 0 && (!selectedStudentForScores || !studentsList.find(s => s.id === selectedStudentForScores?.id))) {
        setSelectedStudentForScores(studentsList[0]);
      } else if (studentsList.length === 0) {
        setSelectedStudentForScores(null);
      }
      setIsLoading(false);
      setFirestoreError(null); // Clear error on successful fetch
    }, (error) => {
      console.error("Erro ao buscar alunos: ", error);
      setFirestoreError("Erro ao carregar alunos. Verifique se o índice do Firestore foi criado corretamente (type ASC, name ASC). Detalhes no console.");
      toast({ title: "Erro ao carregar alunos", description: "Verifique o console para mais detalhes e se o índice do Firestore está configurado.", variant: "destructive" });
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []); 
  

  const handleFormSubmit = async (formDataFromForm) => {
    setIsLoading(true);
    const studentEmailDomain = "@escola.pr.gov.br";
    if (!formDataFromForm.email.toLowerCase().endsWith(studentEmailDomain)) {
        toast({
            title: "Email Inválido",
            description: `O email do aluno deve ser do domínio ${studentEmailDomain}.`,
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }

    const dataToSubmit = {
      name: formDataFromForm.name,
      email: formDataFromForm.email,
      type: 'student', 
      avatar: formDataFromForm.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${formDataFromForm.name}`,
      stats: {
        provaParana: formDataFromForm.stats.provaParana || 0,
        saeb: formDataFromForm.stats.saeb || 0,
        provasInternas: formDataFromForm.stats.provasInternas || 0,
        provasExternas: formDataFromForm.stats.provasExternas || 0,
        frequencia: formDataFromForm.stats.frequencia || 0,
        plataformasDigitais: formDataFromForm.stats.plataformasDigitais || 0,
        provaParanaTrend: editingStudent?.stats?.provaParanaTrend || 'stable',
        saebTrend: editingStudent?.stats?.saebTrend || 'stable',
        internasTrend: editingStudent?.stats?.internasTrend || 'stable',
        externasTrend: editingStudent?.stats?.externasTrend || 'stable',
        frequenciaTrend: editingStudent?.stats?.frequenciaTrend || 'stable',
        plataformasDigitaisTrend: editingStudent?.stats?.plataformasDigitaisTrend || 'stable',
        ranking: editingStudent?.stats?.ranking || 0, // Ranking is calculated in App.jsx
      },
      updatedAt: serverTimestamp()
    };

    try {
      let activityAction = "";
      if (editingStudent) {
        const studentDocRef = doc(db, 'users', editingStudent.id);
        await updateDoc(studentDocRef, dataToSubmit);
        activityAction = `atualizou os dados do aluno ${dataToSubmit.name}`;
        toast({
          title: "Dados atualizados!",
          description: `Os dados de ${dataToSubmit.name} foram atualizados.`,
        });
        if (selectedStudentForScores && selectedStudentForScores.id === editingStudent.id) {
          setSelectedStudentForScores(prev => ({ ...prev, ...dataToSubmit, stats: { ...prev.stats, ...dataToSubmit.stats } }));
        }
      } else {
        const docRef = await addDoc(collection(db, 'users'), { ...dataToSubmit, createdAt: serverTimestamp() });
        activityAction = `adicionou o novo aluno ${dataToSubmit.name}`;
         toast({
          title: "Aluno Adicionado!",
          description: `${dataToSubmit.name} foi adicionado(a) com sucesso.`,
        });
      }

      // Record activity
      if (auth.currentUser && activityAction) {
        const adminUserNames = {
          'izafantin26@gmail.com': 'Diretora Iza',
          'juniedu9@gmail.com': 'Admin Juni',
          'josepsouza@escola.pr.gov.br': 'Pedagogo José',
        };
        const currentAdminName = adminUserNames[auth.currentUser.email.toLowerCase()] || auth.currentUser.displayName || auth.currentUser.email.split('@')[0];
        await addDoc(collection(db, 'activities'), {
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email,
          userName: currentAdminName,
          action: activityAction,
          timestamp: serverTimestamp()
        });
      }

    } catch (error) {
      console.error("Erro ao salvar aluno:", error);
      toast({ title: "Erro ao salvar aluno", description: error.message, variant: "destructive" });
    }
    resetForm();
    setIsLoading(false);
  };

  const resetForm = () => {
    setEditingStudent(null);
    setShowForm(false);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowForm(true);
    setSelectedStudentForScores(student);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    const studentDocRef = doc(db, 'users', id);
    const studentToDelete = students.find(s => s.id === id);
    try {
      await deleteDoc(studentDocRef);
      toast({
        title: "Aluno removido!",
        description: `${studentToDelete?.name || 'O aluno'} foi removido.`,
        variant: "destructive"
      });
      if (selectedStudentForScores && selectedStudentForScores.id === id) {
        setSelectedStudentForScores(students.length > 1 ? students.filter(s => s.id !== id)[0] : null);
      }
       // Record activity
      if (auth.currentUser && studentToDelete) {
        const adminUserNames = {
          'izafantin26@gmail.com': 'Diretora Iza',
          'juniedu9@gmail.com': 'Admin Juni',
          'josepsouza@escola.pr.gov.br': 'Pedagogo José',
        };
        const currentAdminName = adminUserNames[auth.currentUser.email.toLowerCase()] || auth.currentUser.displayName || auth.currentUser.email.split('@')[0];
        await addDoc(collection(db, 'activities'), {
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email,
          userName: currentAdminName,
          action: `removeu o aluno ${studentToDelete.name}`,
          timestamp: serverTimestamp()
        });
      }
    } catch (error) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    }
    setIsLoading(false);
  };
  
  const handleRowClick = (student) => {
    setSelectedStudentForScores(student);
    setShowForm(false); 
    setEditingStudent(null);
  };


  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let valA = a.stats?.[sortConfig.key] ?? a[sortConfig.key];
    let valB = b.stats?.[sortConfig.key] ?? b[sortConfig.key];

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    
    if (valA < valB) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (valA > valB) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ChevronUp className="w-4 h-4 ml-1 opacity-70" /> : <ChevronDown className="w-4 h-4 ml-1 opacity-70" />;
  };


  return (
    <div className="space-y-8 p-4 md:p-6 bg-gradient-to-br from-slate-100 via-gray-100 to-stone-100 rounded-xl shadow-inner min-h-[calc(100vh-10rem)]">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-200"
      >
        <div className="flex items-center space-x-3.5">
          <Users className="w-10 h-10 text-emerald-600" />
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">Gerenciar Alunos</h2>
            <p className="text-gray-500 text-sm">Adicione, edite ou remova dados dos alunos do 9º ano.</p>
          </div>
        </div>
        
        <Button
          onClick={() => { setEditingStudent(null); setSelectedStudentForScores(null); setShowForm(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-lg px-6 py-3"
          disabled={isLoading}
        >
          <Plus className="w-5 h-5 mr-2" />
          Adicionar Aluno
        </Button>
      </motion.div>

      {showForm && (
        <StudentForm
          initialData={editingStudent}
          onSubmit={handleFormSubmit}
          onCancel={resetForm}
          isLoading={isLoading}
        />
      )}

      {firestoreError && !showForm && (
         <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md flex items-center my-4"
            role="alert"
        >
            <AlertTriangle className="h-5 w-5 mr-3" />
            <p>{firestoreError}</p>
        </motion.div>
      )}

      {selectedStudentForScores && !showForm && !firestoreError && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-emerald-700">{selectedStudentForScores.name}</h3>
              <p className="text-sm text-gray-500">{selectedStudentForScores.email}</p>
            </div>
            <Button onClick={() => handleEdit(selectedStudentForScores)} variant="outline" className="mt-3 sm:mt-0 border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md" disabled={isLoading}>
              <Edit className="w-4 h-4 mr-2" /> Editar Notas
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ScoreCard label="Prova Paraná" value={selectedStudentForScores.stats?.provaParana} icon={<BarChartHorizontal />} color="border-blue-500" trend={selectedStudentForScores.stats?.provaParanaTrend} />
            <ScoreCard label="SAEB" value={selectedStudentForScores.stats?.saeb} icon={<BarChartHorizontal />} color="border-green-500" trend={selectedStudentForScores.stats?.saebTrend} />
            <ScoreCard label="Provas Internas" value={selectedStudentForScores.stats?.provasInternas} icon={<BarChartHorizontal />} color="border-yellow-500" trend={selectedStudentForScores.stats?.internasTrend} />
            <ScoreCard label="Provas Externas" value={selectedStudentForScores.stats?.provasExternas} icon={<BarChartHorizontal />} color="border-purple-500" trend={selectedStudentForScores.stats?.externasTrend} />
            <ScoreCard label="Frequência" value={selectedStudentForScores.stats?.frequencia} icon={<Users />} color="border-pink-500" trend={selectedStudentForScores.stats?.frequenciaTrend} />
            <ScoreCard label="Plataformas Digitais" value={selectedStudentForScores.stats?.plataformasDigitais} icon={<PieChart />} color="border-orange-500" trend={selectedStudentForScores.stats?.plataformasDigitaisTrend} />
          </div>
        </motion.div>
      )}


      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: showForm ? 0.3 : 0.1, duration: 0.5 }}
        className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-200"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-3">
          <h3 className="text-2xl font-semibold text-gray-700">Lista de Alunos</h3>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar aluno..."
              className="w-full sm:w-72 pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading && <p className="text-center text-gray-500 py-10">Carregando dados dos alunos...</p>}
        {!isLoading && !firestoreError && sortedStudents.length > 0 && (
          <StudentTable 
            students={sortedStudents} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            onSort={requestSort}
            getSortIcon={getSortIcon}
            onRowClick={handleRowClick}
            selectedStudentId={selectedStudentForScores?.id}
            isLoading={isLoading}
          />
        )}
        {!isLoading && (firestoreError || sortedStudents.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Users className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-500">
              {firestoreError ? "Erro ao Carregar Alunos" : "Nenhum aluno encontrado."}
            </h3>
            <p className="text-gray-400 mt-2">
              {firestoreError ? "Verifique o console para detalhes e a configuração do índice." : 
               (searchTerm ? "Tente um termo de busca diferente." : "Os alunos aparecerão aqui após o primeiro login ou cadastro.")
              }
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminPanel;