import { ComponentMetadata } from '../component-base.interface';

export const FLEX_CONTAINER_METADATA: ComponentMetadata = {
  type: 'flex-container',
  label: 'Flex Container',
  icon: '📦',
  category: 'layout',
  description: 'Organize components using Flexbox',
  schema: {
    fields: [
      { 
        key: 'direction', 
        label: 'Direction', 
        type: 'select', 
        defaultValue: 'row',
        options: [
          { label: 'Row', value: 'row' },
          { label: 'Column', value: 'column' },
          { label: 'Row Reverse', value: 'row-reverse' },
          { label: 'Column Reverse', value: 'column-reverse' }
        ]
      },
      { 
        key: 'justifyContent', 
        label: 'Justify Content', 
        type: 'select', 
        defaultValue: 'space-between',
        options: [
          { label: 'Flex Start', value: 'flex-start' },
          { label: 'Center', value: 'center' },
          { label: 'Flex End', value: 'flex-end' },
          { label: 'Space Between', value: 'space-between' },
          { label: 'Space Around', value: 'space-around' },
          { label: 'Space Evenly', value: 'space-evenly' }
        ]
      },
      { 
        key: 'alignItems', 
        label: 'Align Items', 
        type: 'select', 
        defaultValue: 'center',
        options: [
          { label: 'Flex Start', value: 'flex-start' },
          { label: 'Center', value: 'center' },
          { label: 'Flex End', value: 'flex-end' },
          { label: 'Stretch', value: 'stretch' },
          { label: 'Baseline', value: 'baseline' }
        ]
      },
      { 
        key: 'wrap', 
        label: 'Wrap', 
        type: 'select', 
        defaultValue: 'wrap',
        options: [
          { label: 'No Wrap', value: 'nowrap' },
          { label: 'Wrap', value: 'wrap' },
          { label: 'Wrap Reverse', value: 'wrap-reverse' }
        ]
      },
      { key: 'gap', label: 'Gap', type: 'text', defaultValue: '2rem' },
      { key: 'padding', label: 'Padding', type: 'text', defaultValue: '3rem' },
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' }
    ]
  },
  defaultConfig: {
    direction: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    wrap: 'wrap',
    gap: '2rem',
    padding: '3rem',
    backgroundColor: '#ffffff',
    children: []
  },
  defaultStyle: {
    maxWidth: '1400px',
    margin: '0 auto'
  }
};
