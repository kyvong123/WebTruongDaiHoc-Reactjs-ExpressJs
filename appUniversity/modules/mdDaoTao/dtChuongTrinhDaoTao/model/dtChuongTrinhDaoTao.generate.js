// Table name: DT_CHUONG_TRINH_DAO_TAO { id, maMonHoc, loaiMonHoc, tinChiLyThuyet, tinChiThucHanh, ghiChu, kichHoat, maKhoiKienThuc, maKhungDaoTao, hocKyDuKien, tenMonHoc, tenKhoa, tongSoTiet, soTietLyThuyet, soTietThucHanh, soTinChi, khoa, maKhoiKienThucCon, tinhChatMon, loaiMonMo, namHocDuKien, tinChiDangKy, tinChiTichLuy, diemTrungBinh, idKhungTinChi, tyLeDiem }
const keys = ['ID'];
const obj2Db = { 'id': 'ID', 'maMonHoc': 'MA_MON_HOC', 'loaiMonHoc': 'LOAI_MON_HOC', 'tinChiLyThuyet': 'TIN_CHI_LY_THUYET', 'tinChiThucHanh': 'TIN_CHI_THUC_HANH', 'ghiChu': 'GHI_CHU', 'kichHoat': 'KICH_HOAT', 'maKhoiKienThuc': 'MA_KHOI_KIEN_THUC', 'maKhungDaoTao': 'MA_KHUNG_DAO_TAO', 'hocKyDuKien': 'HOC_KY_DU_KIEN', 'tenMonHoc': 'TEN_MON_HOC', 'tenKhoa': 'TEN_KHOA', 'tongSoTiet': 'TONG_SO_TIET', 'soTietLyThuyet': 'SO_TIET_LY_THUYET', 'soTietThucHanh': 'SO_TIET_THUC_HANH', 'soTinChi': 'SO_TIN_CHI', 'khoa': 'KHOA', 'maKhoiKienThucCon': 'MA_KHOI_KIEN_THUC_CON', 'tinhChatMon': 'TINH_CHAT_MON', 'loaiMonMo': 'LOAI_MON_MO', 'namHocDuKien': 'NAM_HOC_DU_KIEN', 'tinChiDangKy': 'TIN_CHI_DANG_KY', 'tinChiTichLuy': 'TIN_CHI_TICH_LUY', 'diemTrungBinh': 'DIEM_TRUNG_BINH', 'idKhungTinChi': 'ID_KHUNG_TIN_CHI', 'tyLeDiem': 'TY_LE_DIEM' };

module.exports = app => {
    const db = 'main';
    const tableName = 'DT_CHUONG_TRINH_DAO_TAO';
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
        LOAI_MON_HOC: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        TIN_CHI_LY_THUYET: {
            type: 'NUMBER',
            length: '20,0'
        },
        TIN_CHI_THUC_HANH: {
            type: 'NUMBER',
            length: '20,0'
        },
        GHI_CHU: {
            type: 'NVARCHAR2',
            length: '2000'
        },
        KICH_HOAT: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '1'
        },
        MA_KHOI_KIEN_THUC: {
            type: 'NUMBER',
            length: '22,0',
            allowNull: false
        },
        MA_KHUNG_DAO_TAO: {
            type: 'NUMBER',
            length: '22,0',
            allowNull: false
        },
        HOC_KY_DU_KIEN: {
            type: 'NVARCHAR2',
            length: '3'
        },
        TEN_MON_HOC: {
            type: 'NVARCHAR2',
            length: '500'
        },
        TEN_KHOA: {
            type: 'NVARCHAR2',
            length: '200'
        },
        TONG_SO_TIET: {
            type: 'NUMBER',
            length: '5,0'
        },
        SO_TIET_LY_THUYET: {
            type: 'NUMBER',
            length: '5,0'
        },
        SO_TIET_THUC_HANH: {
            type: 'NUMBER',
            length: '5,0'
        },
        SO_TIN_CHI: {
            type: 'NUMBER',
            length: '5,0'
        },
        KHOA: {
            type: 'NUMBER',
            length: '5,0'
        },
        MA_KHOI_KIEN_THUC_CON: {
            type: 'NUMBER',
            length: '22,0'
        },
        TINH_CHAT_MON: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        LOAI_MON_MO: {
            type: 'NVARCHAR2',
            length: '5'
        },
        NAM_HOC_DU_KIEN: {
            type: 'NVARCHAR2',
            length: '11'
        },
        TIN_CHI_DANG_KY: {
            type: 'NUMBER',
            length: '5,0'
        },
        TIN_CHI_TICH_LUY: {
            type: 'NUMBER',
            length: '5,0'
        },
        DIEM_TRUNG_BINH: {
            type: 'NUMBER',
            length: '3,2'
        },
        ID_KHUNG_TIN_CHI: {
            type: 'NUMBER',
            length: '22,0'
        },
        TY_LE_DIEM: {
            type: 'CLOB',
            length: '4000'
        }
    };
    const methods = {
        'getByFilter': 'DT_CHUONG_TRINH_DAO_TAO_GET_BY_FILTER',
        'getCtdt': 'DT_CHUONG_TRINH_DAO_TAO_GET_CTDT',
        'exportCtdt': 'DT_CHUONG_TRINH_DAO_TAO_EXPORT',
        'getData': 'DT_CHUONG_TRINH_DAO_TAO_GET_DATA',
        'getTuongDuong': 'DT_CHUONG_TRINH_DAO_TAO_GET_TUONG_DUONG'
    };
    app.model.dtChuongTrinhDaoTao = {
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
                const sql = 'INSERT INTO DT_CHUONG_TRINH_DAO_TAO (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.dtChuongTrinhDaoTao.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM DT_CHUONG_TRINH_DAO_TAO' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM DT_CHUONG_TRINH_DAO_TAO' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM DT_CHUONG_TRINH_DAO_TAO' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT DT_CHUONG_TRINH_DAO_TAO.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM DT_CHUONG_TRINH_DAO_TAO' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE DT_CHUONG_TRINH_DAO_TAO SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.dtChuongTrinhDaoTao.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM DT_CHUONG_TRINH_DAO_TAO' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM DT_CHUONG_TRINH_DAO_TAO' + (condition.statement ? ' WHERE ' + condition.statement : '');
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

        getByFilter: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_chuong_trinh_dao_tao_get_by_filter(:filter); END;',
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

        getCtdt: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_chuong_trinh_dao_tao_get_ctdt(:filter); END;',
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

        exportCtdt: (makhung, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_chuong_trinh_dao_tao_export(:makhung); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, makhung }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getData: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_chuong_trinh_dao_tao_get_data(:filter, :datacautruckhung, :datakehoachdaotao); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter, datacautruckhung: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, datakehoachdaotao: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getTuongDuong: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_chuong_trinh_dao_tao_get_tuong_duong(:filter); END;',
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