import { ComponentMetadata } from '../component-base.interface';

export const FAQ_METADATA: ComponentMetadata = {
  type: 'faq',
  label: 'Perguntas Frequentes',
  icon: '❓',
  category: 'content',
  description: 'Duvidas comuns em formato de acordeao',
  schema: {
    fields: [
      { key: 'title', label: 'Titulo', type: 'text', defaultValue: 'Perguntas Frequentes' },
      { key: 'subtitle', label: 'Subtitulo', type: 'text', defaultValue: 'Tire suas duvidas sobre nossos servicos' },
      { key: 'titleColor', label: 'Cor do titulo', type: 'color', defaultValue: '#1a202c' },
      { key: 'subtitleColor', label: 'Cor do subtitulo', type: 'color', defaultValue: '#718096' },
      { key: 'questionColor', label: 'Cor das perguntas', type: 'color', defaultValue: '#2d3748' },
      { key: 'answerColor', label: 'Cor das respostas', type: 'color', defaultValue: '#4a5568' },
      { key: 'accentColor', label: 'Cor do icone', type: 'color', defaultValue: '#2c7a7b' },
      { key: 'cardBackground', label: 'Fundo das caixas', type: 'color', defaultValue: '#ffffff' },
      { key: 'borderColor', label: 'Cor da borda', type: 'color', defaultValue: '#e2e8f0' },
      { key: 'boxShadow', label: 'Sombra das caixas', type: 'text', defaultValue: '0 2px 8px rgba(0,0,0,0.08)' },
      { key: 'backgroundColor', label: 'Fundo da secao', type: 'text', defaultValue: '#f9fafb' },
      { key: 'padding', label: 'Espacamento da secao', type: 'text', defaultValue: '4rem 0' },
      { 
        key: 'items', 
        label: 'Lista de perguntas', 
        type: 'array', 
        defaultValue: [],
        schema: {
          question: { type: 'text', label: 'Pergunta' },
          answer: { type: 'textarea', label: 'Resposta' }
        }
      }
    ]
  },
  defaultConfig: {
    title: 'Perguntas Frequentes',
    subtitle: 'Tire suas dúvidas sobre nossos serviços',
    titleColor: '#1a202c',
    subtitleColor: '#718096',
    questionColor: '#2d3748',
    answerColor: '#4a5568',
    accentColor: '#2c7a7b',
    cardBackground: '#ffffff',
    borderColor: '#e2e8f0',
    items: [
      {
        question: 'Como funciona o processo de compra?',
        answer: 'O processo de compra envolve várias etapas, desde a escolha do imóvel até a assinatura do contrato. Nossa equipe te acompanha em todo o processo.'
      },
      {
        question: 'Quais documentos são necessários?',
        answer: 'Você precisará de documentos pessoais, comprovante de renda e outros documentos específicos dependendo do tipo de transação.'
      },
      {
        question: 'Oferecem consultoria de financiamento?',
        answer: 'Sim! Temos parceria com os principais bancos e podemos te ajudar a encontrar as melhores condições de financiamento.'
      }
    ]
  },
  defaultStyle: {
    backgroundColor: '#f9fafb',
    padding: '4rem 0'
  }
};
