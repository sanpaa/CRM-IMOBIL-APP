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
        label: 'Imagem de Fundo',
        type: 'image-url',
        defaultValue: '',
        placeholder: 'URL da imagem de fundo'
      },
      {
        key: 'buttonText',
        label: 'Texto do Botão',
        type: 'text',
        defaultValue: 'Ver Imóveis',
        placeholder: 'Texto do botão (opcional)'
      },
      {
        key: 'buttonLink',
        label: 'Link do Botão',
        type: 'link',
        defaultValue: '/properties',
        placeholder: '/properties ou URL externa'
      },
      {
        key: 'height',
        label: 'Altura',
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
        label: 'Alinhamento',
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
        label: 'Cor de Fundo',
        type: 'color',
        defaultValue: '#004AAD'
      },
      {
        key: 'textColor',
        label: 'Cor do Texto',
        type: 'color',
        defaultValue: '#ffffff'
      },
      {
        key: 'padding',
        label: 'Espaçamento Interno',
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
    buttonText: 'Ver Imóveis',
    buttonLink: '/properties',
    height: 'large',
    alignment: 'center'
  },
  
  defaultStyle: {
    backgroundColor: '#004AAD',
    textColor: '#ffffff',
    padding: '0'
  }
};
