let databaseSchema = null;

// Function to handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    const fileNameDisplay = document.getElementById('fileName');
    fileNameDisplay.textContent = file.name;
    document.querySelector('.file-upload-label').classList.add('file-selected');
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const fileContent = e.target.result;
        
        try {
            const fileName = file.name.toLowerCase();
            let parsedData;
            
            if (fileName.endsWith('.json')) {
                parsedData = JSON.parse(fileContent);
                document.getElementById('schemaInput').value = JSON.stringify(parsedData, null, 2);
                showMessage('JSON file loaded successfully! Click "Generate Data Dictionary" to process.', 'success');
            } else if (fileName.endsWith('.xml')) {
                parsedData = parseXMLToJSON(fileContent);
                document.getElementById('schemaInput').value = JSON.stringify(parsedData, null, 2);
                showMessage('XML file loaded successfully! Click "Generate Data Dictionary" to process.', 'success');
            } else {
                parsedData = JSON.parse(fileContent);
                document.getElementById('schemaInput').value = JSON.stringify(parsedData, null, 2);
                showMessage('File loaded successfully! Click "Generate Data Dictionary" to process.', 'success');
            }
            
        } catch (error) {
            showError('Error reading file: ' + error.message + '. Please ensure the file is valid JSON or XML.');
        }
    };
    
    reader.onerror = function() {
        showError('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
}

// Function to parse XML to JSON format
function parseXMLToJSON(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error('Invalid XML format');
    }
    
    const result = {
        tables: [],
        relationships: []
    };
    
    const tables = xmlDoc.querySelectorAll('table');
    tables.forEach(tableNode => {
        const table = {
            name: tableNode.getAttribute('name') || tableNode.querySelector('name')?.textContent || '',
            comment: tableNode.getAttribute('comment') || tableNode.querySelector('comment')?.textContent || '',
            columns: []
        };
        
        const columns = tableNode.querySelectorAll('column');
        columns.forEach(colNode => {
            const column = {
                name: colNode.getAttribute('name') || colNode.querySelector('name')?.textContent || '',
                type: colNode.getAttribute('type') || colNode.querySelector('type')?.textContent || '',
                nullable: colNode.getAttribute('nullable') || colNode.querySelector('nullable')?.textContent || 'YES',
                key: colNode.getAttribute('key') || colNode.querySelector('key')?.textContent || '',
                default: colNode.getAttribute('default') || colNode.querySelector('default')?.textContent || null,
                extra: colNode.getAttribute('extra') || colNode.querySelector('extra')?.textContent || '',
                comment: colNode.getAttribute('comment') || colNode.querySelector('comment')?.textContent || ''
            };
            table.columns.push(column);
        });
        
        result.tables.push(table);
    });
    
    // Parse relationships
    const relationships = xmlDoc.querySelectorAll('relationship');
    relationships.forEach(relNode => {
        const relationship = {
            from: relNode.getAttribute('from') || relNode.querySelector('from')?.textContent || '',
            to: relNode.getAttribute('to') || relNode.querySelector('to')?.textContent || '',
            fromColumn: relNode.getAttribute('fromColumn') || relNode.querySelector('fromColumn')?.textContent || '',
            toColumn: relNode.getAttribute('toColumn') || relNode.querySelector('toColumn')?.textContent || '',
            type: relNode.getAttribute('type') || relNode.querySelector('type')?.textContent || 'many-to-one'
        };
        result.relationships.push(relationship);
    });
    
    return result;
}

// Function to switch between tabs
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    const clickedTab = Array.from(tabs).find(tab => 
        tab.textContent.toLowerCase().includes(tabName.toLowerCase())
    );
    if (clickedTab) {
        clickedTab.classList.add('active');
    }
    
    document.getElementById(tabName).classList.add('active');
}

// Function to load sample database schema
function loadSampleData() {
    const sampleSchema = {
        "tables": [
            {
                "name": "customers",
                "comment": "Stores customer information",
                "columns": [
                    {"name": "id", "type": "int(11)", "nullable": "NO", "key": "PRI", "default": null, "extra": "auto_increment", "comment": "Primary key"},
                    {"name": "first_name", "type": "varchar(100)", "nullable": "NO", "key": "", "default": null, "extra": "", "comment": "Customer first name"},
                    {"name": "last_name", "type": "varchar(100)", "nullable": "NO", "key": "", "default": null, "extra": "", "comment": "Customer last name"},
                    {"name": "email", "type": "varchar(255)", "nullable": "NO", "key": "UNI", "default": null, "extra": "", "comment": "Customer email address"},
                    {"name": "phone", "type": "varchar(20)", "nullable": "YES", "key": "", "default": null, "extra": "", "comment": "Customer phone number"},
                    {"name": "created_at", "type": "timestamp", "nullable": "NO", "key": "", "default": "CURRENT_TIMESTAMP", "extra": "", "comment": "Record creation timestamp"}
                ]
            },
            {
                "name": "orders",
                "comment": "Stores order information",
                "columns": [
                    {"name": "id", "type": "int(11)", "nullable": "NO", "key": "PRI", "default": null, "extra": "auto_increment", "comment": "Primary key"},
                    {"name": "customer_id", "type": "int(11)", "nullable": "NO", "key": "MUL", "default": null, "extra": "", "comment": "Foreign key to customers table"},
                    {"name": "order_date", "type": "datetime", "nullable": "NO", "key": "", "default": null, "extra": "", "comment": "Order placement date"},
                    {"name": "status", "type": "varchar(50)", "nullable": "NO", "key": "", "default": "pending", "extra": "", "comment": "Order status"},
                    {"name": "total_amount", "type": "decimal(10,2)", "nullable": "NO", "key": "", "default": null, "extra": "", "comment": "Total order amount"}
                ]
            },
            {
                "name": "products",
                "comment": "Stores product catalog",
                "columns": [
                    {"name": "id", "type": "int(11)", "nullable": "NO", "key": "PRI", "default": null, "extra": "auto_increment", "comment": "Primary key"},
                    {"name": "name", "type": "varchar(255)", "nullable": "NO", "key": "", "default": null, "extra": "", "comment": "Product name"},
                    {"name": "description", "type": "text", "nullable": "YES", "key": "", "default": null, "extra": "", "comment": "Product description"},
                    {"name": "price", "type": "decimal(10,2)", "nullable": "NO", "key": "", "default": null, "extra": "", "comment": "Product price"},
                    {"name": "category_id", "type": "int(11)", "nullable": "YES", "key": "MUL", "default": null, "extra": "", "comment": "Foreign key to categories table"},
                    {"name": "stock_quantity", "type": "int(11)", "nullable": "NO", "key": "", "default": "0", "extra": "", "comment": "Available stock quantity"}
                ]
            },
            {
                "name": "order_items",
                "comment": "Stores items within each order",
                "columns": [
                    {"name": "id", "type": "int(11)", "nullable": "NO", "key": "PRI", "default": null, "extra": "auto_increment", "comment": "Primary key"},
                    {"name": "order_id", "type": "int(11)", "nullable": "NO", "key": "MUL", "default": null, "extra": "", "comment": "Foreign key to orders table"},
                    {"name": "product_id", "type": "int(11)", "nullable": "NO", "key": "MUL", "default": null, "extra": "", "comment": "Foreign key to products table"},
                    {"name": "quantity", "type": "int(11)", "nullable": "NO", "key": "", "default": null, "extra": "", "comment": "Quantity ordered"},
                    {"name": "unit_price", "type": "decimal(10,2)", "nullable": "NO", "key": "", "default": null, "extra": "", "comment": "Price per unit at time of order"}
                ]
            },
            {
                "name": "categories",
                "comment": "Stores product categories",
                "columns": [
                    {"name": "id", "type": "int(11)", "nullable": "NO", "key": "PRI", "default": null, "extra": "auto_increment", "comment": "Primary key"},
                    {"name": "name", "type": "varchar(100)", "nullable": "NO", "key": "", "default": null, "extra": "", "comment": "Category name"},
                    {"name": "parent_id", "type": "int(11)", "nullable": "YES", "key": "MUL", "default": null, "extra": "", "comment": "Foreign key to parent category (self-referencing)"}
                ]
            }
        ],
        "relationships": [
            {"from": "orders", "to": "customers", "fromColumn": "customer_id", "toColumn": "id", "type": "many-to-one"},
            {"from": "order_items", "to": "orders", "fromColumn": "order_id", "toColumn": "id", "type": "many-to-one"},
            {"from": "order_items", "to": "products", "fromColumn": "product_id", "toColumn": "id", "type": "many-to-one"},
            {"from": "products", "to": "categories", "fromColumn": "category_id", "toColumn": "id", "type": "many-to-one"},
            {"from": "categories", "to": "categories", "fromColumn": "parent_id", "toColumn": "id", "type": "many-to-one"}
        ]
    };
    
    document.getElementById('schemaInput').value = JSON.stringify(sampleSchema, null, 2);
    
    switchTab('input');
    
    showMessage('Sample data loaded successfully! Click "Generate Data Dictionary" to process it.', 'success');
}

// Function to clear input textarea
function clearInput() {
    document.getElementById('schemaInput').value = '';
    document.getElementById('errorContainer').innerHTML = '';
    document.getElementById('fileUpload').value = '';
    document.getElementById('fileName').textContent = 'Choose a file or drag and drop here';
    document.querySelector('.file-upload-label').classList.remove('file-selected');
}

// Function to show error messages
function showError(message) {
    const errorHTML = `<div class="error">❌ ${message}</div>`;
    document.getElementById('errorContainer').innerHTML = errorHTML;
}

// Function to show success messages
function showMessage(message, type) {
    const messageHTML = `<div class="${type}">✓ ${message}</div>`;
    document.getElementById('errorContainer').innerHTML = messageHTML;
}

// Function to generate the data dictionary and diagram
function generateDictionary() {
    const schemaInput = document.getElementById('schemaInput').value.trim();
    
    document.getElementById('errorContainer').innerHTML = '';
    
    if (!schemaInput) {
        showError('Please enter a database schema or load sample data.');
        return;
    }
    
    try {
        databaseSchema = JSON.parse(schemaInput);
        
        if (!databaseSchema.tables || !Array.isArray(databaseSchema.tables)) {
            showError('Invalid schema format: "tables" array is required.');
            return;
        }
        
        generateDictionaryHTML();
        
        generateERDiagram();
        
        document.getElementById('dictionaryButtons').style.display = 'flex';
        
        switchTab('dictionary');
        
        showMessage('Data dictionary generated successfully!', 'success');
        
    } catch (error) {
        showError('Invalid JSON format: ' + error.message);
    }
}

// Function to generate the data dictionary HTML
function generateDictionaryHTML() {
    let html = '<div class="printable"><h2 style="color: #667eea; margin-bottom: 2rem;">📋 Database Data Dictionary</h2></div>';
    
    databaseSchema.tables.forEach(table => {
        html += `
            <div class="output-section">
                <h3>Table: ${table.name}</h3>
                ${table.comment ? `<p style="color: #6c757d; margin-bottom: 1rem;"><em>${table.comment}</em></p>` : ''}
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Column Name</th>
                                <th>Data Type</th>
                                <th>Nullable</th>
                                <th>Key</th>
                                <th>Default</th>
                                <th>Extra</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        table.columns.forEach(column => {
            html += `
                <tr>
                    <td><strong>${column.name}</strong></td>
                    <td>${column.type || 'N/A'}</td>
                    <td>${column.nullable || 'N/A'}</td>
                    <td>${column.key || '-'}</td>
                    <td>${column.default !== null ? column.default : 'NULL'}</td>
                    <td>${column.extra || '-'}</td>
                    <td>${column.comment || '-'}</td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });
    
    // Add relationships section if relationships exist
    if (databaseSchema.relationships && databaseSchema.relationships.length > 0) {
        html += `
            <div class="output-section">
                <h3>Table Relationships</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>From Table</th>
                                <th>From Column</th>
                                <th>To Table</th>
                                <th>To Column</th>
                                <th>Relationship Type</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        databaseSchema.relationships.forEach(rel => {
            html += `
                <tr>
                    <td><strong>${rel.from}</strong></td>
                    <td>${rel.fromColumn}</td>
                    <td><strong>${rel.to}</strong></td>
                    <td>${rel.toColumn}</td>
                    <td>${rel.type || 'N/A'}</td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    document.getElementById('dictionaryOutput').innerHTML = html;
}

// Function to generate the ER diagram using a force-directed layout approach
function generateERDiagram() {
    const tables = databaseSchema.tables;
    const relationships = databaseSchema.relationships || [];
    
    const canvasWidth = Math.max(1200, tables.length * 200);
    const canvasHeight = Math.max(800, tables.length * 150);
    
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.min(canvasWidth, canvasHeight) * 0.35;
    
    const tablePositions = {};
    tables.forEach((table, index) => {
        const angle = (2 * Math.PI * index) / tables.length - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        tablePositions[table.name] = {
            x: x,
            y: y,
            table: table
        };
    });
    
    let svg = `<svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">`;
    
    svg += `
    <defs>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
        
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
            <feOffset dx="0" dy="3" result="offsetblur"/>
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.25"/>
            </feComponentTransfer>
            <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
            <polygon points="0,0 10,5 0,10 2,5" fill="#e91e63" />
        </marker>
    </defs>`;
    
    // Draw relationships first (so they appear behind tables)
    relationships.forEach(rel => {
        const from = tablePositions[rel.from];
        const to = tablePositions[rel.to];
        
        if (!from || !to) return;
        
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const ndx = dx / distance;
        const ndy = dy / distance;
        
        const startX = from.x + ndx * 140;
        const startY = from.y + ndy * 100;
        const endX = to.x - ndx * 140;
        const endY = to.y - ndy * 100;
        
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const curve = 50;
        const cpX = midX + (endY - startY) / distance * curve;
        const cpY = midY - (endX - startX) / distance * curve;
        
        svg += `<path d="M ${startX},${startY} Q ${cpX},${cpY} ${endX},${endY}" 
                stroke="#e91e63" stroke-width="2" fill="none" 
                marker-end="url(#arrowhead)" opacity="0.7"/>`;
        
        svg += `<text x="${cpX}" y="${cpY - 10}" fill="#e91e63" 
                font-size="11" text-anchor="middle" font-weight="600">
                ${rel.type || 'relates'}
                </text>`;
    });
    
    // Draw tables
    Object.keys(tablePositions).forEach(tableName => {
        const pos = tablePositions[tableName];
        const table = pos.table;
        
        const tableWidth = 260;
        const headerHeight = 45;
        const rowHeight = 28;
        const tableHeight = headerHeight + (table.columns.length * rowHeight);
        
        const x = pos.x - tableWidth / 2;
        const y = pos.y - tableHeight / 2;
        
        svg += `<g filter="url(#shadow)">`;
        svg += `<rect x="${x}" y="${y}" width="${tableWidth}" height="${tableHeight}" 
                fill="white" stroke="#e0e0e0" stroke-width="2" rx="10"/>`;
        
        svg += `<rect x="${x}" y="${y}" width="${tableWidth}" height="${headerHeight}" 
                fill="url(#headerGrad)" rx="10"/>`;
        svg += `<rect x="${x}" y="${y + headerHeight - 10}" width="${tableWidth}" height="10" 
                fill="url(#headerGrad)"/>`;
        
        svg += `<text x="${x + tableWidth / 2}" y="${y + 28}" 
                fill="white" font-size="16" font-weight="bold" text-anchor="middle">
                ${tableName}
                </text>`;
        
        table.columns.forEach((col, idx) => {
            const rowY = y + headerHeight + (idx * rowHeight);
            
            if (idx % 2 === 0) {
                svg += `<rect x="${x}" y="${rowY}" width="${tableWidth}" height="${rowHeight}" 
                        fill="#f8f9fa" opacity="0.5"/>`;
            }
            
            let icon = '';
            let color = '#333';
            if (col.key === 'PRI') {
                icon = '🔑';
                color = '#f57c00';
            } else if (col.key === 'MUL' || col.key === 'FK') {
                icon = '🔗';
                color = '#1976d2';
            } else if (col.key === 'UNI') {
                icon = '⭐';
                color = '#7b1fa2';
            }
            
            svg += `<text x="${x + 15}" y="${rowY + 19}" 
                    fill="${color}" font-size="13" ${col.key ? 'font-weight="600"' : ''}>
                    ${icon} ${col.name}
                    </text>`;
            
            const typeText = col.type.length > 18 ? col.type.substring(0, 18) + '...' : col.type;
            svg += `<text x="${x + tableWidth - 15}" y="${rowY + 19}" 
                    fill="#757575" font-size="11" text-anchor="end" font-style="italic">
                    ${typeText}
                    </text>`;
        });
        
        svg += `</g>`;
    });
    
    svg += `</svg>`;
    
    const legend = `
        <div style="margin-top: 2rem; padding: 1.5rem; background: white; border-radius: 8px; border: 2px solid #e0e0e0;">
            <h4 style="margin-bottom: 1rem; color: #333;">🔖 Legend</h4>
            <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
                <div><span style="color: #f57c00; font-weight: bold;">🔑</span> Primary Key</div>
                <div><span style="color: #1976d2; font-weight: bold;">🔗</span> Foreign Key</div>
                <div><span style="color: #7b1fa2; font-weight: bold;">⭐</span> Unique Key</div>
                <div><span style="color: #e91e63; font-weight: bold;">→</span> Relationship</div>
            </div>
        </div>
    `;
    
    document.getElementById('diagramContainer').innerHTML = svg + legend;
}

// Function to export the data dictionary as HTML file
function exportAsHTML() {
    const dictionaryContent = document.getElementById('dictionaryOutput').innerHTML;
    const diagramContent = document.getElementById('diagramContainer').innerHTML;
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Data Dictionary</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 2rem;
            background: #f8f9fa;
            max-width: 1400px;
            margin: 0 auto;
        }
        h2, h3 {
            color: #667eea;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2rem;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
        }
        .output-section {
            margin-bottom: 3rem;
        }
        #diagramContainer {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 2rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }
    </style>
</head>
<body>
    <h1 style="color: #667eea; margin-bottom: 2rem;">📊 Database Documentation</h1>
    
    <div style="margin-bottom: 3rem;">
        <h2>📋 Data Dictionary</h2>
        ${dictionaryContent}
    </div>
    
    <div>
        <h2>🔗 Entity Relationship Diagram</h2>
        <div id="diagramContainer">
            ${diagramContent}
        </div>
    </div>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data_dictionary.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('✓ Data Dictionary exported as HTML successfully!');
}

// Function to export as PDF (using browser print functionality)
function exportAsPDF() {
    alert('📄 To export as PDF:\n\n1. The print dialog will open\n2. Select "Save as PDF" as the printer\n3. Adjust settings if needed\n4. Click Save');
    
    window.print();
}

// Function to download sample XML file
function downloadSampleXML() {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<database>
    <table name="customers" comment="Stores customer information">
        <column name="id" type="int(11)" nullable="NO" key="PRI" default="" extra="auto_increment" comment="Primary key"/>
        <column name="first_name" type="varchar(100)" nullable="NO" key="" default="" extra="" comment="Customer first name"/>
        <column name="last_name" type="varchar(100)" nullable="NO" key="" default="" extra="" comment="Customer last name"/>
        <column name="email" type="varchar(255)" nullable="NO" key="UNI" default="" extra="" comment="Customer email address"/>
        <column name="phone" type="varchar(20)" nullable="YES" key="" default="" extra="" comment="Customer phone number"/>
        <column name="created_at" type="timestamp" nullable="NO" key="" default="CURRENT_TIMESTAMP" extra="" comment="Record creation timestamp"/>
    </table>
    
    <table name="orders" comment="Stores order information">
        <column name="id" type="int(11)" nullable="NO" key="PRI" default="" extra="auto_increment" comment="Primary key"/>
        <column name="customer_id" type="int(11)" nullable="NO" key="MUL" default="" extra="" comment="Foreign key to customers table"/>
        <column name="order_date" type="datetime" nullable="NO" key="" default="" extra="" comment="Order placement date"/>
        <column name="status" type="varchar(50)" nullable="NO" key="" default="pending" extra="" comment="Order status"/>
        <column name="total_amount" type="decimal(10,2)" nullable="NO" key="" default="" extra="" comment="Total order amount"/>
    </table>
    
    <table name="products" comment="Stores product catalog">
        <column name="id" type="int(11)" nullable="NO" key="PRI" default="" extra="auto_increment" comment="Primary key"/>
        <column name="name" type="varchar(255)" nullable="NO" key="" default="" extra="" comment="Product name"/>
        <column name="description" type="text" nullable="YES" key="" default="" extra="" comment="Product description"/>
        <column name="price" type="decimal(10,2)" nullable="NO" key="" default="" extra="" comment="Product price"/>
        <column name="category_id" type="int(11)" nullable="YES" key="MUL" default="" extra="" comment="Foreign key to categories table"/>
        <column name="stock_quantity" type="int(11)" nullable="NO" key="" default="0" extra="" comment="Available stock quantity"/>
    </table>
    
    <relationship from="orders" to="customers" fromColumn="customer_id" toColumn="id" type="many-to-one"/>
    <relationship from="products" to="categories" fromColumn="category_id" toColumn="id" type="many-to-one"/>
</database>`;
    
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_schema.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showMessage('Sample XML file downloaded! You can modify it and upload to test the tool.', 'success');
}
function adjustLayoutHeight() {
  try {
    const root = document.documentElement;
    const topbarH = getComputedStyle(root).getPropertyValue('--topbar-h') || '72px';
    const footH = getComputedStyle(root).getPropertyValue('--foot-h') || '48px';
    const layout = document.querySelector('.layout');
    if (layout) {
      layout.style.height = `calc(100vh - ${topbarH} - ${footH})`;
    }
  } catch (e) {
    console.warn('adjustLayoutHeight failed', e);
  }
}
window.addEventListener('resize', adjustLayoutHeight);
window.addEventListener('orientationchange', adjustLayoutHeight);
document.addEventListener('DOMContentLoaded', () => {
  adjustLayoutHeight();
  if (typeof applyZoom === 'function') applyZoom();
});
