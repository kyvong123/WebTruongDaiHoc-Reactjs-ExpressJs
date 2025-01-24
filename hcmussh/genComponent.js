const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const devModule = fs.existsSync('./asset/devModule.json') ? require('./asset/devModule.json') : {};
const devModuleSelfDefine = fs.existsSync('./asset/devModule.selfDefine.json') ? require('./asset/devModule.selfDefine.json') : {};
const argv = process.argv;
const buildMode = argv.length == 3 && (argv[2] == '-b' || argv[2] == '--build');
const finalModule = buildMode ? devModule : Object.assign({}, devModule, devModuleSelfDefine);
// Just build explicit subModule, ex: node genComponent.js -m mdOisp | node genComponent.js -m admin
const moduleMode = argv.length == 4 && (argv[2] == '-m' || argv[2] == '--module');
const moduleName = moduleMode ? argv[3] : null;

const buildWebpack = (mainModule) => new Promise((resolve) => {
    // TODO: subSubModule
    const webpackConfig = require('./webpack.moduleBuild.js')({}, { entry: mainModule });
    webpackConfig.mode = 'production';
    webpack(webpackConfig, (error, state) => {
        if (error || state.hasErrors()) {
            console.log(error, state && state.compilation && state.compilation.errors);
            resolve({ error: 'Error when bundling React!' });
        } else {
            setTimeout(() => resolve({}), 1000);
        }
    });
});
const getAllReactFile = (folderPath) => {
    const files = fs.readdirSync(folderPath);
    const filePaths = [];
    for (const file of files) {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            if (file != 'controller' && file != 'model') {
                filePaths.push(...getAllReactFile(fullFilePath));
            }
        } else if (fs.statSync(fullFilePath).isFile()) {
            if (file != 'index.jsx' && file != 'redux.jsx' && file.endsWith('.jsx')) {
                filePaths.push(fullFilePath);
            }
        }
    }
    return filePaths;
};

(async () => {
    // Get All modules
    let moduleData = [];
    fs.readdirSync('./modules').forEach(mainModuleName => {
        fs.statSync(`./modules/${mainModuleName}`).isDirectory() && fs.readdirSync(`./modules/${mainModuleName}`).forEach(moduleName => {
            if (fs.statSync(`./modules/${mainModuleName}/${moduleName}`).isDirectory() && fs.existsSync(`./modules/${mainModuleName}/${moduleName}/index.jsx`)) {
                moduleData.push(mainModuleName + '|' + moduleName);
            }
        });
    });
    moduleData = moduleData.sort();

    // Create tComponent.jsx
    const createComponent = () => {
        let importText = '// That code below is generated automatically. Do not change them manually!\n';
        const moduleNames = [];
        moduleData.forEach(item => {
            const [mainModuleName, moduleName] = item.split('|');
            const moduleText = fs.readFileSync(`./modules/${mainModuleName}/${moduleName}/index.jsx`).toString();
            if (moduleText.includes('init') && moduleText.includes('T.component')) {
                moduleNames.push(moduleName);
                importText += `import ${moduleName} from 'modules/${mainModuleName}/${moduleName}/index';\n`;
            }
        });

        importText += `export const componentModules = [${moduleNames.join(', ')}];`;
        fs.writeFileSync('./view/component/tComponent.jsx', importText);
    };
    createComponent();

    // Create redux info storage
    const createReduxInfoStorage = () => {
        // TODO: 'khcnKhoa', 'khcnPtn', 'trungTam'
        const reduxContainer = {};
        moduleData.forEach(item => {
            const [mainModuleName, moduleName] = item.split('|');
            const moduleTextLines = fs.readFileSync(`./modules/${mainModuleName}/${moduleName}/index.jsx`).toString().split('\n');
            let startReduxIndex = moduleTextLines.findIndex(item => item.includes('redux:') || item.includes('redux :'));
            if (startReduxIndex != -1) {
                let currentLine = moduleTextLines[startReduxIndex].trim();
                if (!currentLine.startsWith('//')) {
                    let openBracket = 0, closeBracket = 0, jsonText = '';
                    while (openBracket == 0 || openBracket != closeBracket) {
                        if (currentLine.startsWith('//')) { // A commend line
                            currentLine = moduleTextLines[++startReduxIndex].trim();
                            continue;
                        }
                        // tokenize to get json text
                        for (let i = 0; i < currentLine.length; i++) {
                            const s = currentLine[i];
                            if (s == '{' && openBracket == 0) {
                                jsonText += s;
                                openBracket++;
                                continue;
                            }
                            if (s == '}') {
                                jsonText += s;
                                closeBracket++;
                                if (openBracket == closeBracket) {
                                    break;
                                } else {
                                    continue;
                                }
                            }
                            if (openBracket) {
                                if (s == '{') openBracket++;
                                jsonText += s;
                            }
                        }
                        currentLine = moduleTextLines[++startReduxIndex].trim();
                    }
                    jsonText = jsonText.replace('},}', '}}');
                    if (!jsonText.includes('\'khcnKhoa\'') && !jsonText.includes('\'khcnPtn\'') && !jsonText.includes('\'trungTam\'') && jsonText != '{}') {
                        if (jsonText.includes('parent')) { // Has parent and child redux
                            jsonText = jsonText.substring(1, jsonText.length - 1).trim();
                            let parentPart = jsonText.substring(0, jsonText.indexOf(',')).trim();
                            let reducersPart = jsonText.substring(jsonText.indexOf(',') + 1, jsonText.length).trim();
                            parentPart = parentPart.replace(/parent( )*:/, '').replace(/'/g, '').trim();
                            reducersPart = reducersPart.replace(/reducers( )*:/, '').trim();
                            reducersPart = reducersPart.substring(1, reducersPart.length - 1).trim();
                            reducersPart = reducersPart.split(',').map(item => item.trim()).filter(item => !!item);
                            // Get import placement of reducers
                            reducersPart.forEach(reducer => {
                                let importTextLine = moduleTextLines.find(text => text.trim().startsWith(`import ${reducer}`) && (text.trim().substring('import '.length + reducer.length).startsWith(' ') || text.trim().substring('import '.length + reducer.length).startsWith(',')));
                                if (!importTextLine) {
                                    console.log('  - Not found reducer: ', reducer, parentPart);
                                } else {
                                    let placement = importTextLine.substring(importTextLine.indexOf('from') + 4, importTextLine.length).replace(';', '').trim();
                                    placement = placement.substring(1, placement.length - 1);
                                    if (placement.startsWith('./')) placement = `modules/${mainModuleName}/${moduleName}/${placement.substring(2)}`;
                                    reduxContainer[reducer] = {
                                        name: reducer,
                                        parent: parentPart,
                                        placement
                                    };
                                }
                            });
                        } else { // Redux with no parent
                            jsonText = jsonText.substring(1, jsonText.length - 1).trim();
                            jsonText = jsonText.split(',').map(item => item.trim()).filter(item => !!item);
                            // Get import placement of reducers
                            jsonText.forEach(reducer => {
                                let importTextLine = moduleTextLines.find(text => text.trim().startsWith(`import ${reducer}`) && (text.trim().substring('import '.length + reducer.length).startsWith(' ') || text.trim().substring('import '.length + reducer.length).startsWith(',')));
                                if (!importTextLine) {
                                    console.log('  - Not found reducer: ', reducer);
                                } else {
                                    let placement = importTextLine.substring(importTextLine.indexOf('from') + 4, importTextLine.length).replace(';', '').trim();
                                    placement = placement.substring(1, placement.length - 1);
                                    if (placement.startsWith('./')) placement = `modules/${mainModuleName}/${moduleName}/${placement.substring(2)}`;
                                    reduxContainer[reducer] = {
                                        name: reducer,
                                        parent: null,
                                        placement
                                    };
                                }
                            });
                        }
                    }
                }
            }
        });
        return reduxContainer;
    };
    const reduxContainer = createReduxInfoStorage(), reduxContainerMapper = {};
    Object.values(reduxContainer).forEach((reducer) => {
        if (reducer.parent) reduxContainerMapper[`state.${reducer.parent}.${reducer.name}`] = reducer.name;
        else reduxContainerMapper[`state.${reducer.name}`] = reducer.name;
    });

    // Scan for get usage reducer
    // Common AdminHeader.jsx - AdminMenu.jsx
    const commonReducers = ['category'];
    let reduxContainerList = [...Object.keys(reduxContainerMapper)];
    const adminHeaderText = fs.readFileSync('./view/component/AdminHeader.jsx', 'utf-8');
    const adminMenuText = fs.readFileSync('./view/component/AdminMenu.jsx', 'utf-8');
    const adminExecuteTaskText = fs.readFileSync('./view/component/AdminExecuteTask.jsx', 'utf-8');
    if (adminHeaderText.includes('React') && adminHeaderText.includes('connect')) {
        for (let i = 0; i < reduxContainerList.length;) {
            const reduxText = reduxContainerList[i];
            if (adminHeaderText.includes(reduxText)) {
                !commonReducers.includes(reduxContainerMapper[reduxText]) && commonReducers.push(reduxContainerMapper[reduxText]);
                reduxContainerList.splice(i, 1);
            } else {
                i++;
            }
        }
    }
    if (adminMenuText.includes('React') && adminMenuText.includes('connect')) {
        for (let i = 0; i < reduxContainerList.length;) {
            const reduxText = reduxContainerList[i];
            if (adminMenuText.includes(reduxText)) {
                !commonReducers.includes(reduxContainerMapper[reduxText]) && commonReducers.push(reduxContainerMapper[reduxText]);
                reduxContainerList.splice(i, 1);
            } else {
                i++;
            }
        }
    }

    if (adminExecuteTaskText.includes('React') && adminExecuteTaskText.includes('connect')) {
        for (let i = 0; i < reduxContainerList.length;) {
            const reduxText = reduxContainerList[i];
            if (adminExecuteTaskText.includes(reduxText)) {
                !commonReducers.includes(reduxContainerMapper[reduxText]) && commonReducers.push(reduxContainerMapper[reduxText]);
                reduxContainerList.splice(i, 1);
            } else {
                i++;
            }
        }
    }

    // Gen template | .jsx
    const moduleContainer = { admin: {}, home: { justBuild: true }, unit: { justBuild: true }, utils: { justBuild: true } }, templateNames = Object.keys(moduleContainer);
    let fullDevMainModules = Object.keys(finalModule), devMainModules = Object.keys(finalModule);
    const ignorePrefix = [];
    Object.values(finalModule).forEach(item => {
        if (!item.debug || buildMode) {
            ignorePrefix.push(item.prefix);
        }
    });

    if (moduleMode && moduleName) {
        devMainModules = devMainModules.filter(item => item == moduleName);
    }

    templateNames.forEach(templateName => {
        if (moduleContainer[templateName].justBuild) {
            moduleContainer[templateName].moduleNames = [];
            moduleContainer[templateName].importText = '// That code below is generated automatically. Do not change them manually!\n';
        } else {
            moduleContainer[templateName].commonModules = {
                moduleNames: [],
                reducers: [...commonReducers],
                importText: '// That code below is generated automatically. Do not change them manually!\n'
            };
            moduleContainer[templateName].seperatedModules = {};
        }
    });

    moduleData.forEach(item => {
        const [mainModuleName, moduleName] = item.split('|');
        const moduleTextLines = fs.readFileSync(`./modules/${mainModuleName}/${moduleName}/index.jsx`).toString().split('\n');
        if (moduleTextLines.length && moduleTextLines[0].startsWith('//TEMPLATES: ')) {
            const moduleTemplateNames = moduleTextLines[0].substring('//TEMPLATES: '.length).split('|').map(item => item.replace(/(\r\n|\n|\r)/gm, ''));
            templateNames.forEach(templateName => {
                if (moduleContainer[templateName].justBuild) {
                    if (moduleTemplateNames.includes(templateName)) {
                        moduleContainer[templateName].moduleNames.push(moduleName);
                        moduleContainer[templateName].importText += `import ${moduleName} from 'modules/${mainModuleName}/${moduleName}/index';\n`;
                    }
                } else {
                    if (moduleTemplateNames.includes(templateName)) {
                        // Spilt modules => Create file .jsx and .pug
                        if (fullDevMainModules.includes(mainModuleName) && (!finalModule[mainModuleName].debug || buildMode)) { // If has separated in non-debug mode or build mode
                            // If in build mode or in normal mode or in moduleMode has this mainModuleName
                            if (buildMode || !moduleMode || (moduleMode && devMainModules.includes(mainModuleName))) {
                                if (!moduleContainer[templateName].seperatedModules[mainModuleName]) {
                                    moduleContainer[templateName].seperatedModules[mainModuleName] = {
                                        moduleNames: [],
                                        reducers: [...commonReducers],
                                        importText: '// That code below is generated automatically. Do not change them manually!\n'
                                    };
                                }
                                moduleContainer[templateName].seperatedModules[mainModuleName].moduleNames.push(moduleName);
                                moduleContainer[templateName].seperatedModules[mainModuleName].importText += `import ${moduleName} from 'modules/${mainModuleName}/${moduleName}/index';\n`;
                                // Scan for get usage reducer
                                // Traverse in module to get React files
                                const filePaths = getAllReactFile(`./modules/${mainModuleName}/${moduleName}`);
                                filePaths.forEach(filePath => {
                                    const text = fs.readFileSync(filePath, 'utf-8');
                                    if (text.includes('React') && text.includes('connect')) {
                                        for (let i = 0; i < reduxContainerList.length; i++) {
                                            const reduxText = reduxContainerList[i];
                                            if (text.includes(reduxText)) {
                                                !moduleContainer[templateName].seperatedModules[mainModuleName].reducers.includes(reduxContainerMapper[reduxText]) && moduleContainer[templateName].seperatedModules[mainModuleName].reducers.push(reduxContainerMapper[reduxText]);
                                            }
                                        }
                                    }
                                });
                            }
                        } else { // If no => goes to common modules.jsx
                            moduleContainer[templateName].commonModules.moduleNames.push(moduleName);
                            moduleContainer[templateName].commonModules.importText += `import ${moduleName} from 'modules/${mainModuleName}/${moduleName}/index';\n`;
                            // Scan for get usage reducer
                            // Traverse in module to get React files
                            const filePaths = getAllReactFile(`./modules/${mainModuleName}/${moduleName}`);
                            filePaths.forEach(filePath => {
                                const text = fs.readFileSync(filePath, 'utf-8');
                                if (text.includes('React') && text.includes('connect')) {
                                    for (let i = 0; i < reduxContainerList.length; i++) {
                                        const reduxText = reduxContainerList[i];
                                        if (text.includes(reduxText)) {
                                            !moduleContainer[templateName].commonModules.reducers.includes(reduxContainerMapper[reduxText]) && moduleContainer[templateName].commonModules.reducers.push(reduxContainerMapper[reduxText]);
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            });
        } else {
            console.warn(`  - Warning: ${mainModuleName}:${moduleName} không thuộc template nào cả!`);
        }
    });

    templateNames.forEach(templateName => {
        const templateModule = moduleContainer[templateName];
        if (templateModule.justBuild) {
            if (templateModule.moduleNames.length) { // Normally create modules.jsx
                fs.writeFileSync(`./view/${templateName}/modules.jsx`, `${templateModule.importText}\nexport const modules = [${templateModule.moduleNames.join(', ')}];`);
            }
        } else {
            if (templateModule.commonModules.moduleNames.length) { // Normally create modules.jsx | <templateName>.reducer.jsx
                fs.writeFileSync(`./view/${templateName}/modules.jsx`, `${templateModule.commonModules.importText}\nexport const modules = [${templateModule.commonModules.moduleNames.join(', ')}];`);
            }
            if (Object.keys(templateModule.seperatedModules).length) { // Create modules.<moduleName>.jsx | <templateName>.<moduleName>.jsx
                const mainModuleNames = Object.keys(templateModule.seperatedModules);
                mainModuleNames.forEach(mainModuleName => {
                    const subTemplateModule = templateModule.seperatedModules[mainModuleName];
                    if (subTemplateModule && subTemplateModule.reducers.length) {
                        let reducerText = '// That code below is generated automatically. Do not change them manually!\n';
                        let nonParent = [], combine = {};
                        let elementText = '';
                        subTemplateModule.reducers.forEach(reducer => {
                            const reducerInfo = reduxContainer[reducer];
                            reducerText += `import ${reducer} from '${reducerInfo.placement}';\n`;
                            if (reducerInfo.parent) {
                                if (!combine[reducerInfo.parent]) combine[reducerInfo.parent] = [];
                                !combine[reducerInfo.parent].includes(reducer) && combine[reducerInfo.parent].push(reducer);
                            } else {
                                !nonParent.includes(reducer) && nonParent.push(reducer);
                            }
                        });
                        reducerText += '\nexport default [\n';
                        elementText += `    { ${nonParent.join(', ')} },\n`;
                        Object.entries(combine).forEach(([parent, reducers]) => {
                            elementText += `    { parent: '${parent}', reducers: { ${reducers.join(', ')} } },\n`;
                        });
                        reducerText += elementText;
                        reducerText += '];';
                        fs.writeFileSync(`./view/${templateName}/${templateName}.${mainModuleName}.reducer.jsx`, reducerText);
                    }
                    if (subTemplateModule && subTemplateModule.moduleNames.length) {
                        // Write modules.<moduleName>.jsx
                        fs.writeFileSync(`./view/${templateName}/modules.${mainModuleName}.jsx`, `${subTemplateModule.importText}\nexport const modules = [${subTemplateModule.moduleNames.join(', ')}];`);
                        // Read <templateName>.jsx and write <templateName>.<mainModuleName>.jsx
                        let mainJsx = fs.readFileSync(`./view/${templateName}/${templateName}.jsx`, 'utf-8');
                        if (mainJsx) {
                            const setting = finalModule[mainModuleName];
                            mainJsx = mainJsx.replace('import { modules } from \'./modules.jsx\';', `import { modules } from './modules.${mainModuleName}.jsx';`);
                            if (!setting.tComponent) {
                                mainJsx = mainJsx.replace('import { componentModules } from \'view/component/tComponent\';\n', '');
                                mainJsx = mainJsx.replace('componentModules.forEach(module => module.init && module.init());\n', '');
                            }
                            if (subTemplateModule.reducers.length) {
                                mainJsx = mainJsx.replace(`import extraReducers from './${templateName}.reducer';`, `import extraReducers from './${templateName}.${mainModuleName}.reducer';`);
                            }
                            mainJsx = mainJsx.replace(/<MessagePage( )*(ignore)?[pP]refix={[\[\]\-'/a-zA-Z, ]*}( )*\/>/,
                                `<MessagePage prefix={'${setting.prefix}'} />`);
                            fs.writeFileSync(`./view/${templateName}/${templateName}.${mainModuleName}.jsx`, mainJsx);
                        } else {
                            console.error(`Cannot find file ./view/${templateName}/${templateName}.jsx!`);
                        }

                        // Read <templateName>.pug and write <templateName>.<mainModuleName>.pug
                        let mainPug = fs.readFileSync(`./view/${templateName}/${templateName}.pug`, 'utf-8');
                        if (mainPug) {
                            mainPug = mainPug.replace('if item.indexOf(\'/js/admin\')==0', `if item.indexOf('/js/admin.${mainModuleName}/')==0`);
                            fs.writeFileSync(`./view/${templateName}/${templateName}.${mainModuleName}.pug`, mainPug);
                        } else {
                            console.error(`Cannot find file ./view/${templateName}/${templateName}.pug!`);
                        }
                    }
                });
            }

            let mainJsx = fs.readFileSync(`./view/${templateName}/${templateName}.jsx`, 'utf-8');
            if (mainJsx) {
                mainJsx = mainJsx.replace(/<MessagePage( )*(ignore)?[pP]refix={[\[\]\-'/a-zA-Z, ]*}( )*\/>/,
                    `<MessagePage ignorePrefix={[${ignorePrefix.map(item => `'${item}'`).join(', ')}]} />`);
                fs.writeFileSync(`./view/${templateName}/${templateName}.jsx`, mainJsx);
            } else {
                console.error(`Cannot find file ./view/${templateName}/${templateName}.jsx!`);
            }

            if (templateModule.commonModules.reducers.length) {
                let reducerText = '// That code below is generated automatically. Do not change them manually!\n';
                let nonParent = [], combine = {};
                let elementText = '';
                templateModule.commonModules.reducers.forEach(reducer => {
                    const reducerInfo = reduxContainer[reducer];
                    reducerText += `import ${reducer} from '${reducerInfo.placement}';\n`;
                    if (reducerInfo.parent) {
                        if (!combine[reducerInfo.parent]) combine[reducerInfo.parent] = [];
                        !combine[reducerInfo.parent].includes(reducer) && combine[reducerInfo.parent].push(reducer);
                    } else {
                        !nonParent.includes(reducer) && nonParent.push(reducer);
                    }
                });
                reducerText += '\nexport default [\n';
                elementText += `    { ${nonParent.join(', ')} },\n`;
                Object.entries(combine).forEach(([parent, reducers]) => {
                    elementText += `    { parent: '${parent}', reducers: { ${reducers.join(', ')} } },\n`;
                });
                reducerText += elementText;
                reducerText += '];';
                fs.writeFileSync(`./view/${templateName}/${templateName}.reducer.jsx`, reducerText);
            }
        }
    });
    for (const templateName of templateNames) {
        if (!moduleContainer[templateName].justBuild) {
            if (buildMode) { // If build mode => Build all split modules
                for (const mainModule of fullDevMainModules) {
                    const result = await buildWebpack(templateName + '.' + mainModule);
                    if (result.error) console.error(result.error);
                    else console.log(`   + Build: ${templateName}.${mainModule}`);
                }
            } else if (moduleMode && moduleName) { // If in module mode => Build only moduleName in mode
                for (const mainModule of devMainModules) {
                    if (!finalModule[mainModule].debug) {
                        const result = await buildWebpack(templateName + '.' + mainModule);
                        if (result.error) console.error(result.error);
                        else console.log(`   + Build: ${templateName}.${mainModule}`);
                    } else {
                        // Clean jsx, pug files
                        fs.existsSync(`./view/${templateName}/${templateName}.${mainModule}.jsx`) && fs.unlinkSync(`./view/${templateName}/${templateName}.${mainModule}.jsx`);
                        fs.existsSync(`./view/${templateName}/${templateName}.${mainModule}.pug`) && fs.unlinkSync(`./view/${templateName}/${templateName}.${mainModule}.pug`);
                        fs.existsSync(`./view/${templateName}/${templateName}.${mainModule}.reducer.jsx`) && fs.unlinkSync(`./view/${templateName}/${templateName}.${mainModule}.reducer.jsx`);
                        fs.existsSync(`./view/${templateName}/modules.${mainModule}.jsx`) && fs.unlinkSync(`./view/${templateName}/modules.${mainModule}.jsx`);
                        // Clean build files
                        fs.existsSync(`./public/${templateName}.${mainModule}.template`) && fs.unlinkSync(`./public/${templateName}.${mainModule}.template`);
                        fs.existsSync(`./public/js/${templateName}.${mainModule}`) && fse.removeSync(`./public/js/${templateName}.${mainModule}`);
                    }
                }
            } else { // If normal mode
                for (const mainModule of fullDevMainModules) {
                    if (!finalModule[mainModule].debug) {
                        const result = await buildWebpack(templateName + '.' + mainModule);
                        if (result.error) console.error(result.error);
                        else console.log(`   + Build: ${templateName}.${mainModule}`);
                    } else {
                        // Clean jsx, pug files
                        fs.existsSync(`./view/${templateName}/${templateName}.${mainModule}.jsx`) && fs.unlinkSync(`./view/${templateName}/${templateName}.${mainModule}.jsx`);
                        fs.existsSync(`./view/${templateName}/${templateName}.${mainModule}.pug`) && fs.unlinkSync(`./view/${templateName}/${templateName}.${mainModule}.pug`);
                        fs.existsSync(`./view/${templateName}/${templateName}.${mainModule}.reducer.jsx`) && fs.unlinkSync(`./view/${templateName}/${templateName}.${mainModule}.reducer.jsx`);
                        fs.existsSync(`./view/${templateName}/modules.${mainModule}.jsx`) && fs.unlinkSync(`./view/${templateName}/modules.${mainModule}.jsx`);
                        // Clean build files
                        fs.existsSync(`./public/${templateName}.${mainModule}.template`) && fs.unlinkSync(`./public/${templateName}.${mainModule}.template`);
                        fs.existsSync(`./public/js/${templateName}.${mainModule}`) && fse.removeSync(`./public/js/${templateName}.${mainModule}`);
                    }
                }
            }
        }
    }

    if (buildMode) {
        for (const templateName of templateNames) {
            const result = await buildWebpack(templateName);
            if (result.error) console.error(result.error);
            else console.log(`   + Build: ${templateName}`);
        }
    }
    console.log('  - Build done!');
})();
