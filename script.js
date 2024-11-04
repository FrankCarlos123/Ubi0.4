let folders = {};
let currentFolder = null;
let rotationInterval = null;
let scanner = null;
let scannerMode = 'add';
let longPressTimer = null;

// Inicializar la aplicación
window.onload = function() {
    loadData();
    renderFolders();
};

// Gestión de datos
function loadData() {
    const savedData = localStorage.getItem('folders');
    if (savedData) {
        folders = JSON.parse(savedData);
    }
}

function saveData() {
    localStorage.setItem('folders', JSON.stringify(folders));
}

// Renderizado de carpetas
function renderFolders() {
    const grid = document.getElementById('qrGrid');
    grid.innerHTML = '';
    
    Object.keys(folders).forEach(folderId => {
        const div = document.createElement('div');
        div.className = 'qr-item';
        
        // Contenedor para el QR y la etiqueta
        const contentDiv = document.createElement('div');
        contentDiv.className = 'qr-content';
        
        const qrDiv = document.createElement('div');
        new QRCode(qrDiv, {
            text: folderId,
            width: 128,
            height: 128
        });
        
        const label = document.createElement('div');
        label.className = 'qr-label';
        label.textContent = folderId;
        
        contentDiv.appendChild(qrDiv);
        contentDiv.appendChild(label);
        
        // Botón de eliminar (inicialmente oculto)
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn hidden';
        deleteBtn.innerHTML = '🗑️ Eliminar';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`¿Estás seguro de que deseas eliminar la carpeta ${folderId}?`)) {
                deleteFolder(folderId);
            }
        };
        
        // Eventos táctiles y de mouse
        let pressTimer;
        let isLongPress = false;

        // Eventos táctiles
        contentDiv.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                isLongPress = true;
                showDeleteButton(deleteBtn);
            }, 800);
        });

        contentDiv.addEventListener('touchend', (e) => {
            clearTimeout(pressTimer);
            if (!isLongPress) {
                openFolder(folderId);
            }
            isLongPress = false;
        });

        // Eventos de mouse
        contentDiv.addEventListener('mousedown', (e) => {
            pressTimer = setTimeout(() => {
                isLongPress = true;
                showDeleteButton(deleteBtn);
            }, 800);
        });

        contentDiv.addEventListener('mouseup', (e) => {
            clearTimeout(pressTimer);
            if (!isLongPress) {
                openFolder(folderId);
            }
            isLongPress = false;
        });

        // Prevenir comportamiento por defecto
        contentDiv.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        div.appendChild(contentDiv);
        div.appendChild(deleteBtn);
        grid.appendChild(div);
    });
}

function showDeleteButton(deleteBtn) {
    // Ocultar todos los botones de eliminar primero
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.classList.add('hidden');
    });
    // Mostrar el botón actual
    deleteBtn.classList.remove('hidden');
}

function deleteFolder(folderId) {
    delete folders[folderId];
    saveData();
    renderFolders();
}

// Resto del código anterior...
[El resto del código se mantiene igual]