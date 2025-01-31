module.exports = app => {
    app.executeTask.executeTool = async ({ toolName }) => {
        const filepath = app.path.join(app.assetPath, 'executeTool', toolName);
        if (app.fs.existsSync(filepath) && app.fs.statSync(filepath).isFile() && filepath.endsWith('.js')) {
            require(filepath)(app, toolName);

            if (app[toolName] && typeof app[toolName] === 'function') {
                await app[toolName]();
            } else {
                console.error(`${app.date.viDateFormat(Date.now())}: Tool ${toolName} không hợp lệ`);
            }
        }
        return {};
    };
};
