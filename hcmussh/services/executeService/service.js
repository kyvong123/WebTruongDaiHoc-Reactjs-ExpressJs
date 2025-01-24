module.exports = (app, serviceConfig) => {
    require('../config/initService')(app, serviceConfig);
    require('./notify')(app);
    // Create folder for data and result
    const beautify = require('json-beautify');
    app.assetPath = app.isDebug ? app.assetPath : '/var/www/hcmussh/asset';
    const dataTaskPath = app.path.join(app.assetPath, 'executeTask', 'dataTask'),
        resultTaskPath = app.path.join(app.assetPath, 'executeTask', 'resultTask');
    app.fs.createFolder(
        app.path.join(app.assetPath, 'executeTask'),
        dataTaskPath,
        resultTaskPath,
    );

    // Require all custom execute tasks from customExecuteTask folder
    app.executeTask = {};
    const requireFolder = (loadPath) => app.fs.readdirSync(loadPath).forEach((filename) => {
        const filepath = app.path.join(loadPath, filename);
        if (app.fs.existsSync(filepath) && app.fs.statSync(filepath).isFile() && filepath.endsWith('.js')) {
            require(filepath)(app);
        }
    });
    const customExecuteTaskFolder = app.path.join(__dirname, 'customExecuteTask');
    requireFolder(customExecuteTaskFolder);


    app.readyHooks.add('consumeExecuteTask', {
        ready: () => app.model && app.messageQueue && app.model.fwExecuteTask,
        run: () => {
            app.messageQueue.consume(`${serviceConfig.name}:start`, async (message) => {
                const param = JSON.parse(message);
                const id = param.id;
                const paramOfTask = require(app.path.join(dataTaskPath, `${id}.json`));
                const { taskResult, error } = await startTask(paramOfTask);
                await app.model.fwExecuteTask.update({ id }, { timeDone: Date.now(), status: error ? -1 : 1, errorMsg: error });
                const beautifyJsonString = beautify(taskResult, null, 4) ?? '';
                app.fs.writeFileSync(app.path.join(resultTaskPath, `${id}.json`), beautifyJsonString);
                app.messageQueue.send(`${serviceConfig.name}:done`, { requester: paramOfTask.requester, taskName: paramOfTask.taskName, error });
            });
        }
    });

    const startTask = async ({ requester, param, path, task, id }) => {
        if (!requester || !param || !path || !task) {
            return { error: 'Invalid Parameters!', id };
        } else {
            let error = '';
            try {
                const checkTask = await app.model.fwExecuteTask.get({ id });
                if (!checkTask) {
                    console.error('Invalid exec task', `#${id}`);
                    error = 'Invalid exec task';
                } else {
                    console.log('Start executing task', task, `#${id}`);
                    const { taskResult, error } = await runTask({ task, param });

                    return { taskResult, error };
                }
            } catch (e) {
                error = JSON.stringify(e);
            }
            return { error };
        }
    };

    const runTask = async ({ param, task }) => {
        let taskResult = {}, error = '';
        const myTask = app.executeTask[task];
        if (!myTask) {
            error = 'Unknown task';
        } else {
            taskResult = await myTask(param);
        }
        return { taskResult, error };
    };
};