import { ComponentMetadata } from '../component-base.interface';

export const PROPERTY_GRID_METADATA: ComponentMetadata = {
  type: 'property-grid',
  label: 'Property Grid',
  icon: '🏘️',
  category: 'properties',
  description: 'Grid of property listings',
  
  schema: {
    fields: [
      {
        key: 'limit',
        label: 'Limite de Imóveis',
        type: 'number',
        defaultValue: 6,
        min: 1,
        max: 50,
        description: 'Número máximo de imóveis a exibir'
      },
      {
        key: 'showFeatured',
        label: 'Apenas Destaques',
        type: 'checkbox',
        defaultValue: true,
        description: 'Mostrar apenas imóveis em destaque'
      },
      {
        key: 'columns',
        label: 'Número de Colunas',
        type: 'select',
        defaultValue: 3,
        options: [
          { label: '2 colunas', value: 2 },
          { label: '3 colunas', value: 3 },
          { label: '4 colunas', value: 4 }
        ]
      },
      {
        key: 'showFilters',
        label: 'Mostrar Filtros',
        type: 'checkbox',
        defaultValue: false,
        description: 'Exibir barra de filtros'
      },
      {
        key: 'sortBy',
        label: 'Ordenar Por',
        type: 'select',
        defaultValue: 'date',
        options: [
          { label: 'Mais Recentes', value: 'date' },
          { label: 'Maior Preço', value: 'price' },
          { label: 'Maior Área', value: 'area' }
        ]
      }
    ],
    
    styleFields: [
      {
        key: 'backgroundColor',
        label: 'Cor de Fundo',
        type: 'color',
        defaultValue: 'transparent'
      },
      {
        key: 'padding',
        label: 'Espaçamento',
        type: 'text',
        defaultValue: '2rem',
        placeholder: 'ex: 2rem ou 20px'
      }
    ]
  },
  
  defaultConfig: {
    limit: 6,
    showFeatured: true,
    columns: 3,
    showFilters: false,
    sortBy: 'date'
  },
  
  defaultStyle: {
    backgroundColor: 'transparent',
    padding: '2rem'
  }
};
