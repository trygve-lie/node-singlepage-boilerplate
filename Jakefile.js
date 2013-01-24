var fs          = require("fs"),
    uglify      = require("uglify-js"),
    jsdom       = require("jsdom"),
    cleanCss    = require("clean-css"),
    b64img      = require('css-b64-images');


var package         = JSON.parse(fs.readFileSync('./package.json')),

    compress        = {
        html    : true,
        js      : true,
        css     : true
    },

    generate        = {
        cssBase64Images     : true,
        sourceMap           : true
    },

    applicationCache = {
        "CACHE MANIFEST"    : [],
        "CACHE"             : [
            'gfx/icon/app.png',
            'gfx/splash/app.png',
            'gfx/example.jpg'
        ],
        "NETWORK"           : ['*'],
        "FALLBACK"          : []
    },


    // Input
    inputPath       = {
        root    : 'src/',
        html    : 'src/',
        js      : 'src/js/',
        css     : 'src/css/'
    },

    inputFileName   = {
        html    : 'index.html'
    },

    input           = {
        html    : inputPath.html + inputFileName.html
    },

    // Output
    outputFileName  = {
        html        : 'index.html',
        js          : 'app.min.' + package.version + '.js',
        map         : 'app.min.' + package.version + '.js.map',
        css         : 'app.min.' + package.version + '.css',
        manifest    : 'manifest.appcache'
    },

    outputFilePath  = {
        html        : 'dist/',
        js          : 'dist/js/',
        map         : 'dist/js/',
        css         : 'dist/css/',
        manifest    : 'dist/'
    },

    outputFile      = {
        html        : outputFilePath.html + outputFileName.html,
        js          : outputFilePath.js + outputFileName.js,
        map         : outputFilePath.map + outputFileName.map,
        css         : outputFilePath.css + outputFileName.css,
        manifest    : outputFilePath.manifest + outputFileName.manifest
    },

    outputWwwPath   = {
        html        : '',
        js          : 'js/',
        map         : 'js/',
        css         : 'css/',
        manifest    : ''
    },

    outputWww       = {
        html        : outputWwwPath.html + outputFileName.html,
        js          : outputWwwPath.js + outputFileName.js,
        map         : outputWwwPath.map + outputFileName.map,
        css         : outputWwwPath.css + outputFileName.css,
        manifest    : outputWwwPath.manifest  + outputFileName.manifest
    },

    // Adjust partis in the document. Normaly tweaking DOM values like
    // adding a version number to a DOM element.
    adjust          = {
        versionId   : 'version'
    };



console.log('===========================');
console.log('Name:', package.name);
console.log('Version:', package.version);
console.log('===========================');



// Helper - Write file to disc
function writeFile(file, content) {
    fs.writeFile(file, content, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log(file, 'written');
    });
}


// Helper - Remove a DOM element
function removeElement(element) {
    if(element) {
        var parentElement = element.parentNode;
        parentElement.removeChild(element);
    }
}


// Helper - DOM walker
// Shamelessly copied from https://gist.github.com/958000
function domWalker(node, callback) {
    var skip, tmp;
    var depth = 0;

    do {
        if ( !skip ) {
            skip = callback.call(node, depth) === false;
        }

        if ( !skip && (tmp = node.firstChild) ) {
            depth++;

        } else if ( tmp = node.nextSibling ) {
            skip = false;

        } else {
            tmp = node.parentNode;
            depth--;
            skip = true;
        }

        node = tmp;

    } while ( depth > 0 );
}



// Build tasks

namespace("min", function(){

    desc('run uglifyjs on all js files');
    task('js', function(filesArr) {

        var result = uglify.minify(filesArr, {
            outSourceMap: outputFileName.map
        });

        // Write minified js and source map files
        writeFile(outputFile.js, result.code);
        writeFile(outputFile.map, result.map);
    });


    desc('run clean-css on all css files');
    task('css', function(filesArr) {

        var content = [];

        filesArr.forEach(function(file){
            var styles = fs.readFileSync(file, "binary");

            // NOTE: './' + inputPath.css might need to be adjusted to something matching in the css files....
            b64img.fromString(styles, './' + inputPath.css, '', function(err, css){
                content.push(css);

                // Encoding runs async so run only on last instance
                if (content.length === filesArr.length) {
                    var result = cleanCss.process(content.join(''), {removeEmpty:true});
                    writeFile(outputFile.css, result);
                }
            });
        });

    });


    desc('run minification on html');
    task('html', function() {

        fs.readFile(input.html, "binary", function(error, data) {
            if(error){
                return console.log(error);
            }

            jsdom.env({
                html: data,
                done: function (errors, window) {
                    if(errors){
                        return console.log(errors);
                    }

                    var doc     = window.document,
                        newDoc  = doc.createDocumentFragment();

                    // Remove all external js files
                    doc.querySelectorAll('script[src]').forEach(function(el){
                        removeElement(el);
                    });

                    // Remove all external css files
                    doc.querySelectorAll('link[rel=stylesheet]').forEach(function(el){
                        removeElement(el);
                    });

                    // Append ApplicationCache manifest file
                    var manifestEl = doc.querySelectorAll('html')[0];
                    manifestEl.setAttribute('manifest', outputWww.manifest);

                    // Append link to minified and prebuilt js file
                    var jsEl = doc.createElement('script');
                    jsEl.setAttribute('src', outputWww.js);
                    doc.body.appendChild(jsEl);

                    // Append link to minified and prebuilt css file
                    var cssEl = doc.createElement('link');
                    cssEl.setAttribute('href', outputWww.css);
                    cssEl.setAttribute('rel', 'stylesheet');
                    doc.head.appendChild(cssEl);

                    // Take all inline javascript files, minify them and add them back
                    doc.querySelectorAll('script[type*=javascript]').forEach(function(el){
                        var minified = uglify.minify(el.innerHTML, {
                            fromString: true
                        });
                        el.innerHTML = minified.code;
                    });

                    // Append version number to DOM element with the id "version"
                    doc.getElementById(adjust.versionId).innerHTML = package.version;

                    // Walk the documents DOM and clone _only_ element nodes and text nodes which does not contain
                    // just whitespace into a new document fragment. This will result in a document fragment which
                    // does not contain any whitespace between elements nodes.
                    domWalker(doc.documentElement, function(depth){

                        // Clone only #element nodes or #text nodes which is not only whitespace
                        if ((this.nodeType === 1) || (this.nodeType === 3 && this.nodeValue.replace(/\s/g, '').length)) {
                            var newEl = this.cloneNode(false);
                            var i = 0;
                            var child = newDoc;
                            for (i = 0; i < depth; i += 1) {
                                child = child.lastChild;
                            }
                            child.appendChild(newEl);
                        }

                        return true;
                    });

                    // Empty the documents DOM and insert the document fragment which holds the result
                    // from the DOM walk
                    removeElement(doc.documentElement);
                    doc.appendChild(newDoc);

                    // Doctype is lost in the DOM parsing, append one and convert the DOM to a string
                    var result = '<!doctype html>' + doc.innerHTML.trim();

                    // Write the manipulated html to a new file
                    writeFile(outputFile.html, result);
                }
            });

        });

    });

});



namespace("url", function(){

    desc('get all external js files in a document');
    task('js', function(nextTask) {

        fs.readFile(input.html, "binary", function(error, data) {
            if(error){
                return console.log(error);
            }

            jsdom.env({
                html: data,
                done: function (errors, window) {
                    if(errors){
                        return console.log(errors);
                    }

                    var doc     = window.document,
                        files   = [];

                    doc.querySelectorAll('script[src]').forEach(function(el){
                        files.push(inputPath.root + el.getAttribute('src'));
                    });

                    console.log('document contains ' + files.length + ' external js files');
                    if (nextTask) {
                        jake.Task[nextTask].invoke(files)
                    }
                }
            });

        });

    });


    desc('get all external css files in a document');
    task('css', function(nextTask) {

        fs.readFile(input.html, "binary", function(error, data) {
            if(error){
                return console.log(error);
            }

            jsdom.env({
                html: data,
                done: function (errors, window) {
                    if(errors){
                        return console.log(errors);
                    }

                    var doc     = window.document,
                        files   = [];

                    doc.querySelectorAll('link[rel=stylesheet]').forEach(function(el){
                        files.push(inputPath.root + el.getAttribute('href'));
                    });

                    console.log('document contains ' + files.length + ' external css files');
                    if (nextTask) {
                        jake.Task[nextTask].invoke(files)
                    }
                }
            });

        });

    });

});



namespace("files", function(){

    desc('create application manifest file');
    task('manifest', function(nextTask) {

        var content = [];

        applicationCache['CACHE MANIFEST'].push('# ' + new Date().toString());
        applicationCache['CACHE MANIFEST'].push('# ' + package.version);

        applicationCache['CACHE'].push(outputWww.html);
        applicationCache['CACHE'].push(outputWww.js);
        applicationCache['CACHE'].push(outputWww.css);

        for (key in applicationCache) {
            if (key === 'CACHE MANIFEST') {
                content.push(key);
            } else {
                content.push(key + ':');
            }
            applicationCache[key].push('');
            content = content.concat(applicationCache[key]);
        }

        writeFile(outputFile.manifest, content.join('\n'));
    });

});


desc("Run all minify tasks");
task('minify', function() {
    jake.Task["url:js"].invoke("min:js");
    jake.Task["url:css"].invoke("min:css");
    jake.Task["min:html"].invoke();
});


desc("Build everything");
task('build', [], function() {
    jake.Task["minify"].invoke();
    jake.Task["files:manifest"].invoke();
});