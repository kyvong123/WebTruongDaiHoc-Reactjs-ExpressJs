// Table name: SV_SU_KIEN_DATA { idSuKien, tenSuKien, thoiGianBatDau, thoiGianKetThuc, diaDiem, soLuongThamGiaDuKien, nguoiTao, createTime, trangThai, maTieuChi, nguoiXuLy, thoiGianXuLy, lyDoTuChoi, diemRenLuyenCong, moTa, soLuongThamGiaToiDa, thoiGianBatDauDangKy, kichHoat, namHoc, hocKy, qrTimeGenerate, qrValidTime, versionNumber, nguoiCapNhat, maDonVi }
const keys = ['ID_SU_KIEN', 'VERSION_NUMBER'];
const obj2Db = { 'idSuKien': 'ID_SU_KIEN', 'tenSuKien': 'TEN_SU_KIEN', 'thoiGianBatDau': 'THOI_GIAN_BAT_DAU', 'thoiGianKetThuc': 'THOI_GIAN_KET_THUC', 'diaDiem': 'DIA_DIEM', 'soLuongThamGiaDuKien': 'SO_LUONG_THAM_GIA_DU_KIEN', 'nguoiTao': 'NGUOI_TAO', 'createTime': 'CREATE_TIME', 'trangThai': 'TRANG_THAI', 'maTieuChi': 'MA_TIEU_CHI', 'nguoiXuLy': 'NGUOI_XU_LY', 'thoiGianXuLy': 'THOI_GIAN_XU_LY', 'lyDoTuChoi': 'LY_DO_TU_CHOI', 'diemRenLuyenCong': 'DIEM_REN_LUYEN_CONG', 'moTa': 'MO_TA', 'soLuongThamGiaToiDa': 'SO_LUONG_THAM_GIA_TOI_DA', 'thoiGianBatDauDangKy': 'THOI_GIAN_BAT_DAU_DANG_KY', 'kichHoat': 'KICH_HOAT', 'namHoc': 'NAM_HOC', 'hocKy': 'HOC_KY', 'qrTimeGenerate': 'QR_TIME_GENERATE', 'qrValidTime': 'QR_VALID_TIME', 'versionNumber': 'VERSION_NUMBER', 'nguoiCapNhat': 'NGUOI_CAP_NHAT', 'maDonVi': 'MA_DON_VI' };

module.exports = app => {
    const db = 'main';
    const tableName = 'SV_SU_KIEN_DATA';
    const type = 'table';
    const schema = {
        ID_SU_KIEN: {
            type: 'NUMBER',
            length: '22,0',
            primaryKey: true
        },
        TEN_SU_KIEN: {
            type: 'NVARCHAR2',
            length: '100',
            allowNull: false
        },
        THOI_GIAN_BAT_DAU: {
            type: 'NUMBER',
            length: '22,0'
        },
        THOI_GIAN_KET_THUC: {
            type: 'NUMBER',
            length: '22,0'
        },
        DIA_DIEM: {
            type: 'NVARCHAR2',
            length: '100'
        },
        SO_LUONG_THAM_GIA_DU_KIEN: {
            type: 'NUMBER',
            length: '5,0'
        },
        NGUOI_TAO: {
            type: 'NVARCHAR2',
            length: '200'
        },
        CREATE_TIME: {
            type: 'NUMBER',
            length: '22,0'
        },
        TRANG_THAI: {
            type: 'NVARCHAR2',
            length: '2',
            defaultValue: 'null'
        },
        MA_TIEU_CHI: {
            type: 'NVARCHAR2',
            length: '50'
        },
        NGUOI_XU_LY: {
            type: 'NVARCHAR2',
            length: '200'
        },
        THOI_GIAN_XU_LY: {
            type: 'NUMBER',
            length: '22,0'
        },
        LY_DO_TU_CHOI: {
            type: 'NVARCHAR2',
            length: '100'
        },
        DIEM_REN_LUYEN_CONG: {
            type: 'NUMBER',
            length: '6,4'
        },
        MO_TA: {
            type: 'CLOB',
            length: '4000'
        },
        SO_LUONG_THAM_GIA_TOI_DA: {
            type: 'NUMBER',
            length: '5,0'
        },
        THOI_GIAN_BAT_DAU_DANG_KY: {
            type: 'NUMBER',
            length: '22,0'
        },
        KICH_HOAT: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        NAM_HOC: {
            type: 'NVARCHAR2',
            length: '11'
        },
        HOC_KY: {
            type: 'NUMBER',
            length: '1,0'
        },
        QR_TIME_GENERATE: {
            type: 'NUMBER',
            length: '22,0'
        },
        QR_VALID_TIME: {
            type: 'NUMBER',
            length: '22,0'
        },
        VERSION_NUMBER: {
            type: 'NUMBER',
            length: '22,0',
            primaryKey: true
        },
        NGUOI_CAP_NHAT: {
            type: 'NVARCHAR2',
            length: '200'
        },
        MA_DON_VI: {
            type: 'NVARCHAR2',
            length: '20'
        }
    };
    const methods = {};
    app.model.svSuKienData = {
        create: (data, done) => new Promise((resolve, reject) => {
            let statement = '', values = '', parameter = {};
            Object.keys(data).forEach(column => {
                if (obj2Db[column]) {
                    statement += ', ' + obj2Db[column];
                    values += ', :' + column;
                    parameter[column] = data[column];
                }
            });

            if (statement.length == 0) {
                done && done('Data is empty!');
                reject('Data is empty!');
            } else {
                const sql = 'INSERT INTO SV_SU_KIEN_DATA (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.svSuKienData.get({ rowId: resultSet.lastRowid }).then(item => {
                            done && done(null, item);
                            resolve(item);
                        }).catch(error => {
                            done && done(error);
                            reject(error);
                        });
                    } else {
                        done && done(error ? error : 'Execute SQL command fail! Sql = ' + sql);
                        reject(error ? error : 'Execute SQL command fail! Sql = ' + sql);
                    }
                });
            }
        }),

        get: (condition, selectedColumns, orderBy, done) => new Promise((resolve, reject) => {
            if (condition == undefined) {
                done = null;
                condition = {};
                selectedColumns = '*';
            } else if (typeof condition == 'function') {
                done = condition;
                condition = {};
                selectedColumns = '*';
            } else if (selectedColumns && typeof selectedColumns == 'function') {
                done = selectedColumns;
                selectedColumns = '*';
            } else {
                selectedColumns = selectedColumns ? selectedColumns : '*';
            }

            if (orderBy) Object.keys(obj2Db).sort((a, b) => b.length - a.length).forEach(key => orderBy = orderBy.replaceAll(key, obj2Db[key]));
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM SV_SU_KIEN_DATA' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
            app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                if (error) {
                    done && done(error);
                    reject(error);
                } else {
                    const item = resultSet && resultSet.rows && resultSet.rows.length ? resultSet.rows[0] : null;
                    done && done(null, item);
                    resolve(item);
                }
            });
        }),

        getAll: (condition, selectedColumns, orderBy, done) => new Promise((resolve, reject) => {
            if (condition == undefined) {
                done = null;
                condition = {};
                selectedColumns = '*';
            } else if (typeof condition == 'function') {
                done = condition;
                condition = {};
                selectedColumns = '*';
            } else if (selectedColumns && typeof selectedColumns == 'function') {
                done = selectedColumns;
                selectedColumns = '*';
            } else {
                selectedColumns = selectedColumns ? selectedColumns : '*';
            }

            if (orderBy) Object.keys(obj2Db).sort((a, b) => b.length - a.length).forEach(key => orderBy = orderBy.replaceAll(key, obj2Db[key]));
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM SV_SU_KIEN_DATA' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
            app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                if (error) {
                    done && done(error);
                    reject(error);
                } else {
                    const items = resultSet && resultSet.rows ? resultSet.rows : [];
                    done && done(null, items);
                    resolve(items);
                }
            });
        }),

        getPage: (pageNumber, pageSize, condition, selectedColumns, orderBy, done) => new Promise((resolve, reject) => {
            if (condition == undefined) {
                done = null;
                condition = {};
                selectedColumns = '*';
            } else if (typeof condition == 'function') {
                done = condition;
                condition = {};
                selectedColumns = '*';
            } else if (selectedColumns && typeof selectedColumns == 'function') {
                done = selectedColumns;
                selectedColumns = '*';
            } else {
                selectedColumns = selectedColumns ? selectedColumns : '*';
            }

            if (orderBy) Object.keys(obj2Db).sort((a, b) => b.length - a.length).forEach(key => orderBy = orderBy.replaceAll(key, obj2Db[key]));
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            let leftIndex = (pageNumber <= 1 ? 0 : pageNumber - 1) * pageSize,
                parameter = condition.parameter ? condition.parameter : {};
            const sqlCount = 'SELECT COUNT(*) FROM SV_SU_KIEN_DATA' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.executeExtra(sqlCount, parameter, (error, res) => {
                if (error) {
                    done && done(error);
                    reject(error);
                } else {
                    let result = {};
                    let totalItem = res && res.rows && res.rows[0] ? res.rows[0]['COUNT(*)'] : 0;
                    result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                    result.pageNumber = Math.max(1, Math.min(pageNumber, result.pageTotal));
                    leftIndex = Math.max(0, result.pageNumber - 1) * pageSize;
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT SV_SU_KIEN_DATA.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM SV_SU_KIEN_DATA' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
                    app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                        if (error) {
                            done && done(error);
                            reject(error);
                        } else {
                            result.list = resultSet && resultSet.rows ? resultSet.rows : [];
                            done && done(null, result);
                            resolve(result);
                        }
                    });
                }
            });
        }),

        update: (condition, changes, done) => new Promise((resolve, reject) => {
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            changes = app.database.oracle.buildCondition(obj2Db, changes, ', ', 'NEW_');

            if (Object.keys(condition).length == 0) {
                done && done('No condition!');
                reject('No condition!');
            } else if (changes.statement) {
                const parameter = app.clone(condition.parameter ? condition.parameter : {}, changes.parameter ? changes.parameter : {});
                const sql = 'UPDATE SV_SU_KIEN_DATA SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.svSuKienData.get({ rowId: resultSet.lastRowid }).then(item => {
                            done && done(null, item);
                            resolve(item);
                        }).catch(error => {
                            done && done(error);
                            reject(error);
                        });
                    } else {
                        done && done(error);
                        reject(error);
                    }
                });
            } else {
                done && done('No changes!');
                reject('No changes!');
            }
        }),

        delete: (condition, done) => new Promise((resolve, reject) => {
            if (condition == undefined) {
                done = null;
                condition = {};
            } else if (typeof condition == 'function') {
                done = condition;
                condition = {};
            }
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');

            if (Object.keys(condition).length == 0) {
                done && done('No condition!');
                reject('No condition!');
            } else {
                const parameter = condition.parameter ? condition.parameter : {};
                const sql = 'DELETE FROM SV_SU_KIEN_DATA' + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, error => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done();
                        resolve();
                    }
                });
            }
        }),

        count: (condition, done) => new Promise((resolve, reject) => {
            if (condition == undefined) {
                done = null;
                condition = {};
            } else if (typeof condition == 'function') {
                done = condition;
                condition = {};
            }
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT COUNT(*) FROM SV_SU_KIEN_DATA' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.executeExtra(sql, parameter, (error, result) => {
                if (error) {
                    done && done(error);
                    reject(error);
                } else {
                    done && done(null, result);
                    resolve(result);
                }
            });
        }),
    };
    return { db, tableName, type, schema, methods, keys };
};