import { ComponentMetadata } from '../component-base.interface';

export const FOOTER_METADATA: ComponentMetadata = {
  type: 'footer',
  label: 'Rodape',
  icon: '📄',
  category: 'navigation',
  description: 'Rodape com contatos, links e redes sociais',
  schema: {
    fields: [
      { key: 'companyName', label: 'Nome da empresa', type: 'text', defaultValue: 'Imobiliária' },
      { key: 'description', label: 'Descricao curta', type: 'textarea', defaultValue: 'Especialistas em imoveis de alto padrao.' },
      { key: 'logoUrl', label: 'Logo (URL da imagem)', type: 'image-url', defaultValue: '' },
      { key: 'showLogo', label: 'Mostrar logo', type: 'checkbox', defaultValue: false },
      { key: 'address', label: 'Endereco', type: 'text', defaultValue: '' },
      { key: 'phone', label: 'Telefone', type: 'text', defaultValue: '' },
      { key: 'email', label: 'E-mail', type: 'text', defaultValue: '' },
      { key: 'instagram', label: 'Instagram (link)', type: 'link', defaultValue: '' },
      { key: 'facebook', label: 'Facebook (link)', type: 'link', defaultValue: '' },
      { key: 'whatsapp', label: 'WhatsApp (numero)', type: 'text', defaultValue: '' },
      {
        key: 'quickLinks',
        label: 'Links rapidos',
        type: 'array',
        defaultValue: [
          { label: 'Quem somos', route: '/sobre' },
          { label: 'Contato', route: '/contato' }
        ],
        schema: {
          label: { type: 'text', label: 'Nome do link' },
          route: { type: 'link', label: 'Destino' }
        }
      },
      {
        key: 'services',
        label: 'Servicos',
        type: 'array',
        defaultValue: [
          { label: 'Venda de imoveis', route: '/imoveis' },
          { label: 'Locacao', route: '/imoveis?tipo=locacao' }
        ],
        schema: {
          label: { type: 'text', label: 'Nome do servico' },
          route: { type: 'link', label: 'Destino' }
        }
      },
      { key: 'showCopyright', label: 'Mostrar direitos autorais', type: 'checkbox', defaultValue: true }
    ],
    styleFields: [
      { key: 'backgroundColor', label: 'Fundo', type: 'text', defaultValue: '#0f172a' },
      { key: 'textColor', label: 'Cor do texto', type: 'color', defaultValue: '#f8fafc' }
    ]
  },
  defaultConfig: {
    companyName: 'Imobiliária',
    description: 'Especialistas em imoveis de alto padrao.',
    logoUrl: '',
    showLogo: false,
    address: '',
    phone: '',
    email: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    quickLinks: [
      { label: 'Quem somos', route: '/sobre' },
      { label: 'Contato', route: '/contato' }
    ],
    services: [
      { label: 'Venda de imoveis', route: '/imoveis' },
      { label: 'Locacao', route: '/imoveis?tipo=locacao' }
    ],
    showCopyright: true
  },
  defaultStyle: { backgroundColor: '#0f172a', textColor: '#f8fafc' }
};
