import React, { useState } from 'react';
import { Step, VolunteerFormData, MaritalStatus, AddictionType } from '../types';
import { VolunteerServiceSupabase as VolunteerService } from '../services/VolunteerServiceSupabase';
import InfoTooltip from './ui/InfoTooltip';
import StepWrapper from './ui/StepWrapper';

import { useConfig } from '../contexts/ConfigContext';

const VolunteerForm: React.FC = () => {
    const { registrationOpen } = useConfig();
    const [step, setStep] = useState<Step>('WELCOME');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<VolunteerFormData>({
        id: Math.random().toString(36).substr(2, 9),
        dataCadastro: '',
        nomeCompleto: '',
        dataNascimento: '',
        estadoCivil: 'Solteiro(a)',
        estaNamorando: false,
        religiaoNamorado: '',
        batizado: false,
        aceitaPrincipios: false,
        escolaReino: false,
        possuiVicios: 'Não',
        disponivelTreinamento: false,
        ministerioIdentificacao: '',
        telefone: ''
    });
    const [loading, setLoading] = useState(false);
    const [ministries, setMinistries] = useState<string[]>([]);

    React.useEffect(() => {
        VolunteerService.getMinistries().then(setMinistries);
    }, []);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (step === 'PERSONAL_DATA') {
            if (!formData.nomeCompleto.trim()) newErrors.nomeCompleto = "Nome completo é obrigatório";
            if (!formData.dataNascimento) newErrors.dataNascimento = "Data de nascimento é obrigatória";
            if (!formData.telefone?.trim()) newErrors.telefone = "Telefone é obrigatório";
        }
        if (step === 'RELATIONSHIP' && formData.estaNamorando) {
            if (!formData.religiaoNamorado.trim()) newErrors.religiaoNamorado = "Por favor, informe a religião";
        }
        if (step === 'MINISTRY_IDENTIFICATION') {
            if (!formData.ministerioIdentificacao) newErrors.ministerioIdentificacao = "Por favor, escolha uma opção";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (!validate()) return;

        switch (step) {
            case 'WELCOME': setStep('BAPTISM'); break;
            case 'PERSONAL_DATA':
                if (formData.estadoCivil === 'Solteiro(a)') setStep('RELATIONSHIP');
                else setStep('COMMITMENTS');
                break;
            case 'RELATIONSHIP': setStep('COMMITMENTS'); break;
            case 'COMMITMENTS': setStep('CONFIDENTIAL'); break;
            case 'CONFIDENTIAL': setStep('TRAINING'); break;
            case 'TRAINING': setStep('MINISTRY_IDENTIFICATION'); break;
            case 'MINISTRY_IDENTIFICATION': setStep('REVIEW'); break;
            case 'REVIEW': handleSubmit(); break;
            default: break;
        }
    };

    const handleBack = () => {
        setErrors({});
        switch (step) {
            case 'BAPTISM': setStep('WELCOME'); break;
            case 'PERSONAL_DATA': setStep('BAPTISM'); break;
            case 'RELATIONSHIP': setStep('PERSONAL_DATA'); break;
            case 'COMMITMENTS':
                if (formData.estadoCivil === 'Solteiro(a)') setStep('RELATIONSHIP');
                else setStep('PERSONAL_DATA');
                break;
            case 'CONFIDENTIAL': setStep('COMMITMENTS'); break;
            case 'TRAINING': setStep('CONFIDENTIAL'); break;
            case 'MINISTRY_IDENTIFICATION': setStep('TRAINING'); break;
            case 'REVIEW': setStep('MINISTRY_IDENTIFICATION'); break;
            default: break;
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const processed = await VolunteerService.processRegistration(formData);
            setFormData(processed);
            await VolunteerService.simulateSheetSync(processed);
            setStep('SUCCESS');
        } catch (error: any) {
            console.error("Erro no envio:", error);
            alert("Erro ao realizar cadastro: " + (error.message || "Erro desconhecido"));
        } finally {
            setLoading(false);
        }
    };

    const updateForm = (updates: Partial<VolunteerFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        const keys = Object.keys(updates);
        if (keys.length > 0) {
            const field = keys[0];
            if (errors[field]) {
                const newErrors = { ...errors };
                delete newErrors[field];
                setErrors(newErrors);
            }
        }
    };

    const inputBaseStyle = "w-full p-4 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-400 dark:hover:border-slate-500";
    const errorInputStyle = "border-red-500 focus:ring-red-500 focus:border-red-500 ring-1 ring-red-500";

    return (
        <>
            {/* CLOSED STATE */}
            {!registrationOpen && (
                <div className="max-w-md mx-auto text-center px-4 pt-20 animate-fadeIn">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-lock text-slate-400 dark:text-slate-500 text-3xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Inscrições Encerradas</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        No momento, nosso período de cadastro para novos voluntários está fechado.
                        Fique atento aos cultos e redes sociais para novas oportunidades!
                    </p>
                </div>
            )}

            {/* OPEN STATE */}
            {registrationOpen && step === 'WELCOME' && (
                <div className="max-w-md mx-auto text-center px-4 pt-10 animate-fadeIn">
                    <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
                        <i className="fas fa-hands-helping text-indigo-600 dark:text-indigo-400 text-4xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Seja bem-vindo(a)</h2>
                    <p className="italic text-slate-600 dark:text-slate-400 mb-8">
                        “Servir é responder ao chamado de Deus com o coração disponível.”
                    </p>
                    <button
                        onClick={handleNext}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all active:scale-95 focus:ring-4 focus:ring-indigo-300 outline-none"
                    >
                        Iniciar Cadastro
                    </button>
                </div>
            )}

            {step === 'BAPTISM' && (
                <StepWrapper title="Etapa 1: Batismo">
                    <p className="mb-6 text-slate-600 dark:text-slate-300">Para servir no ministério, é fundamental ter passado pelas águas do batismo.</p>
                    <div className="space-y-4">
                        <button
                            onClick={() => {
                                updateForm({ batizado: true });
                                setStep('PERSONAL_DATA');
                            }}
                            className="w-full bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-600 dark:hover:border-indigo-400 p-4 rounded-xl flex justify-between items-center transition-colors group text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <span className="font-medium">Sim, sou batizado(a)</span>
                            <i className="fas fa-check-circle text-transparent group-hover:text-indigo-600 transition-colors" aria-hidden="true"></i>
                        </button>
                        <button
                            onClick={() => {
                                updateForm({ batizado: false });
                                setStep('INTEGRATION_REDIRECT');
                            }}
                            className="w-full bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 hover:border-red-500 p-4 rounded-xl flex justify-between items-center transition-colors group text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                        >
                            <span className="font-medium">Não sou batizado(a)</span>
                            <i className="fas fa-info-circle text-slate-400 group-hover:text-red-500 transition-colors" aria-hidden="true"></i>
                        </button>
                    </div>
                </StepWrapper>
            )}

            {step === 'INTEGRATION_REDIRECT' && (
                <div className="max-w-md mx-auto text-center px-4 pt-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700" role="alert">
                        <i className="fas fa-water text-indigo-500 text-5xl mb-6" aria-hidden="true"></i>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Próximo Passo: Batismo</h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-8">
                            Ficamos felizes com seu desejo de servir! Como você ainda não é batizado(a),
                            nosso Ministério de Integração quer te acompanhar nessa jornada de fé primeiro.
                        </p>
                        <a
                            href="https://wa.me/5500000000000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-md mb-4 focus:ring-4 focus:ring-green-300 outline-none"
                        >
                            <i className="fab fa-whatsapp mr-2" aria-hidden="true"></i>
                            <span>Falar com Ministério de Integração</span>
                        </a>
                        <button onClick={() => setStep('WELCOME')} className="text-slate-500 underline text-sm focus:ring-2 focus:ring-slate-300 p-1 outline-none">Voltar ao início</button>
                    </div>
                </div>
            )}

            {step === 'PERSONAL_DATA' && (
                <StepWrapper title="Etapa 2: Dados Pessoais">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="full-name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome Completo *</label>
                            <input id="full-name" type="text" value={formData.nomeCompleto} onChange={(e) => updateForm({ nomeCompleto: e.target.value })} placeholder="Seu nome" className={`${inputBaseStyle} ${errors.nomeCompleto ? errorInputStyle : ''}`} required />
                            {errors.nomeCompleto && <p className="text-red-500 text-xs mt-1 font-medium">{errors.nomeCompleto}</p>}
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone (WhatsApp) *</label>
                            <input id="phone" type="tel" value={formData.telefone} onChange={(e) => updateForm({ telefone: e.target.value })} placeholder="Ex: 5511999999999" className={`${inputBaseStyle} ${errors.telefone ? errorInputStyle : ''}`} />
                            {errors.telefone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.telefone}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="birth-date" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nascimento *</label>
                                <input id="birth-date" type="date" value={formData.dataNascimento} onChange={(e) => updateForm({ dataNascimento: e.target.value })} className={`${inputBaseStyle} ${errors.dataNascimento ? errorInputStyle : ''}`} required />
                                {errors.dataNascimento && <p className="text-red-500 text-xs mt-1 font-medium">{errors.dataNascimento}</p>}
                            </div>
                            <div>
                                <label htmlFor="marital-status" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Estado Civil</label>
                                <select id="marital-status" value={formData.estadoCivil} onChange={(e) => updateForm({ estadoCivil: e.target.value as MaritalStatus })} className={inputBaseStyle}>
                                    <option value="Solteiro(a)">Solteiro(a)</option>
                                    <option value="Casado(a)">Casado(a)</option>
                                    <option value="Divorciado(a)">Divorciado(a)</option>
                                    <option value="Viúvo(a)">Viúvo(a)</option>
                                </select>
                            </div>
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button onClick={handleBack} className="flex-1 bg-white border border-slate-300 py-4 rounded-xl font-medium text-slate-600 focus:ring-2 focus:ring-slate-300 outline-none">Voltar</button>
                            <button onClick={handleNext} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold focus:ring-4 focus:ring-indigo-300 outline-none">Continuar</button>
                        </div>
                    </div>
                </StepWrapper>
            )}

            {step === 'RELATIONSHIP' && (
                <StepWrapper title="Relacionamento">
                    <div className="space-y-4">
                        <p id="relationship-label" className="text-sm text-slate-600 dark:text-slate-300">Você está namorando atualmente?</p>
                        <div className="flex gap-4" role="radiogroup" aria-labelledby="relationship-label">
                            <button
                                role="radio"
                                aria-checked={formData.estaNamorando}
                                onClick={() => updateForm({ estaNamorando: true })}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all focus:ring-2 focus:ring-indigo-500 outline-none ${formData.estaNamorando ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                            >
                                Sim
                            </button>
                            <button
                                role="radio"
                                aria-checked={!formData.estaNamorando}
                                onClick={() => updateForm({ estaNamorando: false })}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all focus:ring-2 focus:ring-indigo-500 outline-none ${!formData.estaNamorando ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                            >
                                Não
                            </button>
                        </div>
                        {formData.estaNamorando && (
                            <div className="mt-4 animate-fadeIn">
                                <label htmlFor="partner-religion" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Religião do(a) namorado(a) *</label>
                                <input id="partner-religion" type="text" value={formData.religiaoNamorado} onChange={(e) => updateForm({ religiaoNamorado: e.target.value })} placeholder="Ex: Cristão, Católico, etc." className={`${inputBaseStyle} ${errors.religiaoNamorado ? errorInputStyle : ''}`} />
                                {errors.religiaoNamorado && <p className="text-red-500 text-xs mt-1 font-medium">{errors.religiaoNamorado}</p>}
                            </div>
                        )}
                        <div className="pt-4 flex gap-3">
                            <button onClick={handleBack} className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 py-4 rounded-xl font-medium text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-slate-300 outline-none hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Voltar</button>
                            <button onClick={handleNext} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold focus:ring-4 focus:ring-indigo-300 outline-none">Continuar</button>
                        </div>
                    </div>
                </StepWrapper>
            )}

            {step === 'COMMITMENTS' && (
                <StepWrapper title="Etapa 3: Compromissos">
                    <div className="space-y-6">
                        <p className="text-slate-600 dark:text-slate-300 text-sm">Para caminhar com a MVP, precisamos que você esteja alinhado com nossos princípios.</p>

                        {/* Princípios Bíblicos */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i className="fas fa-bible"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Princípios Bíblicos</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Você aceita e concorda com os princípios bíblicos e a visão doutrinária da MVP?
                                        <InfoTooltip text="O alinhamento garante unidade de espírito e propósito." />
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateForm({ aceitaPrincipios: true })}
                                    className={`flex-1 py-3 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider ${formData.aceitaPrincipios ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}
                                >
                                    <i className="fas fa-check mr-2"></i> Sim
                                </button>
                                <button
                                    onClick={() => updateForm({ aceitaPrincipios: false })}
                                    className={`flex-1 py-3 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider ${!formData.aceitaPrincipios && formData.aceitaPrincipios !== undefined ? 'bg-slate-800 text-white border-slate-800' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-800'}`}
                                >
                                    Não
                                </button>
                            </div>
                        </div>

                        {/* Escola do Reino */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i className="fas fa-school"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Escola do Reino</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Você está matriculado(a) ou disposto(a) a cursar a Escola do Reino?
                                        <InfoTooltip text="Nossa base de formação de caráter cristão." />
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateForm({ escolaReino: true })}
                                    className={`flex-1 py-3 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider ${formData.escolaReino ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}
                                >
                                    <i className="fas fa-check mr-2"></i> Sim
                                </button>
                                <button
                                    onClick={() => updateForm({ escolaReino: false })}
                                    className={`flex-1 py-3 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider ${!formData.escolaReino && formData.escolaReino !== undefined ? 'bg-slate-800 text-white border-slate-800' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-800'}`}
                                >
                                    Pendente
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button onClick={handleBack} className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 py-4 rounded-xl font-medium text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-slate-300 outline-none hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Voltar</button>
                            <button onClick={handleNext} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold focus:ring-4 focus:ring-indigo-300 outline-none">Continuar</button>
                        </div>
                    </div>
                </StepWrapper>
            )}

            {step === 'CONFIDENTIAL' && (
                <StepWrapper title="Etapa 4: Vida Pessoal">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Possui algum vício atualmente?</label>
                            <div className="grid grid-cols-1 gap-3">
                                {(['Não', 'Sim – bebida alcoólica', 'Sim – cigarro', 'Sim – outro'] as AddictionType[]).map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => updateForm({ possuiVicios: opt })}
                                        className={`text-left p-3 rounded-xl border-2 transition-all text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 ${formData.possuiVicios === opt ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {formData.possuiVicios === 'Sim – outro' && (
                            <div className="animate-fadeIn">
                                <label htmlFor="addiction-desc" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Qual?</label>
                                <input id="addiction-desc" type="text" value={formData.vicioDescricao || ''} onChange={(e) => updateForm({ vicioDescricao: e.target.value })} className={inputBaseStyle} />
                            </div>
                        )}
                        <div className="pt-4 flex gap-3">
                            <button onClick={handleBack} className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 py-4 rounded-xl font-medium text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-slate-300 outline-none hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Voltar</button>
                            <button onClick={handleNext} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold focus:ring-4 focus:ring-indigo-300 outline-none">Continuar</button>
                        </div>
                    </div>
                </StepWrapper>
            )}

            {step === 'TRAINING' && (
                <StepWrapper title="Treinamento">
                    <div className="space-y-4">
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">A excelência no serviço exige preparo. Temos treinamentos específicos para cada área.</p>

                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center mb-6">
                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-chalkboard-teacher text-2xl"></i>
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Disponibilidade para Treinamento</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Você se compromete a participar das reuniões de alinhamento e treinamentos agendados pela liderança do ministério?
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => updateForm({ disponivelTreinamento: true })}
                                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group outline-none focus:ring-2 focus:ring-indigo-500 ${formData.disponivelTreinamento ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${formData.disponivelTreinamento ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500'}`}>
                                        {formData.disponivelTreinamento && <i className="fas fa-check text-xs"></i>}
                                    </div>
                                    <span className="font-bold">Sim, eu aceito participar</span>
                                </div>
                            </button>

                            <button
                                onClick={() => updateForm({ disponivelTreinamento: false })}
                                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group outline-none focus:ring-2 focus:ring-indigo-500 ${!formData.disponivelTreinamento ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${!formData.disponivelTreinamento ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500'}`}>
                                        {!formData.disponivelTreinamento && <i className="fas fa-times text-xs"></i>}
                                    </div>
                                    <span className="font-bold">Não posso no momento</span>
                                </div>
                            </button>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button onClick={handleBack} className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 py-4 rounded-xl font-medium text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-slate-300 outline-none hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Voltar</button>
                            <button onClick={handleNext} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold focus:ring-4 focus:ring-indigo-300 outline-none">Continuar</button>
                        </div>
                    </div>
                </StepWrapper>
            )}

            {step === 'MINISTRY_IDENTIFICATION' && (
                <StepWrapper title="Área de Identificação">
                    <div className="space-y-4">
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">Em qual área você sente que seus dons seriam melhor utilizados?</p>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {ministries.map(min => (
                                <button
                                    key={min}
                                    onClick={() => updateForm({ ministerioIdentificacao: min })}
                                    className={`text-left p-3 rounded-xl border-2 transition-all text-sm font-bold flex justify-between items-center outline-none focus:ring-2 focus:ring-indigo-500 ${formData.ministerioIdentificacao === min ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'border-slate-100 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}
                                >
                                    {min}
                                    {formData.ministerioIdentificacao === min && <i className="fas fa-check text-indigo-600 dark:text-indigo-400"></i>}
                                </button>
                            ))}
                        </div>
                        {errors.ministerioIdentificacao && <p className="text-center text-red-500 text-xs font-bold">{errors.ministerioIdentificacao}</p>}
                        <div className="pt-4 flex gap-3">
                            <button onClick={handleBack} className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 py-4 rounded-xl font-medium text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-slate-300 outline-none hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Voltar</button>
                            <button onClick={handleNext} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold focus:ring-4 focus:ring-indigo-300 outline-none">Continuar</button>
                        </div>
                    </div>
                </StepWrapper>
            )}

            {step === 'REVIEW' && (
                <div className="max-w-md mx-auto px-4 pb-20 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">Revisão</h2>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6 transition-colors">
                        <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-700">
                            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-user-check text-indigo-500 dark:text-indigo-400 text-3xl"></i>
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-lg">{formData.nomeCompleto}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">{formData.telefone}</p>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                                <span className="text-slate-500 dark:text-slate-400">Batizado?</span>
                                <span className={`font-bold ${formData.batizado ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{formData.batizado ? 'Sim' : 'Não'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                                <span className="text-slate-500 dark:text-slate-400">Escola do Reino?</span>
                                <span className={`font-bold ${formData.escolaReino ? 'text-green-600 dark:text-green-400' : 'text-amber-500 dark:text-amber-400'}`}>{formData.escolaReino ? 'Sim/Disposto' : 'Pendente'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                                <span className="text-slate-500 dark:text-slate-400">Área de Interesse</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{formData.ministerioIdentificacao}</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                                <span className="text-slate-500 dark:text-slate-400">Possui Vícios?</span>
                                <div className="text-right">
                                    <span className={`font-bold ${formData.possuiVicios === 'Não' ? 'text-green-600 dark:text-green-400' : 'text-amber-500 dark:text-amber-400'}`}>
                                        {formData.possuiVicios}
                                    </span>
                                    {formData.vicioDescricao && (
                                        <p className="text-xs text-slate-500 mt-1">{formData.vicioDescricao}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button onClick={handleBack} className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 py-4 rounded-xl font-medium text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-slate-300 outline-none hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Editar</button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2 focus:ring-4 focus:ring-green-300 outline-none"
                            >
                                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-paper-plane"></i> Enviar</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 'SUCCESS' && (
                <div className="max-w-md mx-auto text-center px-4 pt-10 animate-fadeIn">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-check text-green-600 dark:text-green-400 text-4xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Cadastro Realizado!</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-8">
                        Glória a Deus pela sua vida! Seus dados foram enviados para nossa liderança.
                        Em breve entraremos em contato.
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl mb-8 text-left border border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 text-sm uppercase tracking-wider">Próximos Passos:</h4>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li className="flex items-start gap-3">
                                <i className="fas fa-search text-indigo-500 dark:text-indigo-400 mt-1"></i>
                                <span>Análise do perfil pela liderança</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <i className="fab fa-whatsapp text-green-500 dark:text-green-400 mt-1"></i>
                                <span>Contato para agendar entrevista</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <i className="fas fa-chalkboard text-amber-500 dark:text-amber-400 mt-1"></i>
                                <span>Início do treinamento específico</span>
                            </li>
                        </ul>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline focus:outline-none"
                    >
                        Voltar ao Início
                    </button>
                </div>
            )}
        </>
    );
};

export default VolunteerForm;
