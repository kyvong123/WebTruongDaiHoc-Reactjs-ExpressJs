// Table name: FW_SINH_VIEN_SDH { mssv, ho, ten, ngaySinh, danToc, tonGiao, quocTich, hienTaiSoNha, noiSinhMaTinh, maKhoa, maNganh, namTuyenSinh, nienKhoa, bacDaoTao, chuongTrinhDaoTao, sdtCaNhan, sdtLienHe, email, coQuan, gvhd, tenDeTai, tinhTrang, heDaoTao, thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha, lienLacMaTinh, lienLacMaHuyen, lienLacMaXa, lienLacSoNha, gioiTinh, lop }
const keys = ['MSSV'];
const obj2Db = { 'mssv': 'MSSV', 'ho': 'HO', 'ten': 'TEN', 'ngaySinh': 'NGAY_SINH', 'danToc': 'DAN_TOC', 'tonGiao': 'TON_GIAO', 'quocTich': 'QUOC_TICH', 'hienTaiSoNha': 'HIEN_TAI_SO_NHA', 'noiSinhMaTinh': 'NOI_SINH_MA_TINH', 'maKhoa': 'MA_KHOA', 'maNganh': 'MA_NGANH', 'namTuyenSinh': 'NAM_TUYEN_SINH', 'nienKhoa': 'NIEN_KHOA', 'bacDaoTao': 'BAC_DAO_TAO', 'chuongTrinhDaoTao': 'CHUONG_TRINH_DAO_TAO', 'sdtCaNhan': 'SDT_CA_NHAN', 'sdtLienHe': 'SDT_LIEN_HE', 'email': 'EMAIL', 'coQuan': 'CO_QUAN', 'gvhd': 'GVHD', 'tenDeTai': 'TEN_DE_TAI', 'tinhTrang': 'TINH_TRANG', 'heDaoTao': 'HE_DAO_TAO', 'thuongTruMaTinh': 'THUONG_TRU_MA_TINH', 'thuongTruMaHuyen': 'THUONG_TRU_MA_HUYEN', 'thuongTruMaXa': 'THUONG_TRU_MA_XA', 'thuongTruSoNha': 'THUONG_TRU_SO_NHA', 'lienLacMaTinh': 'LIEN_LAC_MA_TINH', 'lienLacMaHuyen': 'LIEN_LAC_MA_HUYEN', 'lienLacMaXa': 'LIEN_LAC_MA_XA', 'lienLacSoNha': 'LIEN_LAC_SO_NHA', 'gioiTinh': 'GIOI_TINH', 'lop': 'LOP' };

module.exports = app => {
    const db = 'main';
    const tableName = 'FW_SINH_VIEN_SDH';
    const type = 'table';
    const schema = {
        MSSV: {
            type: 'NVARCHAR2',
            length: '20',
            primaryKey: true
        },
        HO: {
            type: 'NVARCHAR2',
            length: '40'
        },
        TEN: {
            type: 'VARCHAR2',
            length: '20'
        },
        NGAY_SINH: {
            type: 'NUMBER',
            length: '20,0'
        },
        DAN_TOC: {
            type: 'NVARCHAR2',
            length: '20'
        },
        TON_GIAO: {
            type: 'NVARCHAR2',
            length: '20'
        },
        QUOC_TICH: {
            type: 'NVARCHAR2',
            length: '2'
        },
        HIEN_TAI_SO_NHA: {
            type: 'NVARCHAR2',
            length: '100'
        },
        NOI_SINH_MA_TINH: {
            type: 'NVARCHAR2',
            length: '3'
        },
        MA_KHOA: {
            type: 'NVARCHAR2',
            length: '20'
        },
        MA_NGANH: {
            type: 'NVARCHAR2',
            length: '20'
        },
        NAM_TUYEN_SINH: {
            type: 'NUMBER',
            length: '4,0'
        },
        NIEN_KHOA: {
            type: 'NVARCHAR2',
            length: '20'
        },
        BAC_DAO_TAO: {
            type: 'NVARCHAR2',
            length: '100'
        },
        CHUONG_TRINH_DAO_TAO: {
            type: 'NVARCHAR2',
            length: '100'
        },
        SDT_CA_NHAN: {
            type: 'NVARCHAR2',
            length: '20'
        },
        SDT_LIEN_HE: {
            type: 'NVARCHAR2',
            length: '20'
        },
        EMAIL: {
            type: 'NVARCHAR2',
            length: '100'
        },
        CO_QUAN: {
            type: 'NVARCHAR2',
            length: '100'
        },
        GVHD: {
            type: 'NVARCHAR2',
            length: '100'
        },
        TEN_DE_TAI: {
            type: 'NVARCHAR2',
            length: '200'
        },
        TINH_TRANG: {
            type: 'NVARCHAR2',
            length: '20'
        },
        HE_DAO_TAO: {
            type: 'NVARCHAR2',
            length: '20'
        },
        THUONG_TRU_MA_TINH: {
            type: 'NVARCHAR2',
            length: '10'
        },
        THUONG_TRU_MA_HUYEN: {
            type: 'NVARCHAR2',
            length: '10'
        },
        THUONG_TRU_MA_XA: {
            type: 'NVARCHAR2',
            length: '10'
        },
        THUONG_TRU_SO_NHA: {
            type: 'NVARCHAR2',
            length: '100'
        },
        LIEN_LAC_MA_TINH: {
            type: 'NVARCHAR2',
            length: '10'
        },
        LIEN_LAC_MA_HUYEN: {
            type: 'NVARCHAR2',
            length: '10'
        },
        LIEN_LAC_MA_XA: {
            type: 'NVARCHAR2',
            length: '10'
        },
        LIEN_LAC_SO_NHA: {
            type: 'NVARCHAR2',
            length: '100'
        },
        GIOI_TINH: {
            type: 'NVARCHAR2',
            length: '2'
        },
        LOP: {
            type: 'NVARCHAR2',
            length: '20'
        }
    };
    const methods = {
        'searchPage': 'FW_SV_SDH_SEARCH_PAGE',
        'downloadExcel': 'FW_SV_SDH_DOWNLOAD_EXCEL',
        'getData': 'FW_STUDENT_SDH_GET_DATA'
    };
    app.model.fwSinhVienSdh = {
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
                const sql = 'INSERT INTO FW_SINH_VIEN_SDH (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.fwSinhVienSdh.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM FW_SINH_VIEN_SDH' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM FW_SINH_VIEN_SDH' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM FW_SINH_VIEN_SDH' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT FW_SINH_VIEN_SDH.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM FW_SINH_VIEN_SDH' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE FW_SINH_VIEN_SDH SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.fwSinhVienSdh.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM FW_SINH_VIEN_SDH' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM FW_SINH_VIEN_SDH' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=fw_sv_sdh_search_page(:pagenumber, :pagesize, :searchterm, :filter, :sortkey, :sortmode, :totalitem, :pagetotal); END;',
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

        downloadExcel: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=fw_sv_sdh_download_excel(:filter); END;',
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

        getData: (imssv, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=fw_student_sdh_get_data(:imssv); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, imssv }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
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