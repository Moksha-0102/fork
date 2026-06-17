document.addEventListener('click', function(event) {
    
    const forkBtn = event.target.closest('.fork-btn');
    if (forkBtn) {
        const parentNode = forkBtn.closest('.node');
        const childrenContainer = parentNode.querySelector('.children');
        spawnBranch(childrenContainer);
    }
    
    const deleteBtn = event.target.closest('.delete-btn');
    if (deleteBtn) {
        const parentNode = deleteBtn.closest('.node');
        if (parentNode.id !== 'root-node') {
            parentNode.remove(); 
        }
    }
});

document.addEventListener('keydown', function(event) {
    if (event.target.tagName.toLowerCase() === 'textarea') {
        
        const activeTextarea = event.target;
        const currentNode = activeTextarea.closest('.node');
        
        if ((event.ctrlKey || event.metaKey) && (event.key === 'Enter')) {
            event.preventDefault();
            const childrenContainer = currentNode.querySelector('.children');
            spawnBranch(childrenContainer);
            return;
        }

        if((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b'){
            event.preventDefault();

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
                const parentChildrenContainer = currentNode.parentElement;
                const parentNode = parentChildrenContainer.closest('.node');
                if (parentNode) {
                    parentNode.querySelector('textarea').focus();
                }
                currentNode.remove();
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
                        parentNode.querySelector('textarea').focus();
                    }
                }
            }
            
            else if (event.key === 'ArrowDown') {
                event.preventDefault();
                const childrenContainer = currentNode.querySelector('.children');
                const firstChildNode = childrenContainer ? childrenContainer.querySelector('.node') : null;
                if (firstChildNode) {
                    firstChildNode.querySelector('textarea').focus();
                }
            }
            
            else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                const prevSiblingNode = currentNode.previousElementSibling;
                if (prevSiblingNode && prevSiblingNode.classList.contains('node')) {
                    prevSiblingNode.querySelector('textarea').focus();
                }
            }
            
            else if (event.key === 'ArrowRight') {
                event.preventDefault();
                const nextSiblingNode = currentNode.nextElementSibling;
                if (nextSiblingNode && nextSiblingNode.classList.contains('node')) {
                    nextSiblingNode.querySelector('textarea').focus();
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
            <button class="delete-btn" title='Delete branch'>x</button>
            <textarea placeholder="Branch your logic here..."></textarea>
            <button class="fork-btn">⑂ Fork()</button>
        </div>
        <div class="children"></div>
    `;

    container.appendChild(newNode);

    const newTextArea = newNode.querySelector('textarea');
    newTextArea.focus();
}



/*Zoom*/

let zoomLevel = 1;
let panX = 0;
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

document.addEventListener('mousedown', function(event) {
    if (!event.target.closest('.node-card') && !event.target.closest('.zoom-controls')){
        isPanning = true;

        startX = event.clientX - panX;
        startY = event.clientY - panY;
    }
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
});

function setZoom(newZoom) {
    zoomLevel = Math.max(0.2, Math.min(newZoom, 2));
    updateCanvas();
}

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
        autoResize(event.target);
    }
});

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}
