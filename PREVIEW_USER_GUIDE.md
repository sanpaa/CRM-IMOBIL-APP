# 🎯 Quick Start Guide: Live Preview Feature

## Accessing the Feature

1. **Login** to your CRM Imobiliário account
2. Navigate to **"🎨 Construtor de Sites"** in the sidebar
3. You'll see the Website Builder with the new **Live Preview** panel

## Interface Overview

```
┌─────────────────────────────────────────────────────────────┐
│  🎨 Construtor de Sites      [Layout Selector ▾]           │
│  [➕ Novo] [🔲 Preview] [🖥️ Completo] [💾 Salvar] [🚀]    │
├──────────┬──────────────────────────────┬──────────────────┤
│ 📦 COMP  │    CANVAS EDITOR             │  ⚙️ PROPERTIES  │
│          │                              │                 │
│ Click to │    Drag & Drop               │  Edit selected  │
│ add      │    components here           │  component      │
│          │                              │                 │
├──────────┴──────────────────────────────┴──────────────────┤
│              👁️ LIVE PREVIEW PANEL                         │
│  [🖥️] [📱] [📱]                             [⛶]           │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Your website renders here in real-time!           │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Basic Workflow

### Step 1: Create or Select a Layout
```
1. Click [➕ Novo Layout] to create a new page
2. Enter name: "Home Page"
3. Select page type: "Home"
4. Click "Criar Layout"
```

### Step 2: Add Components
```
From the Component Library (left sidebar), click:
1. 🏠 Header - Adds navigation bar
2. 🎯 Hero - Adds banner section
3. 🔍 Search Bar - Adds property search
4. 🏘️ Property Grid - Adds property listings
5. 🦶 Footer - Adds footer section
```

### Step 3: Configure Components
```
1. Click a component in the canvas
2. Properties panel (right) shows options
3. Edit text, colors, settings
4. Preview updates automatically! ✨
```

### Step 4: Test Responsiveness
```
In the Live Preview Panel:
1. Click [🖥️] for Desktop view (1200px)
2. Click [📱] for Tablet view (768px)
3. Click [📱] for Mobile view (375px)
```

### Step 5: Fullscreen Preview
```
1. Click [⛶] button in preview panel
2. Modal opens with fullscreen preview
3. Switch devices in fullscreen mode
4. Click [✕ Fechar] to close
```

### Step 6: Save & Publish
```
1. Click [💾 Salvar] to save changes
2. Click [🚀 Publicar] to make it live
3. Your website is now public!
```

## Component Configuration Examples

### Hero Section
```
Properties Panel shows:
- Título: "Encontre seu imóvel ideal"
- Subtítulo: "As melhores opções"
- Altura: [Large ▾]
- Cor de Fundo: [■ Blue]
- Cor do Texto: [■ White]
```

### Property Grid
```
Properties Panel shows:
- Limite de Imóveis: 6
- Colunas: [3 ▾]
- ☑ Mostrar apenas destaques
- Espaçamento: 2rem
```

### Text Block
```
Properties Panel shows:
- Título: "Sobre Nós"
- Conteúdo: [Text editor]
- Alinhamento: [Left ▾]
- Cor de Fundo: [■]
```

## Tips & Tricks

### 💡 Quick Tips

1. **Real-time Updates**: Changes apply instantly in the preview
2. **Drag to Reorder**: Use the ⋮⋮ handle to rearrange sections
3. **Duplicate Sections**: Click 📋 to copy a section
4. **Delete Sections**: Click 🗑️ to remove a section
5. **Multiple Layouts**: Create different layouts for different pages

### 🎨 Design Best Practices

1. **Start with Structure**: Add Header → Hero → Content → Footer
2. **Test Early**: Switch device views frequently while building
3. **Use Preview**: Check appearance before saving
4. **Iterate Fast**: Make changes and see results immediately
5. **Mobile First**: Always check mobile view before publishing

### 🚀 Performance Tips

1. **Limit Property Grid**: Show 6-12 properties per page
2. **Optimize Images**: Use web-optimized images in Hero sections
3. **Spacer Components**: Use spacers for breathing room
4. **Color Contrast**: Ensure text is readable on backgrounds

## Keyboard Shortcuts

While working in the builder:
- **Ctrl/Cmd + S**: Save layout (when focused on properties)
- **Escape**: Close fullscreen preview
- **Tab**: Navigate between form fields

## Troubleshooting

### Preview not updating?
- ✅ Ensure you've clicked a section to select it
- ✅ Try clicking another section then back
- ✅ Refresh the page if needed

### Component not appearing?
- ✅ Check if the component is in the canvas
- ✅ Scroll the preview panel to see it
- ✅ Some components need configuration to show content

### Mobile view looks wrong?
- ✅ This is expected - mobile layout is responsive
- ✅ Grid columns automatically reduce on smaller screens
- ✅ Test all device sizes before publishing

### Fullscreen not opening?
- ✅ Check if popup blockers are enabled
- ✅ Try clicking the button again
- ✅ Use browser's F11 for actual fullscreen if needed

## Device Preview Comparison

### Desktop View (🖥️ 1200px)
- Property Grid: 3-4 columns
- Navigation: Horizontal menu
- Images: Large, high quality
- Best for: Complete layout view

### Tablet View (📱 768px)
- Property Grid: 2 columns
- Navigation: May collapse to menu icon
- Images: Medium size
- Best for: Testing tablet devices

### Mobile View (📱 375px)
- Property Grid: 1 column (stacked)
- Navigation: Hamburger menu
- Images: Optimized size
- Best for: Testing smartphone experience

## Component Visibility

| Component      | Desktop | Tablet | Mobile |
|---------------|---------|--------|--------|
| Header        | Full    | Full   | Menu   |
| Hero          | Full    | Full   | Compact|
| Search Bar    | Horiz.  | Horiz. | Vert.  |
| Property Grid | 3 cols  | 2 cols | 1 col  |
| Text Block    | Full    | Full   | Full   |
| Contact Form  | Side    | Stack  | Stack  |
| Stats         | Row     | Row    | Column |
| Footer        | Multi   | Multi  | Single |

## Support

If you need help:
1. Check this guide first
2. Review `LIVE_PREVIEW_FEATURE.md` for technical details
3. Contact support if issues persist

---

**Last Updated**: December 31, 2025  
**Version**: 1.0.0  
**Feature Status**: ✅ Production Ready
