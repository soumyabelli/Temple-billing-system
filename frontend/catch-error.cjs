const http = require('http');
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    console.log('\n\n--- CAUGHT FRONTEND ERROR ---\n');
    console.log(body);
    console.log('\n-----------------------------\n');
    res.end('ok');
    process.exit(0);
  });
});
server.listen(5005, () => {
  console.log('Listening for errors on port 5005...');
});
