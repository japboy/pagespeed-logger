const fs = require('fs');
const path = require('path');
const globby = require('globby');
const moment = require('moment');
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

if (!targetUrl && (!savePath || !fs.statSync(savePath).isDirectory())) {
  console.log('Invalid save path. Aborted.');
  process.exit(1);
}


function pagespeedinsights (data) {
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

function webpagetest (data) {
  return superagent
  .get(process.env.WEBPAGETEST_API_ENDPOINT)
  .query({
    url: data.url,
    label: `${data.name} ${Date.now()}`,
    location: 'Dulles:Chrome.DSL',
    runs: 3,
    f: 'json',
    video: 1,
    k: process.env.WEBPAGETEST_API_KEY,
    mobile: data.strategy === 'mobile' ? 1 : 0,
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
  return Promise.all([
    pagespeedinsights(data),
    webpagetest(data),
  ])
  .then(function ([psiResponse, wptResponse]) {
    const timestamp = Date.now();
    const prefix = moment(timestamp).format('YYYYMMDDHHmm');
    const datetime = moment(timestamp).format();
    const psiBody = psiResponse.body;
    const wptBody = wptResponse.body;
    psiBody.name = data.name;
    psiBody.datetime = datetime;
    wptBody.name = data.name;
    wptBody.datetime = datetime;
    return Promise.all([
      save({ filename: `${prefix}-${data.name}-pagespeedinsights.json`, text: JSON.stringify(psiBody) }),
      save({ filename: `${prefix}-${data.name}-webpagetest.json`, text: JSON.stringify(wptBody) }),
    ]);
  });
}

function createList () {
  return globby([ '*.json', '!list.json' ], { cwd: savePath })
  .then((data) => save({ filename: 'list.json', text: JSON.stringify(data) }));
}


if (targetUrl) {
  Promise.all([
    pagespeedinsights({
      url: targetUrl,
      strategy: process.env.PAGESPEED_DEFAULT_STRATEGY,
    }),
    webpagetest({
      name: 'testing',
      url: targetUrl,
      strategy: process.env.PAGESPEED_DEFAULT_STRATEGY,
    }),
  ])
  .then(function ([psiResponse, wptResponse ]) {
    console.log(psiResponse.text);
    console.log(wptResponse.text);
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
