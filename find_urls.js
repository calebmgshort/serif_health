const fs = require("fs");
const { parser } = require('stream-json')
const { streamArray } = require('stream-json/streamers/StreamArray');
const { pick } = require('stream-json/filters/Pick');
const zlib = require('zlib');

if(process.argv.length != 3) {
  console.error('This script must be run with exactly 1 argument: the path of the file to process');
  process.exit(1);
}
const inputFilePath = process.argv[2];
const outputFilePath = "output_url_list.txt"

async function run() {
  let inputStream = fs.createReadStream(inputFilePath);
  if(inputFilePath.split('.').pop() == "gz") {
    inputStream = inputStream.pipe(zlib.createGunzip());
  }
  inputStream = inputStream.pipe(parser());

  const outputStream = fs.createWriteStream(outputFilePath, { flags: 'a' });

  let reportingStructureLength = 0;
  let storedURLs = new Set();
  let numUrls = 0;
  inputStream = inputStream.pipe(pick({filter: 'reporting_structure'})).pipe(streamArray()); 
  inputStream.on('data', data => { 
    reportingStructureLength++; 
    const reporting_plans = data.value.reporting_plans;
    const in_network_files = data.value.in_network_files;

    if(!reporting_plans || !in_network_files) {
      return;
    }

    let isAnthem = false;
    for(let plan of reporting_plans) {
      if(plan.plan_name && plan.plan_name.indexOf('ANTHEM' != -1)){
        isAnthem = true;
        break;
      }
    }
    // 
    if(!isAnthem) {
      console.log('non-anthem plans: ' + JSON.stringify(reporting_plans));
      console.log('non-anthem files: ' + JSON.stringify(reporting_plans));
      return; 
    } 

    for(let file of in_network_files) {
      // let lowerCaseFileDescription = file.description.toLowerCase()
      if(file.description.indexOf('New York') != -1 && file.description.indexOf('PPO') != -1) {
        let url = file.location.split('?')[0];
        if(!storedURLs.has(url)) {
          outputStream.write(url + '\n');
          storedURLs.add(url);
          numUrls++;
          if(storedURLs.size > 100000) {
            storedURLs.clear();
          }
        }
      }
    }
  });
  inputStream.on('error', (error) => {
    console.error(error);
  })

  // Give myself something to look at while waiting for the script to finish running
  let i = 1;
  while(!inputStream.closed) {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(`after ${i} seconds: ${reportingStructureLength} reporting_structure array elements processed and ${numUrls} relevant urls found`)
        i++;
        resolve();
      }, 1 * 1000);
    })
  }

  outputStream.close();

  // Some nice stats at the end
  console.log('total number of array elments processed in reporting_structure: ' + reportingStructureLength);
  console.log('total number of urls in the output list: ' + numUrls);
}

run().catch(console.error);