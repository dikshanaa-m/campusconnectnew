const axios = require('axios');
async function test() {
  try {
    const res = await axios.get("http://localhost:5000/api/clubs/requests?role=club_admin&clubId=69b1d20c8f383714e20b3d7b");
    const fs = require('fs');
    fs.writeFileSync('api_resp.json', JSON.stringify(res.data, null, 2));
    console.log("Success");
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
  }
}
test();
