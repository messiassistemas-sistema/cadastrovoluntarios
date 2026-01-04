
import { GoogleGenAI } from "@google/genai";
import { VolunteerFormData, TrainingRecord } from "../types";

export class VolunteerService {
  /**
   * Process initial registration data and determine status based on business rules.
   */
  static async processRegistration(data: VolunteerFormData): Promise<VolunteerFormData> {
    let status = "Apto para Análise Final";
    let obs = "Liberado para processo de voluntariado";

    if (!data.batizado) {
      status = "Encaminhado para Integração";
      obs = "Necessita contato do Ministério de Integração";
    } else if (!data.aceitaPrincipios) {
      status = "Aguardando Conversa Pastoral";
      obs = "Agendar conversa pastoral";
    } else if (!data.escolaReino) {
      status = "Pendente – Escola do Reino";
      obs = "Precisa regularizar Escola do Reino";
    } else if (!data.disponivelTreinamento) {
      status = "Não apto no momento";
      obs = "Conversar sobre disponibilidade de treinamento";
    }

    return {
      ...data,
      dataCadastro: new Date().toLocaleString('pt-BR'),
      statusCadastro: status,
      observacoesInternas: obs
    };
  }

  /**
   * Simulate synchronization with multiple sheets (Cadastros, Dashboard, Treinamento)
   */
  static async simulateSheetSync(processedData: VolunteerFormData) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      Simule a atualização do Ecossistema Google Sheets "MVP – Cadastro de Voluntários":
      
      1. Aba "Cadastros": Inserir linha para ${processedData.nomeCompleto}.
      2. Aba "Dashboard": Atualizar fórmulas de contagem (Aptos: COUNTIF, Total: COUNTA).
      3. Aba "Treinamento": Criar registro inicial com 5 aulas pendentes.
      
      Gere um log de confirmação da estrutura de colunas e fórmulas conforme o manual da MVP.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      console.log("MVP Sheets Sync Log:", response.text);
      return true;
    } catch (error) {
      console.error("Erro na sincronização MVP Sheets:", error);
      return false;
    }
  }

  // Dados fictícios para demonstração do Painel Admin
  static getMockVolunteers(): VolunteerFormData[] {
    return [
      {
        id: '1',
        nomeCompleto: 'Ana Paula Souza',
        dataCadastro: '10/05/2024 14:20',
        dataNascimento: '1995-03-15',
        estadoCivil: 'Solteiro(a)',
        estaNamorando: false,
        religiaoNamorado: '',
        batizado: true,
        aceitaPrincipios: true,
        escolaReino: true,
        possuiVicios: 'Não',
        disponivelTreinamento: true,
        // Added required property ministerioIdentificacao
        ministerioIdentificacao: 'Voluntariado',
        statusCadastro: 'Apto para Análise Final',
        observacoesInternas: 'Liberado para processo de voluntariado',
        telefone: '5511999999999'
      },
      {
        id: '2',
        nomeCompleto: 'Carlos Eduardo Lima',
        dataCadastro: '11/05/2024 09:15',
        dataNascimento: '1988-07-22',
        estadoCivil: 'Casado(a)',
        estaNamorando: false,
        religiaoNamorado: '',
        batizado: false,
        aceitaPrincipios: true,
        escolaReino: true,
        possuiVicios: 'Não',
        disponivelTreinamento: true,
        // Added required property ministerioIdentificacao
        ministerioIdentificacao: 'AMI',
        statusCadastro: 'Encaminhado para Integração',
        observacoesInternas: 'Necessita contato do Ministério de Integração',
        telefone: '5511888888888'
      },
      {
        id: '3',
        nomeCompleto: 'Marcos Oliveira',
        dataCadastro: '12/05/2024 18:45',
        dataNascimento: '1992-11-30',
        estadoCivil: 'Solteiro(a)',
        estaNamorando: true,
        religiaoNamorado: 'Católica',
        batizado: true,
        aceitaPrincipios: true,
        escolaReino: false,
        // 'Sim – cigarro' is now valid as AddictionType was updated in types.ts
        possuiVicios: 'Sim – cigarro',
        disponivelTreinamento: true,
        // Added required property ministerioIdentificacao
        ministerioIdentificacao: 'Hause Mix, Sonoplastia',
        statusCadastro: 'Pendente – Escola do Reino',
        observacoesInternas: 'Precisa regularizar Escola do Reino',
        telefone: '5511777777777'
      }
    ];
  }

  static getMockTraining(): TrainingRecord[] {
    return [
      {
        volunteerId: '1',
        nomeCompleto: 'Ana Paula Souza',
        dataInicio: '15/05/2024',
        aulas: [true, true, false, false, false],
        status: 'Em Andamento'
      }
    ];
  }

  // Gestão de Ministérios (Mock)
  private static ministries: string[] = [
    'Recepção', 'Kids', 'Mídia', 'Louvor', 'Intercessão',
    'Manutenção', 'Ação Social', 'Teatro/Dança', 'Secretaria'
  ];

  static getMinistries(): string[] {
    return this.ministries;
  }

  static addMinistry(name: string): void {
    if (!this.ministries.includes(name)) {
      this.ministries = [...this.ministries, name].sort();
    }
  }

  static removeMinistry(name: string): void {
    this.ministries = this.ministries.filter(m => m !== name);
  }

  static updateMinistry(oldName: string, newName: string): void {
    this.ministries = this.ministries.map(m => m === oldName ? newName : m).sort();
  }
}