let folders = {};
let currentFolder = null;
let rotationInterval = null;
let scanner = null;
let scannerMode = 'add'; // 'add' o 'createFolder'

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
        
        // Contenedor principal del QR
        const qrContainer = document.createElement('div');
        qrContainer.className = 'qr-container';
        qrContainer.onclick = () => openFolder(folderId);
        
        const qrDiv = document.createElement('div');
        new QRCode(qrDiv, {
            text: folderId,
            width: 128,
            height: 128
        });
        
        const label = document.createElement('div');
        label.className = 'qr-label';
        label.textContent = folderId;
        
        // Botón eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`¿Deseas eliminar la carpeta ${folderId}?`)) {
                deleteFolder(folderId);
            }
        };
        
        qrContainer.appendChild(qrDiv);
        qrContainer.appendChild(label);
        div.appendChild(qrContainer);
        div.appendChild(deleteBtn);
        grid.appendChild(div);
    });
}

// Gestión de carpetas
function showAddFolderDialog() {
    scannerMode = 'createFolder';
    startScanner();
}

function createNewFolder(scannedFolderId) {
    if (folders[scannedFolderId]) {
        alert('Esta carpeta ya existe');
        return;
    }
    folders[scannedFolderId] = {
        items: []
    };
    saveData();
    renderFolders();
}

function deleteFolder(folderId) {
    delete folders[folderId];
    saveData();
    renderFolders();
}

function openFolder(folderId) {
    currentFolder = folderId;
    document.getElementById('mainView').classList.add('hidden');
    document.getElementById('folderView').classList.remove('hidden');
    document.getElementById('viewTitle').textContent = 'Ventana dentro de carpeta';
    startRotation();
}

// Rotación de datos
function startRotation() {
    stopRotation();
    
    const folder = folders[currentFolder];
    let currentIndex = -1;
    const qrDisplay = document.getElementById('qrDisplay');
    
    function showNext() {
        currentIndex = (currentIndex + 1) % (folder.items.length * 2);
        qrDisplay.innerHTML = '';
        
        // Crear contenedor blanco para el QR
        const qrContainer = document.createElement('div');
        qrContainer.className = 'qr-display-container';
        
        if (currentIndex % 2 === 0) {
            // Mostrar QR de la carpeta
            new QRCode(qrContainer, {
                text: currentFolder,
                width: 256,
                height: 256
            });
            const label = document.createElement('div');
            label.className = 'qr-label';
            label.textContent = currentFolder;
            qrContainer.appendChild(label);
        } else {
            // Mostrar dato
            const itemIndex = Math.floor(currentIndex / 2);
            new QRCode(qrContainer, {
                text: folder.items[itemIndex],
                width: 256,
                height: 256
            });
            const label = document.createElement('div');
            label.className = 'qr-label';
            label.textContent = folder.items[itemIndex];
            qrContainer.appendChild(label);
        }
        
        qrDisplay.appendChild(qrContainer);
    }
    
    showNext();
    rotationInterval = setInterval(showNext, 3000);
}

// Scanner
function startScanner() {
    document.getElementById('scannerView').classList.remove('hidden');
    scanner = new Html5QrcodeScanner("reader", { 
        fps: 10,
        qrbox: {width: 250, height: 250}
    });
    
    scanner.render((decodedText) => {
        if (scannerMode === 'createFolder') {
            createNewFolder(decodedText);
        } else {
            handleScan(decodedText);
        }
        stopScanner();
    });
}

function stopScanner() {
    if (scanner) {
        scanner.clear();
        scanner = null;
    }
    document.getElementById('scannerView').classList.add('hidden');
    scannerMode = 'add';
}

function handleScan(scannedData) {
    if (!folders[currentFolder].items.includes(scannedData)) {
        folders[currentFolder].items.push(scannedData);
        saveData();
        stopRotation();
        startRotation();
    }
}

function stopRotation() {
    if (rotationInterval) {
        clearInterval(rotationInterval);
        rotationInterval = null;
    }
}

// Event Listeners
window.addEventListener('beforeunload', () => {
    stopRotation();
    stopScanner();
});
