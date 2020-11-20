const fs = require('fs');
const { TestScheduler } = require('jest');
const util = require('util');
const r = require ('../index.js');

const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);

function unicodeLength(str) {
    return [...str].length;
}

// Test 1: open a file and see if it can read lines to memory
test('Smoke test it can read a file into memory', () =>
    {
        let reader = fs.createReadStream('./__tests__/smoketest.txt');

        expect(reader).toBeDefined();

        return parser = new r(reader).promise.then( d =>{
            expect(d.length).toBe(8);
            expect(d[2]).toBe('of the');
            reader.close();
        })
    });

// Test 2: open a file and see if it can read a bunch of lines to a function
test('Smoke test it can read a file line by line', () =>
    {
        let reader = fs.createReadStream('./__tests__/smoketest.txt');
        expect(reader).toBeDefined();

        var lines = [];
        const parser = new r(reader, { "lineFunction": function(l){
            lines.push(l);
        }});
        
        return parser.promise.then( d =>{
            expect(lines.length).toBe(8);
            expect(lines[7]).toBe('one');
            reader.close();
        })
    });

// Test 3: small buffers
test('Check for lines bigger than the chunk size', () =>
    {
        let reader = fs.createReadStream('./__tests__/longish.txt');
        expect(reader).toBeDefined();

        var lines = [];
        const parser = new r(reader, { "lineFunction": function(l){
                lines.push(l);
            },
            chunkSize: 256
        });
        
        return parser.promise.then( d =>{
            expect(lines.length).toBe(41);
            expect(lines[40]).toBe('LGTM');
            reader.close();
        })
    });

// Test 4: Unicode
test('Unicode input', () =>
{
    let reader = fs.createReadStream('./__tests__/unicode.txt');

    expect(reader).toBeDefined();

    return parser = new r(reader).promise.then( d =>{
        expect(d.length).toBe(4);
        const testUnicodeString = "😀aaa😰bbb😇ccc😱ddd";
        let targetLength = unicodeLength(testUnicodeString);
        let x = unicodeLength(d[0]);
        expect(unicodeLength(d[1])).toBe(targetLength);
        expect(unicodeLength(d[3])).toBe(targetLength);
        reader.close();
    })
});
