// Table name: TC_HOC_PHI_SUB_DETAIL { mssv, idDotDong, maMonHoc, soTinChi, tenMonHoc, active, soTien, id, soTienDaDong, maHocPhan, daHoanDongHocPhi, hocPhiNienKhoa, modifier, lastModified, status, mucTinhPhi, soTienCanDong, thoiGianThanhToanGiangVien, hocPhiChinh, loaiPhi, soTiet }
const keys = ['ID'];
const obj2Db = { 'mssv': 'MSSV', 'idDotDong': 'ID_DOT_DONG', 'maMonHoc': 'MA_MON_HOC', 'soTinChi': 'SO_TIN_CHI', 'tenMonHoc': 'TEN_MON_HOC', 'active': 'ACTIVE', 'soTien': 'SO_TIEN', 'id': 'ID', 'soTienDaDong': 'SO_TIEN_DA_DONG', 'maHocPhan': 'MA_HOC_PHAN', 'daHoanDongHocPhi': 'DA_HOAN_DONG_HOC_PHI', 'hocPhiNienKhoa': 'HOC_PHI_NIEN_KHOA', 'modifier': 'MODIFIER', 'lastModified': 'LAST_MODIFIED', 'status': 'STATUS', 'mucTinhPhi': 'MUC_TINH_PHI', 'soTienCanDong': 'SO_TIEN_CAN_DONG', 'thoiGianThanhToanGiangVien': 'THOI_GIAN_THANH_TOAN_GIANG_VIEN', 'hocPhiChinh': 'HOC_PHI_CHINH', 'loaiPhi': 'LOAI_PHI', 'soTiet': 'SO_TIET' };

module.exports = app => {
    const db = 'main';
    const tableName = 'TC_HOC_PHI_SUB_DETAIL';
    const type = 'table';
    const schema = {
        MSSV: {
            type: 'NVARCHAR2',
            length: '20',
            allowNull: false
        },
        ID_DOT_DONG: {
            type: 'NUMBER',
            length: '4,0',
            allowNull: false
        },
        MA_MON_HOC: {
            type: 'NVARCHAR2',
            length: '20'
        },
        SO_TIN_CHI: {
            type: 'NUMBER',
            length: '2,0'
        },
        TEN_MON_HOC: {
            type: 'NVARCHAR2',
            length: '500'
        },
        ACTIVE: {
            type: 'NUMBER',
            length: '1,0',
            allowNull: false
        },
        SO_TIEN: {
            type: 'NUMBER',
            length: '20,0'
        },
        ID: {
            type: 'NUMBER',
            length: '22,0',
            autoIncrement: true,
            primaryKey: true
        },
        SO_TIEN_DA_DONG: {
            type: 'NUMBER',
            length: '20,0',
            defaultValue: '0'
        },
        MA_HOC_PHAN: {
            type: 'NVARCHAR2',
            length: '50'
        },
        DA_HOAN_DONG_HOC_PHI: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        HOC_PHI_NIEN_KHOA: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        MODIFIER: {
            type: 'NVARCHAR2',
            length: '100'
        },
        LAST_MODIFIED: {
            type: 'NUMBER',
            length: '20,0'
        },
        STATUS: {
            type: 'NVARCHAR2',
            length: '5'
        },
        MUC_TINH_PHI: {
            type: 'NUMBER',
            length: '3,0',
            defaultValue: '100'
        },
        SO_TIEN_CAN_DONG: {
            type: 'NUMBER',
            length: '20,0'
        },
        THOI_GIAN_THANH_TOAN_GIANG_VIEN: {
            type: 'NUMBER',
            length: '20,0'
        },
        HOC_PHI_CHINH: {
            type: 'NUMBER',
            length: '1,0'
        },
        LOAI_PHI: {
            type: 'NUMBER',
            length: '10,0'
        },
        SO_TIET: {
            type: 'NUMBER',
            length: '5,0'
        }
    };
    const methods = {
        'addTienClc': 'TC_HOC_PHI_SUB_DETAIL_ADD_TIEN_CLC',
        'searchPage': 'TC_HOC_PHI_SUB_DETAIL_SEARCH_PAGE',
        'downloadExcel': 'TC_HOC_PHI_SUB_DETAIL_DOWNLOAD_EXCEL'
    };
    app.model.tcHocPhiSubDetail = {
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
                const sql = 'INSERT INTO TC_HOC_PHI_SUB_DETAIL (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.tcHocPhiSubDetail.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM TC_HOC_PHI_SUB_DETAIL' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM TC_HOC_PHI_SUB_DETAIL' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM TC_HOC_PHI_SUB_DETAIL' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT TC_HOC_PHI_SUB_DETAIL.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM TC_HOC_PHI_SUB_DETAIL' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE TC_HOC_PHI_SUB_DETAIL SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.tcHocPhiSubDetail.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM TC_HOC_PHI_SUB_DETAIL' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM TC_HOC_PHI_SUB_DETAIL' + (condition.statement ? ' WHERE ' + condition.statement : '');
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

        addTienClc: (done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_sub_detail_add_tien_clc(); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                });
        }),

        searchPage: (pagenumber, pagesize, searchterm, filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_sub_detail_search_page(:pagenumber, :pagesize, :searchterm, :filter, :totalitem, :pagetotal, :totalcurrent, :totalpaid, :totalmiengiam, :totalconlai, :totalsinhvien, :totaldadong, :thoigianthanhtoan); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, searchterm, filter, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, totalcurrent: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, totalpaid: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, totalmiengiam: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, totalconlai: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, totalsinhvien: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, totaldadong: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, thoigianthanhtoan: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        downloadExcel: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_sub_detail_download_excel(:filter, :listgroup); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter, listgroup: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
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