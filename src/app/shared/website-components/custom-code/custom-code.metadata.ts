import { ComponentMetadata } from '../component-base.interface';

export const CUSTOM_CODE_METADATA: ComponentMetadata = {
  type: 'custom-code',
  label: 'Custom Code',
  icon: '💻',
  category: 'layout',
  description: 'Insert custom HTML, CSS and JavaScript',
  schema: {
    fields: [
      { key: 'html', label: 'HTML', type: 'textarea', defaultValue: '<div>Custom content</div>' },
      { key: 'css', label: 'CSS', type: 'textarea', defaultValue: '' },
      { key: 'js', label: 'JavaScript', type: 'textarea', defaultValue: '' },
      { key: 'enableJs', label: 'Enable JavaScript (Admin Only)', type: 'checkbox', defaultValue: false }
    ]
  },
  defaultConfig: {
    html: '<div class="custom-widget"><h3>Custom Widget</h3><p>Your custom content here</p></div>',
    css: '.custom-widget { background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; }',
    js: '',
    enableJs: false
  },
  defaultStyle: {
    padding: '2rem 1rem'
  }
};
