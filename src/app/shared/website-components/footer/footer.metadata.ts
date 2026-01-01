import { ComponentMetadata } from '../component-base.interface';

export const FOOTER_METADATA: ComponentMetadata = {
  type: 'footer',
  label: 'Footer',
  icon: '📄',
  category: 'navigation',
  description: 'Site footer with links and copyright',
  schema: {
    fields: [
      { key: 'copyrightText', label: 'Texto de Copyright', type: 'text', defaultValue: '© 2024 Todos os direitos reservados' }
    ],
    styleFields: [
      { key: 'backgroundColor', label: 'Cor de Fundo', type: 'color', defaultValue: '#1a1a1a' },
      { key: 'textColor', label: 'Cor do Texto', type: 'color', defaultValue: '#ffffff' }
    ]
  },
  defaultConfig: {
    columns: [{ title: 'Empresa', links: [{ label: 'Sobre', link: '#' }] }],
    copyrightText: '© 2024 Todos os direitos reservados'
  },
  defaultStyle: { backgroundColor: '#1a1a1a', textColor: '#ffffff' }
};
