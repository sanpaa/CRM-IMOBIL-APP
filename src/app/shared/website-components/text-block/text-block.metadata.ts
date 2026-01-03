import { ComponentMetadata } from '../component-base.interface';

export const TEXT_BLOCK_METADATA: ComponentMetadata = {
  type: 'text-block',
  label: 'Text Block',
  icon: '📝',
  category: 'content',
  description: 'Rich text content block',
  schema: {
    fields: [
      { key: 'title', label: 'Título', type: 'text', defaultValue: 'Título' },
      { key: 'content', label: 'Conteúdo', type: 'textarea', defaultValue: 'Seu conteúdo aqui...', required: true },
      {
        key: 'alignment',
        label: 'Alinhamento',
        type: 'select',
        defaultValue: 'left',
        options: [
          { label: 'Esquerda', value: 'left' },
          { label: 'Centro', value: 'center' },
          { label: 'Direita', value: 'right' }
        ]
      }
    ],
    styleFields: [
      { key: 'backgroundColor', label: 'Cor de Fundo', type: 'color', defaultValue: '#ffffff' },
      { key: 'textColor', label: 'Cor do Texto', type: 'color', defaultValue: '#333333' },
      { key: 'padding', label: 'Espaçamento', type: 'text', defaultValue: '2rem' }
    ]
  },
  defaultConfig: { title: 'Título', content: 'Seu conteúdo aqui...', alignment: 'left' },
  defaultStyle: { backgroundColor: 'transparent', textColor: '#333333', padding: '2rem' }
};
