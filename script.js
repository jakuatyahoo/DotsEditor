let selectedColor = 'red';
const litUpDots = [];

function selectColor(color) {
    selectedColor = color;
}


function toggleDot(dot, row, col) {
    const index = litUpDots.findIndex(d => d.row === row && d.col === col);
    if (index !== -1) {
        dot.style.backgroundColor = '#eee';
        litUpDots.splice(index, 1);
    } else {
        dot.style.backgroundColor = selectedColor;
        litUpDots.push({row, col, color: selectedColor});
    }
}

function exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(litUpDots));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "litUpDots.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importJSON() {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
    fileInput.onchange = function (event) {
        clearGrid();
        //                const file = event.target.files[0];
        for (file of event.target.files) {

            const reader = new FileReader();
            reader.onload = function (e) {
                const importedData = JSON.parse(e.target.result);
                setGrid(importedData);
            };
reader.readAsText(file);
        }
    };
}

function setGrid(dots) {
    dots.forEach(dotData => {
        litUpDots.push(dotData);
        const dot = document.querySelector(`.dot[data-row='${dotData.row}'][data-col='${dotData.col}']`);
        if (dot) {
            dot.style.backgroundColor = dotData.color;
        }
    });
}

function restoreGrid(data) {
    litUpDots.length = 0;
    setGrid(data)
}

function clearGrid() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => {
        dot.style.backgroundColor = '#eee';
    });
    litUpDots.length = 0;
}

function eraseGrid() {
    clearGrid();
}

