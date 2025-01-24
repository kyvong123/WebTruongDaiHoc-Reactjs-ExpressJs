module.exports = (app, toolName) => {
    app[toolName] = async () => {
        await app.model.fwExecuteTask.getAll({}).then(item => console.log(item[0]));
    }
};