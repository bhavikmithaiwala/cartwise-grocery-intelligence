import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
for(const name of ['discounted-fictional','malformed-fictional','unit-mismatch-fictional']){
 const lines=(await readFile(`fixtures/${name}.txt`,'utf8')).trim().split('\n');
 const svg=`<svg width="1000" height="${lines.length*75+70}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/>${lines.map((line,i)=>`<text x="35" y="${60+i*75}" font-family="Arial" font-size="38">${line.replaceAll('&','&amp;').replaceAll('<','&lt;')}</text>`).join('')}</svg>`;
 let image=sharp(Buffer.from(svg));if(name==='malformed-fictional')image=image.blur(1.5);
 await image.png().toFile(`fixtures/${name}.png`);
}
console.log('Generated three explicitly fictional receipt fixtures.');
