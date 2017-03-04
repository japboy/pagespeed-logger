const fs = require('fs');
const path = require('path');
const globby = require('globby');
const superagent = require('superagent');

require('dotenv').config();

const urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
const targetPath = process.argv[2];
const savePath = process.argv[3];

let targetJson, targetUrl;

if (urlPattern.test(targetPath)) {
  targetUrl = targetPath;
} else if (fs.statSync(targetPath).isFile()) {
  targetJson = JSON.parse(fs.readFileSync(targetPath, { encoding: 'utf8' }));
} else {
  console.log('Invalid target path. Aborted.');
  process.exit(1);
}

if (!savePath || !fs.statSync(savePath).isDirectory()) {
  console.log('Invalid save path. Aborted.');
  process.exit(1);
}


function request (data) {
  return superagent
  .get(process.env.PAGESPEED_API_ENDPOINT)
  .query({
    url: data.url,
    'filter_third_party_resources': false,
    locale: 'ja_JP',
    screenshot: true,
    strategy: data.strategy,
    key: process.env.PAGESPEED_API_KEY,
  });
}

function save (data) {
  return new Promise(function (resolve, reject) {
    const filePath = path.resolve(`${savePath}/${data.filename}`);
    fs.writeFile(filePath, data.text, 'utf8', function (error) {
      if (error) return reject(error);
      resolve(filePath);
    });
  });
}

function requestAndSave (data) {
  return request(data)
  .then((response) => save({ filename: `${Date.now()}-${data.name}.json`, text: response.text }));
}

function createList () {
  return globby([ '*.json', '!list.json' ], { cwd: savePath })
  .then((data) => save({ filename: 'list.json', text: JSON.stringify(data) }));
}


if (targetUrl) {
  request({
    url: targetUrl,
    strategy: process.env.PAGESPEED_DEFAULT_STRATEGY,
  })
  .then(function (response) {
    console.log(response.text);
    process.exit(0);
  }, function (error) {
    console.log(error.message);
    process.exit(1);
  });
} else if (targetJson) {
  const targets = targetJson.map(requestAndSave);
  Promise.all(targets)
  .then(createList)
  .then(function () {
    process.exit(0);
  }, function (error) {
    console.log(error.message);
    process.exit(1);
  });
}
