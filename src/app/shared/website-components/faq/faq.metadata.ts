import { ComponentMetadata } from '../component-base.interface';

export const FAQ_METADATA: ComponentMetadata = {
  type: 'faq',
  label: 'FAQ Section',
  icon: '❓',
  category: 'content',
  description: 'Frequently asked questions with accordion',
  schema: {
    fields: [
      { key: 'title', label: 'Título', type: 'text', defaultValue: 'Perguntas Frequentes' },
      { key: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Tire suas dúvidas sobre nossos serviços' },
      { key: 'titleColor', label: 'Cor do Título', type: 'color', defaultValue: '#1a202c' },
      { key: 'subtitleColor', label: 'Cor do Subtítulo', type: 'color', defaultValue: '#718096' },
      { key: 'questionColor', label: 'Cor das Perguntas', type: 'color', defaultValue: '#2d3748' },
      { key: 'answerColor', label: 'Cor das Respostas', type: 'color', defaultValue: '#4a5568' },
      { key: 'accentColor', label: 'Cor de Destaque (Ícone)', type: 'color', defaultValue: '#2c7a7b' },
      { key: 'cardBackground', label: 'Fundo dos Cards', type: 'color', defaultValue: '#ffffff' },
      { key: 'borderColor', label: 'Cor da Borda', type: 'color', defaultValue: '#e2e8f0' },
      { 
        key: 'items', 
        label: 'Perguntas e Respostas', 
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
