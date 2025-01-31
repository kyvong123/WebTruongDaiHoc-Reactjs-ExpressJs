// Table name: QT_HOP_DONG_LAO_DONG { loaiHopDong, soHopDong, nguoiKy, chucVu, nguoiDuocThue, batDauLamViec, ketThucHopDong, ngayKyHdTiepTheo, diaDiemLamViec, chucDanhChuyenMon, congViecDuocGiao, chiuSuPhanCong, ngach, maNgach, bac, heSo, ngayKyHopDong, phanTramHuong, ma, thoiGianLamViec, dungCuDuocCapPhat, phuongTienDiLaiLamViec, hinhThucTraLuong, cheDoNghiNgoi, boiThuongVatChat, ngayCapNhatHopDong, boMon, phanTramHuongId, ghiChu }
const keys = ['MA'];
const obj2Db = { 'loaiHopDong': 'LOAI_HOP_DONG', 'soHopDong': 'SO_HOP_DONG', 'nguoiKy': 'NGUOI_KY', 'chucVu': 'CHUC_VU', 'nguoiDuocThue': 'NGUOI_DUOC_THUE', 'batDauLamViec': 'BAT_DAU_LAM_VIEC', 'ketThucHopDong': 'KET_THUC_HOP_DONG', 'ngayKyHdTiepTheo': 'NGAY_KY_HD_TIEP_THEO', 'diaDiemLamViec': 'DIA_DIEM_LAM_VIEC', 'chucDanhChuyenMon': 'CHUC_DANH_CHUYEN_MON', 'congViecDuocGiao': 'CONG_VIEC_DUOC_GIAO', 'chiuSuPhanCong': 'CHIU_SU_PHAN_CONG', 'ngach': 'NGACH', 'maNgach': 'MA_NGACH', 'bac': 'BAC', 'heSo': 'HE_SO', 'ngayKyHopDong': 'NGAY_KY_HOP_DONG', 'phanTramHuong': 'PHAN_TRAM_HUONG', 'ma': 'MA', 'thoiGianLamViec': 'THOI_GIAN_LAM_VIEC', 'dungCuDuocCapPhat': 'DUNG_CU_DUOC_CAP_PHAT', 'phuongTienDiLaiLamViec': 'PHUONG_TIEN_DI_LAI_LAM_VIEC', 'hinhThucTraLuong': 'HINH_THUC_TRA_LUONG', 'cheDoNghiNgoi': 'CHE_DO_NGHI_NGOI', 'boiThuongVatChat': 'BOI_THUONG_VAT_CHAT', 'ngayCapNhatHopDong': 'NGAY_CAP_NHAT_HOP_DONG', 'boMon': 'BO_MON', 'phanTramHuongId': 'PHAN_TRAM_HUONG_ID', 'ghiChu': 'GHI_CHU' };

module.exports = app => {
    const db = 'main';
    const tableName = 'QT_HOP_DONG_LAO_DONG';
    const type = 'table';
    const schema = {
        LOAI_HOP_DONG: {
            type: 'NVARCHAR2',
            length: '2'
        },
        SO_HOP_DONG: {
            type: 'NVARCHAR2',
            length: '30'
        },
        NGUOI_KY: {
            type: 'NVARCHAR2',
            length: '10'
        },
        CHUC_VU: {
            type: 'NVARCHAR2',
            length: '10'
        },
        NGUOI_DUOC_THUE: {
            type: 'NVARCHAR2',
            length: '10'
        },
        BAT_DAU_LAM_VIEC: {
            type: 'NUMBER',
            length: '20,0'
        },
        KET_THUC_HOP_DONG: {
            type: 'NUMBER',
            length: '20,0'
        },
        NGAY_KY_HD_TIEP_THEO: {
            type: 'NUMBER',
            length: '20,0'
        },
        DIA_DIEM_LAM_VIEC: {
            type: 'NVARCHAR2',
            length: '5'
        },
        CHUC_DANH_CHUYEN_MON: {
            type: 'NVARCHAR2',
            length: '3'
        },
        CONG_VIEC_DUOC_GIAO: {
            type: 'NVARCHAR2',
            length: '200'
        },
        CHIU_SU_PHAN_CONG: {
            type: 'NVARCHAR2',
            length: '200'
        },
        NGACH: {
            type: 'NUMBER',
            length: '10,0'
        },
        MA_NGACH: {
            type: 'NVARCHAR2',
            length: '10'
        },
        BAC: {
            type: 'NVARCHAR2',
            length: '5'
        },
        HE_SO: {
            type: 'NUMBER',
            length: '10,2'
        },
        NGAY_KY_HOP_DONG: {
            type: 'NUMBER',
            length: '20,0'
        },
        PHAN_TRAM_HUONG: {
            type: 'NVARCHAR2',
            length: '200'
        },
        MA: {
            type: 'NUMBER',
            length: '22,0',
            autoIncrement: true,
            primaryKey: true
        },
        THOI_GIAN_LAM_VIEC: {
            type: 'NVARCHAR2',
            length: '200'
        },
        DUNG_CU_DUOC_CAP_PHAT: {
            type: 'NVARCHAR2',
            length: '200'
        },
        PHUONG_TIEN_DI_LAI_LAM_VIEC: {
            type: 'NVARCHAR2',
            length: '200'
        },
        HINH_THUC_TRA_LUONG: {
            type: 'NVARCHAR2',
            length: '200'
        },
        CHE_DO_NGHI_NGOI: {
            type: 'NVARCHAR2',
            length: '200'
        },
        BOI_THUONG_VAT_CHAT: {
            type: 'NVARCHAR2',
            length: '200'
        },
        NGAY_CAP_NHAT_HOP_DONG: {
            type: 'NUMBER',
            length: '20,0'
        },
        BO_MON: {
            type: 'NVARCHAR2',
            length: '10'
        },
        PHAN_TRAM_HUONG_ID: {
            type: 'NUMBER',
            length: '22,0'
        },
        GHI_CHU: {
            type: 'NVARCHAR2',
            length: '1000'
        }
    };
    const methods = {
        'searchPage': 'QT_HOP_DONG_LAO_DONG_SEARCH_PAGE',
        'download': 'QT_HOP_DONG_LAO_DONG_DOWNLOAD',
        'groupPage': 'QT_HOP_DONG_LAO_DONG_GROUP_PAGE',
        'downloadExcel': 'DOWNLOAD_EXCEL_QT_HOP_DONG_LAO_DONG',
        'getMaxShccByDonVi': 'QT_HOP_DONG_GET_MAX_SHCC_BY_DON_VI'
    };
    app.model.qtHopDongLaoDong = {
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
                const sql = 'INSERT INTO QT_HOP_DONG_LAO_DONG (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.qtHopDongLaoDong.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM QT_HOP_DONG_LAO_DONG' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM QT_HOP_DONG_LAO_DONG' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM QT_HOP_DONG_LAO_DONG' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT QT_HOP_DONG_LAO_DONG.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM QT_HOP_DONG_LAO_DONG' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE QT_HOP_DONG_LAO_DONG SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.qtHopDongLaoDong.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM QT_HOP_DONG_LAO_DONG' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM QT_HOP_DONG_LAO_DONG' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=qt_hop_dong_lao_dong_search_page(:pagenumber, :pagesize, :filter, :searchterm, :totalitem, :pagetotal); END;',
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

        download: (mahd, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=qt_hop_dong_lao_dong_download(:mahd); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, mahd }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
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
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=qt_hop_dong_lao_dong_group_page(:pagenumber, :pagesize, :filter, :searchterm, :totalitem, :pagetotal); END;',
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

        downloadExcel: (pagenumber, pagesize, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=download_excel_qt_hop_dong_lao_dong(:pagenumber, :pagesize, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getMaxShccByDonVi: (madonvi, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=qt_hop_dong_get_max_shcc_by_don_vi(:madonvi); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, madonvi }, (error, result) => {
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