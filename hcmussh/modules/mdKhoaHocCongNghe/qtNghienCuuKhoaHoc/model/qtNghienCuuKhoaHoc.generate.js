// Table name: QT_NGHIEN_CUU_KHOA_HOC { id, tenDeTai, maSoCapQuanLy, kinhPhi, vaiTro, ngayNghiemThu, ketQua, shcc, batDau, ketThuc, batDauType, ketThucType, ngayNghiemThuType, thoiGian, fileMinhChung, inLlkh, hinhThuc, tinhTrang, maSo, capQuanLy, quyMo }
const keys = ['ID'];
const obj2Db = { 'id': 'ID', 'tenDeTai': 'TEN_DE_TAI', 'maSoCapQuanLy': 'MA_SO_CAP_QUAN_LY', 'kinhPhi': 'KINH_PHI', 'vaiTro': 'VAI_TRO', 'ngayNghiemThu': 'NGAY_NGHIEM_THU', 'ketQua': 'KET_QUA', 'shcc': 'SHCC', 'batDau': 'BAT_DAU', 'ketThuc': 'KET_THUC', 'batDauType': 'BAT_DAU_TYPE', 'ketThucType': 'KET_THUC_TYPE', 'ngayNghiemThuType': 'NGAY_NGHIEM_THU_TYPE', 'thoiGian': 'THOI_GIAN', 'fileMinhChung': 'FILE_MINH_CHUNG', 'inLlkh': 'IN_LLKH', 'hinhThuc': 'HINH_THUC', 'tinhTrang': 'TINH_TRANG', 'maSo': 'MA_SO', 'capQuanLy': 'CAP_QUAN_LY', 'quyMo': 'QUY_MO' };

module.exports = app => {
    const db = 'main';
    const tableName = 'QT_NGHIEN_CUU_KHOA_HOC';
    const type = 'table';
    const schema = {
        ID: {
            type: 'NUMBER',
            length: '22,0',
            autoIncrement: true,
            primaryKey: true
        },
        TEN_DE_TAI: {
            type: 'NVARCHAR2',
            length: '200'
        },
        MA_SO_CAP_QUAN_LY: {
            type: 'NVARCHAR2',
            length: '200'
        },
        KINH_PHI: {
            type: 'NVARCHAR2',
            length: '200'
        },
        VAI_TRO: {
            type: 'NVARCHAR2',
            length: '2'
        },
        NGAY_NGHIEM_THU: {
            type: 'NUMBER',
            length: '20,0'
        },
        KET_QUA: {
            type: 'NVARCHAR2',
            length: '200'
        },
        SHCC: {
            type: 'NVARCHAR2',
            length: '10'
        },
        BAT_DAU: {
            type: 'NUMBER',
            length: '20,0'
        },
        KET_THUC: {
            type: 'NUMBER',
            length: '20,0'
        },
        BAT_DAU_TYPE: {
            type: 'NVARCHAR2',
            length: '20'
        },
        KET_THUC_TYPE: {
            type: 'NVARCHAR2',
            length: '20'
        },
        NGAY_NGHIEM_THU_TYPE: {
            type: 'NVARCHAR2',
            length: '20'
        },
        THOI_GIAN: {
            type: 'NUMBER',
            length: '22,0'
        },
        FILE_MINH_CHUNG: {
            type: 'NVARCHAR2',
            length: '1000'
        },
        IN_LLKH: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '1'
        },
        HINH_THUC: {
            type: 'NVARCHAR2',
            length: '20'
        },
        TINH_TRANG: {
            type: 'NVARCHAR2',
            length: '10'
        },
        MA_SO: {
            type: 'NVARCHAR2',
            length: '20'
        },
        CAP_QUAN_LY: {
            type: 'NVARCHAR2',
            length: '20'
        },
        QUY_MO: {
            type: 'NVARCHAR2',
            length: '20'
        }
    };
    const methods = {
        'searchPage': 'QT_NGHIEN_CUU_KHOA_HOC_SEARCH_PAGE',
        'groupPage': 'QT_NGHIEN_CUU_KHOA_HOC_GROUP_PAGE',
        'downloadExcel': 'QT_NGHIEN_CUU_KHOA_HOC_DOWNLOAD_EXCEL',
        'userPage': 'QT_NGHIEN_CUU_KHOA_HOC_USER_PAGE'
    };
    app.model.qtNghienCuuKhoaHoc = {
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
                const sql = 'INSERT INTO QT_NGHIEN_CUU_KHOA_HOC (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.qtNghienCuuKhoaHoc.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM QT_NGHIEN_CUU_KHOA_HOC' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM QT_NGHIEN_CUU_KHOA_HOC' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM QT_NGHIEN_CUU_KHOA_HOC' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT QT_NGHIEN_CUU_KHOA_HOC.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM QT_NGHIEN_CUU_KHOA_HOC' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE QT_NGHIEN_CUU_KHOA_HOC SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.qtNghienCuuKhoaHoc.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM QT_NGHIEN_CUU_KHOA_HOC' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM QT_NGHIEN_CUU_KHOA_HOC' + (condition.statement ? ' WHERE ' + condition.statement : '');
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

        searchPage: (pagenumber, pagesize, filter, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=qt_nghien_cuu_khoa_hoc_search_page(:pagenumber, :pagesize, :filter, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, filter, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        groupPage: (pagenumber, pagesize, filter, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=qt_nghien_cuu_khoa_hoc_group_page(:pagenumber, :pagesize, :filter, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, filter, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        downloadExcel: (masocanbo, loaihocvi, fromyear, toyear, timetype, madonvi, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=qt_nghien_cuu_khoa_hoc_download_excel(:masocanbo, :loaihocvi, :fromyear, :toyear, :timetype, :madonvi); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, masocanbo, loaihocvi, fromyear, toyear, timetype, madonvi }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        userPage: (staffemail, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=qt_nghien_cuu_khoa_hoc_user_page(:staffemail); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, staffemail }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),
    };
    return { db, tableName, type, schema, methods, keys };
};