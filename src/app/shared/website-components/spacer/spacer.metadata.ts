import { ComponentMetadata } from '../component-base.interface';

export const SPACER_METADATA: ComponentMetadata = {
  type: 'spacer',
  label: 'Spacer',
  icon: '↕️',
  category: 'layout',
  description: 'Empty space for layout spacing',
  schema: {
    fields: [
      { key: 'height', label: 'Altura', type: 'text', defaultValue: '2rem', placeholder: 'ex: 2rem, 50px, 10vh' }
    ]
  },
  defaultConfig: { height: '2rem' },
  defaultStyle: {}
};
