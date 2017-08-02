import fs from 'fs'
import path from 'path'

export function read (filePath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path.resolve(filePath), 'utf8', (error, data) => {
      if (error) return reject(error)
      resolve(data)
    })
  })
}

export function write (filePath, data) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(path.resolve(filePath), data, 'utf8', (error) => {
      if (error) return reject(error)
      resolve(filePath)
    })
  })
}

