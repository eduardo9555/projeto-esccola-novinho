import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Save, X, User, Mail, Percent, BarChart, Activity, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const InputField = ({ label, id, type = "text", value, onChange, icon, min, max, required = true, step = "1", placeholder }) => (
  <div className="flex flex-col space-y-1.5">
    <label htmlFor={id} className="text-sm font-medium text-gray-700 flex items-center">
      {icon && React.cloneElement(icon, { className: "w-4 h-4 mr-2 text-emerald-600" })}
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm placeholder-gray-400"
      required={required}
      placeholder={placeholder || (type === 'number' ? '0-100' : `Digite ${label.toLowerCase()}`)}
    />
  </div>
);

const StudentForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    provaParana: '',
    saeb: '',
    provasInternas: '',
    provasExternas: '',
    frequencia: '',
    plataformasDigitais: '',
  });
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        provaParana: initialData.stats?.provaParana === 0 ? '' : (initialData.stats?.provaParana?.toString() || ''),
        saeb: initialData.stats?.saeb === 0 ? '' : (initialData.stats?.saeb?.toString() || ''),
        provasInternas: initialData.stats?.provasInternas === 0 ? '' : (initialData.stats?.provasInternas?.toString() || ''),
        provasExternas: initialData.stats?.provasExternas === 0 ? '' : (initialData.stats?.provasExternas?.toString() || ''),
        frequencia: initialData.stats?.frequencia === 0 ? '' : (initialData.stats?.frequencia?.toString() || ''),
        plataformasDigitais: initialData.stats?.plataformasDigitais === 0 ? '' : (initialData.stats?.plataformasDigitais?.toString() || ''),
      });
    } else {
      setFormData({
        name: '',
        email: '',
        provaParana: '',
        saeb: '',
        provasInternas: '',
        provasExternas: '',
        frequencia: '',
        plataformasDigitais: '',
      });
    }
    setEmailError('');
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;
    
    if (type === 'number') {
      if (value === '') {
        processedValue = ''; 
      } else {
        let numValue = parseInt(value);
        if (isNaN(numValue)) {
            processedValue = ''; 
        } else {
            if (numValue < 0) numValue = 0;
            if (numValue > 100) numValue = 100;
            processedValue = numValue.toString(); 
        }
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    if (name === 'email') {
      if (value && !value.endsWith('@escola.pr.gov.br')) {
        setEmailError('O email deve ser institucional (@escola.pr.gov.br).');
      } else {
        setEmailError('');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.email && !formData.email.endsWith('@escola.pr.gov.br')) {
      toast({
        title: "Email Inválido",
        description: "Por favor, insira um email institucional válido (@escola.pr.gov.br).",
        variant: "destructive",
      });
      setEmailError('O email deve ser institucional (@escola.pr.gov.br).');
      return;
    }
    setEmailError('');
    
    const parseNumericField = (fieldValue) => {
        const num = parseInt(fieldValue);
        return isNaN(num) || fieldValue === '' ? 0 : num;
    };

    const submissionData = {
      name: formData.name,
      email: formData.email,
      // Avatar will be auto-generated based on name by AdminPanel or App.jsx
      stats: {
        provaParana: parseNumericField(formData.provaParana),
        saeb: parseNumericField(formData.saeb),
        provasInternas: parseNumericField(formData.provasInternas),
        provasExternas: parseNumericField(formData.provasExternas),
        frequencia: parseNumericField(formData.frequencia),
        plataformasDigitais: parseNumericField(formData.plataformasDigitais),
        provaParanaTrend: initialData?.stats?.provaParanaTrend || 'stable',
        saebTrend: initialData?.stats?.saebTrend || 'stable',
        internasTrend: initialData?.stats?.internasTrend || 'stable',
        externasTrend: initialData?.stats?.externasTrend || 'stable',
        frequenciaTrend: initialData?.stats?.frequenciaTrend || 'stable',
        plataformasDigitaisTrend: initialData?.stats?.plataformasDigitaisTrend || 'stable',
        ranking: initialData?.stats?.ranking || 0, 
      }
    };
    if (initialData?.id) {
        submissionData.id = initialData.id;
    }
    if (initialData?.avatar) { // Preserve existing avatar if editing
        submissionData.avatar = initialData.avatar;
    }


    onSubmit(submissionData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "circOut" }}
      className="bg-white rounded-xl shadow-2xl p-6 md:p-8 mb-8 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
          {initialData ? 'Editar Dados do Aluno' : 'Adicionar Novo Aluno'}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-full"
          aria-label="Fechar formulário"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <InputField label="Nome Completo" id="name" value={formData.name} onChange={handleChange} icon={<User />} placeholder="Nome do Aluno"/>
        <div className="flex flex-col space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-emerald-600" />
                Email Escolar
            </label>
            <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:border-transparent transition-all text-sm placeholder-gray-400 ${emailError ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-emerald-500'}`}
                required
                placeholder="aluno@escola.pr.gov.br"
            />
            {emailError && <p className="text-xs text-red-600 flex items-center mt-1"><AlertCircle className="w-3.5 h-3.5 mr-1"/>{emailError}</p>}
        </div>
                
        <InputField label="Prova Paraná (%)" id="provaParana" type="number" min="0" max="100" value={formData.provaParana} onChange={handleChange} icon={<Percent />} />
        <InputField label="SAEB (%)" id="saeb" type="number" min="0" max="100" value={formData.saeb} onChange={handleChange} icon={<Percent />} />
        <InputField label="Provas Internas (%)" id="provasInternas" type="number" min="0" max="100" value={formData.provasInternas} onChange={handleChange} icon={<Percent />} />
        <InputField label="Provas Externas (%)" id="provasExternas" type="number" min="0" max="100" value={formData.provasExternas} onChange={handleChange} icon={<Percent />} />
        <InputField label="Frequência (%)" id="frequencia" type="number" min="0" max="100" value={formData.frequencia} onChange={handleChange} icon={<BarChart />} />
        <InputField label="Plataformas Digitais (%)" id="plataformasDigitais" type="number" min="0" max="100" value={formData.plataformasDigitais} onChange={handleChange} icon={<Activity />} />
        
        <div className="md:col-span-2 flex justify-end space-x-3 pt-5 mt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="shadow-sm hover:bg-gray-100 px-5 py-2.5" disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all px-5 py-2.5" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? (initialData ? 'Salvando...' : 'Adicionando...') : (initialData ? 'Salvar Alterações' : 'Adicionar Aluno')}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default StudentForm;