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
        const font = makeFont(importedData);
        fonts.push(font);
        keyboard.appendChild(getKey(font));
      };
      reader.readAsText(file);
    }
  }
}

function makeFont(dots) {
  var minX = dots[0].col, 
    minY = dots[0].row, 
    maxX = 0, maxY = 0;
  
  for (dot of dots) {
    if (dot.col < minX) {
      minX = dot.col;
    }
    if (dot.row < minY) {
      minY = dot.row;
    }
    if (dot.col > maxX) {
      maxX = dot.col;
    }
    if (dot.row > maxY) {
      maxY = dot.row;
    }
  }

  // translate to top left
  if (minX > 0 || minY > 0) {
    for (dot of dots) {
      dot.col -= minX;
      dot.row -= minY;
    }
  }

  return {
    dots : dots,
    width : maxX - minX,
    heigth : maxY - minY
  }
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
  const offsetX = Math.floor((32-font.width)/2);
  const offsetY = Math.floor((32-font.heigth)/2);
  if (offsetX < 0) offsetX = 0;
  if (offsetY < 0) offsetY = 0;

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

