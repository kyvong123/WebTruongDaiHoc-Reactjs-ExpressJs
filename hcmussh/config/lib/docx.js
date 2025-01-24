module.exports = app => {
    const PizZip = require('pizzip');
    const Docxtemplater = require('docxtemplater');
    const ImageModule = require('docxtemplater-image-module-free');

    const tmp = require('temporary');
    const exec = require('child_process').exec;
    // Demo: https://docxtemplater.com/demo

    function parser(tag) {
        // We write an exception to handle the tag '$pageBreakExceptLast'
        if (tag === '$pageBreakExceptLast') {
            return {
                get(scope, context) {
                    const totalLength =
                        context.scopePathLength[
                        context.scopePathLength.length - 1
                        ];
                    const index =
                        context.scopePathItem[
                        context.scopePathItem.length - 1
                        ];
                    const isLast = index === totalLength - 1;
                    if (!isLast) {
                        return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
                    } else {
                        return '';
                    }
                },
            };
        }
        // We use the expressionParser as the default fallback
        // If you don't wish to use the expressionParser,
        // you can use the default parser as documented here:
        // https://docxtemplater.com/docs/configuration#default-parser
        return {
            get: function (scope) {
                // scope will be {user: 'John'}
                if (tag === '.') {
                    return scope;
                } else {
                    // Here we return the property 'user' of the object {user: 'John'}
                    return scope[tag];
                }
            },
        };
    }
    app.docx = {
        replaceErrors: (key, value) => {
            if (value instanceof Error) {
                return Object.getOwnPropertyNames(value).reduce(function (error, key) {
                    error[key] = value[key];
                    return error;
                }, {});
            }
            return value;
        },

        errorHandler: (error) => {
            if (error.properties && error.properties.errors instanceof Array) {
                throw error.properties.errors.map(function (error) {
                    return error.properties.explanation;
                }).join('\n');
            } else {
                throw error;
            }
        },

        generateFile: (inputFile, data, done) => new Promise((resolve, reject) => {
            //Load the docx file as a binary
            const content = app.fs.readFileSync(inputFile, 'binary');
            const zip = new PizZip(content);
            try {
                let doc = new Docxtemplater(zip, {
                    paragraphLoop: true,
                    linebreaks: true,
                    nullGetter() { return ''; }
                });
                doc.setData({ ...data, raw: '<w:br w:type="page"/>' });
                // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
                doc.render();
                let buf = doc.getZip().generate({ type: 'nodebuffer' });
                done && done(null, buf);
                resolve(buf);
            } catch (error) { done && done(error); reject(error); }
        }),

        generateFileHasImage: (inputFile, data, config, done) => new Promise((resolve, reject) => {
            try {
                //Below the options that will be passed to ImageModule instance
                let opts = {};
                opts.centered = true; //Set to true to always center images
                opts.fileType = 'docx'; //Or pptx

                //Pass your image loader
                // eslint-disable-next-line no-unused-vars
                opts.getImage = function (tagValue, tagName = 'image') {
                    //tagValue is 'examples/image.png'
                    //tagName is 'image'
                    return app.fs.readFileSync(tagValue);
                };

                //Pass the function that return image size
                // eslint-disable-next-line no-unused-vars
                opts.getSize = function (img, tagValue, tagName = 'image') {
                    //img is the image returned by opts.getImage()
                    //tagValue is 'examples/image.png'
                    //tagName is 'image'
                    //tip: you can use node module 'image-size' here
                    return config && config.length == 2 ? config : [120, 120];
                };

                let imageModule = new ImageModule(opts);

                const content = app.fs.readFileSync(inputFile, 'binary');
                const zip = new PizZip(content);
                let doc = new Docxtemplater();
                doc.attachModule(imageModule);
                doc.loadZip(zip);
                doc.setOptions({ parser, paragraphLoop: true, linebreaks: true, });
                doc.setData(data);
                doc.render();
                let buf = doc.getZip().generate({ type: 'nodebuffer', });
                done && done(null, buf);
                resolve(buf);
            } catch (error) { done && done(error); reject(error); }
        }),

        writeDocumentFile: (inputFile, data, outputFile, done) => {
            //Load the docx file as a binary
            const content = app.fs.readFileSync(app.publicPath + inputFile, 'binary');
            const zip = new PizZip(content);
            let doc;
            try {
                doc = new Docxtemplater(zip);
            } catch (error) {
                // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
                console.log(error);
            }

            //set the templatelet iables
            doc.setData(data);

            try {
                // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
                doc.render();
            } catch (error) {
                // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
                console.log(error);
            }

            let buf = doc.getZip().generate({ type: 'nodebuffer' });

            // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
            app.fs.writeFileSync(app.publicPath + outputFile, buf);

            done();
        },

        mergeFile: (listPath, mergeFilePath) => new Promise((resolve, reject) => {
            let DocxMerger = require('docx-merger');
            let path = require('path');

            let listFile = listPath.map(item => app.fs.readFileSync(path.resolve(item), 'binary'));

            let docx = new DocxMerger({}, listFile);

            //SAVING THE DOCX FILE

            docx.save('nodebuffer', function (data) {
                app.fs.writeFile(mergeFilePath, data, function (err) {
                    err ? reject({ err }) : resolve();
                });
            });
        }),

        toPdf: (inpath, outdir, mergeFilePath) => new Promise((resolve, reject) => {
            let cmd = 'nohup ' + (app.isDebug ? 'soffice' : 'libreoffice7.3') + ` --headless --convert-to pdf --outdir ${outdir} --nologo --norestore ${inpath.join(' ')}  & `;
            exec(cmd, (error) => {
                if (error) {
                    reject(error);
                } else {
                    if (mergeFilePath) {
                        exec(`gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOutputFile=${mergeFilePath} ${inpath.join(' ').replaceAll('docx', 'pdf')}`, (err, stdout, stderr) => {
                            if (err) {
                                console.log(err);
                                reject(err);
                            } else {
                                resolve({ stdout, stderr });
                            }
                        });
                    } else {
                        resolve();
                    }
                }
            });

        }),

        toPdfBuffer: (buffer) => new Promise((resolve, reject) => {
            let file = new tmp.File();
            let outdir = new tmp.Dir();
            file.writeFile(buffer, (err) => {

                if (err) reject(err);

                let cmd = (app.isDebug ? 'soffice' : 'libreoffice7.3') + ' --headless --convert-to pdf ' + file.path + ' --outdir ' + outdir.path;

                exec(cmd, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        app.fs.readFile(app.path.join(outdir.path, app.path.basename(file.path, app.path.extname(app.path.basename(file.path))) + '.pdf'), (err, buffer) => {
                            if (err) reject(err);
                            resolve(buffer);
                            app.fs.deleteFolder(outdir.path);
                        });
                    }
                });
            });
        })
    };
};