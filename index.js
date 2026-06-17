document.addEventListener('click', function(event) {
    if(event.target.classList.contains('fork-btn')){
        const parentNode = event.target.closest('.node');
        const childrenContainer = parentNode.querySelector('.children');

        spawnBranch(childrenContainer);
    }
});

function spawnBranch(container){
    const newNode = document.createElement('div');
    newNode.className = 'node';

    newNode.innerHTML = `
        <div class="node-card">
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
const canvas = document.getElementById('canvas');
const zoomText = document.getElementById('zoom-level');

function setZoom(newZoom) {
    zoomLevel = Math.max(0.2, Math.min(newZoom, 2));
    canvas.style.transform = `scale(${zoomLevel})`;
    zoomText.innerText = `${Math.round(zoomLevel * 100)}%`;
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
}, {passive: false});


document.addEventListener('input', function(event) {
    if(event.target.tagName.toLowerCase() === 'textarea'){
        autoResize(event.target);
    }
});

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}
