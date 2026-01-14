import { ComponentMetadata } from '../component-base.interface';

export const CTA_BUTTON_METADATA: ComponentMetadata = {
  type: 'cta-button',
  label: 'Chamada Final',
  icon: '🚀',
  category: 'content',
  description: 'Secao final com destaque e botoes',
  schema: {
    fields: [
      { key: 'title', label: 'Titulo', type: 'text', defaultValue: 'Pronto para fechar o seu proximo negocio?' },
      { key: 'subtitle', label: 'Subtitulo', type: 'text', defaultValue: 'Agende uma consultoria e tenha acesso a oportunidades fora do mercado.' },
      { key: 'buttonText', label: 'Texto do botao principal', type: 'text', defaultValue: 'Agendar consultoria' },
      { key: 'buttonLink', label: 'Link do botao principal', type: 'link', defaultValue: '/contato' },
      { key: 'secondaryButtonText', label: 'Texto do botao secundario', type: 'text', defaultValue: 'Ver imoveis' },
      { key: 'secondaryButtonLink', label: 'Link do botao secundario', type: 'link', defaultValue: '/imoveis' },
      { key: 'overlayColor', label: 'Cor da camada escura', type: 'color', defaultValue: '#0f172a' },
      { key: 'overlayOpacity', label: 'Forca da camada (0 a 1)', type: 'number', defaultValue: 0.6, min: 0, max: 1 },
      { key: 'accentColor', label: 'Cor de destaque', type: 'color', defaultValue: '#0ea5e9' },
      { key: 'badgeText', label: 'Selo pequeno', type: 'text', defaultValue: 'Ultima chance' }
    ],
    styleFields: [
      {
        key: 'backgroundColor',
        label: 'Fundo (cor ou gradiente)',
        type: 'text',
        defaultValue: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)'
      },
      {
        key: 'textColor',
        label: 'Cor do texto',
        type: 'color',
        defaultValue: '#f8fafc'
      },
      {
        key: 'padding',
        label: 'Espacamento interno',
        type: 'text',
        defaultValue: '5rem 0'
      }
    ]
  },
  defaultConfig: {
    title: 'Pronto para fechar o seu proximo negocio?',
    subtitle: 'Agende uma consultoria e tenha acesso a oportunidades fora do mercado.',
    buttonText: 'Agendar consultoria',
    buttonLink: '/contato',
    secondaryButtonText: 'Ver imoveis',
    secondaryButtonLink: '/imoveis',
    overlayColor: '#0f172a',
    overlayOpacity: 0.6,
    accentColor: '#0ea5e9',
    badgeText: 'Ultima chance'
  },
  defaultStyle: {
    backgroundColor: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    textColor: '#f8fafc',
    padding: '5rem 0'
  }
};
