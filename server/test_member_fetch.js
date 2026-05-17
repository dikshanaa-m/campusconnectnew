async function test() {
  try {
    const role = "club_member";
    const clubId = "69b1d20c8f383714e20b3d7b";
    
    const res = await fetch(`http://localhost:5000/api/clubs/requests?role=${role}&clubId=${clubId}`);
    
    if (res.ok) {
      const data = await res.json();
      console.log("SUCCESS FETCHED AS CLUB_MEMBER:", data);
    } else {
      const data = await res.json();
      console.log("EXPECTED REJECTION FOR CLUB_MEMBER:", res.status, data);
    }
  } catch (err) {
    console.log("ERROR:", err.message);
  }
}
test();
