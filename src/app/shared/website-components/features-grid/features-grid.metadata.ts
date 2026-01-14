import { ComponentMetadata } from '../component-base.interface';

export const FEATURES_GRID_METADATA: ComponentMetadata = {
  type: 'features-grid',
  label: 'Diferenciais',
  icon: '⭐',
  category: 'content',
  description: 'Cards com os diferenciais do negocio',
  schema: {
    fields: [
      { key: 'title', label: 'Titulo', type: 'text', defaultValue: 'Por que escolher a gente?' },
      { key: 'subtitle', label: 'Subtitulo', type: 'text', defaultValue: 'Vantagens de trabalhar conosco' },
      { key: 'titleColor', label: 'Cor do titulo', type: 'color', defaultValue: '#1a202c' },
      { key: 'subtitleColor', label: 'Cor do subtitulo', type: 'color', defaultValue: '#718096' },
      { key: 'iconBackground', label: 'Fundo do icone (cor ou gradiente)', type: 'text', defaultValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { key: 'iconSize', label: 'Tamanho do icone', type: 'text', defaultValue: '80px' },
      { key: 'cardTitleColor', label: 'Cor do titulo do card', type: 'color', defaultValue: '#2d3748' },
      { key: 'cardDescriptionColor', label: 'Cor do texto do card', type: 'color', defaultValue: '#718096' },
      { key: 'cardBackground', label: 'Fundo do card', type: 'color', defaultValue: '#ffffff' },
      { key: 'cardBorderColor', label: 'Borda do card', type: 'color', defaultValue: '#ffffff' },
      { key: 'cardShadow', label: 'Sombra do card', type: 'text', defaultValue: '0 2px 8px rgba(0,0,0,0.05)' },
      { key: 'gridGap', label: 'Espaco entre cards', type: 'text', defaultValue: '2rem' },
      { 
        key: 'features', 
        label: 'Lista de diferenciais', 
        type: 'array', 
        defaultValue: [],
        schema: {
          icon: { type: 'text', label: 'Icone ou emoji' },
          title: { type: 'text', label: 'Titulo curto' },
          description: { type: 'textarea', label: 'Descricao' }
        }
      }
    ]
  },
  defaultConfig: {
    title: 'Por que escolher a gente?',
    subtitle: 'Vantagens de trabalhar conosco',
    titleColor: '#1a202c',
    subtitleColor: '#718096',
    iconBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    iconSize: '80px',
    cardTitleColor: '#2d3748',
    cardDescriptionColor: '#718096',
    cardBackground: '#ffffff',
    cardBorderColor: 'transparent',
    cardShadow: '0 2px 8px rgba(0,0,0,0.05)',
    gridGap: '2rem',
    features: [
      {
        icon: 'fas fa-shield-alt',
        title: 'Segurança Total',
        description: 'Transações 100% seguras e garantidas'
      },
      {
        icon: 'fas fa-clock',
        title: 'Atendimento 24/7',
        description: 'Suporte disponível a qualquer momento'
      },
      {
        icon: 'fas fa-star',
        title: 'Avaliação Gratuita',
        description: 'Avaliamos seu imóvel sem custo'
      },
      {
        icon: 'fas fa-handshake',
        title: 'Consultoria Especializada',
        description: 'Corretores experientes e qualificados'
      }
    ]
  },
  defaultStyle: {
    backgroundColor: '#ffffff',
    padding: '5rem 0'
  }
};
