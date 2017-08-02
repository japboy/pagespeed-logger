import Realm from 'realm'

import PageSpeedInsightsSchemas from './pagespeedinsights.schema'


class WebPageTest {}
WebPageTest.schema = {
  name: 'WebPageTest',
  properties: {
    datetime: 'string',
    name: 'string',
    testId: 'string',
    ownerKey: 'string',
  }
}

/*export const schema = [
  ...PageSpeedInsightsSchemas,
  //WebPageTest,
]*/
export const schema = PageSpeedInsightsSchemas

function migrate (oldRealm, newRealm) {}

export function open (schema, schemaVersion) {
  return new Promise((resolve, reject) => {
    Realm.openAsync({
      path: 'pagespeed.realm',
      schema,
      schemaVersion,
      migration: migrate,
    }, (error, realm) => {
      if (error) return reject(error)
      resolve(realm)
    })
  })
}

export function write (realm, path, data) {
  return new Promise((resolve) => {
    realm.write(() => {
      const result = realm.create(path, data)
      resolve(result)
    })
  })
}

export function createPageSpeedInsights (realm, data) {
  return write(realm, 'PageSpeedInsights', data)
}

export function createWebPageTest (realm, data) {
  console.dir(data)
  return write(realm, 'WebPageTest', {
    datetime: data.datetime,
    name: data.name,
    testId: data.data.testId,
    ownerKey: data.data.ownerKey,
  })
}
