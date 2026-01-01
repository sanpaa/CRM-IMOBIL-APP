import { ComponentMetadata } from '../component-base.interface';

export const GRID_CONTAINER_METADATA: ComponentMetadata = {
  type: 'grid-container',
  label: 'Grid Container',
  icon: '📐',
  category: 'layout',
  description: 'Organize components using CSS Grid',
  schema: {
    fields: [
      { 
        key: 'columns', 
        label: 'Columns (grid-template-columns)', 
        type: 'text', 
        defaultValue: 'repeat(3, 1fr)',
        placeholder: 'repeat(3, 1fr) or 300px 1fr 2fr'
      },
      { 
        key: 'rows', 
        label: 'Rows (grid-template-rows)', 
        type: 'text', 
        defaultValue: 'auto',
        placeholder: 'auto or 200px 1fr'
      },
      { key: 'gap', label: 'Gap', type: 'text', defaultValue: '2rem' },
      { key: 'padding', label: 'Padding', type: 'text', defaultValue: '3rem' },
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#f9fafb' }
    ]
  },
  defaultConfig: {
    columns: 'repeat(3, 1fr)',
    rows: 'auto',
    gap: '2rem',
    padding: '3rem',
    backgroundColor: '#f9fafb',
    children: []
  },
  defaultStyle: {
    maxWidth: '1400px',
    margin: '0 auto'
  }
};
