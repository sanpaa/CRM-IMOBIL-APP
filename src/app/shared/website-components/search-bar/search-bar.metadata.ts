import { ComponentMetadata } from '../component-base.interface';

export const SEARCH_BAR_METADATA: ComponentMetadata = {
  type: 'search-bar',
  label: 'Barra de Busca',
  icon: '??',
  category: 'properties',
  description: 'Barra de busca com filtros de im?veis',
  schema: {
    fields: [
      {
        key: 'fields',
        label: 'Campos visiveis',
        type: 'array',
        defaultValue: ['type', 'city', 'priceRange', 'bedrooms']
      },
      {
        key: 'placeholder',
        label: 'Placeholder',
        type: 'text',
        defaultValue: 'Buscar im?veis...'
      },
      {
        key: 'buttonText',
        label: 'Texto do botao',
        type: 'text',
        defaultValue: 'Buscar'
      },
      {
        key: 'orientation',
        label: 'Orientacao',
        type: 'select',
        options: [
          { label: 'Horizontal', value: 'horizontal' },
          { label: 'Vertical', value: 'vertical' }
        ],
        defaultValue: 'horizontal'
      }
    ]
  },
  defaultConfig: {
    fields: ['type', 'city', 'priceRange', 'bedrooms'],
    placeholder: 'Buscar im?veis...',
    buttonText: 'Buscar',
    orientation: 'horizontal'
  },
  defaultStyle: {
    backgroundColor: 'transparent',
    padding: '2rem'
  }
};
