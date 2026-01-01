import { ComponentMetadata } from '../component-base.interface';

export const NEWSLETTER_METADATA: ComponentMetadata = {
  type: 'newsletter',
  label: 'Newsletter',
  icon: '📧',
  category: 'forms',
  description: 'Newsletter subscription form',
  schema: {
    fields: [
      { key: 'title', label: 'Título', type: 'text', defaultValue: 'Fique por dentro das novidades' },
      { key: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Receba lançamentos e oportunidades exclusivas no seu email' },
      { key: 'inputPlaceholder', label: 'Placeholder do Input', type: 'text', defaultValue: 'Seu melhor email' },
      { key: 'buttonText', label: 'Texto do Botão', type: 'text', defaultValue: 'Assinar Newsletter' },
      { key: 'titleColor', label: 'Cor do Título', type: 'color', defaultValue: 'white' },
      { key: 'subtitleColor', label: 'Cor do Subtítulo', type: 'color', defaultValue: 'white' },
      { key: 'buttonBackground', label: 'Fundo do Botão', type: 'color', defaultValue: 'white' },
      { key: 'buttonColor', label: 'Cor do Texto do Botão', type: 'color', defaultValue: '#667eea' },
      { key: 'inputBackground', label: 'Fundo do Input', type: 'color', defaultValue: 'white' },
      { key: 'inputColor', label: 'Cor do Texto do Input', type: 'color', defaultValue: '#333333' },
      { key: 'background', label: 'Fundo da Seção (gradiente ou cor)', type: 'text', defaultValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
    ]
  },
  defaultConfig: {
    title: 'Fique por dentro das novidades',
    subtitle: 'Receba lançamentos e oportunidades exclusivas no seu email',
    inputPlaceholder: 'Seu melhor email',
    buttonText: 'Assinar Newsletter',
    titleColor: 'white',
    subtitleColor: 'white',
    buttonBackground: 'white',
    buttonColor: '#667eea',
    inputBackground: 'white',
    inputColor: '#333333',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  defaultStyle: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '5rem 0',
    color: 'white'
  }
};
