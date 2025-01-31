// Table name: QT_CONG_TAC_TRONG_NUOC { id, ngayQuyetDinh, soCv, shcc, noiDen, vietTat, lyDo, batDau, batDauType, ketThuc, ketThucType, kinhPhi, ghiChu, loaiChiPhi, idVanBan }
const keys = ['ID'];
const obj2Db = { 'id': 'ID', 'ngayQuyetDinh': 'NGAY_QUYET_DINH', 'soCv': 'SO_CV', 'shcc': 'SHCC', 'noiDen': 'NOI_DEN', 'vietTat': 'VIET_TAT', 'lyDo': 'LY_DO', 'batDau': 'BAT_DAU', 'batDauType': 'BAT_DAU_TYPE', 'ketThuc': 'KET_THUC', 'ketThucType': 'KET_THUC_TYPE', 'kinhPhi': 'KINH_PHI', 'ghiChu': 'GHI_CHU', 'loaiChiPhi': 'LOAI_CHI_PHI', 'idVanBan': 'ID_VAN_BAN' };

module.exports = app => {
    const db = 'main';
    const tableName = 'QT_CONG_TAC_TRONG_NUOC';
    const type = 'table';
    const schema = {
        ID: {
            type: 'NUMBER',
            length: '22,0',
            autoIncrement: true,
            primaryKey: true
        },
        NGAY_QUYET_DINH: {
            type: 'NUMBER',
            length: '20,0'
        },
        SO_CV: {
            type: 'NVARCHAR2',
            length: '30'
        },
        SHCC: {
            type: 'NVARCHAR2',
            length: '10'
        },
        NOI_DEN: {
            type: 'NVARCHAR2',
            length: '100'
        },
        VIET_TAT: {
            type: 'NVARCHAR2',
            length: '30'
        },
        LY_DO: {
            type: 'NVARCHAR2',
            length: '500'
        },
        BAT_DAU: {
            type: 'NUMBER',
            length: '20,0'
        },
        BAT_DAU_TYPE: {
            type: 'NVARCHAR2',
            length: '10'
        },
        KET_THUC: {
            type: 'NUMBER',
            length: '20,0'
        },
        KET_THUC_TYPE: {
            type: 'NVARCHAR2',
            length: '10'
        },
        KINH_PHI: {
            type: 'NVARCHAR2',
            length: '200'
        },
        GHI_CHU: {
            type: 'NVARCHAR2',
            length: '50'
        },
        LOAI_CHI_PHI: {
            type: 'NVARCHAR2',
            length: '2'
        },
        ID_VAN_BAN: {
            type: 'NUMBER',
            length: '22,0'
        }
    };
    const methods = {
        'searchPage': 'QT_CONG_TAC_TRONG_NUOC_SEARCH_PAGE',
        'groupPage': 'QT_CONG_TAC_TRONG_NUOC_GROUP_PAGE',
        'download': 'QT_CONG_TAC_TRONG_NUOC_DOWNLOAD_EXCEL'
    };
    app.model.qtCongTacTrongNuoc = {
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
                const sql = 'INSERT INTO QT_CONG_TAC_TRONG_NUOC (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.qtCongTacTrongNuoc.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM QT_CONG_TAC_TRONG_NUOC' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM QT_CONG_TAC_TRONG_NUOC' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM QT_CONG_TAC_TRONG_NUOC' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT QT_CONG_TAC_TRONG_NUOC.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM QT_CONG_TAC_TRONG_NUOC' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE QT_CONG_TAC_TRONG_NUOC SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.qtCongTacTrongNuoc.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM QT_CONG_TAC_TRONG_NUOC' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM QT_CONG_TAC_TRONG_NUOC' + (condition.statement ? ' WHERE ' + condition.statement : '');
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

        searchPage: (pagenumber, pagesize, listShcc, listDv, fromyear, toyear, timetype, tinhtrang, loaihocvi, mucdich, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=qt_cong_tac_trong_nuoc_search_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromyear, :toyear, :timetype, :tinhtrang, :loaihocvi, :mucdich, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, listShcc, listDv, fromyear, toyear, timetype, tinhtrang, loaihocvi, mucdich, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        groupPage: (pagenumber, pagesize, listShcc, listDv, fromyear, toyear, timetype, tinhtrang, loaihocvi, mucdich, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=qt_cong_tac_trong_nuoc_group_page(:pagenumber, :pagesize, :listShcc, :listDv, :fromyear, :toyear, :timetype, :tinhtrang, :loaihocvi, :mucdich, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, listShcc, listDv, fromyear, toyear, timetype, tinhtrang, loaihocvi, mucdich, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        download: (listShcc, listDv, fromyear, toyear, timetype, tinhtrang, loaihocvi, mucdich, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=qt_cong_tac_trong_nuoc_download_excel(:listShcc, :listDv, :fromyear, :toyear, :timetype, :tinhtrang, :loaihocvi, :mucdich); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, listShcc, listDv, fromyear, toyear, timetype, tinhtrang, loaihocvi, mucdich }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
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