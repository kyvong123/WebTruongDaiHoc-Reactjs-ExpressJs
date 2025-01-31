// Table name: DT_THOI_KHOA_BIEU_CUSTOM { id, maMonHoc, maHocPhan, hocKy, namHoc, thu, phong, tietBatDau, soTietBuoi, thoiGianBatDau, thoiGianKetThuc, coSo, idNgayNghi, isBu, modifier, timeModified, ngayHoc, isNgayLe, idThoiKhoaBieu, isNghi, ghiChu, isHoanTac, isGiangVienBaoNghi, isVang, userAction, timeAction, isAccept, userVang, timeVang, isLate, isSoon }
const keys = ['ID'];
const obj2Db = { 'id': 'ID', 'maMonHoc': 'MA_MON_HOC', 'maHocPhan': 'MA_HOC_PHAN', 'hocKy': 'HOC_KY', 'namHoc': 'NAM_HOC', 'thu': 'THU', 'phong': 'PHONG', 'tietBatDau': 'TIET_BAT_DAU', 'soTietBuoi': 'SO_TIET_BUOI', 'thoiGianBatDau': 'THOI_GIAN_BAT_DAU', 'thoiGianKetThuc': 'THOI_GIAN_KET_THUC', 'coSo': 'CO_SO', 'idNgayNghi': 'ID_NGAY_NGHI', 'isBu': 'IS_BU', 'modifier': 'MODIFIER', 'timeModified': 'TIME_MODIFIED', 'ngayHoc': 'NGAY_HOC', 'isNgayLe': 'IS_NGAY_LE', 'idThoiKhoaBieu': 'ID_THOI_KHOA_BIEU', 'isNghi': 'IS_NGHI', 'ghiChu': 'GHI_CHU', 'isHoanTac': 'IS_HOAN_TAC', 'isGiangVienBaoNghi': 'IS_GIANG_VIEN_BAO_NGHI', 'isVang': 'IS_VANG', 'userAction': 'USER_ACTION', 'timeAction': 'TIME_ACTION', 'isAccept': 'IS_ACCEPT', 'userVang': 'USER_VANG', 'timeVang': 'TIME_VANG', 'isLate': 'IS_LATE', 'isSoon': 'IS_SOON' };

module.exports = app => {
    const db = 'main';
    const tableName = 'DT_THOI_KHOA_BIEU_CUSTOM';
    const type = 'table';
    const schema = {
        ID: {
            type: 'NUMBER',
            length: '22,0',
            autoIncrement: true,
            primaryKey: true
        },
        MA_MON_HOC: {
            type: 'NVARCHAR2',
            length: '20',
            allowNull: false
        },
        MA_HOC_PHAN: {
            type: 'NVARCHAR2',
            length: '50'
        },
        HOC_KY: {
            type: 'NUMBER',
            length: '1,0',
            allowNull: false
        },
        NAM_HOC: {
            type: 'NVARCHAR2',
            length: '11'
        },
        THU: {
            type: 'NUMBER',
            length: '1,0'
        },
        PHONG: {
            type: 'NVARCHAR2',
            length: '20'
        },
        TIET_BAT_DAU: {
            type: 'NUMBER',
            length: '2,0'
        },
        SO_TIET_BUOI: {
            type: 'NUMBER',
            length: '2,0'
        },
        THOI_GIAN_BAT_DAU: {
            type: 'NUMBER',
            length: '20,0'
        },
        THOI_GIAN_KET_THUC: {
            type: 'NUMBER',
            length: '20,0'
        },
        CO_SO: {
            type: 'NUMBER',
            length: '22,0'
        },
        ID_NGAY_NGHI: {
            type: 'NUMBER',
            length: '15,0'
        },
        IS_BU: {
            type: 'NUMBER',
            length: '1,0'
        },
        MODIFIER: {
            type: 'NVARCHAR2',
            length: '100'
        },
        TIME_MODIFIED: {
            type: 'NUMBER',
            length: '20,0'
        },
        NGAY_HOC: {
            type: 'NUMBER',
            length: '20,0'
        },
        IS_NGAY_LE: {
            type: 'NUMBER',
            length: '1,0'
        },
        ID_THOI_KHOA_BIEU: {
            type: 'NUMBER',
            length: '22,0'
        },
        IS_NGHI: {
            type: 'NUMBER',
            length: '1,0'
        },
        GHI_CHU: {
            type: 'NVARCHAR2',
            length: '500'
        },
        IS_HOAN_TAC: {
            type: 'NUMBER',
            length: '1,0'
        },
        IS_GIANG_VIEN_BAO_NGHI: {
            type: 'NUMBER',
            length: '1,0'
        },
        IS_VANG: {
            type: 'NUMBER',
            length: '1,0'
        },
        USER_ACTION: {
            type: 'NVARCHAR2',
            length: '100'
        },
        TIME_ACTION: {
            type: 'NUMBER',
            length: '20,0'
        },
        IS_ACCEPT: {
            type: 'NUMBER',
            length: '1,0'
        },
        USER_VANG: {
            type: 'NVARCHAR2',
            length: '100'
        },
        TIME_VANG: {
            type: 'NUMBER',
            length: '20,0'
        },
        IS_LATE: {
            type: 'NUMBER',
            length: '1,0'
        },
        IS_SOON: {
            type: 'NUMBER',
            length: '1,0'
        }
    };
    const methods = {
        'getData': 'DT_THOI_KHOA_BIEU_CUSTOM_GET_DATA',
        'searchPageNghi': 'DT_THOI_KHOA_BIEU_CUSTOM_NGHI_SEARCH_PAGE',
        'searchPageBu': 'DT_THOI_KHOA_BIEU_CUSTOM_BU_SEARCH_PAGE',
        'thongKe': 'DT_THOI_KHOA_BIEU_CUSTOM_THONG_KE'
    };
    app.model.dtThoiKhoaBieuCustom = {
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
                const sql = 'INSERT INTO DT_THOI_KHOA_BIEU_CUSTOM (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.dtThoiKhoaBieuCustom.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM DT_THOI_KHOA_BIEU_CUSTOM' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM DT_THOI_KHOA_BIEU_CUSTOM' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM DT_THOI_KHOA_BIEU_CUSTOM' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT DT_THOI_KHOA_BIEU_CUSTOM.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM DT_THOI_KHOA_BIEU_CUSTOM' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE DT_THOI_KHOA_BIEU_CUSTOM SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.dtThoiKhoaBieuCustom.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM DT_THOI_KHOA_BIEU_CUSTOM' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM DT_THOI_KHOA_BIEU_CUSTOM' + (condition.statement ? ' WHERE ' + condition.statement : '');
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

        getData: (mahocphan, filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_custom_get_data(:mahocphan, :filter); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, mahocphan, filter }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        searchPageNghi: (pagenumber, pagesize, filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_custom_nghi_search_page(:pagenumber, :pagesize, :filter, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, filter, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        searchPageBu: (pagenumber, pagesize, filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_custom_bu_search_page(:pagenumber, :pagesize, :filter, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, filter, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        thongKe: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_custom_thong_ke(:filter, :datathongke); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter, datathongke: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
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