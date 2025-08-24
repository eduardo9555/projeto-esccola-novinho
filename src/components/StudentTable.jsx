import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';

const TableHeader = ({ label, sortKey, onSort, sortIcon }) => (
  <th 
    className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
    onClick={() => onSort(sortKey)}
  >
    <div className="flex items-center">
      {label}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {sortIcon}
      </span>
    </div>
  </th>
);

const StudentTable = ({ students, onEdit, onDelete, onSort, getSortIcon, onRowClick, selectedStudentId }) => {
  const calculateAverage = (studentStats) => {
    if (!studentStats) return 0;
    const scores = [
        studentStats.provaParana, 
        studentStats.saeb, 
        studentStats.provasInternas, 
        studentStats.provasExternas,
        studentStats.plataformasDigitais
    ];
    const validScores = scores.filter(score => typeof score === 'number');
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    const average = validScores.length > 0 ? Math.round(sum / validScores.length) : 0;
    return average;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
      <table className="w-full min-w-max">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <TableHeader label="Aluno" sortKey="name" onSort={onSort} sortIcon={getSortIcon('name')} />
            <TableHeader label="Prova Paraná" sortKey="provaParana" onSort={onSort} sortIcon={getSortIcon('provaParana')} />
            <TableHeader label="SAEB" sortKey="saeb" onSort={onSort} sortIcon={getSortIcon('saeb')} />
            <TableHeader label="Internas" sortKey="provasInternas" onSort={onSort} sortIcon={getSortIcon('provasInternas')} />
            <TableHeader label="Externas" sortKey="provasExternas" onSort={onSort} sortIcon={getSortIcon('provasExternas')} />
            <TableHeader label="Frequência" sortKey="frequencia" onSort={onSort} sortIcon={getSortIcon('frequencia')} />
            <TableHeader label="Plataformas" sortKey="plataformasDigitais" onSort={onSort} sortIcon={getSortIcon('plataformasDigitais')} />
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Média</th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {students.map((student, index) => {
            const studentStats = student.stats || {};
            return (
            <motion.tr
              key={student.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className={`transition-colors duration-150 ${selectedStudentId === student.id ? 'bg-emerald-100/70' : 'hover:bg-emerald-50/50'}`}
              
            >
              <td className="px-4 py-3.5 whitespace-nowrap cursor-pointer" onClick={() => onRowClick(student)}>
                <div className="flex items-center space-x-3">
                    <img 
                        src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} 
                        alt={student.name} 
                        className="w-8 h-8 rounded-full object-cover shadow-sm"
                    />
                    <div>
                        <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.email}</div>
                    </div>
                </div>
              </td>
              {[studentStats.provaParana, studentStats.saeb, studentStats.provasInternas, studentStats.provasExternas, studentStats.frequencia, studentStats.plataformasDigitais].map((score, i) => {
                const displayScore = score === null || typeof score === 'undefined' ? 0 : score;
                return (
                <td key={i} className="px-4 py-3.5 whitespace-nowrap cursor-pointer" onClick={() => onRowClick(student)}>
                  <span className={`text-sm font-medium ${displayScore >= 70 ? 'text-emerald-700' : displayScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                    {displayScore}%
                  </span>
                </td>
              )})}
              <td className="px-4 py-3.5 whitespace-nowrap cursor-pointer" onClick={() => onRowClick(student)}>
                <span className="text-sm font-bold text-blue-600">{calculateAverage(studentStats)}%</span>
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                   <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRowClick(student)}
                    className="text-sky-600 hover:bg-sky-100 hover:text-sky-700 transition-all"
                    title="Ver Detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(student)}
                    className="text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-all"
                    title="Editar Aluno"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(student.id)}
                    className="text-red-600 hover:bg-red-100 hover:text-red-700 transition-all"
                    title="Remover Aluno"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </motion.tr>
          )})}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;