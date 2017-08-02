import dotenv from 'dotenv'
import moment from 'moment'
import yargs from 'yargs'

import { schema, open, createPageSpeedInsights, createWebPageTest } from './database'
import { pagespeedinsights } from './pagespeedinsights'
import { webpagetest } from './webpagetest'
//import { read, write } from './file'

dotenv.config()

const argv = yargs.argv
const dest = argv.dest ? argv.dest : '.'

if (argv.url) {
  byUrl(argv.url)
} else if (argv.json) {
  byJson(argv.json)
}

async function byUrl (url) {
  try {
    const timestamp = Date.now()
    const prefix = moment(timestamp).format('YYYYMMDDHHmm')
    const datetime = moment(timestamp).format()

    const pagespeedinsightsDone = pagespeedinsights(url, process.env.PAGESPEED_DEFAULT_STRATEGY)
    //const webpagetestDone = webpagetest(url, prefix, process.env.PAGESPEED_DEFAULT_STRATEGY)

    const filenames = await Promise.all([
      doneAndSave(pagespeedinsightsDone, { datetime, name: prefix }, 'PageSpeedInsights'),
      //doneAndSave(webpagetestDone, { datetime, name: prefix }, 'WebPageTest')
    ])

    console.log('Result saved.\n' + filenames.join('\n'))
    process.exit(0)
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}

async function byJson (jsonPath) {
  try {
    const timestamp = Date.now()
    const prefix = moment(timestamp).format('YYYYMMDDHHmm')
    const datetime = moment(timestamp).format()

    let targets = JSON.parse(await read(jsonPath))
    targets = targets.map((target) => {
      const pagespeedinsightsDone = pagespeedinsights(target.url, target.strategy)
      const webpagetestDone = webpagetest(target.url, target.name, target.strategy)
      return [
        doneAndSave(pagespeedinsightsDone, { datetime, name: target.name }, `${dest}/${prefix}-${target.name}-pagespeedinsights.json`),
        doneAndSave(webpagetestDone, { datetime, name: target.name }, `${dest}/${prefix}-${target.name}-webpagetest.json`)
      ]
    })
    targets = Array.prototype.concat(...targets)

    const filenames = await Promise.all(targets)

    console.log('Result saved.\n' + filenames.join('\n'))
    process.exit(0)
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}

/*async function doneAndSave (done, props, filePath) {
  const result = await done
  Object.assign(result, props)
  return write(filePath, JSON.stringify(result))
}*/

async function doneAndSave (done, props, schemaName) {
  const [ result, realm ] = await Promise.all([ done, open(schema, 0) ])
  Object.assign(result, props)
  if (schemaName === 'PageSpeedInsights') {
    return createPageSpeedInsights(realm, result)
  }
  if (schemaName === 'WebPageTest') {
    //return createWebPageTest(realm, result)
  }
}
