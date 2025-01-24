// Table name: SDH_TS_THONG_TIN_CO_BAN { idDot, sbd, maNganh, ho, ten, ngaySinh, gioiTinh, ngheNghiep, donVi, soNha, dienThoai, email, ghiChu, id, dkNgoaiNgu, phanHe, hinhThuc, doiTuongUuTien, maTinhThanhPho, maQuanHuyen, maPhuongXa, idNganh, maTruyXuat, trungTuyen, isXetDuyet, ngayDangKy, latestUpdate, btkt, noiSinh, modifier, timeModified, danToc, triggerPh, noiSinhQuocGia, congBoTrungTuyen }
const keys = ['ID'];
const obj2Db = { 'idDot': 'ID_DOT', 'sbd': 'SBD', 'maNganh': 'MA_NGANH', 'ho': 'HO', 'ten': 'TEN', 'ngaySinh': 'NGAY_SINH', 'gioiTinh': 'GIOI_TINH', 'ngheNghiep': 'NGHE_NGHIEP', 'donVi': 'DON_VI', 'soNha': 'SO_NHA', 'dienThoai': 'DIEN_THOAI', 'email': 'EMAIL', 'ghiChu': 'GHI_CHU', 'id': 'ID', 'dkNgoaiNgu': 'DK_NGOAI_NGU', 'phanHe': 'PHAN_HE', 'hinhThuc': 'HINH_THUC', 'doiTuongUuTien': 'DOI_TUONG_UU_TIEN', 'maTinhThanhPho': 'MA_TINH_THANH_PHO', 'maQuanHuyen': 'MA_QUAN_HUYEN', 'maPhuongXa': 'MA_PHUONG_XA', 'idNganh': 'ID_NGANH', 'maTruyXuat': 'MA_TRUY_XUAT', 'trungTuyen': 'TRUNG_TUYEN', 'isXetDuyet': 'IS_XET_DUYET', 'ngayDangKy': 'NGAY_DANG_KY', 'latestUpdate': 'LATEST_UPDATE', 'btkt': 'BTKT', 'noiSinh': 'NOI_SINH', 'modifier': 'MODIFIER', 'timeModified': 'TIME_MODIFIED', 'danToc': 'DAN_TOC', 'triggerPh': 'TRIGGER_PH', 'noiSinhQuocGia': 'NOI_SINH_QUOC_GIA', 'congBoTrungTuyen': 'CONG_BO_TRUNG_TUYEN' };

module.exports = app => {
    const db = 'main';
    const tableName = 'SDH_TS_THONG_TIN_CO_BAN';
    const type = 'table';
    const schema = {
        ID_DOT: {
            type: 'NVARCHAR2',
            length: '10'
        },
        SBD: {
            type: 'NVARCHAR2',
            length: '50'
        },
        MA_NGANH: {
            type: 'NVARCHAR2',
            length: '255'
        },
        HO: {
            type: 'NVARCHAR2',
            length: '40'
        },
        TEN: {
            type: 'NVARCHAR2',
            length: '20'
        },
        NGAY_SINH: {
            type: 'NUMBER',
            length: '20,0'
        },
        GIOI_TINH: {
            type: 'NVARCHAR2',
            length: '10'
        },
        NGHE_NGHIEP: {
            type: 'NVARCHAR2',
            length: '500'
        },
        DON_VI: {
            type: 'NVARCHAR2',
            length: '500'
        },
        SO_NHA: {
            type: 'NVARCHAR2',
            length: '1000'
        },
        DIEN_THOAI: {
            type: 'NVARCHAR2',
            length: '20'
        },
        EMAIL: {
            type: 'NVARCHAR2',
            length: '100'
        },
        GHI_CHU: {
            type: 'NVARCHAR2',
            length: '2000'
        },
        ID: {
            type: 'NUMBER',
            length: '22,0',
            autoIncrement: true,
            primaryKey: true
        },
        DK_NGOAI_NGU: {
            type: 'NVARCHAR2',
            length: '255'
        },
        PHAN_HE: {
            type: 'NVARCHAR2',
            length: '20'
        },
        HINH_THUC: {
            type: 'NVARCHAR2',
            length: '20'
        },
        DOI_TUONG_UU_TIEN: {
            type: 'NVARCHAR2',
            length: '20'
        },
        MA_TINH_THANH_PHO: {
            type: 'NVARCHAR2',
            length: '20'
        },
        MA_QUAN_HUYEN: {
            type: 'NVARCHAR2',
            length: '20'
        },
        MA_PHUONG_XA: {
            type: 'NVARCHAR2',
            length: '20'
        },
        ID_NGANH: {
            type: 'NUMBER',
            length: '22,0'
        },
        MA_TRUY_XUAT: {
            type: 'NVARCHAR2',
            length: '1000'
        },
        TRUNG_TUYEN: {
            type: 'NUMBER',
            length: '1,0'
        },
        IS_XET_DUYET: {
            type: 'NUMBER',
            length: '22,0'
        },
        NGAY_DANG_KY: {
            type: 'NUMBER',
            length: '22,0'
        },
        LATEST_UPDATE: {
            type: 'NUMBER',
            length: '22,0'
        },
        BTKT: {
            type: 'NUMBER',
            length: '1,0'
        },
        NOI_SINH: {
            type: 'NVARCHAR2',
            length: '10'
        },
        MODIFIER: {
            type: 'NVARCHAR2',
            length: '100'
        },
        TIME_MODIFIED: {
            type: 'NUMBER',
            length: '22,0'
        },
        DAN_TOC: {
            type: 'NVARCHAR2',
            length: '10'
        },
        TRIGGER_PH: {
            type: 'NUMBER',
            length: '22,0'
        },
        NOI_SINH_QUOC_GIA: {
            type: 'NVARCHAR2',
            length: '10'
        },
        CONG_BO_TRUNG_TUYEN: {
            type: 'NUMBER',
            length: '1,0'
        }
    };
    const methods = {
        'searchPage': 'SDH_TS_THONG_TIN_CO_BAN_OF_KY_THI_SEARCH_PAGE',
        'searchPageNew': 'SDH_TS_THONG_TIN_CO_BAN_OF_KY_THI_SEARCH_PAGE_NEW',
        'downloadExcel': 'SDH_KY_THI_TUYEN_SINH_DANH_SACH_TS_DOWNLOAD_EXCEL',
        'getDataThongKe': 'SDH_TS_GET_DATA_THONG_KE',
        'searchTTCB': 'SDH_TS_THONG_TIN_CO_BAN_SEARCH_TTCB',
        'getTkDetail': 'SDH_TS_GET_DATA_THONG_KE_DETAIL',
        'getAccountById': 'SDH_TS_GET_ACCOUNT_BY_ID',
        'exportDstsTuyenThangCaoHoc': 'SDH_TS_DSTS_EXPORT_TUYEN_THANG_CAO_HOC',
        'exportDstsXetTuyenCaoHoc': 'SDH_TS_DSTS_EXPORT_XET_TUYEN_CAO_HOC'
    };
    app.model.sdhTsThongTinCoBan = {
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
                const sql = 'INSERT INTO SDH_TS_THONG_TIN_CO_BAN (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.sdhTsThongTinCoBan.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM SDH_TS_THONG_TIN_CO_BAN' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM SDH_TS_THONG_TIN_CO_BAN' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM SDH_TS_THONG_TIN_CO_BAN' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT SDH_TS_THONG_TIN_CO_BAN.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM SDH_TS_THONG_TIN_CO_BAN' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE SDH_TS_THONG_TIN_CO_BAN SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.sdhTsThongTinCoBan.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM SDH_TS_THONG_TIN_CO_BAN' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM SDH_TS_THONG_TIN_CO_BAN' + (condition.statement ? ' WHERE ' + condition.statement : '');
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

        searchPage: (pagenumber, pagesize, filter, searchterm, makythi, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=sdh_ts_thong_tin_co_ban_of_ky_thi_search_page(:pagenumber, :pagesize, :filter, :searchterm, :makythi, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, filter, searchterm, makythi, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        searchPageNew: (pagenumber, pagesize, filter, searchterm, makythi, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=sdh_ts_thong_tin_co_ban_of_ky_thi_search_page_new(:pagenumber, :pagesize, :filter, :searchterm, :makythi, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, filter, searchterm, makythi, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        downloadExcel: (searchterm, filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=sdh_ky_thi_tuyen_sinh_danh_sach_ts_download_excel(:searchterm, :filter); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, searchterm, filter }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getDataThongKe: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=sdh_ts_get_data_thong_ke(:filter, :tkXetDuyet, :tkDknn, :tkDkccnn, :tkVang, :tkKyLuat, :tkXetTrungTuyen, :tkPhanHe, :tkHinhThuc, :tkNganh, :tkDknnByMon, :tkCcnnByLoai, :tkKyLuatByMucDo, :tkTrungTuyenByNganh); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter, tkXetDuyet: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, tkDknn: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, tkDkccnn: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, tkVang: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, tkKyLuat: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, tkXetTrungTuyen: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, tkPhanHe: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, tkHinhThuc: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, tkNganh: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, tkDknnByMon: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, tkCcnnByLoai: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, tkKyLuatByMucDo: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, tkTrungTuyenByNganh: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        searchTTCB: (iden, filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=sdh_ts_thong_tin_co_ban_search_ttcb(:iden, :filter); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, iden, filter }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getTkDetail: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=sdh_ts_get_data_thong_ke_detail(:filter); END;',
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

        getAccountById: (idthisinh, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=sdh_ts_get_account_by_id(:idthisinh); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, idthisinh }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        exportDstsTuyenThangCaoHoc: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=sdh_ts_dsts_export_tuyen_thang_cao_hoc(:filter, :dataHeader); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter, dataHeader: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        exportDstsXetTuyenCaoHoc: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=sdh_ts_dsts_export_xet_tuyen_cao_hoc(:filter); END;',
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