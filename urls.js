const fs = require("fs");
// const { pipeline } = require('node:stream/promises');
const { parser } = require('stream-json')
const { streamObject } = require('stream-json/streamers/StreamObject');
const { streamValues } = require('stream-json/streamers/StreamValues');
const { pick } = require('stream-json/filters/Pick');
const zlib = require('zlib');

// TODO: Take path as argument
const path = "/Users/caleb/Downloads/2024-07-01_anthem_index.json.gz";

// function streamToPromise(stream) {
//   return new Promise(function(resolve, reject) {
//     stream.on('data', () => console.log('data'));
//     stream.on('end', () => console.log('end'));
//     stream.on('end', () => resolve('stream promise finished'));
//     stream.on('close', () => console.log('close'));
//     stream.on('pause', () => console.log('pause'));
//     stream.on('error', (error) => {
//       console.log('error');
//       reject(error);
//     });
//   });
// }

async function run() {
  let mainStream = fs.createReadStream(path);
  if(path.split('.').pop() == "gz") {
    mainStream = mainStream.pipe(zlib.createGunzip());
  }
  mainStream = mainStream.pipe(parser());

  const reportingEntityIsAnthem = await new Promise(function(resolve, reject) {
    const reportingEntityStream = mainStream.pipe(pick({filter: 'reporting_entity_name'})).pipe(streamValues());
    reportingEntityStream.on('data', data => {
      if(data.value.indexOf('Anthem') != -1) {
        resolve(true);
      }
      resolve(false);
    });
    reportingEntityStream.on('error', (error) => {
      console.log('error');
      reject(error);
    })
  });
  if(!reportingEntityIsAnthem) {
    console.log("The reporting entity is not Anthem and so there is no point in creating a url list");
    return;
  }
  console.log("The reporting entity is Anthem. Proceeding to create file list.")

  // mainStream.on('data', data => { console.log(data) });
  // mainStream.on('end', () => { console.log('mainStream ended')});

  await new Promise((resolve, reject) => {
    setTimeout(function(){
      resolve();
    }, 2);
  })

  mainStream.emit("close");
  console.log('Pipeline completed.');
}

run().catch(console.error).finally(() => { console.log("last line of code. program should end now") });