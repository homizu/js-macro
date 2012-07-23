#!/opt/local/bin/node

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

//var js = require('./ex-javascript-parser');
var grammarFile = './ex-javascript.pegjs';
var debug = true;
var resultDir = 'converted/';

var argv = process.argv;
if (argv.length === 3) {
    var jsFile = argv[2];
    var divPos = jsFile.lastIndexOf('/');
    var fileDir = jsFile.substr(0, divPos+1) + resultDir;
    var fileName = jsFile.substr(divPos+1).split('.js')[0];
    var midtreeFile = fileDir + fileName + '.midtree';
    var treeFile = fileDir + fileName + '.tree';
    var pegjsFile = fileDir + fileName + '.pegjs';

    fs.mkdir(fileDir, function(err) {});

    fs.readFile(grammarFile, function(err, grammar) {
        if (err) throw err;
        grammar = '' + grammar;
        // generate a parser
        try {
            if (debug) console.log('building a parser ...');
            var parser = PEG.buildParser(grammar, { cache: true});
            if (debug) console.log('done');
        } catch (e) {
            console.log("Line " + e.line + ", column " + e.column + ": " + e.message + "\n");
            process.exit(1);
        }
        // make a parse tree
        fs.readFile(jsFile, function(err, jsCode) {
            if (err) throw err;
            jsCode = '' + jsCode;
            try {
                if (debug) console.log('parsing a JavaScript code ...');
                var tree = parser.parse(jsCode, 'start');
                if (debug) console.log('done\n%s', JSON.stringify(tree, null, 2));
            } catch(e) {
                console.log("Line " + e.line + ", column " + e.column + ": " + e.message + "\n");
                process.exit(1);
            }
            
            // write a mid-tree
            if (debug) console.log('writing a mid-tree file ...');
            fs.writeFile(midtreeFile,
                         JSON.stringify(tree, null, 2),
                         function(err) {
                             if (err) throw err;
                             if (debug) console.log('done');
                         });

            // generate a pegjs code
            if (debug) console.log('generating a pegjs code ...');
            var macro = generator.generate(tree);
            if (debug) console.log('done\n%s', macro);

            // write a pegjs code
            if (debug) console.log('writing a pegjs file ...');
            fs.writeFile(pegjsFile,
                         macro,
                         function(err) {
                             if (err) throw err;
                             if (debug) console.log('done');
                         });
            
            // re-generate a parser
            try {
                if (debug) console.log('re-building a parser ...');
                parser = PEG.buildParser(grammar+macro, { cache: true });
                if (debug) console.log('done');
            } catch (e) {
                console.log("Line " + e.line + ", column " + e.column + ": " + e.message + "\n");
                process.exit(1);
            }

            // make a parse tree
            try {
                if (debug) console.log('parsing a JavaScript code ...');
                var tree = parser.parse(jsCode, 'start');
                if (debug) console.log('done\n%s', JSON.stringify(tree, null, 2));
            } catch(e) {
                console.log("Line " + e.line + ", column " + e.column + ": " + e.message + "\n");
                process.exit(1);
            }

            // write a tree
            if (debug) console.log('writing a tree file ...');
            fs.writeFile(treeFile,
                         JSON.stringify(tree, null, 2),
                         function(err) {
                             if (err) throw err;
                             if (debug) console.log('done');
                         });

        });
    });
} else {
    console.log('Expected 1 argument, but got %d arguments', argv.length-2);
    process.exit(1);
}