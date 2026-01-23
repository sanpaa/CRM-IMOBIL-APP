import { ComponentMetadata } from '../component-base.interface';

export const PROPERTY_GRID_METADATA: ComponentMetadata = {
  type: 'property-grid',
  label: 'Vitrine de Imoveis',
  icon: '🏘️',
  category: 'properties',
  description: 'Vitrine com cards de imoveis',
  
  schema: {
    fields: [
      {
        key: 'eyebrow',
        label: 'Etiqueta superior',
        type: 'text',
        defaultValue: 'Exclusividade'
      },
      {
        key: 'title',
        label: 'Titulo da secao',
        type: 'text',
        defaultValue: 'Imoveis em destaque'
      },
      {
        key: 'limit',
        label: 'Quantidade de imoveis',
        type: 'number',
        defaultValue: 6,
        min: 1,
        max: 50,
        description: 'Quantos cards aparecem na vitrine'
      },
      {
        key: 'showFeatured',
        label: 'Somente destaques',
        type: 'checkbox',
        defaultValue: true,
        description: 'Mostra apenas imoveis marcados como destaque'
      },
      {
        key: 'columns',
        label: 'Quantidade de colunas',
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
        label: 'Mostrar filtros',
        type: 'checkbox',
        defaultValue: false,
        description: 'Exibe a barra de filtros no topo'
      },
      {
        key: 'showViewAll',
        label: 'Mostrar botao ver todos',
        type: 'checkbox',
        defaultValue: true
      },
      {
        key: 'viewAllLabel',
        label: 'Texto ver todos',
        type: 'text',
        defaultValue: 'Ver todos os imoveis'
      },
      {
        key: 'viewAllLink',
        label: 'Link ver todos',
        type: 'text',
        defaultValue: '#'
      },
      {
        key: 'showCarousel',
        label: 'Usar carrossel',
        type: 'checkbox',
        defaultValue: true
      },
      {
        key: 'sortBy',
        label: 'Ordenacao',
        type: 'select',
        defaultValue: 'date',
        options: [
          { label: 'Mais recentes', value: 'date' },
          { label: 'Maior preco', value: 'price' },
          { label: 'Maior area', value: 'area' }
        ]
      }
    ],
    
    styleFields: [
      {
        key: 'backgroundColor',
        label: 'Fundo (cor ou gradiente)',
        type: 'text',
        defaultValue: '#ffffff'
      },
      {
        key: 'padding',
        label: 'Espacamento',
        type: 'text',
        defaultValue: '2rem',
        placeholder: 'Ex: 2rem ou 20px'
      }
    ]
  },
  
  defaultConfig: {
    eyebrow: 'Exclusividade',
    title: 'Imoveis em destaque',
    limit: 6,
    showFeatured: true,
    columns: 3,
    showFilters: false,
    showViewAll: true,
    viewAllLabel: 'Ver todos os imoveis',
    viewAllLink: '#',
    showCarousel: true,
    sortBy: 'date'
  },
  
  defaultStyle: {
    backgroundColor: 'transparent',
    padding: '2rem'
  }
};
