import superagent from 'superagent'

export function pagespeedinsights (url, strategy) {
  return superagent
  .get(process.env.PAGESPEED_API_ENDPOINT)
  .query({
    url,
    'filter_third_party_resources': false,
    locale: 'ja_JP',
    screenshot: true,
    strategy,
    key: process.env.PAGESPEED_API_KEY,
  })
  .then(response => response.body)
}
