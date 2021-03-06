const API_URL = 'http://cookiecraver.eastus.cloudapp.azure.com';
document.getElementById('card').style.display = "block";
document.getElementById('download').style.display = "none";
chrome.storage.sync.get('sessionUser', (val) => {
  const { sessionUser } = val;
  if (!sessionUser) {
    document.getElementById('download').style.display = "block";
    document.getElementById('card').style.display = "none";
  }
  fetch(`${API_URL}/user/cookies?uid=${sessionUser.uid}`)
    .then(data => data.json())
    .then((data) => {
      const playerPic = document.getElementById('player-pic');
      const playerRank = document.getElementById('player-rank');
      const total = document.getElementById('total');
      const name = document.getElementById('name');
      const score = document.getElementById('score');
      playerPic.src = data.pic;
      playerRank.innerText = data.rank;
      total.innerText = data.total;
      name.innerText = `${data.fname} ${data.sname}`;
      score.innerHTML = data.score.toString().split('').map(digit => `<span>${digit}</span>`).join('');
    }).catch(() => {
      document.getElementById('download').style.display = "block";
      document.getElementById('card').style.display = "none";
    });
});
