// Project illustrations use geometry, not invented application screenshots.
export function projectArt(slug, accent) {
  const frame = (body) => `<rect width="620" height="248" fill="#08121f"/><path d="M0 225H620" stroke="${accent}" opacity=".25"/>${body}`;
  if (slug === 'xport') {
    const city = (offset, color, heights) => heights.map((h,i)=>`<rect x="${offset+i*26}" y="${180-h}" width="21" height="${h}" fill="${color}" opacity=".65"/><path d="M${offset+i*26+7} ${188-h}V171" stroke="#ebf5ff" stroke-dasharray="3 8" opacity=".3"/>`).join('');
    return frame(`<circle cx="410" cy="88" r="52" fill="#f79abc" opacity=".14"/>${city(24,'#305769',[60,96,78,120,65,103,80])}${city(355,'#7f4d88',[75,120,89,61,105,79,112,67,100])}
      <path d="M0 244L290 180L620 244M80 248L290 180M540 248L290 180" stroke="#264352" fill="none"/>
      <rect x="233" y="28" width="156" height="189" rx="30" fill="#07101b" stroke="#285266" stroke-width="10"/>
      <rect x="239" y="33" width="144" height="179" rx="27" fill="#142836" stroke="#6fe7fb" stroke-width="3"/>
      ${city(253,'#8772b5',[68,87,115,80,104])}<path d="M248 200L310 165L374 200" stroke="#ffb2d8" fill="none"/>
      <text x="36" y="32" fill="#88bcd1" font-family="Consolas,monospace" font-size="12">host world</text><text x="310" y="67" text-anchor="middle" fill="#c5f7ff" font-family="Consolas,monospace" font-size="12">guest world</text>`);
  }
  if (slug === 'launcher') return frame(`<rect x="30" y="24" width="560" height="206" rx="12" fill="#101c2c" stroke="#334155"/><path d="M30 65H590" stroke="#334155"/><circle cx="48" cy="44" r="4" fill="${accent}"/><text x="65" y="48" fill="#cbd5e1" font-family="Consolas,monospace" font-size="12">library / all games</text>
    ${['#48596d','#bc785a','#39667c','#85566b','#857b4c'].map((color,i)=>`<g transform="translate(${55+i*104} 83)"><rect width="87" height="119" rx="7" fill="${color}"/><circle cx="44" cy="38" r="21" fill="#fff" opacity=".12"/><path d="M0 110L25 66L44 85L67 48L87 88V119H0Z" fill="#060b15" opacity=".5"/><rect x="12" y="99" width="52" height="4" rx="2" fill="#fff" opacity=".55"/></g>`).join('')}`);
  if (slug === 'ouija') return frame(`<rect x="42" y="24" width="536" height="204" rx="12" fill="#13152b" stroke="#4c3a69"/><rect x="42" y="24" width="126" height="204" rx="12" fill="#211a36"/>
    <text x="62" y="54" fill="#d9c8ff" font-family="Segoe UI,sans-serif" font-size="19" font-weight="700">Ouija</text>
    ${['# general','# projects','# voice'].map((t,i)=>`<text x="60" y="${95+i*34}" fill="#a794bd" font-family="Consolas,monospace" font-size="12">${t}</text>`).join('')}
    ${[0,1,2].map(i=>`<circle cx="200" cy="${70+i*48}" r="12" fill="${['#c084fc','#6bc8cf','#cf8ea3'][i]}"/><rect x="225" y="${59+i*48}" width="${160+i*32}" height="5" rx="2" fill="#d0c4df" opacity=".8"/><rect x="225" y="${74+i*48}" width="${255-i*38}" height="6" rx="3" fill="#6c5d87"/>`).join('')}<rect x="190" y="190" width="362" height="21" rx="6" fill="#282038"/>`);
  if (slug === 'riftfall') return frame(`<g stroke="#4186a7" fill="none" opacity=".4"><ellipse cx="310" cy="50" rx="72" ry="26"/><ellipse cx="310" cy="50" rx="83" ry="32"/></g><path d="M288 58L269 178H351L332 58Z" fill="#38bdf8" opacity=".08"/>
    <path d="M112 147L265 91L476 139L346 204Z" fill="#31585c"/><path d="M112 147L346 204L333 234L197 213Z" fill="#172e3c"/><path d="M346 204L476 139L418 213L333 234Z" fill="#223848"/>
    <path d="M247 122L234 102L254 79L287 115Z M363 150L386 117L421 154Z" fill="#568b78"/>
    ${[[202,148],[292,131],[372,168],[436,116]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#a7edff"/><circle cx="${x}" cy="${y}" r="12" fill="#38bdf8" opacity=".12"/>`).join('')}
    <path d="M74 154L48 168L68 177Z M502 158L522 145L530 164Z M389 231L400 244L417 235Z" fill="#2a5263"/>`);
  if (slug === 'powder') {
    const pixels=[];
    for(let x=0;x<105;x++)for(let y=0;y<31;y++){
      let color=null; const sand=19+Math.sin(x*.08)*4;
      if(x<44 && y>sand) color=['#dcb478','#e8c789','#bb985e'][(x*7+y*3)%3];
      if(x>52 && x<93 && y>22) color=['#4d9ed8','#408cbe','#79b8dc'][(x+y)%3];
      if(x>35 && x<57 && y>7+(x*13%9) && y<26) color=['#ef7650','#f6b466','#a74735'][(x+y)%3];
      if(color)pixels.push(`<rect x="${48+x*5}" y="${56+y*5}" width="5" height="5" fill="${color}"/>`);
    }
    return frame(`<rect x="36" y="27" width="550" height="193" rx="9" fill="#101a20" stroke="#38434a"/>${pixels.join('')}<text x="48" y="47" fill="#c5a57c" font-family="Consolas,monospace" font-size="12">sand / water / fire</text>`);
  }
  if (slug === 'paradise') return frame(`<circle cx="162" cy="123" r="85" fill="#152c28" stroke="#314d41"/><circle cx="162" cy="123" r="65" fill="#0c151e" stroke="#294738"/><circle cx="162" cy="123" r="23" fill="#4ade80" opacity=".15"/><circle cx="162" cy="123" r="7" fill="#95efbd"/>
    ${Array.from({length:36},(_,i)=>{const h=12+Math.abs(Math.sin(i*.69))*74;return `<rect x="${285+i*7}" y="${120-h/2}" width="3" height="${h}" rx="1.5" fill="#4ade80" opacity="${.3+i%4*.15}"/>`;}).join('')}
    <path d="M368 185V201M375 185V201M408 184L421 193L408 202Z" stroke="#bcf4cf" stroke-width="2" fill="none"/><text x="310" y="58" fill="#a6cbb6" font-family="Consolas,monospace" font-size="14">Radio Paradise</text>`);
  return frame('');
}
