import { ComponentMetadata } from '../component-base.interface';

export const HEADER_METADATA: ComponentMetadata = {
  type: 'header',
  label: 'Topo do Site',
  icon: '📄',
  category: 'navigation',
  description: 'Topo com logo, menu e atalho de WhatsApp',
  
  schema: {
    fields: [
      {
        key: 'companyName',
        label: 'Nome da empresa',
        type: 'text',
        defaultValue: 'Imobiliária',
        required: true,
        placeholder: 'Ex: Imobiliaria Prime'
      },
      {
        key: 'logoUrl',
        label: 'Logo (URL da imagem)',
        type: 'image-url',
        defaultValue: '',
        placeholder: 'Cole o link da sua logo'
      },
      {
        key: 'showLogo',
        label: 'Mostrar logo',
        type: 'checkbox',
        defaultValue: true
      },
      {
        key: 'showMenu',
        label: 'Mostrar menu',
        type: 'checkbox',
        defaultValue: true
      },
      {
        key: 'navigation',
        label: 'Itens do menu',
        type: 'array',
        defaultValue: [
          { label: 'Home', link: '/' },
          { label: 'Imóveis', link: '/properties' },
          { label: 'Contato', link: '/contact' }
        ],
        fields: [
          {
            key: 'label',
            label: 'Nome do item',
            type: 'text',
            required: true
          },
          {
            key: 'link',
            label: 'Link de destino',
            type: 'link',
            required: true
          }
        ]
      },
      {
        key: 'phone',
        label: 'WhatsApp (numero)',
        type: 'text',
        defaultValue: '',
        placeholder: 'Ex: 11 99999-9999'
      }
    ],
    
    styleFields: [
      {
        key: 'backgroundColor',
        label: 'Fundo',
        type: 'text',
        defaultValue: '#ffffff'
      },
      {
        key: 'textColor',
        label: 'Cor do texto',
        type: 'color',
        defaultValue: '#333333'
      }
    ]
  },
  
  defaultConfig: {
    companyName: 'Imobiliária',
    logoUrl: '',
    showLogo: true,
    showMenu: true,
    navigation: [
      { label: 'Home', link: '/' },
      { label: 'Imóveis', link: '/properties' },
      { label: 'Contato', link: '/contact' }
    ],
    phone: ''
  },
  
  defaultStyle: {
    backgroundColor: '#ffffff',
    textColor: '#333333'
  }
};
