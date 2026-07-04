const fs = require('fs');
const https = require('https');

https.get('https://unavatar.io/twitter/JossyPi', (res) => {
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    https.get(res.headers.location, (res2) => {
      res2.pipe(fs.createWriteStream('public/jossypi.jpg'));
    });
  } else {
    res.pipe(fs.createWriteStream('public/jossypi.jpg'));
  }
});
