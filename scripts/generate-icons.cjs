// Run: node scripts/generate-icons.js
const fs = require('fs');
const path = require('path');

function createPNG(size) {
  // Create a simple colored square PNG
  const width = size;
  const height = size;
  
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdrType = Buffer.from('IHDR');
  const ihdrCrc = crc32(Buffer.concat([ihdrType, ihdrData]));
  const ihdrChunk = Buffer.concat([
    Buffer.alloc(4), ihdrType, ihdrData, ihdrCrc
  ]);
  ihdrChunk.writeUInt32BE(ihdrData.length, 0);
  
  // IDAT chunk - raw image data
  const rawData = [];
  const r = 217, g = 119, b = 87; // #D97757
  
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte (none)
    for (let x = 0; x < width; x++) {
      // Simple gradient + letter "B" shape
      const cx = width / 2, cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const maxR = width * 0.45;
      
      if (dist < maxR) {
        // Inside circle - draw "B"
        const nx = (x - cx) / maxR;
        const ny = (y - cy) / maxR;
        
        const inB = (
          // Vertical line
          (nx > -0.5 && nx < -0.3 && ny > -0.6 && ny < 0.6) ||
          // Top bump
          (nx >= -0.3 && nx < 0.3 && ny > -0.6 && ny < -0.1 && 
            Math.sqrt((nx - 0.0) ** 2 + (ny + 0.35) ** 2) < 0.35) ||
          // Bottom bump
          (nx >= -0.3 && nx < 0.4 && ny > -0.1 && ny < 0.6 && 
            Math.sqrt((nx - 0.05) ** 2 + (ny - 0.25) ** 2) < 0.4)
        );
        
        if (inB) {
          rawData.push(255, 255, 255); // white letter
        } else {
          // Rounded rectangle background
          const cornerR = width * 0.18;
          const inRect = x > cornerR && x < width - cornerR && y > cornerR && y < height - cornerR;
          const inCorners = (
            (Math.sqrt((x - cornerR) ** 2 + (y - cornerR) ** 2) < cornerR) ||
            (Math.sqrt((x - (width - cornerR)) ** 2 + (y - cornerR) ** 2) < cornerR) ||
            (Math.sqrt((x - cornerR) ** 2 + (y - (height - cornerR)) ** 2) < cornerR) ||
            (Math.sqrt((x - (width - cornerR)) ** 2 + (y - (height - cornerR)) ** 2) < cornerR)
          );
          
          if (inRect || inCorners) {
            // Slight gradient
            const shade = 0.85 + 0.15 * (y / height);
            rawData.push(Math.round(r * shade), Math.round(g * shade), Math.round(b * shade));
          } else {
            rawData.push(0, 0, 0); // transparent (black fallback)
          }
        }
      } else {
        rawData.push(0, 0, 0);
      }
    }
  }
  
  const rawBuffer = Buffer.from(rawData);
  
  // Compress with zlib
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawBuffer);
  
  const idatType = Buffer.from('IDAT');
  const idatCrc = crc32(Buffer.concat([idatType, compressed]));
  const idatChunk = Buffer.concat([
    Buffer.alloc(4), idatType, compressed, idatCrc
  ]);
  idatChunk.writeUInt32BE(compressed.length, 0);
  
  // IEND chunk
  const iendType = Buffer.from('IEND');
  const iendCrc = crc32(iendType);
  const iendChunk = Buffer.concat([
    Buffer.alloc(4), iendType, iendCrc
  ]);
  iendChunk.writeUInt32BE(0, 0);
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 implementation
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crc ^ buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  crc = crc ^ (-1);
  const result = Buffer.alloc(4);
  result.writeUInt32BE(crc >>> 0, 0);
  return result;
}

const publicDir = path.join(__dirname, '..', 'public');

[192, 512].forEach(size => {
  const png = createPNG(size);
  const filePath = path.join(publicDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`Created ${filePath} (${png.length} bytes)`);
});
