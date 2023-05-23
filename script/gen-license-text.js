#!/usr/bin/env node

'use strict'

const fs = require('fs');
const path = require('path');
const legalEagle = require('legal-eagle');

const licenseOverrides = require('./license-overrides');
const licenseSkippings = require('./license-skippings');

const LICENSE_IN_FILEPATH = './script/licenses.txt'; // npm install以外の静的配置はないため、Baseとなる本ファイルは現状空
const LICENSE_OUT_FILEPATH = './LICENSES.txt';

/**
 * パケージモジュールライセンステキスト生成
 * @param
 * 
 * @return
 * 
 */
function genLicenseText() {
  Promise.resolve()
    .then(() => {
      return new Promise((resolve, reject) => {
        getPackageLegal(null, './').then((ret) => {
          if (ret[1]) {
            reject(ret[1]);
          }
          else {
            resolve(ret[0]);
          }
        })
      })
    }).then((chainPackageLicences) => {
      let text = fs.readFileSync(LICENSE_IN_FILEPATH, 'utf8') + '\n\n';
      let aftPackages = [];
      let confirmInfoPJ = [];

      for (let packageName of Object.keys(chainPackageLicences).sort()) {
        // 同名/同バージョンSkip
        const findPackage = aftPackages.find((val) => val === packageName);
        if (findPackage){
          continue;
        }
        aftPackages.push(packageName);

        // 除外リストモジュールSkip
        let atIndex = packageName.indexOf('@');
        const packageNameOnly = packageName.slice(0, atIndex);
        if (packageNameOnly in licenseSkippings) {
          continue;
        }
        
        console.log('output: ', packageName);

        const packageLicense = chainPackageLicences[packageName]

        // LICENSEファイルが存在せず自動ライセンス表記できないパッケージ
        if ( packageLicense.source == "package.json" ) {
          confirmInfoPJ.push(packageName);
        }
        
        text += "-------------------------------------------------------------------------\n\n"
        text += `Package: ${packageName}\n`
        text += `License: ${packageLicense.license}\n`
        if (packageLicense.source) {
          text += `License Source: ${packageLicense.source}\n`
        }
        if (packageLicense.sourceText) {
          text += `Source Text:\n\n${packageLicense.sourceText}`
        }
        text += '\n'
      }

      fs.writeFileSync(LICENSE_OUT_FILEPATH, text);
      console.log('\nfinished!!');

      if (confirmInfoPJ.length > 0){
        console.log('\n### Requires confirmation of package license. ###');
        confirmInfoPJ.forEach(packageName => console.log(packageName));
      }
    }).catch((err) => {
      console.log('\n' + err.stack);
    });
}

/**
 * パッケージモジュールライセンス取得
 * @param
 *    chainPackageLicences  : パッケージモジュールライセンス群 (nullの場合は連結しない)
 *    dir                   : 取得対象ディレクトリパス
 * @return
 *    Promise object
 *      resolve : [ packageLicences, err ]
 *                    packageLicences : パッケージモジュールライセンス群
 *                    err             : エラーオブジェクト
 *      reject  : 未使用
 */
function getPackageLegal(chainPackageLicences, dir) {
  return new Promise((resolve, reject) => {
    legalEagle({
      path: dir,
      overrides: licenseOverrides, // 読み込み先ファイルは現状空のため実質機能しない
      //omitPermissive: true,   // can not be ommited.
    }, (err, packagesLicenses) => {
      if (err) {
        resolve([null, err]);
      }
      else {
        let retPackageLicences = packagesLicenses;
        if (chainPackageLicences) {
          // 引数chainPackageLicences存在時は取得値と連結
          Object.assign(retPackageLicences, chainPackageLicences)
        }
        resolve([retPackageLicences, null]);
      }
    })
  })
}

module.exports = genLicenseText

genLicenseText();

