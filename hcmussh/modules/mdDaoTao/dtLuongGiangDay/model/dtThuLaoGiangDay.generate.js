// Table name: DT_THU_LAO_GIANG_DAY { id, idGiangVien, maHocPhan, loaiHinhDaoTao, lopNuocNgoai, vietNamHoc, donGia, thue, soTietDuocChia, timeModified, namHoc, hocKy, status, dotThanhToan, modifier, idThoiKhoaBieu, soLuongSv, soVanBan, tinhPhi, hocVi, hocHam, ngach, loaiHopDong }
const keys = ['ID'];
const obj2Db = { 'id': 'ID', 'idGiangVien': 'ID_GIANG_VIEN', 'maHocPhan': 'MA_HOC_PHAN', 'loaiHinhDaoTao': 'LOAI_HINH_DAO_TAO', 'lopNuocNgoai': 'LOP_NUOC_NGOAI', 'vietNamHoc': 'VIET_NAM_HOC', 'donGia': 'DON_GIA', 'thue': 'THUE', 'soTietDuocChia': 'SO_TIET_DUOC_CHIA', 'timeModified': 'TIME_MODIFIED', 'namHoc': 'NAM_HOC', 'hocKy': 'HOC_KY', 'status': 'STATUS', 'dotThanhToan': 'DOT_THANH_TOAN', 'modifier': 'MODIFIER', 'idThoiKhoaBieu': 'ID_THOI_KHOA_BIEU', 'soLuongSv': 'SO_LUONG_SV', 'soVanBan': 'SO_VAN_BAN', 'tinhPhi': 'TINH_PHI', 'hocVi': 'HOC_VI', 'hocHam': 'HOC_HAM', 'ngach': 'NGACH', 'loaiHopDong': 'LOAI_HOP_DONG' };

module.exports = app => {
    const db = 'main';
    const tableName = 'DT_THU_LAO_GIANG_DAY';
    const type = 'table';
    const schema = {
        ID: {
            type: 'NUMBER',
            length: '22,0',
            autoIncrement: true,
            primaryKey: true
        },
        ID_GIANG_VIEN: {
            type: 'NVARCHAR2',
            length: '50'
        },
        MA_HOC_PHAN: {
            type: 'NVARCHAR2',
            length: '50'
        },
        LOAI_HINH_DAO_TAO: {
            type: 'NVARCHAR2',
            length: '20'
        },
        LOP_NUOC_NGOAI: {
            type: 'NUMBER',
            length: '1,0'
        },
        VIET_NAM_HOC: {
            type: 'NUMBER',
            length: '1,0'
        },
        DON_GIA: {
            type: 'NUMBER',
            length: '20,0'
        },
        THUE: {
            type: 'NUMBER',
            length: '4,2'
        },
        SO_TIET_DUOC_CHIA: {
            type: 'NUMBER',
            length: '3,0'
        },
        TIME_MODIFIED: {
            type: 'NUMBER',
            length: '20,0'
        },
        NAM_HOC: {
            type: 'NVARCHAR2',
            length: '11'
        },
        HOC_KY: {
            type: 'NUMBER',
            length: '1,0'
        },
        STATUS: {
            type: 'NUMBER',
            length: '2,0',
            defaultValue: '0'
        },
        DOT_THANH_TOAN: {
            type: 'NVARCHAR2',
            length: '10'
        },
        MODIFIER: {
            type: 'NVARCHAR2',
            length: '50'
        },
        ID_THOI_KHOA_BIEU: {
            type: 'NUMBER',
            length: '20,0'
        },
        SO_LUONG_SV: {
            type: 'NUMBER',
            length: '10,0'
        },
        SO_VAN_BAN: {
            type: 'NVARCHAR2',
            length: '50'
        },
        TINH_PHI: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '1'
        },
        HOC_VI: {
            type: 'NVARCHAR2',
            length: '10'
        },
        HOC_HAM: {
            type: 'NVARCHAR2',
            length: '10'
        },
        NGACH: {
            type: 'NVARCHAR2',
            length: '30'
        },
        LOAI_HOP_DONG: {
            type: 'NVARCHAR2',
            length: '50'
        }
    };
    const methods = {
        'searchPage': 'DT_THU_LAO_GIANG_DAY_SEARCH_PAGE',
        'getInfoGiangVien': 'DT_THU_LAO_GIANG_DAY_GET_INFO_GIANG_VIEN',
        'listAutoGen': 'DT_THU_LAO_GIANG_DAY_LIST_AUTO_GEN',
        'gopHang': 'DT_THU_LAO_GIANG_DAY_GOP_HANG',
        'getListHopDong': 'DT_THU_LAO_GIANG_DAY_GET_LIST_HOP_DONG',
        'exportHopDong': 'DT_THU_LAO_GIANG_DAY_EXPORT_HOP_DONG'
    };
    app.model.dtThuLaoGiangDay = {
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
                const sql = 'INSERT INTO DT_THU_LAO_GIANG_DAY (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.dtThuLaoGiangDay.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM DT_THU_LAO_GIANG_DAY' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM DT_THU_LAO_GIANG_DAY' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM DT_THU_LAO_GIANG_DAY' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT DT_THU_LAO_GIANG_DAY.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM DT_THU_LAO_GIANG_DAY' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE DT_THU_LAO_GIANG_DAY SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.dtThuLaoGiangDay.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM DT_THU_LAO_GIANG_DAY' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM DT_THU_LAO_GIANG_DAY' + (condition.statement ? ' WHERE ' + condition.statement : '');
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

        searchPage: (pagenumber, pagesize, searchterm, filter, sortkey, sortmode, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thu_lao_giang_day_search_page(:pagenumber, :pagesize, :searchterm, :filter, :sortkey, :sortmode, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, searchterm, filter, sortkey, sortmode, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getInfoGiangVien: (idgiangvien, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thu_lao_giang_day_get_info_giang_vien(:idgiangvien); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, idgiangvien }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        listAutoGen: (namhoc, hocky, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thu_lao_giang_day_list_auto_gen(:namhoc, :hocky); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, namhoc, hocky }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        gopHang: (namhoc, hocky, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thu_lao_giang_day_gop_hang(:namhoc, :hocky); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, namhoc, hocky }, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                });
        }),

        getListHopDong: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thu_lao_giang_day_get_list_hop_dong(:filter); END;',
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

        exportHopDong: (data, info, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thu_lao_giang_day_export_hop_dong(:data, :info, :canbo); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, data, info, canbo: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
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