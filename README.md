# fixedStreamReader

A stream parser that breaks fixed-sized text data into arrays, asynchronously. 

There are 2 portions to this system: 
1. `streamline` is a much simplified version of readline that can take a stream and parse out single lines, 1 by 1, for processing. 
1. `fixedStreamReader` takes those fixed lines and parses out data, 1 line at a time. 

I envisioned this library for taking very large fixed-width files from HTTP/S and parsing in memory, mostly for serverless use. 

## streamline

**Usage**:
```
const streamline = require('streamline');

const reader = fs.createReadStream('./__tests__/smoketest.txt');
const parser = new streamline(reader, { 
    "lineFunction": function(l){
        console.log(l);
    },
    chunkSize: 1024 * 16,
    maxLineSize: 1024 * 32,
    encoding: 'utf-8'
});

parser.promise.then( d =>{
    console.log('Done');
    reader.close();
})
```

### Implementation details

Streamline starts reading as soon as you create it. Specifically, it immediately attached to the onData evert, which makes `stream.Reader` go to the running state. This removes some of the control you have, but makes it easy to pull large files and parse them line by line. 

You can modify the following options to change behavior

* `lineFunction` - supply a function that takes a single string argument and every line it parses will call this function
* `chunkSize` - How much data to process at once. Defaults to 16k
* `maxLineSize` - Largest text line it will process. Defaults to 32k
* `encoding` - Encoding to translate from . Defaults to 'utf8'

# To Do

- [ ] Make streamline handle opening files, s3 links, and http links
- [ ] Get better error handling
- [ ] Test lines longer than the maxLineSize
- [ ] Test with network streams

## fixedStreamReader

Not complete. Will take a series of positions in a string as input, and a stream/file/URL, and a per-line callback, and process the lines.
