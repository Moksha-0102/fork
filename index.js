const alertIcons = {
    success: `<svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    info: `<svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    warning: `<svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
};

function showCustomAlert(title, message, type = 'info') {
    const overlay = document.createElement('div');
    overlay.className = 'premium-overlay';
    
    overlay.innerHTML = `
        <div class="custom-alert-box">
            <div class="custom-alert-icon" style="color: var(--text-main); margin-bottom: 20px;">
                ${alertIcons[type] || alertIcons.info}
            </div>
            <h3>${title}</h3>
            <p>${message}</p>
            <button class="custom-alert-btn">Got it</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    const btn = overlay.querySelector('.custom-alert-btn');
    btn.focus();
    
    const close = () => {
        overlay.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => document.body.removeChild(overlay), 300);
    };
    
    btn.addEventListener('click', close);
}


document.addEventListener('click', function(event) {
    
    const forkBtn = event.target.closest('.fork-btn');
    if (forkBtn) {
        saveStateToHistory();
        const parentNode = forkBtn.closest('.node');
        parentNode.classList.remove('collapsed');
        const childrenContainer = parentNode.querySelector('.children');
        spawnBranch(childrenContainer);
    }
    
    const deleteBtn = event.target.closest('.delete-btn');
    if (deleteBtn) {
        const parentNode = deleteBtn.closest('.node');
        if (parentNode.id !== 'root-node') {
            saveStateToHistory();
            parentNode.remove(); 
            saveTree();
        }
    }

    const collapseBtn = event.target.closest('.collapse-btn');
    if (collapseBtn){
        const parentNode = collapseBtn.closest('.node');
        parentNode.classList.toggle('collapsed');
        saveTree();
    }
});


document.addEventListener('keydown', function(event) {

   if (event.ctrlKey || event.metaKey){
        if (event.key === '=' || event.key === '+'){
            event.preventDefault();
            setZoom(zoomLevel + 0.1);
            return;
        }

        if (event.key === '-'){
            event.preventDefault();
            setZoom(zoomLevel - 0.1);
            return;
        }

        if (event.key === '0'){
            event.preventDefault();
            document.getElementById('recenter-btn').click();
            return;
        }
    }
    
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
            redo();
        } else {
            undo();
        }
        return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
        return;
    }

    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'f'){
        event.preventDefault();
        toggleFocusMode();
        return;
    }

    if (event.target.tagName.toLowerCase() === 'textarea') {
        const activeTextarea = event.target;
        const currentNode = activeTextarea.closest('.node');
        
        if ((event.ctrlKey || event.metaKey) && (event.key === 'Enter')) {
            event.preventDefault();
            saveStateToHistory();
            currentNode.classList.remove('collapsed');
            const childrenContainer = currentNode.querySelector('.children');
            spawnBranch(childrenContainer);
            return;
        }

        if((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b'){
            event.preventDefault();
            saveStateToHistory();
            const parentChildrenContainer = currentNode.parentElement;

            if (parentChildrenContainer && parentChildrenContainer.classList.contains('children')){
                spawnBranch(parentChildrenContainer);
            } else {
                const childrenContainer = currentNode.querySelector('.children');
                spawnBranch(childrenContainer);
            }
            return;
        }

        if ((event.ctrlKey || event.metaKey) && (event.key === 'Delete' || event.key === 'Backspace')) {
            event.preventDefault();
            if (currentNode.id !== 'root-node') {
                saveStateToHistory();
                
                const nextSibling = currentNode.nextElementSibling;
                const prevSibling = currentNode.previousElementSibling;
                const parentNode = currentNode.parentElement.closest('.node');

                if (nextSibling && nextSibling.classList.contains('node')) {
                    focusAndCenter(nextSibling.querySelector('textarea'));
                } 
                else if (prevSibling && prevSibling.classList.contains('node')) {
                    focusAndCenter(prevSibling.querySelector('textarea'));
                } 
                else if (parentNode) {
                    focusAndCenter(parentNode.querySelector('textarea'));
                }

                currentNode.remove();
                saveTree();
            }
            return;
        }

        if (event.ctrlKey || event.metaKey) {
            
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                const parentChildrenContainer = currentNode.parentElement;
                if (parentChildrenContainer && parentChildrenContainer.classList.contains('children')) {
                    const parentNode = parentChildrenContainer.closest('.node');
                    if (parentNode) {
                        focusAndCenter(parentNode.querySelector('textarea'));
                    }
                }
            }
            else if (event.key === 'ArrowDown') {
                event.preventDefault();
                const childrenContainer = currentNode.querySelector('.children');
                const firstChildNode = childrenContainer ? childrenContainer.querySelector('.node') : null;
                if (firstChildNode) {
                    focusAndCenter(firstChildNode.querySelector('textarea'));
                }
            }
            else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                const prevSiblingNode = currentNode.previousElementSibling;
                if (prevSiblingNode && prevSiblingNode.classList.contains('node')) {
                    focusAndCenter(prevSiblingNode.querySelector('textarea'));
                }
            }
            else if (event.key === 'ArrowRight') {
                event.preventDefault();
                const nextSiblingNode = currentNode.nextElementSibling;
                if (nextSiblingNode && nextSiblingNode.classList.contains('node')) {
                    focusAndCenter(nextSiblingNode.querySelector('textarea'));
                }
            }
        }
    }
});



function spawnBranch(container){
    const newNode = document.createElement('div');
    newNode.className = 'node';

    newNode.innerHTML = `
        <div class="node-card">
            <button class="delete-btn" title="Delete branch">×</button>
            <textarea placeholder="Branch your logic here..."></textarea>
            <button class="fork-btn">⑂ Fork()</button>
            
            <button class="collapse-btn" title="Fold/Unfold Branch">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
        </div>
        <div class="children"></div>
    `;

    container.appendChild(newNode);

    const newTextArea = newNode.querySelector('textarea');
    focusAndCenter(newTextArea);
    saveTree();
}



/*Zoom*/


function focusAndCenter(textarea){
    textarea.focus({preventScroll: true});

    setTimeout(() => {
        const card = textarea.closest('.node-card');
        const rect = card.getBoundingClientRect();
        const elementCenterX = rect.left + rect.width / 2;
        const elementCenterY = rect.top + rect.height / 2;
        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;
        
        panX += (screenCenterX - elementCenterX)
        panY += (screenCenterY - elementCenterY);

        canvas.style.transition = 'transform 0.2s ease-out';
        updateCanvas();

        setTimeout(() => {
            canvas.style.transition = 'none';
        }, 200);
    }, 10)
}


let zoomLevel = 1;
let panX = (window.innerWidth / 2) - 50000;
let panY = 0;
let isPanning = false;
let startX = 0;
let startY = 0;

const canvas = document.getElementById('canvas');
const zoomText = document.getElementById('zoom-level');

function updateCanvas(){
    canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
    zoomText.innerText = `${Math.round(zoomLevel * 100)}%`
}

updateCanvas();

document.addEventListener('mousedown', function(event) {
    if (
        event.target.closest('.node-card') || 
        event.target.closest('.bottom-right-controls') ||
        event.target.closest('.bottom-left-hud') ||
        event.target.closest('.bottom-left-controls') ||
        event.target.closest('.modal-overlay') ||
        event.target.closest('.splash-screen')
    ) {
        return;
    }

    isPanning = true;
    startX = event.clientX - panX;
    startY = event.clientY - panY;
    document.body.classList.add('is-panning');
});

document.addEventListener('mousemove', function(event) {
    if (!isPanning) return;
    event.preventDefault();
    panX = event.clientX - startX;
    panY = event.clientY - startY;
    updateCanvas();
})

document.addEventListener('mouseup', function() {
    isPanning = false;
    document.body.classList.remove('is-panning');
});

function setZoom(newZoom) {
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    const canvasX = (screenCenterX - panX) / zoomLevel;
    const canvasY = (screenCenterY - panY) / zoomLevel;

    zoomLevel = Math.max(0.2, Math.min(newZoom, 2));
    panX = screenCenterX - (canvasX * zoomLevel);
    panY = screenCenterY - (canvasY * zoomLevel);

    updateCanvas();
}

document.getElementById('recenter-btn').addEventListener('click', () => {
    const rootCard = document.querySelector('#root-node > .node-card');
    const rect = rootCard.getBoundingClientRect();
    const currentScreenX = rect.left + rect.width / 2;
    const currentScreenY = rect.top + rect.height / 2;
    const localX = (currentScreenX - panX) / zoomLevel;
    const localY = (currentScreenY - panY) / zoomLevel;
    
    zoomLevel = 1;
    
    panX = (window.innerWidth / 2) - localX;
    panY = (window.innerHeight * 0.25) - localY;

    canvas.style.transition = 'transform 0.4s ease-out';
    updateCanvas();

    setTimeout(() => {
        canvas.style.transition = 'none';
    }, 400);
});

document.getElementById('zoom-in').addEventListener('click', () => {
    setZoom(zoomLevel + 0.1);
});

document.getElementById('zoom-out').addEventListener('click', () => {
    setZoom(zoomLevel - 0.1);
})

document.addEventListener('wheel', function(event) {
    if(event.ctrlKey || event.metaKey){
        event.preventDefault();
        const zoomChange = event.deltaY > 0 ? -0.1 : 0.1;
        setZoom(zoomLevel + zoomChange)
    }

    else {
        panY -= event.deltaY;
        panX -= event.deltaX;
    }
}, {passive: false});

/*End Zoom*/


document.addEventListener('input', function(event) {
    if(event.target.tagName.toLowerCase() === 'textarea'){
        event.target.textContent = event.target.value;
        autoResize(event.target);
        saveTree();
    }
});

function autoResize(textarea) {
    textarea.style.height = '100px';
    textarea.style.height = textarea.scrollHeight + 'px';
}


function saveTree(){
    const canvasContent = document.getElementById('canvas').innerHTML;
    localStorage.setItem('forkTreeData', canvasContent);
}

function startTypewriter(elementId, text, speed){
    const element = document.getElementById(elementId);
    if(!element) return;

    element.innerHTML = '';
    let i = 0;

    function type(){
        if(i < text.length){
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    setTimeout(type, 200);
}



function loadTree() {
    const savedData = localStorage.getItem('forkTreeData');
    const skipSplash = localStorage.getItem('forkSkipSplash'); 
    const canvasEl = document.getElementById('canvas');
    const splashScreen = document.getElementById('splash-screen');

    if (skipSplash === 'true') {
        if (splashScreen) splashScreen.style.display = 'none';
    } else {
        if (splashScreen) {
            splashScreen.classList.remove('hidden');
            splashScreen.style.display = 'flex';
            startTypewriter('typewriter-text', 'Break out of the document.', 75);
        }
    }

    if (savedData) {
        canvasEl.innerHTML = savedData;
        const textareas = canvasEl.querySelectorAll('textarea');
        textareas.forEach(ta => {
            ta.value = ta.textContent;
            autoResize(ta);
        });
    } else {}

    panX = (window.innerWidth / 2) - 50000;
    panY = 150;
    updateCanvas();
    
    setTimeout(() => {
        canvasEl.classList.add('loaded');
        
        if (!savedData) {
            const rootTextArea = canvasEl.querySelector('textarea');
            if (rootTextArea) rootTextArea.focus({ preventScroll: true });
        }
    }, 50);
}

loadTree();



/*Export engine*/

const exportToggle = document.getElementById('export-toggle');
const exportDropdown = document.getElementById('export-dropdown');

exportToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    exportDropdown.classList.toggle('hidden');
});

document.addEventListener('click', () => {
    exportDropdown.classList.add('hidden');
});

function parseToMarkdown(node, depth = 0){
    let result = '';
    const card = node.querySelector(':scope > .node-card');
    const childrenContainer = node.querySelector(':scope > .children');

    if (card){
        const textarea = card.querySelector('textarea');
        if(textarea && textarea.value.trim() !== ''){
            let textValue = textarea.value.replace(/\n/g, ' ').trim();
            result += "  ".repeat(depth) + '- ' + textValue + '\n';
        }
    }

    if(childrenContainer){
        const childNodes = childrenContainer.querySelectorAll(':scope > .node');
        childNodes.forEach(child => {
            result += parseToMarkdown(child, depth + 1);
        });
    }
    return result;
}

function parseToJson(node) {
    let obj = {};
    const card = node.querySelector(':scope > .node-card');
    const childrenContainer = node.querySelector(':scope > .children');

    if (card) {
        const textarea = card.querySelector('textarea');
        if (textarea){
            obj.thought = textarea.value.trim();
        }
    }

    if (childrenContainer){
        const childNodes = childrenContainer.querySelectorAll(':scope > .node');
        if(childNodes.length > 0){
            obj.branches = [];
            childNodes.forEach(child => {
                obj.branches.push(parseToJson(child));
            });
        }
    } 
    return obj;
}

document.getElementById('export-md').addEventListener('click', () => {
    const rootNode = document.getElementById('root-node');
    const mdData = parseToMarkdown(rootNode, 0);
    navigator.clipboard.writeText(mdData).then(() => {
        showCustomAlert('Copied to Clipboard', 'Your logic tree has been successfully exported to Markdown.', 'success');
    });
});

document.getElementById('export-json').addEventListener('click', () => {
    const rootNode = document.getElementById('root-node');
    const jsonData = JSON.stringify(parseToJson(rootNode), null, 4);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "fork_logic_tree.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showCustomAlert('JSON Exported', 'Your data structure has been saved to your downloads folder.', 'success');
});

async function captureAndExport(format) {
    const loader = document.createElement('div');
    loader.className = 'premium-overlay';
    loader.innerHTML = `
        <div class="orbital-spinner">
            <div class="orbital-ring"></div>
            <div class="orbital-ring"></div>
            <div class="orbital-ring"></div>
        </div>
        <div class="loader-status" id="loader-text">Preparing canvas...</div>
    `;
    document.body.appendChild(loader);

    const statusText = document.getElementById('loader-text');
    const texts = ['Freezing DOM layout...', 'Processing spatial math...', 'Generating vector shapes...', 'Finalizing binary blob...'];
    let textIdx = 0;
    const textInterval = setInterval(() => {
        if (textIdx < texts.length) {
            statusText.innerText = texts[textIdx];
            textIdx++;
        }
    }, 600);

    await new Promise(r => setTimeout(r, 100));

    const originalCanvas = document.getElementById('canvas');
    const clonedCanvas = originalCanvas.cloneNode(true);
    clonedCanvas.querySelectorAll('.fork-btn, .delete-btn, .collapse-btn').forEach(btn => btn.style.display = 'none');
    
    const currentBgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim() || '#fafafa';
    Object.assign(clonedCanvas.style, {
        width: 'max-content', height: 'max-content',
        padding: '80px', transform: 'none', transition: 'none',
        position: 'absolute', left: '0', top: '0',
        backgroundColor: currentBgColor,
        backgroundImage: 'radial-gradient(var(--bg-dots) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
    });

    const originalTextareas = originalCanvas.querySelectorAll('textarea');
    const clonedTextareas = clonedCanvas.querySelectorAll('textarea');
    originalTextareas.forEach((ta, index) => {
        clonedTextareas[index].textContent = ta.value;
        clonedTextareas[index].style.height = ta.style.height || ta.scrollHeight + 'px';
    });

    const exportFrame = document.createElement('div');
    Object.assign(exportFrame.style, { 
        position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
        background: currentBgColor, overflow: 'auto', zIndex: '-9999'
    });
    exportFrame.appendChild(clonedCanvas);
    document.body.appendChild(exportFrame);

    await new Promise(r => setTimeout(r, 400));

    try {
        const exportWidth = clonedCanvas.scrollWidth;
        const exportHeight = clonedCanvas.scrollHeight;

        if (format === 'png') {
            const blob = await htmlToImage.toBlob(clonedCanvas, { 
                width: exportWidth, height: exportHeight, backgroundColor: currentBgColor,
                style: { margin: 0, transform: 'none' }
            });
            if (!blob) throw new Error("Image engine failed to generate Blob.");
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'fork_logic_tree.png';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        } 
        else if (format === 'svg') {
            const dataUrl = await htmlToImage.toSvg(clonedCanvas, { 
                width: exportWidth, height: exportHeight, backgroundColor: currentBgColor,
                style: { margin: 0, transform: 'none' } 
            });
            
            const blob = new Blob([decodeURIComponent(dataUrl.split(',')[1])], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'fork_logic_tree.svg';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            showCustomAlert('SVG Export Complete', 'SVGs are raw vector files. If it looks broken in your browser, drag it directly into Figma or Illustrator to view it correctly.', 'info');        }
    } catch (err) {
        console.error("Export Error:", err);
        showCustomAlert('Export Failed', 'Something went wrong during the rendering process. Please try again.', 'warning');} finally {
        clearInterval(textInterval);
        loader.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => document.body.removeChild(loader), 300);
        document.body.removeChild(exportFrame);
    }
}

const btnPng = document.getElementById('export-png');
const btnSvg = document.getElementById('export-svg');

btnPng.replaceWith(btnPng.cloneNode(true));
btnSvg.replaceWith(btnSvg.cloneNode(true));

document.getElementById('export-png').addEventListener('click', () => captureAndExport('png'));
document.getElementById('export-svg').addEventListener('click', () => captureAndExport('svg'));

/*Undo Engine*/

const undoHistory = [];
let redoHistory = [];
const MAX_HISTORY = 50;

function updateHistoryButtons (){
    document.getElementById('undo-btn').disabled = undoHistory.length === 0;
    document.getElementById('redo-btn').disabled = redoHistory.length === 0;
}

function saveStateToHistory() {
    const currentState = document.getElementById('canvas').innerHTML;
    undoHistory.push(currentState);

    if (undoHistory.length > MAX_HISTORY){
        undoHistory.shift()
    }

    redoHistory = [];
    updateHistoryButtons();
}

function undo(){
    if (undoHistory.length > 0){
        redoHistory.push(document.getElementById('canvas').innerHTML);

        const previousState = undoHistory.pop();
        document.getElementById('canvas').innerHTML = previousState;

        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(ta => autoResize(ta));

        saveTree();
        updateHistoryButtons();
    }
}

function redo(){
    if (redoHistory.length > 0){
        undoHistory.push(document.getElementById('canvas').innerHTML);
        const nextState = redoHistory.pop();
        document.getElementById('canvas').innerHTML = nextState;
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(ta => autoResize(ta));

        saveTree();
        updateHistoryButtons();
    }
}

document.getElementById('undo-btn').addEventListener('click', undo);
document.getElementById('redo-btn').addEventListener('click', redo);




/*Focus Mode*/

const focusToggleBtn = document.getElementById('focus-toggle');
let focusModeActive = false;

function toggleFocusMode(){
    focusModeActive = !focusModeActive;
    document.body.classList.toggle('focus-mode-active', focusModeActive);
    focusToggleBtn.classList.toggle('active', focusModeActive);
}

focusToggleBtn.addEventListener('click', toggleFocusMode);

document.addEventListener('focusin', function(event) {
    if (event.target.tagName.toLowerCase() === 'textarea'){
        document.querySelectorAll('.focused-node').forEach(node => {
            node.classList.remove('focused-node');
        });

        const currentNode = event.target.closest('.node');
        if (currentNode){
            currentNode.classList.add('focused-node');
        }
    }
});

/*Dark Mode*/

const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

let currentTheme = localStorage.getItem('forkTheme') || 'light';
applyTheme(currentTheme);

function applyTheme(theme){
    if (theme === 'dark'){
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    }
}

themeToggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('forkTheme', currentTheme)
    applyTheme(currentTheme);
})


function dismissSplash() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen && !splashScreen.classList.contains('hidden') && splashScreen.style.display !== 'none') {
        
        const skipCheck = document.getElementById('skip-splash-check');
        if (skipCheck && skipCheck.checked) {
            localStorage.setItem('forkSkipSplash', 'true');
        }

        splashScreen.classList.add('hidden');
        setTimeout(() => splashScreen.style.display = 'none', 600);
        
        const rootTextArea = document.querySelector('#root-node textarea');
        if (rootTextArea) rootTextArea.focus({preventScroll: true});
    }
}

const dismissBtn = document.getElementById('dismiss-splash-btn');
if (dismissBtn) dismissBtn.addEventListener('click', dismissSplash);

document.addEventListener('keydown', function(event) {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen && !splashScreen.classList.contains('hidden') && splashScreen.style.display !== 'none') {
        if (event.target.id === 'skip-splash-check') return; 
        
        dismissSplash();
        
        if (event.key === 'Enter') event.preventDefault();
    }
});

const shortcutsToggle = document.getElementById('shortcuts-toggle');
const shortcutsModal = document.getElementById('shortcuts-modal');
const closeShortcuts = document.getElementById('close-shortcuts');

shortcutsToggle.addEventListener('click', () => {
    shortcutsModal.classList.remove('hidden');
});

closeShortcuts.addEventListener('click', () => {
    shortcutsModal.classList.add('hidden');
});

shortcutsModal.addEventListener('click', (event) => {
    if (event.target === shortcutsModal) {
        shortcutsModal.classList.add('hidden');
    }
});


window.addEventListener('scroll', function(){
    window.scrollTo(0, 0);
});
document.body.addEventListener('scroll', function(){
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;
})







