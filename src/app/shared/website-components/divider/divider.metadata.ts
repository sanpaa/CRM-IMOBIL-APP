import { ComponentMetadata } from '../component-base.interface';

export const DIVIDER_METADATA: ComponentMetadata = {
  type: 'divider',
  label: 'Divider',
  icon: '➖',
  category: 'layout',
  description: 'Horizontal line separator',
  schema: {
    fields: [
      { key: 'color', label: 'Cor', type: 'color', defaultValue: '#e0e0e0' },
      { key: 'thickness', label: 'Espessura', type: 'text', defaultValue: '1px' }
    ],
    styleFields: [
      { key: 'margin', label: 'Margem', type: 'text', defaultValue: '2rem 0' }
    ]
  },
  defaultConfig: { style: 'solid', thickness: '1px', color: '#e0e0e0' },
  defaultStyle: { margin: '2rem 0' }
};
