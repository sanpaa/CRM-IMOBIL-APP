import { ComponentMetadata } from '../component-base.interface';

export const HERO_METADATA: ComponentMetadata = {
  type: 'hero',
  label: 'Hero Section',
  icon: '🖼️',
  category: 'content',
  description: 'Large banner with title and call-to-action',
  
  schema: {
    fields: [
      {
        key: 'title',
        label: 'Título',
        type: 'text',
        defaultValue: 'Encontre seu imóvel ideal',
        required: true,
        placeholder: 'Digite o título principal'
      },
      {
        key: 'subtitle',
        label: 'Subtítulo',
        type: 'text',
        defaultValue: 'As melhores opções do mercado',
        placeholder: 'Digite o subtítulo (opcional)'
      },
      {
        key: 'backgroundImage',
        label: 'Imagem de fundo (URL)',
        type: 'image-url',
        defaultValue: '',
        placeholder: 'Cole o link da imagem'
      },
      {
        key: 'overlayColor',
        label: 'Cor da camada escura',
        type: 'color',
        defaultValue: '#0f172a'
      },
      {
        key: 'overlayOpacity',
        label: 'Forca da camada (0 a 1)',
        type: 'number',
        defaultValue: 0.55,
        min: 0,
        max: 1
      },
      {
        key: 'buttonText',
        label: 'Texto do botao principal',
        type: 'text',
        defaultValue: 'Ver Imóveis',
        placeholder: 'Ex: Agendar visita'
      },
      {
        key: 'buttonLink',
        label: 'Link do botao principal',
        type: 'link',
        defaultValue: '/properties',
        placeholder: 'Ex: /imoveis ou link externo'
      },
      {
        key: 'secondaryButtonText',
        label: 'Texto do botao secundario',
        type: 'text',
        defaultValue: 'Fale com um corretor',
        placeholder: 'Ex: Falar no WhatsApp'
      },
      {
        key: 'secondaryButtonLink',
        label: 'Link do botao secundario',
        type: 'link',
        defaultValue: '/contato',
        placeholder: 'Ex: /contato ou link externo'
      },
      {
        key: 'badges',
        label: 'Selos (badges)',
        type: 'array',
        defaultValue: [{ text: 'Atendimento premium' }, { text: 'Imoveis exclusivos' }],
        schema: {
          text: { type: 'text', label: 'Texto do selo' }
        }
      },
      {
        key: 'highlights',
        label: 'Destaques rapidos',
        type: 'array',
        defaultValue: [
          { value: '320+', label: 'Imoveis vendidos', description: 'Nos ultimos 12 meses' },
          { value: '98%', label: 'Satisfacao', description: 'Clientes recomendam' }
        ],
        schema: {
          value: { type: 'text', label: 'Numero/valor' },
          label: { type: 'text', label: 'Titulo curto' },
          description: { type: 'text', label: 'Descricao curta' }
        }
      },
      {
        key: 'contentWidth',
        label: 'Largura do conteudo',
        type: 'text',
        defaultValue: '1200px',
        placeholder: 'Ex: 1100px ou 80%'
      },
      {
        key: 'height',
        label: 'Altura do banner',
        type: 'select',
        defaultValue: 'large',
        options: [
          { label: 'Pequena (300px)', value: 'small' },
          { label: 'Média (400px)', value: 'medium' },
          { label: 'Grande (500px)', value: 'large' },
          { label: 'Tela Cheia', value: 'full' }
        ]
      },
      {
        key: 'alignment',
        label: 'Alinhamento do texto',
        type: 'select',
        defaultValue: 'center',
        options: [
          { label: 'Esquerda', value: 'left' },
          { label: 'Centro', value: 'center' },
          { label: 'Direita', value: 'right' }
        ]
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
        defaultValue: '0',
        placeholder: 'ex: 2rem ou 20px'
      }
    ]
  },
  
  defaultConfig: {
    title: 'Encontre seu imóvel ideal',
    subtitle: 'As melhores opções do mercado',
    backgroundImage: '',
    overlayColor: '#0f172a',
    overlayOpacity: 0.55,
    buttonText: 'Ver Imóveis',
    buttonLink: '/properties',
    secondaryButtonText: 'Fale com um corretor',
    secondaryButtonLink: '/contato',
    badges: [
      { text: 'Atendimento premium' },
      { text: 'Imoveis exclusivos' }
    ],
    highlights: [
      { value: '320+', label: 'Imoveis vendidos', description: 'Nos ultimos 12 meses' },
      { value: '98%', label: 'Satisfacao', description: 'Clientes recomendam' }
    ],
    contentWidth: '1200px',
    height: 'large',
    alignment: 'center'
  },
  
  defaultStyle: {
    backgroundColor: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    textColor: '#f8fafc',
    padding: '0'
  }
};
