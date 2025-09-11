// Form Builder Application
class FormBuilder {
    constructor() {
        this.formElements = [];
        this.formRows = [];
        this.selectedElement = null;
        this.selectedRow = null;
        this.elementCounter = 0;
        this.rowCounter = 0;
        this.currentTab = 'html';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initDragAndDrop();
    }
    
    setupEventListeners() {
        // Header buttons
        document.getElementById('previewBtn').addEventListener('click', () => this.showPreview());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportForm());
        document.getElementById('generateCodeBtn').addEventListener('click', () => this.showCodeModal());
        document.getElementById('clearCanvas').addEventListener('click', () => this.clearCanvas());
        
        // Modal close buttons
        document.getElementById('closeModalBtn').addEventListener('click', () => this.hideCodeModal());
        document.getElementById('closePreviewBtn').addEventListener('click', () => this.hidePreview());
        document.getElementById('closePanelBtn').addEventListener('click', () => this.hidePropertiesPanel());
        
        // Code tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Copy code button
        document.getElementById('copyCodeBtn').addEventListener('click', () => this.copyCode());
        
        // Form title change
        document.getElementById('formTitle').addEventListener('input', () => this.updateFormTitle());
        
        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }
    
    initDragAndDrop() {
        // Make elements draggable
        document.querySelectorAll('.draggable-element').forEach(element => {
            element.addEventListener('dragstart', (e) => this.handleDragStart(e));
            element.addEventListener('drag', (e) => this.handleDrag(e));
            element.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });
        
        // Setup main drop zone
        const dropZone = document.getElementById('dropZone');
        dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        dropZone.addEventListener('dragenter', (e) => this.handleDragEnter(e));
        dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        
        // Setup column drop zones (will be added dynamically)
        this.setupColumnDragAndDrop();
    }
    
    setupColumnDragAndDrop() {
        // This will be called after rendering to setup column drop zones
        document.querySelectorAll('.column-drop-zone').forEach(zone => {
            // Track drag enter/leave properly
            let dragCounter = 0;
            
            zone.addEventListener('dragenter', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dragCounter++;
                zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            
            zone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dragCounter--;
                if (dragCounter === 0) {
                    zone.classList.remove('drag-over');
                }
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dragCounter = 0;
                zone.classList.remove('drag-over');
                
                const rowId = zone.dataset.rowId;
                const columnIndex = parseInt(zone.dataset.columnIndex);
                const elementType = e.dataTransfer.getData('text/plain');
                
                // Dropping element in column
                
                // Don't allow row layouts inside columns
                if (elementType.startsWith('row-')) {
                    alert('Cannot add row layouts inside columns');
                    return;
                }
                
                this.createElement(elementType, { rowId, columnIndex });
            });
        });
    }
    
    handleDragStart(e) {
        const elementType = e.target.dataset.type;
        e.dataTransfer.setData('text/plain', elementType);
        e.target.classList.add('dragging');
    }
    
    handleDrag(e) {
        // Optional: Add visual feedback during drag
    }
    
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }
    
    handleDragOver(e) {
        e.preventDefault();
    }
    
    handleDragEnter(e) {
        e.preventDefault();
        const dropZone = document.getElementById('dropZone');
        dropZone.classList.add('drag-over');
    }
    
    handleDragLeave(e) {
        // Only remove if leaving the entire drop zone
        if (!e.currentTarget.contains(e.relatedTarget)) {
            const dropZone = document.getElementById('dropZone');
            dropZone.classList.remove('drag-over');
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        const dropZone = document.getElementById('dropZone');
        dropZone.classList.remove('drag-over');
        
        // Check if dropping on a column (this should be handled by column event listeners)
        const columnZone = e.target.closest('.column-drop-zone');
        if (columnZone) {
            // Let the column drop zone handle this
            return;
        }
        
        // Only handle drops on the main canvas area
        const elementType = e.dataTransfer.getData('text/plain');
        this.createElement(elementType);
    }
    
    createElement(type, targetColumn = null) {
        // Handle row layout creation
        if (type.startsWith('row-')) {
            const rowId = `row_${++this.rowCounter}`;
            const columns = parseInt(type.split('-')[1].replace('col', ''));
            const row = {
                id: rowId,
                type: type,
                columns: columns,
                elements: Array(columns).fill(null).map(() => [])
            };
            
            this.formRows.push(row);
            this.renderForm();
            this.hideDropPlaceholder();
            return;
        }
        
        // Handle regular element creation
        const elementId = `element_${++this.elementCounter}`;
        const element = {
            id: elementId,
            type: type,
            label: this.getDefaultLabel(type),
            placeholder: this.getDefaultPlaceholder(type),
            required: false,
            options: this.getDefaultOptions(type),
            validation: {},
            styling: {
                width: '100%',
                margin: '0 0 1rem 0'
            },
            parentRow: targetColumn ? targetColumn.rowId : null,
            columnIndex: targetColumn ? targetColumn.columnIndex : null
        };
        
        if (targetColumn) {
            // Add to specific column in a row
            const row = this.formRows.find(r => r.id === targetColumn.rowId);
            if (row && row.elements[targetColumn.columnIndex]) {
                row.elements[targetColumn.columnIndex].push(element);
                // Element added to column successfully
            } else {
                console.error('Row or column not found:', targetColumn);
            }
        } else {
            // Add as standalone element
            this.formElements.push(element);
        }
        
        this.renderForm();
        this.hideDropPlaceholder();
    }
    
    getDefaultLabel(type) {
        const labels = {
            text: 'Text Input',
            email: 'Email Address',
            password: 'Password',
            number: 'Number',
            tel: 'Phone Number',
            url: 'Website URL',
            textarea: 'Message',
            select: 'Select Option',
            radio: 'Choose One',
            checkbox: 'Select All That Apply',
            file: 'Upload File',
            date: 'Select Date',
            time: 'Select Time',
            submit: 'Submit',
            reset: 'Reset'
        };
        return labels[type] || 'Form Field';
    }
    
    getDefaultPlaceholder(type) {
        const placeholders = {
            text: 'Enter text here...',
            email: 'your@email.com',
            password: 'Enter password...',
            number: 'Enter number...',
            tel: '+1 (555) 123-4567',
            url: 'https://example.com',
            textarea: 'Enter your message here...',
            date: '',
            time: ''
        };
        return placeholders[type] || '';
    }
    
    getDefaultOptions(type) {
        const defaultOptions = {
            select: ['Please select', 'Option 1', 'Option 2', 'Option 3'],
            radio: ['Option 1', 'Option 2', 'Option 3'],
            checkbox: ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4']
        };
        return defaultOptions[type] || null;
    }
    
    renderForm() {
        const dropZone = document.getElementById('dropZone');
        const formHTML = this.generateFormHTML();
        dropZone.innerHTML = formHTML;
        
        // Add event listeners to form elements
        this.attachFormElementListeners();
        
        // Setup column drag and drop after rendering
        this.setupColumnDragAndDrop();
    }
    
    generateFormHTML() {
        if (this.formElements.length === 0 && this.formRows.length === 0) {
            return `
                <div class="drop-placeholder">
                    <i class="fas fa-mouse-pointer"></i>
                    <h3>Drag & Drop Form Elements Here</h3>
                    <p>Start building your form by dragging elements from the sidebar</p>
                </div>
            `;
        }
        
        const formTitle = document.getElementById('formTitle').value;
        let html = `<form class="generated-form" id="generatedForm">`;
        
        if (formTitle) {
            html += `<h2 class="form-title">${formTitle}</h2>`;
        }
        
        // Render standalone elements
        this.formElements.forEach(element => {
            html += this.generateElementHTML(element);
        });
        
        // Render rows with columns
        this.formRows.forEach(row => {
            html += this.generateRowHTML(row);
        });
        
        html += `</form>`;
        return html;
    }
    
    generateElementHTML(element, inColumn = false) {
        const isButton = element.type === 'submit' || element.type === 'reset';
        
        let html = `
            <div class="form-element ${inColumn ? 'in-column' : ''}" data-element-id="${element.id}">
                <div class="element-controls">
                    <button type="button" class="element-control-btn btn-edit" data-action="edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="element-control-btn btn-delete" data-action="delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
        `;
        
        if (!isButton) {
            html += `<div class="form-group">`;
            
            if (element.label) {
                html += `<label class="form-label" for="${element.id}">${element.label}${element.required ? ' *' : ''}</label>`;
            }
        }
        
        switch (element.type) {
            case 'textarea':
                html += `<textarea class="form-textarea" id="${element.id}" name="${element.id}" placeholder="${element.placeholder}"${element.required ? ' required' : ''}></textarea>`;
                break;
                
            case 'select':
                html += `<select class="form-select" id="${element.id}" name="${element.id}"${element.required ? ' required' : ''}>`;
                if (element.placeholder) {
                    html += `<option value="">${element.placeholder}</option>`;
                }
                if (element.options) {
                    element.options.forEach(option => {
                        html += `<option value="${option}">${option}</option>`;
                    });
                }
                html += `</select>`;
                break;
                
            case 'radio':
                html += `<div class="radio-group">`;
                if (element.options) {
                    element.options.forEach((option, index) => {
                        html += `
                            <div class="radio-item">
                                <input type="radio" id="${element.id}_${index}" name="${element.id}" value="${option}"${element.required && index === 0 ? ' required' : ''}>
                                <label for="${element.id}_${index}">${option}</label>
                            </div>
                        `;
                    });
                }
                html += `</div>`;
                break;
                
            case 'checkbox':
                if (element.options && element.options.length > 1) {
                    html += `<div class="checkbox-group">`;
                    element.options.forEach((option, index) => {
                        html += `
                            <div class="checkbox-item">
                                <input type="checkbox" id="${element.id}_${index}" name="${element.id}[]" value="${option}">
                                <label for="${element.id}_${index}">${option}</label>
                            </div>
                        `;
                    });
                    html += `</div>`;
                } else {
                    html += `
                        <div class="checkbox-item">
                            <input type="checkbox" id="${element.id}" name="${element.id}" value="yes"${element.required ? ' required' : ''}>
                            <label for="${element.id}">${element.options ? element.options[0] : 'Check this box'}</label>
                        </div>
                    `;
                }
                break;
                
            case 'submit':
            case 'reset':
                html += `<button type="${element.type}" class="form-button btn-${element.type}" id="${element.id}">${element.label}</button>`;
                break;
                
            default:
                html += `<input type="${element.type}" class="form-input" id="${element.id}" name="${element.id}" placeholder="${element.placeholder}"${element.required ? ' required' : ''}>`;
                break;
        }
        
        if (!isButton) {
            html += `</div>`;
        }
        
        html += `</div>`;
        
        return html;
    }
    
    generateRowHTML(row) {
        let html = `
            <div class="form-row ${row.type}" data-row-id="${row.id}">
                <div class="row-controls">
                    <button type="button" class="element-control-btn btn-edit" data-action="edit-row">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="element-control-btn btn-delete" data-action="delete-row">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
        `;
        
        // Generate columns
        for (let i = 0; i < row.columns; i++) {
            const columnElements = row.elements[i];
            html += `
                <div class="column-drop-zone ${columnElements.length > 0 ? 'has-elements' : ''}" 
                     data-row-id="${row.id}" 
                     data-column-index="${i}">
                    <div class="drop-hint">Drop elements here</div>
            `;
            
            // Add elements in this column
            columnElements.forEach(element => {
                html += this.generateElementHTML(element, true);
            });
            
            html += `</div>`;
        }
        
        html += `</div>`;
        return html;
    }
    
    attachFormElementListeners() {
        // Form element listeners
        document.querySelectorAll('.form-element').forEach(element => {
            element.addEventListener('click', (e) => {
                if (!e.target.closest('.element-controls')) {
                    this.selectElement(element.dataset.elementId);
                }
            });
        });
        
        // Row listeners
        document.querySelectorAll('.form-row').forEach(row => {
            row.addEventListener('click', (e) => {
                if (!e.target.closest('.row-controls') && !e.target.closest('.form-element')) {
                    this.selectRow(row.dataset.rowId);
                }
            });
        });
        
        // Control button listeners
        document.querySelectorAll('.element-control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.closest('.element-control-btn').dataset.action;
                
                if (action === 'edit' || action === 'delete') {
                    const elementId = e.target.closest('.form-element')?.dataset.elementId;
                    if (elementId) {
                        if (action === 'edit') {
                            this.editElement(elementId);
                        } else if (action === 'delete') {
                            this.deleteElement(elementId);
                        }
                    }
                } else if (action === 'edit-row' || action === 'delete-row') {
                    const rowId = e.target.closest('.form-row')?.dataset.rowId;
                    if (rowId) {
                        if (action === 'edit-row') {
                            this.editRow(rowId);
                        } else if (action === 'delete-row') {
                            this.deleteRow(rowId);
                        }
                    }
                }
            });
        });
        
        // Column drop zone listeners are handled by setupColumnDragAndDrop()
    }
    
    selectElement(elementId) {
        // Remove previous selections
        document.querySelectorAll('.form-element.selected, .form-row.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selection to current element
        const elementDiv = document.querySelector(`[data-element-id="${elementId}"]`);
        if (elementDiv) {
            elementDiv.classList.add('selected');
            
            // Find the element in standalone elements first
            let element = this.formElements.find(el => el.id === elementId);
            
            // If not found in standalone elements, search in row columns
            if (!element) {
                for (const row of this.formRows) {
                    for (const column of row.elements) {
                        element = column.find(el => el.id === elementId);
                        if (element) break;
                    }
                    if (element) break;
                }
            }
            
            if (element) {
                this.selectedElement = element;
                this.selectedRow = null; // Clear row selection
                this.showPropertiesPanel();
            }
        }
    }
    
    editElement(elementId) {
        this.selectElement(elementId);
    }
    
    deleteElement(elementId) {
        // Check if element is in a row
        let elementFound = false;
        
        // Remove from rows first
        this.formRows.forEach(row => {
            row.elements.forEach(column => {
                const index = column.findIndex(el => el.id === elementId);
                if (index !== -1) {
                    column.splice(index, 1);
                    elementFound = true;
                }
            });
        });
        
        // Remove from standalone elements if not found in rows
        if (!elementFound) {
            this.formElements = this.formElements.filter(el => el.id !== elementId);
        }
        
        this.renderForm();
        this.hidePropertiesPanel();
        
        // Check if we need to show placeholder
        const hasStandaloneElements = this.formElements.length > 0;
        const hasRowElements = this.formRows.some(row => 
            row.elements.some(column => column.length > 0)
        );
        
        if (!hasStandaloneElements && !hasRowElements) {
            this.showDropPlaceholder();
        }
    }
    
    selectRow(rowId) {
        // Remove previous selections
        document.querySelectorAll('.form-row.selected, .form-element.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selection to current row
        const rowDiv = document.querySelector(`[data-row-id="${rowId}"]`);
        if (rowDiv) {
            rowDiv.classList.add('selected');
            this.selectedRow = this.formRows.find(row => row.id === rowId);
            this.selectedElement = null;
            this.showPropertiesPanel();
        }
    }
    
    editRow(rowId) {
        this.selectRow(rowId);
    }
    
    deleteRow(rowId) {
        this.formRows = this.formRows.filter(row => row.id !== rowId);
        this.renderForm();
        this.hidePropertiesPanel();
        
        if (this.formElements.length === 0 && this.formRows.length === 0) {
            this.showDropPlaceholder();
        }
    }
    
    showPropertiesPanel() {
        const panel = document.getElementById('propertiesPanel');
        panel.classList.add('active');
        this.renderPropertiesPanel();
    }
    
    hidePropertiesPanel() {
        const panel = document.getElementById('propertiesPanel');
        panel.classList.remove('active');
        this.selectedElement = null;
    }
    
    renderPropertiesPanel() {
        const panelContent = document.getElementById('panelContent');
        
        if (!this.selectedElement && !this.selectedRow) {
            panelContent.innerHTML = `
                <div class="no-selection">
                    <i class="fas fa-mouse-pointer"></i>
                    <p>Select an element or row to edit its properties</p>
                </div>
            `;
            return;
        }
        
        // Handle row properties
        if (this.selectedRow) {
            this.renderRowProperties();
            return;
        }
        
        const element = this.selectedElement;
        const isButton = element.type === 'submit' || element.type === 'reset';
        
        let html = `
            <div class="property-group">
                <label class="property-label">Element Type</label>
                <input type="text" class="property-input" value="${element.type}" disabled>
            </div>
            
            <div class="property-group">
                <label class="property-label">${isButton ? 'Button Text' : 'Label'}</label>
                <input type="text" class="property-input" id="prop-label" value="${element.label}">
            </div>
        `;
        
        if (!isButton) {
            html += `
                <div class="property-group">
                    <label class="property-label">Placeholder</label>
                    <input type="text" class="property-input" id="prop-placeholder" value="${element.placeholder}">
                </div>
                
                <div class="property-group">
                    <label class="property-label">
                        <input type="checkbox" class="property-checkbox" id="prop-required" ${element.required ? 'checked' : ''}>
                        Required Field
                    </label>
                </div>
            `;
        }
        
        if (element.options) {
            const optionTypeName = {
                'select': 'Dropdown Options',
                'radio': 'Radio Button Options', 
                'checkbox': 'Checkbox Options'
            }[element.type] || 'Options';
            
            const optionHelp = {
                'select': 'First option will be the default placeholder',
                'radio': 'Users can select one option',
                'checkbox': 'Users can select multiple options'
            }[element.type] || '';
            
            html += `
                <div class="property-group">
                    <label class="property-label">${optionTypeName}</label>
                    ${optionHelp ? `<p class="property-help">${optionHelp}</p>` : ''}
                    <div class="options-container" id="optionsContainer">
            `;
            
            element.options.forEach((option, index) => {
                html += `
                    <div class="option-item" data-index="${index}">
                        <input type="text" class="property-input option-input" value="${option}" placeholder="Enter option text">
                        <button type="button" class="btn-small btn-delete-option" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            });
            
            html += `
                    </div>
                    <button type="button" class="btn btn-outline btn-add-option">
                        <i class="fas fa-plus"></i> Add Option
                    </button>
                </div>
            `;
        }
        
        html += `
            <div class="property-group">
                <button type="button" class="btn btn-primary" id="updateProperties">Update Element</button>
            </div>
        `;
        
        panelContent.innerHTML = html;
        
        // Add event listener for update button
        document.getElementById('updateProperties').addEventListener('click', () => this.updateElementProperties());
        
        // Add event listeners for option management
        this.setupOptionManagement();
    }
    
    renderRowProperties() {
        const panelContent = document.getElementById('panelContent');
        const row = this.selectedRow;
        
        let html = `
            <div class="property-group">
                <label class="property-label">Layout Type</label>
                <input type="text" class="property-input" value="${row.columns} Column Row" disabled>
            </div>
            
            <div class="property-group">
                <label class="property-label">Number of Columns</label>
                <select class="property-select" id="row-columns">
                    <option value="2" ${row.columns === 2 ? 'selected' : ''}>2 Columns</option>
                    <option value="3" ${row.columns === 3 ? 'selected' : ''}>3 Columns</option>
                    <option value="4" ${row.columns === 4 ? 'selected' : ''}>4 Columns</option>
                </select>
            </div>
            
            <div class="property-group">
                <label class="property-label">Column Content</label>
        `;
        
        for (let i = 0; i < row.columns; i++) {
            const columnElements = row.elements[i];
            html += `
                <div class="column-info">
                    <strong>Column ${i + 1}:</strong> ${columnElements.length} element(s)
                </div>
            `;
        }
        
        html += `
            </div>
            
            <div class="property-group">
                <button type="button" class="btn btn-primary" id="updateRowProperties">Update Row</button>
            </div>
        `;
        
        panelContent.innerHTML = html;
        
        // Add event listener for update button
        document.getElementById('updateRowProperties').addEventListener('click', () => this.updateRowProperties());
    }
    
    setupOptionManagement() {
        // Add option button
        const addOptionBtn = document.querySelector('.btn-add-option');
        if (addOptionBtn) {
            addOptionBtn.addEventListener('click', () => this.addOption());
        }
        
        // Delete option buttons
        document.querySelectorAll('.btn-delete-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.btn-delete-option').dataset.index);
                this.deleteOption(index);
            });
        });
        
        // Option input change listeners
        document.querySelectorAll('.option-input').forEach(input => {
            input.addEventListener('input', () => this.updateOptionsFromInputs());
        });
    }
    
    addOption() {
        if (!this.selectedElement || !this.selectedElement.options) return;
        
        this.selectedElement.options.push('New Option');
        this.renderPropertiesPanel();
        
        // Focus on the new option input
        setTimeout(() => {
            const inputs = document.querySelectorAll('.option-input');
            const lastInput = inputs[inputs.length - 1];
            if (lastInput) {
                lastInput.focus();
                lastInput.select();
            }
        }, 100);
    }
    
    deleteOption(index) {
        if (!this.selectedElement || !this.selectedElement.options) return;
        
        // Don't allow deleting if there's only one option
        if (this.selectedElement.options.length <= 1) {
            alert('You must have at least one option.');
            return;
        }
        
        this.selectedElement.options.splice(index, 1);
        this.renderPropertiesPanel();
        this.renderForm();
        
        // Keep the element selected
        setTimeout(() => {
            this.selectElement(this.selectedElement.id);
        }, 100);
    }
    
    updateOptionsFromInputs() {
        if (!this.selectedElement || !this.selectedElement.options) return;
        
        const inputs = document.querySelectorAll('.option-input');
        const newOptions = [];
        
        inputs.forEach(input => {
            const value = input.value.trim();
            if (value) {
                newOptions.push(value);
            }
        });
        
        if (newOptions.length > 0) {
            this.selectedElement.options = newOptions;
        }
    }
    
    updateElementProperties() {
        if (!this.selectedElement) return;
        
        const element = this.selectedElement;
        
        // Update basic properties
        const labelInput = document.getElementById('prop-label');
        if (labelInput) element.label = labelInput.value;
        
        const placeholderInput = document.getElementById('prop-placeholder');
        if (placeholderInput) element.placeholder = placeholderInput.value;
        
        const requiredInput = document.getElementById('prop-required');
        if (requiredInput) element.required = requiredInput.checked;
        
        // Update options from inputs (handled by updateOptionsFromInputs)
        this.updateOptionsFromInputs();
        
        // Re-render the form
        this.renderForm();
        
        // Keep the element selected
        setTimeout(() => {
            if (element && element.id) {
                this.selectElement(element.id);
            }
        }, 100);
    }
    
    updateRowProperties() {
        if (!this.selectedRow) return;
        
        const row = this.selectedRow;
        const newColumns = parseInt(document.getElementById('row-columns').value);
        
        if (newColumns !== row.columns) {
            // Adjust number of columns
            if (newColumns > row.columns) {
                // Add empty columns
                for (let i = row.columns; i < newColumns; i++) {
                    row.elements.push([]);
                }
            } else {
                // Merge elements from removed columns into the last remaining column
                const elementsToMove = [];
                for (let i = newColumns; i < row.columns; i++) {
                    elementsToMove.push(...row.elements[i]);
                }
                // Add moved elements to the last column
                if (elementsToMove.length > 0 && newColumns > 0) {
                    row.elements[newColumns - 1].push(...elementsToMove);
                }
                // Remove excess columns
                row.elements = row.elements.slice(0, newColumns);
            }
            
            row.columns = newColumns;
            row.type = `row-${newColumns}col`;
            
            // Re-render the form
            this.renderForm();
            
            // Keep the row selected
            setTimeout(() => {
                this.selectRow(row.id);
            }, 100);
        }
    }
    
    clearCanvas() {
        // Check if there's anything to clear
        const hasContent = this.formElements.length > 0 || this.formRows.length > 0;
        
        if (!hasContent) {
            return; // Nothing to clear
        }
        
        if (confirm('Are you sure you want to clear all form elements and rows?')) {
            this.formElements = [];
            this.formRows = [];
            this.selectedElement = null;
            this.selectedRow = null;
            this.elementCounter = 0;
            this.rowCounter = 0;
            this.renderForm();
            this.hidePropertiesPanel();
            this.showDropPlaceholder();
        }
    }
    
    showDropPlaceholder() {
        const dropZone = document.getElementById('dropZone');
        dropZone.innerHTML = `
            <div class="drop-placeholder">
                <i class="fas fa-mouse-pointer"></i>
                <h3>Drag & Drop Form Elements Here</h3>
                <p>Start building your form by dragging elements from the sidebar</p>
            </div>
        `;
    }
    
    hideDropPlaceholder() {
        const placeholder = document.querySelector('.drop-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
    }
    
    updateFormTitle() {
        this.renderForm();
    }
    
    showPreview() {
        const modal = document.getElementById('previewModal');
        const previewContent = document.getElementById('previewContent');
        
        previewContent.innerHTML = this.generateCleanHTML();
        modal.classList.add('active');
        
        // Add form submission handler for preview
        const previewForm = previewContent.querySelector('form');
        if (previewForm) {
            previewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('This is a preview. Form submission is disabled.');
            });
        }
    }
    
    hidePreview() {
        const modal = document.getElementById('previewModal');
        modal.classList.remove('active');
    }
    
    showCodeModal() {
        const modal = document.getElementById('codeModal');
        modal.classList.add('active');
        this.currentTab = 'html';
        this.updateCodeDisplay();
    }
    
    hideCodeModal() {
        const modal = document.getElementById('codeModal');
        modal.classList.remove('active');
    }
    
    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        this.updateCodeDisplay();
    }
    
    updateCodeDisplay() {
        const codeElement = document.getElementById('generatedCode');
        let code = '';
        
        switch (this.currentTab) {
            case 'html':
                code = this.generateCleanHTML();
                break;
            case 'css':
                code = this.generateCSS();
                break;
            case 'js':
                code = this.generateJS();
                break;
        }
        
        codeElement.textContent = code;
    }
    
    generateCleanHTML() {
        const formTitle = document.getElementById('formTitle').value;
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formTitle || 'Generated Form'}</title>
    <link rel="stylesheet" href="form-styles.css">
</head>
<body>
    <div class="form-container">
        <form class="generated-form" id="generatedForm" action="#" method="POST">`;
        
        if (formTitle) {
            html += `\n            <h2 class="form-title">${formTitle}</h2>`;
        }
        
        this.formElements.forEach(element => {
            html += '\n            ' + this.generateCleanElementHTML(element);
        });
        
        // Add rows
        this.formRows.forEach(row => {
            html += '\n            ' + this.generateCleanRowHTML(row);
        });
        
        html += `
        </form>
    </div>
    <script src="form-validation.js"></script>
</body>
</html>`;
        
        return html;
    }
    
    generateCleanElementHTML(element) {
        const isButton = element.type === 'submit' || element.type === 'reset';
        
        let html = '';
        
        if (!isButton) {
            html += `<div class="form-group">`;
            
            if (element.label) {
                html += `\n                <label class="form-label" for="${element.id}">${element.label}${element.required ? ' *' : ''}</label>`;
            }
        }
        
        switch (element.type) {
            case 'textarea':
                html += `\n                <textarea class="form-textarea" id="${element.id}" name="${element.id}" placeholder="${element.placeholder}"${element.required ? ' required' : ''}></textarea>`;
                break;
                
            case 'select':
                html += `\n                <select class="form-select" id="${element.id}" name="${element.id}"${element.required ? ' required' : ''}>`;
                if (element.placeholder) {
                    html += `\n                    <option value="">${element.placeholder}</option>`;
                }
                element.options.forEach(option => {
                    html += `\n                    <option value="${option}">${option}</option>`;
                });
                html += `\n                </select>`;
                break;
                
            case 'radio':
                html += `\n                <div class="radio-group">`;
                element.options.forEach((option, index) => {
                    html += `\n                    <div class="radio-item">
                        <input type="radio" id="${element.id}_${index}" name="${element.id}" value="${option}"${element.required && index === 0 ? ' required' : ''}>
                        <label for="${element.id}_${index}">${option}</label>
                    </div>`;
                });
                html += `\n                </div>`;
                break;
                
            case 'checkbox':
                if (element.options && element.options.length > 1) {
                    html += `\n                <div class="checkbox-group">`;
                    element.options.forEach((option, index) => {
                        html += `\n                    <div class="checkbox-item">
                        <input type="checkbox" id="${element.id}_${index}" name="${element.id}[]" value="${option}">
                        <label for="${element.id}_${index}">${option}</label>
                    </div>`;
                    });
                    html += `\n                </div>`;
                } else {
                    html += `\n                <div class="checkbox-item">
                    <input type="checkbox" id="${element.id}" name="${element.id}" value="yes"${element.required ? ' required' : ''}>
                    <label for="${element.id}">${element.options ? element.options[0] : 'Check this box'}</label>
                </div>`;
                }
                break;
                
            case 'submit':
            case 'reset':
                html += `<div class="form-group">
                <button type="${element.type}" class="form-button btn-${element.type}" id="${element.id}">${element.label}</button>
            </div>`;
                break;
                
            default:
                html += `\n                <input type="${element.type}" class="form-input" id="${element.id}" name="${element.id}" placeholder="${element.placeholder}"${element.required ? ' required' : ''}>`;
                break;
        }
        
        if (!isButton) {
            html += `\n            </div>`;
        }
        
        return html;
    }
    
    generateCleanRowHTML(row) {
        let html = `<div class="form-row ${row.type}">`;
        
        for (let i = 0; i < row.columns; i++) {
            const columnElements = row.elements[i];
            html += `\n                <div class="form-column">`;
            
            columnElements.forEach(element => {
                html += '\n                    ' + this.generateCleanElementHTML(element);
            });
            
            html += `\n                </div>`;
        }
        
        html += `\n            </div>`;
        return html;
    }
    
    generateCSS() {
        return `/* Generated Form Styles */
.form-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Row Layouts */
.form-row {
    display: grid;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.form-row.row-2col {
    grid-template-columns: 1fr 1fr;
}

.form-row.row-3col {
    grid-template-columns: 1fr 1fr 1fr;
}

.form-row.row-4col {
    grid-template-columns: 1fr 1fr 1fr 1fr;
}

.form-column {
    display: flex;
    flex-direction: column;
}

.form-title {
    text-align: center;
    color: #1e293b;
    margin-bottom: 2rem;
    font-weight: 700;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
}

.form-input,
.form-textarea,
.form-select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: all 0.2s;
    background: white;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
    resize: vertical;
    min-height: 100px;
}

.radio-group,
.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.radio-item,
.checkbox-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.radio-item input,
.checkbox-item input {
    width: auto;
    margin: 0;
}

.form-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
}

.btn-submit {
    background: #3b82f6;
    color: white;
}

.btn-submit:hover {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.btn-reset {
    background: #6b7280;
    color: white;
    margin-left: 0.5rem;
}

.btn-reset:hover {
    background: #4b5563;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(107, 114, 128, 0.25);
}

.form-error {
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.25rem;
}

.form-success {
    color: #10b981;
    font-size: 0.875rem;
    text-align: center;
    padding: 1rem;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 6px;
    margin-bottom: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    .form-row.row-2col,
    .form-row.row-3col,
    .form-row.row-4col {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .form-container {
        margin: 1rem;
        padding: 1.5rem;
    }
    
    .form-button {
        width: 100%;
        margin-left: 0;
        margin-bottom: 0.5rem;
    }
    
    .radio-group,
    .checkbox-group {
        gap: 0.75rem;
    }
    
    .form-row {
        gap: 0.75rem;
    }
}`;
    }
    
    generateJS() {
        return `// Generated Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('generatedForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            clearErrors();
            
            // Validate form
            if (validateForm()) {
                // Form is valid, you can submit it here
                showSuccess('Form submitted successfully!');
                
                // Example: Submit form data
                // submitFormData(new FormData(form));
            }
        });
    }
    
    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showError(field, 'This field is required');
                isValid = false;
            }
        });
        
        // Email validation
        const emailFields = form.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            if (field.value && !isValidEmail(field.value)) {
                showError(field, 'Please enter a valid email address');
                isValid = false;
            }
        });
        
        // Phone validation
        const phoneFields = form.querySelectorAll('input[type="tel"]');
        phoneFields.forEach(field => {
            if (field.value && !isValidPhone(field.value)) {
                showError(field, 'Please enter a valid phone number');
                isValid = false;
            }
        });
        
        // URL validation
        const urlFields = form.querySelectorAll('input[type="url"]');
        urlFields.forEach(field => {
            if (field.value && !isValidURL(field.value)) {
                showError(field, 'Please enter a valid URL');
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    function showError(field, message) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            const errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            errorElement.textContent = message;
            formGroup.appendChild(errorElement);
        }
        
        field.style.borderColor = '#ef4444';
    }
    
    function clearErrors() {
        // Remove error messages
        const errors = form.querySelectorAll('.form-error');
        errors.forEach(error => error.remove());
        
        // Reset field border colors
        const fields = form.querySelectorAll('.form-input, .form-textarea, .form-select');
        fields.forEach(field => {
            field.style.borderColor = '';
        });
        
        // Remove success message
        const successMessage = form.querySelector('.form-success');
        if (successMessage) {
            successMessage.remove();
        }
    }
    
    function showSuccess(message) {
        const successElement = document.createElement('div');
        successElement.className = 'form-success';
        successElement.textContent = message;
        form.insertBefore(successElement, form.firstChild);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
            successElement.remove();
        }, 5000);
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
    
    function isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    // Example function to submit form data
    function submitFormData(formData) {
        // Replace with your actual submission logic
        fetch('/submit-form', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            showSuccess('Form submitted successfully!');
        })
        .catch(error => {
            showError(form, 'There was an error submitting the form. Please try again.');
        });
    }
});`;
    }
    
    copyCode() {
        const codeElement = document.getElementById('generatedCode');
        const textArea = document.createElement('textarea');
        textArea.value = codeElement.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Show feedback
        const copyBtn = document.getElementById('copyCodeBtn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.background = '#10b981';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '#3b82f6';
        }, 2000);
    }
    
    exportForm() {
        const formData = {
            title: document.getElementById('formTitle').value,
            elements: this.formElements,
            created: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(formData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `form-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Optional: Import functionality
    importForm(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const formData = JSON.parse(e.target.result);
                this.formElements = formData.elements || [];
                document.getElementById('formTitle').value = formData.title || '';
                this.elementCounter = this.formElements.length;
                this.renderForm();
            } catch (error) {
                alert('Error importing form: Invalid file format');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the form builder when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.formBuilder = new FormBuilder();
});
