import { createServer } from 'http';
import { readFile, writeFile } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = createServer((req, res) => {
  const url = decodeURI(req.url); // decodeURI to handle the spaces in URL
  const parts = url.split('/');


  // check if URL has correct format
  if (parts[1] !== 'read' && parts[1] !== 'write') {
    res.statusCode = 400;
    res.end('Invalid URL format. Use /read/file.extension or /write/file.extension/content');
    return;
  }

  // find index of "read" or "write" part of URL
  const index = parts.findIndex(part => part === 'read' || part === 'write');

  // join subdirectories with file name to form file path
  const file = parts[parts.length - (parts[index] === 'read' ? 1 : 2)];
  const filePath = join(__dirname, ...parts.slice(index + 1, (parts[index] === 'read' ? -1 : -2)), file);

  // handle read or write request
  if (parts[index] === 'read') {
    readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end(`File ${file} not found`);
      } else {
        res.end(data.toString());
      }
    });
  } else if (parts[index] === 'write') {
    const content = url.substring(url.lastIndexOf('/') + 1)
    writeFile(filePath, content, err => {
      if (err) {
        res.statusCode = 500;
        res.end(`Error writing to file ${file}`);
      } else {
        res.end(`File ${file} written successfully`);
      }
    });
  } else {
    res.statusCode = 404;
    res.end('Invalid URL');
  }
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
