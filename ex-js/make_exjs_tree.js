#!/usr/bin/env node

/* 
   引数に指定されたJSファイルをパーズし，JSONを生成するプログラム．
   引数のJSファイルが存在するフォルダにconvertedというフォルダを作成し，以下の3ファイルを生成する(XXXはファイル名)．
   - XXX.midtree： 1回目のパーズで生成されるJSONを出力したもの
   - XXX.pegjs  ： JSONから生成したPEG.jsのコードを出力したもの
   - XXX.tree   ： 拡張後のパーサーでパーズした結果、生成されるJSONを出力したもの
*/

(function () {
    var fs = require('fs');
    var util = require('util');
    var crypto = require('crypto');
    var path = require('path');
    var PEG = require('pegjs');
    var generator = require('pegjs-generator2');
    var parser = require('ex-javascript-parser');
    //var parser = require('jsx-parser');

    var grammarFile = process.env.JSX + '/ex-javascript.pegjs';
    //var grammarFile = 'jsx.pegjs';
    var debug = true;
    var resultDir = 'converted/';
    var parserDir = process.env.JSX + '/parsers/';
    var jsxRevision = 5;

    var start, end; // 時間計測用変数

    var jsFile, midtreeFile, treeFile, pegjsFile, parserFile;
    var fileDir, fileName;

    var argv = process.argv;

    var hash = function(peg_code, jsx_revision) {
        return crypto.createHash('sha1').update(peg_code).digest("hex") + jsx_revision;
    };
    
    var printErrorMessage = function (e) {
        var m = "";
        if (e instanceof parser.SyntaxError)
            m += "Line " + e.line + ", column " + e.column + ": ";
        m += e.message + "\n";
        console.log(m);
    }

    if (argv.length === 3) {
        jsFile = argv[2];
        fileDir = path.join(path.dirname(jsFile), resultDir);
        fileName = path.basename(jsFile, '.js');
        midtreeFile = path.join(fileDir, fileName + '.midtree');
        treeFile = path.join(fileDir, fileName + '.tree');
        pegjsFile = path.join(fileDir, fileName + '.pegjs');

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
//                    console.log((e instanceof SyntaxError ? "Line " + e.line + ", column " + e.column + ": " : "") + e.message + "\n");
                    printErrorMessage(e);
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
//                    console.log("Line " + e.line + ", column " + e.column + ": " + e.message + "\n");
                    printErrorMessage(e);
                    process.exit(1);
                }

                // generate a pegjs code
                if (debug) console.log('Generating a pegjs code ...');
                start = new Date();
                macro = generator.generate(midtree);
                end = new Date();
                if (debug) console.log('Done.\nTime: %ds.\n%s', (end.getTime() - start.getTime()) / 1000, macro);

                // look for a parser already generated from same pegjs code.
                if (debug) console.log('Looking for a parser generated from same pegjs code ...');
                parserFile = parserDir + hash(macro, jsxRevision) + '-parser.js';
                path.exists(parserDir, function(dir) {
                    path.exists(parserFile, function(file) {
                        if (file) {
                            if (debug) console.log('Find a parser');
                            parser = require(parserFile);
                        } else {
                            if(!dir)
                                fs.mkdir(parserDir, function(err) {});
                
                            // re-generate a parser
                            try {
                                if (debug) console.log('Re-building a parser ...');
                                grammar = grammar + macro;
                                start = new Date();
                                parser = PEG.buildParser(grammar, { cache: true });
                                end = new Date();
                                if (debug) console.log('Done.\nTime: %ds.\n', (end.getTime() - start.getTime()) / 1000);
                            } catch (e) {
//                                console.log("Line " + e.line + ", column " + e.column + ": " + e.message + "\n");
                                printErrorMessage(e);
                                process.exit(1);
                            }
                        }

                        // make a parse tree
                        try {
                            if (debug) console.log('Parsing a JavaScript code ...');
                            start = new Date();
                            tree = parser.parse(jsCode, 'start');
                            end = new Date();
                            if (debug) console.log('Done.\nTime: %ds.\n%s', (end.getTime() - start.getTime()) / 1000, JSON.stringify(tree, null, 2));
                        } catch(e) {
//                            console.log("Line " + e.line + ", column " + e.column + ": " + e.message + "\n");
                            printErrorMessage(e);
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

                        // write a parser code
                        if (!file) {
                            if (debug) console.log('Writing a parser file ...');
                            fs.writeFile(parserFile,
                                         'module.exports = ' + parser.toSource() + ';',
                                         function(err) {
                                             if (err) throw err;
                                             if (debug) console.log('Done.');
                                         });
                        }
                        
                    });
                });
                        
            });
        });
    } else {
        console.log('Expected 1 argument, but got %d arguments', argv.length-2);
        process.exit(1);
    }
})();
