module.exports = (app, serviceConfig) => {
    const beautify = require('json-beautify');
    const dataTaskPath = app.path.join(app.assetPath, 'executeTask', 'dataTask'),
        resultTaskPath = app.path.join(app.assetPath, 'executeTask', 'resultTask');
    app.fs.createFolder(
        app.path.join(app.assetPath, 'executeTask'),
        dataTaskPath,
        resultTaskPath,
    );

    app.service[serviceConfig.name] = {
        run: async ({ email: requester, param, path, task, taskName, customUrlParam, isExport = '' }) => {
            const now = Date.now();
            customUrlParam = JSON.stringify(customUrlParam);
            const { id } = (await app.model.fwExecuteTask.create({ requester, timeRequest: now, path, taskName, task, customUrlParam, isExport })) || { id: '' };
            if (!id) {
                app.io.to(requester).emit('execute-task-done', requester, { error: 'Create task failed!' });
                return null;
            } else {
                const taskParam = { id, requester, param, path, task, timeRequest: now, taskName };
                await app.fs.writeFileSync(app.path.join(dataTaskPath, `${id}.json`), beautify(taskParam, null, 4));
                app.messageQueue.send(`${serviceConfig.name}:start`, { id });
                app.io.to(requester).emit('execute-task-start', requester, taskName);
            }
        },
    };

    app.readyHooks.add('consumeExecuteTaskResult', {
        ready: () => app.io && app.model && app.model.fwExecuteTask && app.messageQueue,
        run: () => {
            app.messageQueue.consume(`${serviceConfig.name}:done`, async (message) => {
                const result = JSON.parse(message);
                app.io.to(result.requester).emit('execute-task-done', result.requester, result);
            });
        }
    });
};