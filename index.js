// Copyright Dan Afonso 
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';
const stream = require('stream');

/**
 * TODO:
 * - [ ] Better Error handling
 * - [ ] better define what gets trimmed off the end 
 * - [ ] Be able to handle a URL or file name
 */

class streamline{
    // variables
    _stream;
    chunkSize = 16 * 1024;
    maxLineSize = 32 * 1024;
    _bufferPos = 0;
    encoding = 'utf8';
    lineFunction = false;
    lines = [];
    done = false;
    promise = false;
    _resolve;
    _reject;

    // Constructor
    constructor(thing, options=false){
        if (!thing instanceof stream.Readable){
            throw new Error(`readline: Expected stream.readable, got {Object.prototype.toString.call(thing)}`);
        }

        if (options){
            for (const k in options){
                if (this.hasOwnProperty(k)) {
                    this[k] = options[k];
                }
            }
        }

        this._stream = thing;
        this._buffer = Buffer.alloc(this.maxLineSize + this.chunkSize, 0);
        this.promise = new Promise((resolve, reject) => { this._resolve = resolve; this._reject = reject;});
        this._stream.on('data', (d) => {this.chunkIn(d, this)});
        this._stream.on('end', () => {this.end(this)});
        return this;
    }

    // data chunk in
    chunkIn(chunk, me){
        try{
            // Greab the new chunk of data
            const chunkLength = chunk.length;
            me._bufferPos += chunk.copy(me._buffer, me._bufferPos);

            // scan the buffer for EOL characters
            let i = 0;
            let startPos = 0;
            while ((i = me._buffer.indexOf("\n", startPos, me.encoding)) > -1){
                let line = me._buffer.slice(startPos, i).toString(me.encoding).trimEnd();
                startPos = ++i;
                me.onLine(line);
            }

            if (startPos > 0){
                // move the data back to the begining of the buffer
                for(let pos = startPos; pos < me._bufferPos; pos++){
                    me._buffer[pos - startPos] = me._buffer[pos];
                }
                me._buffer.fill("#", startPos, me._bufferPos - startPos);
                me._bufferPos -= startPos;
            }
        } catch (e) {
            me._stream.close();
            me._reject(e);
        }
    }

    // data stream finished
    end(me){
        // emit the last of the buffer
        const line = me._buffer.slice(0, me._bufferPos).toString(me.encoding).trimEnd();
        me.onLine(line);
        me.finish();
    }

    finish(){
        this.done = true;
        if (this.promise && this._resolve){
            this._resolve(this.lines);
        }
    }

    // Emit the line
    onLine(line){
        if (this.lineFunction && typeof(this.lineFunction) === 'function'){
            this.lineFunction(line);
        } else {
            this.lines.push(line);
        }
    }

    // access functions
    get stream(){
        return this._stream;
    }
}

module.exports = streamline;