import { ComponentMetadata } from '../component-base.interface';

export const STATS_SECTION_METADATA: ComponentMetadata = {
  type: 'stats-section',
  label: 'Provas Sociais',
  icon: '📊',
  category: 'content',
  description: 'Numeros de credibilidade com cards fortes',
  schema: {
    fields: [
      { key: 'title', label: 'Titulo', type: 'text', defaultValue: 'Resultados que comprovam' },
      { key: 'subtitle', label: 'Subtitulo', type: 'text', defaultValue: 'Provas sociais que mostram nossa solidez no mercado' },
      { key: 'badgeText', label: 'Selo do topo', type: 'text', defaultValue: 'Credibilidade' },
      { key: 'accentColor', label: 'Cor de destaque', type: 'color', defaultValue: '#0ea5e9' },
      {
        key: 'stats',
        label: 'Cards de resultados',
        type: 'array',
        defaultValue: [
          { value: '1200+', label: 'Imoveis ativos', description: 'Em carteira exclusiva' },
          { value: '18k', label: 'Leads qualificados', description: 'Gerados no ultimo ano' },
          { value: '97%', label: 'Conversao', description: 'Satisfacao comprovada' }
        ],
        schema: {
          value: { type: 'text', label: 'Numero/valor' },
          label: { type: 'text', label: 'Titulo curto' },
          description: { type: 'text', label: 'Descricao curta' }
        }
      }
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
    title: 'Resultados que comprovam',
    subtitle: 'Provas sociais que mostram nossa solidez no mercado',
    badgeText: 'Credibilidade',
    accentColor: '#0ea5e9',
    stats: [
      { value: '1200+', label: 'Imoveis ativos', description: 'Em carteira exclusiva' },
      { value: '18k', label: 'Leads qualificados', description: 'Gerados no ultimo ano' },
      { value: '97%', label: 'Conversao', description: 'Satisfacao comprovada' }
    ]
  },
  defaultStyle: {
    backgroundColor: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    textColor: '#f8fafc',
    padding: '5rem 0'
  }
};
