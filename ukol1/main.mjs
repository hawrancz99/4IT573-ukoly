import { promises as fs } from "fs"
import path from 'path'

// check if both source and destination are in the command
const checkCommand = () => {
  if (!source || !destination) {
    console.log('You must provide both source and destination.');
    return false;
  } else {
    return true;
  }

}
// check if source exists and is not empty
const checkSource = async (source) => {
  let sourceOk = true;
  try {
    const stats = await fs.stat(source);
    if (stats.size === 0) {
      console.log(`${source} is empty.`);
      sourceOk = false;
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('Source doesn\'t exist.');
      sourceOk = false;
    }
  }
  return sourceOk;
}

// check if destination directory exists, if not create it
const checkDestDir = async() =>{
  const destinationDir = path.dirname(destination);
  const dir = './' + destinationDir;
  try {
    // dir exists
    await fs.stat(dir);
  } catch (err) {
    // dir doesn't exist, create it
    if (err.code === 'ENOENT') {
      await fs.mkdir(dir);
    } else {
      throw err;
    }
  }
}

// check if destination file is empty and if it doesn't exist create it
const checkDestFile = async() =>{
  let destFileOk = true;
  try {
    const destinationStat = await fs.stat(destination);
    if (destinationStat.size > 0) {
      console.log(`${destination} is not empty.`);
      destFileOk = false;
    }
  } catch (error) {
    // destination file doesn't exist, create it
    if (error.code === 'ENOENT') {
      await fs.writeFile(destination, '');
    } else {
      throw error;
    }
  }
  return destFileOk;
}

// copy files
const copyFile = async (source, destination) => {
  try {
    const data = await fs.readFile(source);
    await fs.writeFile(destination, data);
    console.log(`Data has been succesfully copied from ${source} to ${destination}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// process command line
const args = process.argv.slice(2);
const source = args[0];
const destination = args[1];

// run it
if (checkCommand()) {
  if (await checkSource(source)) {
    await checkDestDir();
    if (await checkDestFile()){
      await copyFile(source, destination);
    }
  }
}



