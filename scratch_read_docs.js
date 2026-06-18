const fs = require('fs');
const path = require('path');

function extractStrings(filePath) {
  const buf = fs.readFileSync(filePath);
  console.log('=== FILE:', path.basename(filePath), '===');
  
  // Try extracting UTF-16LE strings (2 bytes per character)
  // Let's look for runs of printable characters (range 0x0020 to 0x007E, and some Vietnamese ranges/unicode)
  let text = '';
  for (let i = 0; i < buf.length - 1; i += 2) {
    const charCode = buf.readUInt16LE(i);
    // printable ASCII or common Vietnamese/Unicode characters
    if ((charCode >= 32 && charCode <= 126) || 
        (charCode >= 0x00A0 && charCode <= 0x036F) || 
        (charCode >= 0x1EA0 && charCode <= 0x1EF9) || // Vietnamese characters
        charCode === 10 || charCode === 13 || charCode === 9) {
      text += String.fromCharCode(charCode);
    } else {
      if (text.length > 5) {
        // Only print blocks of text
        console.log(text.trim());
      }
      text = '';
    }
  }
  if (text.length > 5) {
    console.log(text.trim());
  }
}

const files = [
  '04-Phiếu nhận SV_12tuan.doc',
  'M-TT-01-1-Phieugiaoviec_TTDN_12tuan.doc',
  'M-TT-02-1-Phieutheodoi_TTDN_12Tuan.doc'
];

files.forEach(f => {
  const p = path.join(__dirname, '..', f);
  if (fs.existsSync(p)) {
    extractStrings(p);
  } else {
    console.log('File not found:', p);
  }
});
