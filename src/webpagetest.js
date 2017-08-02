import superagent from 'superagent'

export function webpagetest (url, name, strategy) {
  const now = Date.now()
  return superagent
  .get(process.env.WEBPAGETEST_API_ENDPOINT)
  .query({
    url,
    label: `${name} ${now}`,
    location: 'Dulles:Chrome.DSL',
    runs: 3,
    f: 'json',
    video: 1,
    k: process.env.WEBPAGETEST_API_KEY,
    mobile: strategy === 'mobile' ? 1 : 0,
  })
  .then((response) => {
    const body = response.body
    if (body.statusCode !== 200) throw new Error(`[webpagetest] ${body.statusCode}: ${body.statusText}`)
    return body
  })
}
