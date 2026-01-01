import { ComponentMetadata } from '../component-base.interface';

export const HEADER_METADATA: ComponentMetadata = {
  type: 'header',
  label: 'Header',
  icon: '📄',
  category: 'navigation',
  description: 'Site header with logo and navigation menu',
  
  schema: {
    fields: [
      {
        key: 'logo',
        label: 'Logo / Nome',
        type: 'text',
        defaultValue: 'Imobiliária',
        required: true,
        placeholder: 'Nome da imobiliária'
      },
      {
        key: 'showSearch',
        label: 'Mostrar Busca',
        type: 'checkbox',
        defaultValue: true
      },
      {
        key: 'navigation',
        label: 'Menu de Navegação',
        type: 'array',
        defaultValue: [
          { label: 'Home', link: '/' },
          { label: 'Imóveis', link: '/properties' },
          { label: 'Contato', link: '/contact' }
        ],
        fields: [
          {
            key: 'label',
            label: 'Texto',
            type: 'text',
            required: true
          },
          {
            key: 'link',
            label: 'Link',
            type: 'link',
            required: true
          }
        ]
      }
    ],
    
    styleFields: [
      {
        key: 'backgroundColor',
        label: 'Cor de Fundo',
        type: 'color',
        defaultValue: '#ffffff'
      },
      {
        key: 'textColor',
        label: 'Cor do Texto',
        type: 'color',
        defaultValue: '#333333'
      }
    ]
  },
  
  defaultConfig: {
    logo: 'Imobiliária',
    showSearch: true,
    navigation: [
      { label: 'Home', link: '/' },
      { label: 'Imóveis', link: '/properties' },
      { label: 'Contato', link: '/contact' }
    ]
  },
  
  defaultStyle: {
    backgroundColor: '#ffffff',
    textColor: '#333333'
  }
};
