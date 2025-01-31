module.exports = app => {
    app.executeTask.importDrl = async ({ namHoc, hocKy, srcPath }) => {
        let worksheet = null;
        let workbook = app.excel.create();
        workbook = await app.excel.readFile(srcPath);
        app.fs.deleteFile(srcPath);
        if (!workbook) throw 'No Workbook';
        worksheet = workbook.getWorksheet(1);
        if (!worksheet) throw 'No Worksheet';
        const items = [], visited = {}, failed = [];
        // const listPromises = [];

        const processRow = async (row, index) => {
            try {
                let now = Date.now();
                const mssv = row.getCell('A').text?.trim() || '',
                    svSubmit = row.getCell('B').text?.trim() || '',
                    ltSubmit = row.getCell('C').text?.trim() || '',
                    fSubmit = row.getCell('D').text?.trim() || '',
                    tkSubmit = row.getCell('E').text?.trim() || '',
                    lyDoF = row.getCell('F').text?.trim() || '',
                    lyDoTk = row.getCell('G').text?.trim() || '',
                    diemTb = Math.max(parseInt(tkSubmit || 0) - parseInt(fSubmit || 0), 0);

                const changes = { mssv, svSubmit, ltSubmit, fSubmit, tkSubmit, lyDoF, lyDoTk, timeModified: now };
                if (!mssv) throw { rowNumber: index, color: 'warning', message: 'Không tiềm thấy dữ liệu' };
                if (visited[mssv]) {
                    throw { rowNumber: index, color: 'warning', message: `Sinh viên ${mssv} bị trùng trong danh sách` };
                }
                let student = await app.model.fwStudent.get({ mssv }, 'ho,ten,loaiHinhDaoTao');
                if (!student) {
                    throw { rowNumber: index, color: 'warning', message: `Không tìm thấy sinh viên ${mssv}` };
                }

                let thongTinDrlSave = await app.model.svDiemRenLuyen.get({ mssv, namHoc, hocKy }, '*', 'ma DESC');
                let hoTen = `${student.ho} ${student.ten}`,
                    loaiHinhDaoTao = `${student.loaiHinhDaoTao}`,
                    tmpRow = { ...changes, hoTen, loaiHinhDaoTao, thongTinDrlSave };
                if (thongTinDrlSave) await app.model.svDiemRenLuyen.update({ mssv, namHoc, hocKy }, { svSubmit, ltSubmit, fSubmit, tkSubmit, lyDoF, lyDoTk, diemTb });
                else await app.model.svDiemRenLuyen.create({ mssv, namHoc, hocKy, svSubmit, fSubmit, tkSubmit, diemTb });
                items.push(tmpRow);
                visited[mssv] = true;
            } catch (error) {
                if (error.rowNumber) failed.push(error);
                else failed.push({ rowNumber: index, color: 'danger', message: 'Xử lý dữ liệu thất bại' });
            }
        };
        // worksheet.eachRow((row, index) => {
        //     index > 1 && listPromises.push(processRow(row, index));
        // });
        for (let index = 2; index <= worksheet.rowCount; ++index) {
            const row = worksheet.getRow(index);
            await processRow(row, index);
        }
        // await Promise.all(listPromises).catch(error => { throw error; });
        return ({ items, failed, namHoc, hocKy });
    };
};