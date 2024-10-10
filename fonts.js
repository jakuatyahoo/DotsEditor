const fonts = []

function saveContents() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(panelDots));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "contents.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function loadContents() {

  const keyboard = document.getElementsByClassName('keyboard')[0];
  const fileInput = document.getElementById('fileInput');
  fileInput.click();
  fileInput.onchange = function(event) {
    clearDots();
    for (file of event.target.files) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const dots = JSON.parse(e.target.result);
        lightUpDots(dots)
      }
      reader.readAsText(file);
    }
  }
}

function loadFontsArray() {

  const keyboard = document.getElementsByClassName('keyboard')[0];
  const fileInput = document.getElementById('fileInput');
  fileInput.click();
  fileInput.onchange = function(event) {
    keyboard.innerHTML = "";
    fonts.splice(0, fonts.length); // remove all fonts
    for (file of event.target.files) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const importedData = JSON.parse(e.target.result);
        for (font of importedData) {
          fonts.push(font)
          keyboard.appendChild(getKey(font));
        }
      }
      reader.readAsText(file);
    }
  }
}

function loadFonts() {

  const keyboard = document.getElementsByClassName('keyboard')[0];
  const fileInput = document.getElementById('fileInput');
  fileInput.click();
  fileInput.onchange = function(event) {
    keyboard.innerHTML = "";
    for (file of event.target.files) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const importedData = JSON.parse(e.target.result);
        extractFonts(importedData).forEach(font => {
          fonts.push(font);
          keyboard.appendChild(getKey(font));
        });
      };
      reader.readAsText(file);
    }
  }
}

function extractFonts(dots) {
  const filledCols = new Array(64)//.fill(()=>[]);
  const filledRows = new Array(32)//.fill(()=>[]);

  for (dot of dots) {
    (filledCols[dot.col] || (filledCols[dot.col] = [])).push(dot);
    (filledRows[dot.row] || (filledRows[dot.row] = [])).push(dot);
  }

  const fonts = [];
  for (let col = 0; col < filledCols.length; col++) {
    if (!filledCols[col]) continue;

    var colDots = filledCols[col];
    const font = {
      dots: [],
      width: 0,
      height: 0,
      minX: col,
      minY: colDots[0].row,
      maxY: 0,
      maxX: 0
    };

    while (col < 64 && (colDots = filledCols[col++])) {
      for (dot of colDots) {
        if (dot.row < font.minY) {
          font.minY = dot.row;
        }
        if (dot.row > font.maxY) {
          font.maxY = dot.row;
        }
        font.dots.push(dot);
      }
    }

    font.maxX = --col - 1;
    font.width = font.maxX - font.minX;
    font.height = font.maxY - font.minY;

    // translate to top left
    if (font.minX > 0 || font.minY > 0) {
      for (dot of font.dots) {
        dot.col -= font.minX;
        dot.row -= font.minY;
      }
    }

    fonts.push(font);
  }


  return fonts
}

function offsetToCenter(size, segment) {
  const offset = Math.floor((size - segment) / 2);
  return offset < 0 ? 0 : offset;
}

function getKey(font) {
  const key = document.createElement('div');
  key.classList.add('key');
  key.dataset.font = font;
  key.addEventListener('click',
    () => toggleKey(key, font));
  const canvas = key.appendChild(document.createElement('canvas'));
  font.canvas = canvas;
  drawFont(canvas, font);
  return key;
}

function drawFont(canvas, font) {
  const ctx = canvas.getContext('2d');
  const pixelSize = 1;
  const offsetX = offsetToCenter(32, font.width);
  const offsetY = offsetToCenter(32, font.height);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // loop to light up a specific pixels
  for (dot of font.dots) {
    ctx.fillStyle = dot.color;
    ctx.fillRect((dot.col + offsetX) * pixelSize, (dot.row + offsetY) * pixelSize, pixelSize, pixelSize);
  }

}

var currentKey;
function toggleKey(key, font) {
  //alert(JSON.stringify(font))
    if (currentKey) currentKey.classList.remove('editing');
    currentKey = key;
    key.classList.add('editing');
    clearGridEditor();
    setGridFont(font);
    lightUpDots(font.dots, font.width, selectedColor)
    moveCursor(font.width + 2, 0);
}

/*
// Function to light up specific pixels
function lightUpPixels(pixels) {
  const grid = document.getElementById('pixel-grid');
  pixels.forEach(([x, y]) => {
    const index = y * 32 + x;
    grid.children[index].classList.add('on');
  });
}
*/

function clearDots() {
  clearGridEditor()
  const grid = document.getElementById('pixel-grid');
  grid.charPosX = 0;
  grid.charPosY = 0;
  panelDots = []

    for (pixel of grid.children) {
        pixel.selected = false;
        pixel.style.backgroundColor = 'white';
        pixel.classList.remove('on');
    }
}

panelDots = []
function lightUpDots(dots, width, dotsColor) {
  const grid = document.getElementById('pixel-grid');
  if (!grid.charPosX) grid.charPosX = 0;
  if (!grid.charPosY) grid.charPosY = 0;
  //  clearDots()

  if ((grid.charPosX + width) >= 128) {
    grid.charPosX = 0;
    grid.charPosY += 1 * 16;
  }
  for (dot of dots) {
    const index = ((dot.row + grid.charPosY) * 128) + dot.col + (grid.charPosX);
    if (index < grid.children.length) {
        const pixel = grid.children[index]
        pixel.classList.add('on');
        pixel.selected = true;
        pixel.style.backgroundColor = (dotsColor ? dotsColor:dot.color);
        panelDots.push({
            ...dot,
            color: (dotsColor ? dotsColor : dot.color),
            row: dot.row + grid.charPosY,
            col: dot.col + grid.charPosX
        })
    }
  }

  // accumulate the font dots to use for display, adding PosX offset to each in sequence
//    panelDots.concat(font.dots.map(dot => { return { ...dot, row: dot.row + grid.charPosX } }))

// commenting out - moveCursor would already do this!!
//  grid.charPosX += font.width + 2;
}

function moveCursor(x,y) {
  const grid = document.getElementById('pixel-grid');
    grid.charPosX += x;
    grid.charPosY += y;
    grid.selectedPixel.classList.toggle('selected');
    (grid.selectedPixel = pixels[grid.charPosY][grid.charPosX]).classList.toggle('selected');
}

function markCursor() {
    const grid = document.getElementById('pixel-grid');
//    grid.style.cursor = `url(${squareCursorURL}), auto`; // Set marking cursor
    grid.selectingPixel = true;
    grid.classList.remove('lighting');
    grid.classList.add('selecting');
}

// Function to create a hollow square image dynamically
function createHollowSquareCursor() {
    // Create a small canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 3;  // 3px width
    canvas.height = 3; // 3px height

    // Get the drawing context
    const ctx = canvas.getContext('2d');

    // Draw a 1px hollow square
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.strokeStyle = 'black'; // Border color
    ctx.lineWidth = 1; // 1px border width

    // Draw the square border
    ctx.strokeRect(0.5, 0.5, 2, 2); // Slightly offset to center the border within 3x3

    // Convert canvas to data URL
    return canvas.toDataURL('image/png');
}

// Create the custom cursor data URL
const squareCursorURL = createHollowSquareCursor();

function exportFonts() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fonts));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "fonts.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

const DEFAULT_API_SERVER = 'http://192.168.1.7:5555'
var API_SERVER = DEFAULT_API_SERVER

function updateServer(input) {
    API_SERVER = input.value
}
function setDefaultServer(input) {
    API_SERVER = DEFAULT_API_SERVER
}
function showDots() {
    // Show spinner
    spinner.style.display = 'block';

    fetch(API_SERVER + '/showDots', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(panelDots)
    })
        .then(response => response.json())
        .then(data => {
            console.log("Success : ", data)
        })
        .catch(error => {
            console.error("Error : ", error)
            alert("Request failed - check connection")
        }).finally(() => {
            // Hide spinner
            spinner.style.display = 'none';
        });
}

