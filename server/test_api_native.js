const http = require('http');
const fs = require('fs');

http.get('http://localhost:5000/api/clubs/requests?role=club_admin&clubId=69b1d20c8f383714e20b3d7b', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('api_resp.json', JSON.stringify(JSON.parse(data), null, 2));
    console.log('Success');
  });
}).on('error', console.error);
