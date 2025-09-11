# Drag & Drop Form Builder

A powerful, Shopify-like drag and drop form builder that allows users to create responsive forms visually and generate clean, production-ready code.

## Features

### ✨ Core Features
- **Drag & Drop Interface** - Intuitive form building experience
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Real-time Preview** - See your form as you build it
- **Code Generation** - Export clean HTML, CSS, and JavaScript
- **Form Validation** - Built-in client-side validation
- **Copy & Paste Ready** - Generated code works anywhere

### 🎛️ Form Elements
- **Input Fields**: Text, Email, Password, Number, Phone, URL
- **Selection**: Dropdown, Radio buttons, Checkboxes
- **Content**: Textarea, File upload, Date, Time
- **Actions**: Submit and Reset buttons

### 🎨 Customization
- **Element Properties** - Configure labels, placeholders, validation
- **Required Fields** - Mark fields as mandatory
- **Custom Options** - Add custom options for select/radio/checkbox elements
- **Form Titles** - Customizable form headers

### 📱 Responsive Design
- **Mobile First** - Optimized for all screen sizes
- **Flexible Layout** - Adapts to different viewport widths
- **Touch Friendly** - Works great on touch devices

## Getting Started

### Option 1: Direct Usage
1. Simply open `index.html` in your web browser
2. Start dragging form elements from the sidebar to the canvas
3. Click on elements to configure their properties
4. Use the "Generate Code" button to export your form

### Option 2: Local Server
1. Install dependencies (optional for development):
   ```bash
   npm install
   ```

2. Start a local server:
   ```bash
   npm run dev
   # or
   npm start
   ```

3. Open your browser and navigate to the provided local URL

## How to Use

### 1. Building Forms
1. **Drag Elements**: Drag form elements from the left sidebar to the canvas area
2. **Configure Properties**: Click on any element to open the properties panel
3. **Edit Properties**: Modify labels, placeholders, and validation settings
4. **Reorder Elements**: Elements are added sequentially as you drop them

### 2. Element Configuration
- **Label**: The text that appears above the form field
- **Placeholder**: Helper text inside the form field
- **Required**: Mark fields as mandatory for form submission
- **Options**: For dropdowns, radio buttons, and checkboxes

### 3. Code Generation
1. Click the **"Generate Code"** button in the header
2. Switch between HTML, CSS, and JavaScript tabs
3. Copy the code using the **"Copy Code"** button
4. Paste the code into your website

### 4. Preview & Export
- **Preview**: Click "Preview" to see how your form will look on the frontend
- **Export**: Save your form configuration as JSON for later editing
- **Clear**: Remove all elements and start fresh

## Generated Code Structure

The form builder generates three files:

### HTML (`form.html`)
- Complete HTML document with form structure
- Semantic markup with proper accessibility attributes
- Responsive viewport meta tag

### CSS (`form-styles.css`)
- Modern, responsive styling
- Focus states and transitions
- Error and success message styles
- Mobile-first responsive breakpoints

### JavaScript (`form-validation.js`)
- Client-side form validation
- Email, phone, and URL validation
- Error handling and user feedback
- Form submission handling (customizable)

## Customization

### Styling
The generated CSS uses CSS custom properties (variables) that you can easily customize:

```css
:root {
  --primary-color: #3b82f6;
  --error-color: #ef4444;
  --success-color: #10b981;
  --border-color: #d1d5db;
  --text-color: #374151;
}
```

### Form Submission
Modify the `submitFormData` function in the generated JavaScript to integrate with your backend:

```javascript
function submitFormData(formData) {
  fetch('/your-form-endpoint', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    showSuccess('Form submitted successfully!');
  })
  .catch(error => {
    showError('There was an error submitting the form.');
  });
}
```

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Features Used**: HTML5 Drag & Drop API, ES6+ JavaScript, CSS Grid/Flexbox

## File Structure

```
├── index.html          # Main form builder interface
├── styles.css          # Form builder application styles
├── script.js           # Form builder functionality
├── package.json        # Project configuration
└── README.md          # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this in your projects!

## Support

For issues, feature requests, or questions:
1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Include screenshots if applicable

## Roadmap

### Upcoming Features
- [ ] Theme customization panel
- [ ] More form field types (Range, Color, etc.)
- [ ] Form templates and presets
- [ ] Import/Export functionality
- [ ] Multi-step form support
- [ ] Advanced validation rules
- [ ] Integration with popular form services

## Examples

### Basic Contact Form
1. Drag "Text Input" for name
2. Drag "Email" for email address
3. Drag "Textarea" for message
4. Drag "Submit Button"
5. Configure labels and validation
6. Generate and copy code

### Survey Form
1. Use "Radio Button" for multiple choice questions
2. Use "Checkbox" for multi-select questions
3. Use "Dropdown" for rating scales
4. Add "Textarea" for comments
5. Include "Submit Button"

The generated forms are production-ready and can be integrated into any website or web application.
