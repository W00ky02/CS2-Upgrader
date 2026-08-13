const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;
const root = __dirname;
const usersFile = path.join(root, 'users.json');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
function readUsers(){ try{return JSON.parse(fs.readFileSync(usersFile,'utf8'))}catch{return {users:[]}} }
function writeUsers(data){ fs.writeFileSync(usersFile, JSON.stringify(data,null,2)); }
function body(req){ return new Promise((res,rej)=>{let d=''; req.on('data',c=>d+=c); req.on('end',()=>{try{res(d?JSON.parse(d):{})}catch(e){rej(e)}});}); }
http.createServer(async (req,res)=>{
  try{
    if(req.url === '/api/users' && req.method === 'GET'){ res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify(readUsers())); }
    if(req.url === '/api/users' && req.method === 'POST'){ const data = await body(req); writeUsers(data); res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify({ok:true})); }
    const clean = decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]);
    const file = path.normalize(path.join(root, clean));
    if(!file.startsWith(root)){ res.writeHead(403); return res.end('Forbidden'); }
    fs.readFile(file,(err,buf)=>{ if(err){res.writeHead(404); res.end('Not found'); return;} res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream'); res.end(buf); });
  }catch(e){ res.writeHead(500); res.end(String(e)); }
}).listen(PORT,()=>console.log(`Upgrader läuft auf http://localhost:${PORT}`));
