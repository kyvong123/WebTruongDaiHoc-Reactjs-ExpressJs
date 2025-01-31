module.exports = (app, toolName) => {
    app[toolName] = async () => {
        console.log('Start calculate diem');

        // readFile
        let dataStudent = await app.model.fwStudent.getAll({ tinhTrang: 1 }, 'mssv', 'mssv');

        const chunks = dataStudent.chunk(100);
        for (const chunk of chunks) {
            await Promise.all(chunk.map(async item => {
                try {
                    await app.model.dtDiemAll.diemTrungBinh({ mssv: item.mssv });
                    console.log(`Calculate diem trung binh sv ${item.mssv} done`);
                } catch (error) {
                    console.error(error);
                }
            }));
            app.fs.writeFileSync(app.path.join(app.assetPath, 'executeTool', 'lastCalculateDiem.json'), JSON.stringify(chunk[chunk.length - 1].mssv));
        }
        console.log('Calculate diem done!');
    }
};