// Table name: SV_MANAGE_QUYET_DINH { id, student, formType, staffHandle, handleTime, staffSign, staffSignPosition, tinhTrangCapNhat, dataCustom, soQuyetDinh, action, model, ngayKy, kieuQuyetDinh, isDeleted, lyDo, ghiChu, idCvd, maDonVi, staffHandleUpdate, handleTimeUpdate, namHoc, hocKy }
const keys = ['ID'];
const obj2Db = { 'id': 'ID', 'student': 'STUDENT', 'formType': 'FORM_TYPE', 'staffHandle': 'STAFF_HANDLE', 'handleTime': 'HANDLE_TIME', 'staffSign': 'STAFF_SIGN', 'staffSignPosition': 'STAFF_SIGN_POSITION', 'tinhTrangCapNhat': 'TINH_TRANG_CAP_NHAT', 'dataCustom': 'DATA_CUSTOM', 'soQuyetDinh': 'SO_QUYET_DINH', 'action': 'ACTION', 'model': 'MODEL', 'ngayKy': 'NGAY_KY', 'kieuQuyetDinh': 'KIEU_QUYET_DINH', 'isDeleted': 'IS_DELETED', 'lyDo': 'LY_DO', 'ghiChu': 'GHI_CHU', 'idCvd': 'ID_CVD', 'maDonVi': 'MA_DON_VI', 'staffHandleUpdate': 'STAFF_HANDLE_UPDATE', 'handleTimeUpdate': 'HANDLE_TIME_UPDATE', 'namHoc': 'NAM_HOC', 'hocKy': 'HOC_KY' };

module.exports = app => {
    const db = 'main';
    const tableName = 'SV_MANAGE_QUYET_DINH';
    const type = 'table';
    const schema = {
        ID: {
            type: 'NUMBER',
            length: '10,0',
            autoIncrement: true,
            primaryKey: true
        },
        STUDENT: {
            type: 'NVARCHAR2',
            length: '100'
        },
        FORM_TYPE: {
            type: 'NVARCHAR2',
            length: '100'
        },
        STAFF_HANDLE: {
            type: 'NVARCHAR2',
            length: '200'
        },
        HANDLE_TIME: {
            type: 'NUMBER',
            length: '20,0'
        },
        STAFF_SIGN: {
            type: 'NVARCHAR2',
            length: '200'
        },
        STAFF_SIGN_POSITION: {
            type: 'NVARCHAR2',
            length: '100'
        },
        TINH_TRANG_CAP_NHAT: {
            type: 'NUMBER',
            length: '3,0'
        },
        DATA_CUSTOM: {
            type: 'NVARCHAR2',
            length: '1000'
        },
        SO_QUYET_DINH: {
            type: 'NVARCHAR2',
            length: '50'
        },
        ACTION: {
            type: 'NVARCHAR2',
            length: '2'
        },
        MODEL: {
            type: 'NVARCHAR2',
            length: '1000'
        },
        NGAY_KY: {
            type: 'NUMBER',
            length: '20,0'
        },
        KIEU_QUYET_DINH: {
            type: 'NUMBER',
            length: '2,0'
        },
        IS_DELETED: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        LY_DO: {
            type: 'NUMBER',
            length: '10,0'
        },
        GHI_CHU: {
            type: 'NVARCHAR2',
            length: '1000'
        },
        ID_CVD: {
            type: 'NUMBER',
            length: '22,0'
        },
        MA_DON_VI: {
            type: 'NUMBER',
            length: '4,0'
        },
        STAFF_HANDLE_UPDATE: {
            type: 'NVARCHAR2',
            length: '100'
        },
        HANDLE_TIME_UPDATE: {
            type: 'NUMBER',
            length: '20,0'
        },
        NAM_HOC: {
            type: 'NVARCHAR2',
            length: '11'
        },
        HOC_KY: {
            type: 'NUMBER',
            length: '22,0'
        }
    };
    const methods = {
        'getData': 'SV_MANAGE_QUYET_DINH_GET_DATA',
        'searchPage': 'SV_MANAGE_QUYET_DINH_SEARCH_PAGE',
        'getDssvQuaHanNhtt': 'SV_QUYET_DINH_DSSV_QUA_HAN_NGHI_HOC',
        'getThongKe': 'SV_MANAGE_QUYET_DINH_GET_THONG_KE'
    };
    app.model.svManageQuyetDinh = {
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
                const sql = 'INSERT INTO SV_MANAGE_QUYET_DINH (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.svManageQuyetDinh.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM SV_MANAGE_QUYET_DINH' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM SV_MANAGE_QUYET_DINH' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM SV_MANAGE_QUYET_DINH' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT SV_MANAGE_QUYET_DINH.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM SV_MANAGE_QUYET_DINH' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE SV_MANAGE_QUYET_DINH SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.svManageQuyetDinh.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM SV_MANAGE_QUYET_DINH' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM SV_MANAGE_QUYET_DINH' + (condition.statement ? ' WHERE ' + condition.statement : '');
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

        getData: (paramid, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=sv_manage_quyet_dinh_get_data(:paramid); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, paramid }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        searchPage: (pagenumber, pagesize, searchterm, filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=sv_manage_quyet_dinh_search_page(:pagenumber, :pagesize, :searchterm, :filter, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, searchterm, filter, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getDssvQuaHanNhtt: (datesearch, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=sv_quyet_dinh_dssv_qua_han_nghi_hoc(:datesearch); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, datesearch }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getThongKe: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=sv_manage_quyet_dinh_get_thong_ke(:filter); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
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