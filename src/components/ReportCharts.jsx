import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { motion } from 'framer-motion';
import { FileText, Users, BarChartHorizontal } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ReportCharts = ({ students, activities, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-10 p-6 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center print:hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 text-slate-400 mx-auto mb-3"
        >
            <Users/>
        </motion.div>
        <p className="text-slate-500 font-medium">Carregando gráficos e dados detalhados...</p>
        <p className="text-xs text-slate-400 mt-1">Aguarde um momento.</p>
      </div>
    );
  }

  const studentAverageScores = students.map(s => s.averageScore || 0);
  const averageScoreDistribution = {
    '0-20%': studentAverageScores.filter(s => s <= 20).length,
    '21-40%': studentAverageScores.filter(s => s > 20 && s <= 40).length,
    '41-60%': studentAverageScores.filter(s => s > 40 && s <= 60).length,
    '61-80%': studentAverageScores.filter(s => s > 60 && s <= 80).length,
    '81-100%': studentAverageScores.filter(s => s > 80 && s <= 100).length,
  };

  const barChartData = {
    labels: Object.keys(averageScoreDistribution),
    datasets: [
      {
        label: 'Nº de Alunos por Faixa de Média',
        data: Object.values(averageScoreDistribution),
        backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(255, 205, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(54, 162, 235, 0.7)',
        ],
        borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
        ],
        borderWidth: 1,
        borderRadius: 5,
        hoverBackgroundColor: [
            'rgba(255, 99, 132, 0.9)',
            'rgba(255, 159, 64, 0.9)',
            'rgba(255, 205, 86, 0.9)',
            'rgba(75, 192, 192, 0.9)',
            'rgba(54, 162, 235, 0.9)',
        ]
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12, family: 'Inter' }, color: '#4A5568' } },
      title: { display: true, text: 'Distribuição de Médias dos Alunos', font: { size: 16, family: 'Inter', weight: 'bold' }, color: '#2D3748', padding: { bottom: 20 } },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleFont: { family: 'Inter', weight: 'bold' },
        bodyFont: { family: 'Inter' },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} alunos`;
          }
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        title: { display: true, text: 'Número de Alunos', font: { family: 'Inter', weight: 'semibold' }, color: '#4A5568' },
        ticks: { stepSize: 1, font: { family: 'Inter' }, color: '#718096' }
      },
      x: {
        title: { display: true, text: 'Faixa de Média (%)', font: { family: 'Inter', weight: 'semibold' }, color: '#4A5568' },
        ticks: { font: { family: 'Inter' }, color: '#718096' }
      }
    },
  };

  const activityTypes = activities.reduce((acc, activity) => {
    let type = 'Outra';
    if (activity.action?.includes('adicionou o novo aluno')) type = 'Novo Aluno';
    else if (activity.action?.includes('atualizou os dados do aluno')) type = 'Edição de Aluno';
    else if (activity.action?.includes('removeu o aluno')) type = 'Remoção de Aluno';
    else if (activity.action?.includes('adicionou nova notícia')) type = 'Nova Notícia';
    else if (activity.action?.includes('editou a notícia')) type = 'Edição de Notícia';
    else if (activity.action?.includes('removeu a notícia')) type = 'Remoção de Notícia';
    else if (activity.action?.includes('adicionou novo evento')) type = 'Novo Evento';
    else if (activity.action?.includes('editou o evento')) type = 'Edição de Evento';
    else if (activity.action?.includes('removeu o evento')) type = 'Remoção de Evento';
    
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(activityTypes),
    datasets: [
      {
        label: 'Tipos de Atividades Registradas',
        data: Object.values(activityTypes),
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)',
          'rgba(100, 220, 150, 0.8)', 'rgba(200, 100, 100, 0.8)', 'rgba(120, 120, 200, 0.8)', 'rgba(220, 220, 100, 0.8)'
        ],
        borderColor: 'rgba(255, 255, 255, 0.7)',
        borderWidth: 1.5,
        hoverOffset: 8,
        hoverBorderColor: 'rgba(255, 255, 255, 1)',
      },
    ],
  };
  
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { font: { size: 11, family: 'Inter' }, color: '#4A5568', boxWidth: 15, padding: 15 } },
      title: { display: true, text: 'Distribuição de Atividades da Secretaria', font: { size: 16, family: 'Inter', weight: 'bold' }, color: '#2D3748', padding: { bottom: 20 } },
       tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleFont: { family: 'Inter', weight: 'bold' },
        bodyFont: { family: 'Inter' },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (students.length === 0 && activities.length === 0) {
    return (
         <motion.div 
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:0.2, duration: 0.5 }}
            className="mt-10 p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 text-center print:hidden shadow-lg"
        >
            <BarChartHorizontal className="w-16 h-16 text-slate-400 mx-auto mb-4 animate-pulse"/>
            <h4 className="text-xl text-slate-600 font-semibold mb-2">Sem dados para exibir gráficos.</h4>
            <p className="text-sm text-slate-500">
              Os gráficos de desempenho e atividades aparecerão aqui quando houver dados suficientes.
            </p>
        </motion.div>
    );
  }


  return (
    <motion.div 
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        transition={{ delay:0.3, duration:0.6 }}
        className="mt-10 space-y-10"
    >
      {students.length > 0 && (
        <div className="bg-white p-5 md:p-7 rounded-xl shadow-2xl border border-gray-200 print:shadow-none print:border-gray-300">
          <h4 className="text-lg font-semibold text-gray-700 mb-5 print:text-base print:mb-3">Desempenho Geral dos Alunos</h4>
          <div className="h-[350px] md:h-[450px] print:h-[300px]">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      )}

      {activities.length > 0 && (
         <div className="bg-white p-5 md:p-7 rounded-xl shadow-2xl border border-gray-200 print:shadow-none print:border-gray-300">
            <h4 className="text-lg font-semibold text-gray-700 mb-5 print:text-base print:mb-3">Atividades da Secretaria</h4>
            <div className="h-[350px] md:h-[400px] print:h-[280px] mx-auto max-w-md md:max-w-lg lg:max-w-xl">
                 <Pie data={pieChartData} options={pieChartOptions} />
            </div>
        </div>
      )}
    </motion.div>
  );
};

export default ReportCharts;