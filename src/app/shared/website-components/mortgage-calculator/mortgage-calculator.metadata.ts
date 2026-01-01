import { ComponentMetadata } from '../component-base.interface';

export const MORTGAGE_CALCULATOR_METADATA: ComponentMetadata = {
  type: 'mortgage-calculator',
  label: 'Mortgage Calculator',
  icon: '🧮',
  category: 'forms',
  description: 'Real estate financing calculator',
  schema: {
    fields: [
      { key: 'title', label: 'Título', type: 'text', defaultValue: 'Calculadora de Financiamento' },
      { key: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Simule as parcelas do seu financiamento imobiliário' },
      { key: 'titleColor', label: 'Cor do Título', type: 'color', defaultValue: '#1a202c' },
      { key: 'subtitleColor', label: 'Cor do Subtítulo', type: 'color', defaultValue: '#718096' },
      { key: 'primaryColor', label: 'Cor Primária (gradiente ou cor)', type: 'text', defaultValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { key: 'labelColor', label: 'Cor dos Labels', type: 'color', defaultValue: '#2d3748' },
      { key: 'inputBorderColor', label: 'Cor da Borda dos Inputs', type: 'color', defaultValue: '#e2e8f0' },
      { key: 'inputBackground', label: 'Fundo dos Inputs', type: 'color', defaultValue: 'white' },
      { key: 'inputColor', label: 'Cor do Texto dos Inputs', type: 'color', defaultValue: '#2d3748' },
      { key: 'contentBackground', label: 'Fundo do Conteúdo', type: 'color', defaultValue: '#ffffff' },
      { key: 'resultBackground', label: 'Fundo dos Resultados', type: 'color', defaultValue: '#f8f9fa' },
      { key: 'resultTextColor', label: 'Cor do Texto dos Resultados', type: 'color', defaultValue: '#2d3748' },
      { key: 'highlightTextColor', label: 'Cor do Texto em Destaque', type: 'color', defaultValue: 'white' },
      { key: 'defaultPropertyValue', label: 'Valor Padrão do Imóvel', type: 'number', defaultValue: 300000 },
      { key: 'defaultDownPayment', label: 'Entrada Padrão', type: 'number', defaultValue: 60000 },
      { key: 'defaultInterestRate', label: 'Taxa de Juros Padrão (%)', type: 'number', defaultValue: 9.5 },
      { key: 'defaultLoanTerm', label: 'Prazo Padrão (anos)', type: 'number', defaultValue: 30 },
      { key: 'currency', label: 'Moeda', type: 'select', options: ['BRL', 'USD', 'EUR'], defaultValue: 'BRL' },
      { 
        key: 'labels', 
        label: 'Labels Personalizados', 
        type: 'object',
        schema: {
          propertyValue: { type: 'text', label: 'Valor do Imóvel' },
          downPayment: { type: 'text', label: 'Entrada' },
          interestRate: { type: 'text', label: 'Taxa de Juros' },
          loanTerm: { type: 'text', label: 'Prazo' },
          monthlyPayment: { type: 'text', label: 'Parcela Mensal' },
          financedAmount: { type: 'text', label: 'Valor Financiado' },
          totalInterest: { type: 'text', label: 'Juros Totais' },
          totalAmount: { type: 'text', label: 'Total a Pagar' }
        }
      }
    ]
  },
  defaultConfig: {
    title: 'Calculadora de Financiamento',
    subtitle: 'Simule as parcelas do seu financiamento imobiliário',
    titleColor: '#1a202c',
    subtitleColor: '#718096',
    primaryColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    labelColor: '#2d3748',
    inputBorderColor: '#e2e8f0',
    inputBackground: 'white',
    inputColor: '#2d3748',
    contentBackground: '#ffffff',
    resultBackground: '#f8f9fa',
    resultTextColor: '#2d3748',
    highlightTextColor: 'white',
    defaultPropertyValue: 300000,
    defaultDownPayment: 60000,
    defaultInterestRate: 9.5,
    defaultLoanTerm: 30,
    currency: 'BRL',
    labels: {
      propertyValue: 'Valor do Imóvel (R$)',
      downPayment: 'Entrada (R$)',
      interestRate: 'Taxa de Juros (% ao ano)',
      loanTerm: 'Prazo (anos)',
      monthlyPayment: 'Parcela Mensal',
      financedAmount: 'Valor Financiado',
      totalInterest: 'Juros Totais',
      totalAmount: 'Total a Pagar'
    }
  },
  defaultStyle: {
    backgroundColor: '#f9fafb',
    padding: '5rem 0'
  }
};
