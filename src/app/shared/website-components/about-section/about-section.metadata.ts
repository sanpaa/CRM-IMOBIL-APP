import { ComponentMetadata } from '../component-base.interface';

export const ABOUT_SECTION_METADATA: ComponentMetadata = {
  type: 'about-section',
  label: 'Manifesto / Sobre',
  icon: '🧭',
  category: 'content',
  description: 'Texto de autoridade com foto, bullets e botao',
  schema: {
    fields: [
      { key: 'eyebrow', label: 'Selo pequeno acima do titulo', type: 'text', defaultValue: 'Manifesto' },
      { key: 'title', label: 'Titulo principal', type: 'text', defaultValue: 'Seu corretor com visao estrategica' },
      { key: 'subtitle', label: 'Subtitulo', type: 'text', defaultValue: 'Atendimento direto, dados de mercado e foco em conversao.' },
      { key: 'content', label: 'Texto principal', type: 'textarea', defaultValue: 'Ha mais de 12 anos conectando familias aos melhores imoveis.' },
      { key: 'imageUrl', label: 'Foto (URL)', type: 'image-url', defaultValue: '' },
      {
        key: 'bullets',
        label: 'Pontos de valor',
        type: 'array',
        defaultValue: [
          { icon: 'fa-solid fa-chart-line', title: 'Visao de mercado', description: 'Analises semanais para precificar com seguranca.' },
          { icon: 'fa-solid fa-star', title: 'Curadoria premium', description: 'Selecao enxuta com imoveis de alta liquidez.' },
          { icon: 'fa-solid fa-handshake', title: 'Negociacao clara', description: 'Processo transparente ate a assinatura.' }
        ],
        schema: {
          icon: { type: 'text', label: 'Icone ou emoji' },
          title: { type: 'text', label: 'Titulo curto' },
          description: { type: 'text', label: 'Descricao curta' }
        }
      },
      { key: 'buttonText', label: 'Texto do botao', type: 'text', defaultValue: 'Conheca o corretor' },
      { key: 'buttonLink', label: 'Link do botao', type: 'link', defaultValue: '/sobre' },
      { key: 'highlightText', label: 'Frase de destaque na foto', type: 'text', defaultValue: 'Atendimento 1:1 com acompanhamento total' },
      {
        key: 'imagePosition',
        label: 'Foto fica na',
        type: 'select',
        defaultValue: 'right',
        options: [
          { label: 'Direita', value: 'right' },
          { label: 'Esquerda', value: 'left' }
        ]
      }
    ],
    styleFields: [
      {
        key: 'backgroundColor',
        label: 'Fundo (cor ou gradiente)',
        type: 'text',
        defaultValue: '#f8fafc'
      },
      {
        key: 'textColor',
        label: 'Cor do texto',
        type: 'color',
        defaultValue: '#0f172a'
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
    eyebrow: 'Manifesto',
    title: 'Seu corretor com visao estrategica',
    subtitle: 'Atendimento direto, dados de mercado e foco em conversao.',
    content: 'Ha mais de 12 anos conectando familias aos melhores imoveis.',
    imageUrl: '',
    bullets: [
      { icon: 'fa-solid fa-chart-line', title: 'Visao de mercado', description: 'Analises semanais para precificar com seguranca.' },
      { icon: 'fa-solid fa-star', title: 'Curadoria premium', description: 'Selecao enxuta com imoveis de alta liquidez.' },
      { icon: 'fa-solid fa-handshake', title: 'Negociacao clara', description: 'Processo transparente ate a assinatura.' }
    ],
    buttonText: 'Conheca o corretor',
    buttonLink: '/sobre',
    highlightText: 'Atendimento 1:1 com acompanhamento total',
    imagePosition: 'right'
  },
  defaultStyle: {
    backgroundColor: '#f8fafc',
    textColor: '#0f172a',
    padding: '5rem 0'
  }
};
