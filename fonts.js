const fonts = []
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
        extractFonts(importedData).forEach(font =>{
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
          dots : [],
          width : 0,
          height : 0,
          minX : col,
          minY : colDots[0].row,
          maxY : 0,
          maxX : 0
      };
          
      while(col < 64 && (colDots = filledCols[col++])) {
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

      font.maxX = --col-1;
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
  const offset = Math.floor((size-segment)/2);
  return offset < 0 ? 0 : offset;
}

function getKey(font) {
  const key = document.createElement('div');
  key.classList.add('key');
  key.dataset.font = font;
  key.addEventListener('click',
    () => toggleKey(key, font));

  const canvas = key.appendChild(document.createElement('canvas'));
  const ctx = canvas.getContext('2d');
  const pixelSize = 1;
  const offsetX = offsetToCenter(32, font.width);
  const offsetY = offsetToCenter(32, font.height);

  // loop to light up a specific pixels
  for (dot of font.dots) {
    ctx.fillStyle = dot.color;
    ctx.fillRect((dot.col+offsetX) * pixelSize, (dot.row+offsetY) * pixelSize, pixelSize, pixelSize);
  }
  return key;
}

function toggleKey(key, font) {
  //alert(JSON.stringify(font))
  lightUpDots(font)
}

// Function to light up specific pixels
function lightUpPixels(pixels) {
  const grid = document.getElementById('pixel-grid');
  pixels.forEach(([x, y]) => {
    const index = y * 32 + x;
    grid.children[index].classList.add('on');
  });
}

function clearDots() {
  const grid = document.getElementById('pixel-grid');
  grid.charPosX = 0;
  grid.charPosY = 0;
  
  for (pixel of grid.children)
    pixel.classList.remove('on');
}

function lightUpDots(font) {
  const grid = document.getElementById('pixel-grid');
  if (!grid.charPosX) grid.charPosX = 0;
  if (!grid.charPosY) grid.charPosY = 0;
  //  clearDots()

  if ((grid.charPosX + font.width) >= 128) {
    grid.charPosX = 0;
    grid.charPosY += 1*16;
  }
  for (dot of font.dots) {
    const index = ((dot.row + grid.charPosY) * 128) + dot.col + (grid.charPosX);
    if (index < grid.children.length) {
      grid.children[index].classList.add('on');
    }
  }
  grid.charPosX += font.width + 2;
}

