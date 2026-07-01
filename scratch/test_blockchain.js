const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3009,
      path: path,
      method: 'GET',
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

async function test() {
  try {
    const isActive = await get('/blockchain/is-active');
    console.log('Is Active:', isActive);
    const voteCount = await get('/blockchain/vote-count');
    console.log('Vote Count:', voteCount);
    const merkleRoot = await get('/blockchain/merkle-root');
    console.log('Merkle Root:', merkleRoot);
  } catch (err) {
    console.error(err);
  }
}

test();
