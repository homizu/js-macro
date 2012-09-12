#!/usr/bin/env node

/* 
   引数に指定されたJSファイルをパーズし，JSONを生成するプログラム．
   引数のJSファイルが存在するフォルダにconvertedというフォルダを作成し，以下の3ファイルを生成する(XXXはファイル名)．
   - XXX.midtree： 1回目のパーズで生成されるJSONを出力したもの
   - XXX.pegjs  ： JSONから生成したPEG.jsのコードを出力したもの
   - XXX.tree   ： 拡張後のパーサーでパーズした結果、生成されるJSONを出力したもの
*/

var fs = require('fs');
var util = require('util');
var PEG = require('pegjs');
var generator = require('./pegjs-generator');
var parser = require('./ex-javascript-parser');
//var parser = require('./jsx-parser');

var grammarFile = './ex-javascript.pegjs';
//var grammarFile = './jsx.pegjs';
var debug = true;
var resultDir = 'converted/';

var start, end; // 時間計測用変数

var jsFile, midtreeFile, treeFile, pegjsFile;
var divPos;
var fileDir, fileName;

var argv = process.argv;
if (argv.length === 3) {
    jsFile = argv[2];
    divPos = jsFile.lastIndexOf('/');
    fileDir = jsFile.substr(0, divPos+1) + resultDir;
    fileName = jsFile.substr(divPos+1).split('.js')[0];
    midtreeFile = fileDir + fileName + '.midtree';
    treeFile = fileDir + fileName + '.tree';
    pegjsFile = fileDir + fileName + '.pegjs';

    fs.mkdir(fileDir, function(err) {});

    fs.readFile(grammarFile, function(err, gram) {
        var midtree, tree;
        var macro;
        var grammar = '' + gram;

        if (err) throw err;

        // generate a parser
        if (!parser.parse) {
            try {
                if (debug) console.log('Building a parser ...');
                start = new Date();
                parser = PEG.buildParser(grammar, { cache: true});
                end = new Date();
                if (debug) console.log('Done.\nTime: %ds.', (end.getTime() - start.getTime()) / 1000);
            } catch (e) {
                console.log("Line " + e.line + ", column " + e.column + ": " + e.message + "\n");
                process.exit(1);
            }
        }
        
        // make a parse tree
        fs.readFile(jsFile, function(err, jsCode) {
            if (err) throw err;
            jsCode = '' + jsCode;
            try {
                if (debug) console.log('Parsing a JavaScript code ...');
                start = new Date();
                midtree = parser.parse(jsCode, 'start');
                end = new Date();
                if (debug) console.log('Done.\nTime: %ds.\n%s', (end.getTime() - start.getTime()) / 1000, JSON.stringify(midtree, null, 2));
            } catch(e) {
                console.log("Line " + e.line + ", column " + e.column + ": " + e.message + "\n");
                process.exit(1);
            }

            // generate a pegjs code
            if (debug) console.log('Generating a pegjs code ...');
            start = new Date();
            macro = generator.generate(midtree);
            end = new Date();
            if (debug) console.log('Done.\nTime: %ds.\n%s', (end.getTime() - start.getTime()) / 1000, macro);
            
            // re-generate a parser
            try {
                if (debug) console.log('Re-building a parser ...');
                grammar = grammar + macro;
                start = new Date();
                parser = PEG.buildParser(grammar, { cache: true });
                end = new Date();
                if (debug) console.log('Done.\nTime: %ds.\n', (end.getTime() - start.getTime()) / 1000);
            } catch (e) {
                console.log("Line " + e.line + ", column " + e.column + ": " + e.message + "\n");
                process.exit(1);
            }

            // make a parse tree
            try {
                if (debug) console.log('Parsing a JavaScript code ...');
                start = new Date();
                tree = parser.parse(jsCode, 'start');
                end = new Date();
                if (debug) console.log('Done.\nTime: %ds.\n%s', (end.getTime() - start.getTime()) / 1000, JSON.stringify(tree, null, 2));
            } catch(e) {
                console.log("Line " + e.line + ", column " + e.column + ": " + e.message + "\n");
                process.exit(1);
            }

            // write a mid-tree
            if (debug) console.log('Writing a mid-tree file ...');
            fs.writeFile(midtreeFile,
                         JSON.stringify(midtree, null, 2),
                         function(err) {
                             if (err) throw err;
                             if (debug) console.log('Done.');
                         });

            // write a pegjs code
            if (debug) console.log('Writing a pegjs file ...');
            fs.writeFile(pegjsFile,
                         macro,
                         function(err) {
                             if (err) throw err;
                             if (debug) console.log('Done.');
                         });

            // write a tree
            if (debug) console.log('Writing a tree file ...');
            fs.writeFile(treeFile,
                         JSON.stringify(tree, null, 2),
                         function(err) {
                             if (err) throw err;
                             if (debug) console.log('Done.');
                         });

        });
    });
} else {
    console.log('Expected 1 argument, but got %d arguments', argv.length-2);
    process.exit(1);
}