
export type MaritalStatus = 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)';
export type AddictionType = 'Não' | 'Sim – bebida alcoólica' | 'Sim – cigarro' | 'Sim – outro';

export interface VolunteerFormData {
  id: string;
  dataCadastro: string;
  nomeCompleto: string;
  dataNascimento: string;
  estadoCivil: MaritalStatus;
  estaNamorando: boolean;
  religiaoNamorado: string;
  batizado: boolean;
  aceitaPrincipios: boolean;
  escolaReino: boolean;
  possuiVicios: AddictionType;
  vicioDescricao?: string;
  disponivelTreinamento: boolean;
  ministerioIdentificacao: string;
  statusCadastro?: string;
  observacoesInternas?: string;
  telefone?: string;
}

export interface TrainingRecord {
  volunteerId: string;
  nomeCompleto: string;
  dataInicio: string;
  aulas: boolean[];
  status: 'Em Andamento' | 'Concluído';
}

export type Step = 
  | 'WELCOME' 
  | 'BAPTISM' 
  | 'PERSONAL_DATA' 
  | 'RELATIONSHIP' 
  | 'COMMITMENTS' 
  | 'CONFIDENTIAL' 
  | 'TRAINING' 
  | 'MINISTRY_IDENTIFICATION'
  | 'REVIEW' 
  | 'SUCCESS' 
  | 'INTEGRATION_REDIRECT';

export type AdminTab = 'DASHBOARD' | 'LISTA' | 'TREINAMENTO' | 'CONFIGURACAO';
export type AppView = 'USER_FORM' | 'ADMIN_DASHBOARD';
