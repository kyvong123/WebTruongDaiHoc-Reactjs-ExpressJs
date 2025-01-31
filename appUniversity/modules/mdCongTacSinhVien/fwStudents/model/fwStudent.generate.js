// Table name: FW_STUDENT { ho, ten, ngaySinh, gioiTinh, danToc, tonGiao, quocGia, thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha, lienLacMaTinh, lienLacMaHuyen, lienLacMaXa, lienLacSoNha, loaiSinhVien, tinhTrang, dienThoaiKhac, dienThoaiCaNhan, dienThoaiLienLac, emailCaNhan, emailTruong, tenCha, ngheNghiepCha, ngaySinhCha, tenMe, ngheNghiepMe, ngaySinhMe, loaiHinhDaoTao, maKhoa, khoa, maNganh, lop, sdtCha, sdtMe, hoTenNguoiLienLac, sdtNguoiLienLac, cmnd, cmndNoiCap, cmndNgayCap, namTuyenSinh, ngayNhapHoc, mssv, nienKhoa, maCtdt, bacDaoTao, noiSinhMaTinh, doiTuongTuyenSinh, khuVucTuyenSinh, ngayVaoDoan, ngayVaoDang, thuongTruSoNhaCha, thuongTruSoNhaMe, phuongThucTuyenSinh, doiTuongChinhSach, image, lastModified, canEdit, anhThe, diemThi, matKhau, nganhTrungTuyen, khoaSinhVien, namVao, soTkNh, chiNhanhNh, maNoiTru, maTamTru, totNghiepInfo, noiSinhQuocGia, khoaGiaoDich, tenNganHang, phongThuTuc, isTest, thuongTruMaTinhCha, thuongTruMaHuyenCha, thuongTruMaXaCha, thuongTruMaTinhMe, thuongTruMaHuyenMe, thuongTruMaXaMe, chuongTrinhDaoTao }
const keys = ['MSSV'];
const obj2Db = { 'ho': 'HO', 'ten': 'TEN', 'ngaySinh': 'NGAY_SINH', 'gioiTinh': 'GIOI_TINH', 'danToc': 'DAN_TOC', 'tonGiao': 'TON_GIAO', 'quocGia': 'QUOC_GIA', 'thuongTruMaTinh': 'THUONG_TRU_MA_TINH', 'thuongTruMaHuyen': 'THUONG_TRU_MA_HUYEN', 'thuongTruMaXa': 'THUONG_TRU_MA_XA', 'thuongTruSoNha': 'THUONG_TRU_SO_NHA', 'lienLacMaTinh': 'LIEN_LAC_MA_TINH', 'lienLacMaHuyen': 'LIEN_LAC_MA_HUYEN', 'lienLacMaXa': 'LIEN_LAC_MA_XA', 'lienLacSoNha': 'LIEN_LAC_SO_NHA', 'loaiSinhVien': 'LOAI_SINH_VIEN', 'tinhTrang': 'TINH_TRANG', 'dienThoaiKhac': 'DIEN_THOAI_KHAC', 'dienThoaiCaNhan': 'DIEN_THOAI_CA_NHAN', 'dienThoaiLienLac': 'DIEN_THOAI_LIEN_LAC', 'emailCaNhan': 'EMAIL_CA_NHAN', 'emailTruong': 'EMAIL_TRUONG', 'tenCha': 'TEN_CHA', 'ngheNghiepCha': 'NGHE_NGHIEP_CHA', 'ngaySinhCha': 'NGAY_SINH_CHA', 'tenMe': 'TEN_ME', 'ngheNghiepMe': 'NGHE_NGHIEP_ME', 'ngaySinhMe': 'NGAY_SINH_ME', 'loaiHinhDaoTao': 'LOAI_HINH_DAO_TAO', 'maKhoa': 'MA_KHOA', 'khoa': 'KHOA', 'maNganh': 'MA_NGANH', 'lop': 'LOP', 'sdtCha': 'SDT_CHA', 'sdtMe': 'SDT_ME', 'hoTenNguoiLienLac': 'HO_TEN_NGUOI_LIEN_LAC', 'sdtNguoiLienLac': 'SDT_NGUOI_LIEN_LAC', 'cmnd': 'CMND', 'cmndNoiCap': 'CMND_NOI_CAP', 'cmndNgayCap': 'CMND_NGAY_CAP', 'namTuyenSinh': 'NAM_TUYEN_SINH', 'ngayNhapHoc': 'NGAY_NHAP_HOC', 'mssv': 'MSSV', 'nienKhoa': 'NIEN_KHOA', 'maCtdt': 'MA_CTDT', 'bacDaoTao': 'BAC_DAO_TAO', 'noiSinhMaTinh': 'NOI_SINH_MA_TINH', 'doiTuongTuyenSinh': 'DOI_TUONG_TUYEN_SINH', 'khuVucTuyenSinh': 'KHU_VUC_TUYEN_SINH', 'ngayVaoDoan': 'NGAY_VAO_DOAN', 'ngayVaoDang': 'NGAY_VAO_DANG', 'thuongTruSoNhaCha': 'THUONG_TRU_SO_NHA_CHA', 'thuongTruSoNhaMe': 'THUONG_TRU_SO_NHA_ME', 'phuongThucTuyenSinh': 'PHUONG_THUC_TUYEN_SINH', 'doiTuongChinhSach': 'DOI_TUONG_CHINH_SACH', 'image': 'IMAGE', 'lastModified': 'LAST_MODIFIED', 'canEdit': 'CAN_EDIT', 'anhThe': 'ANH_THE', 'diemThi': 'DIEM_THI', 'matKhau': 'MAT_KHAU', 'nganhTrungTuyen': 'NGANH_TRUNG_TUYEN', 'khoaSinhVien': 'KHOA_SINH_VIEN', 'namVao': 'NAM_VAO', 'soTkNh': 'SO_TK_NH', 'chiNhanhNh': 'CHI_NHANH_NH', 'maNoiTru': 'MA_NOI_TRU', 'maTamTru': 'MA_TAM_TRU', 'totNghiepInfo': 'TOT_NGHIEP_INFO', 'noiSinhQuocGia': 'NOI_SINH_QUOC_GIA', 'khoaGiaoDich': 'KHOA_GIAO_DICH', 'tenNganHang': 'TEN_NGAN_HANG', 'phongThuTuc': 'PHONG_THU_TUC', 'isTest': 'IS_TEST', 'thuongTruMaTinhCha': 'THUONG_TRU_MA_TINH_CHA', 'thuongTruMaHuyenCha': 'THUONG_TRU_MA_HUYEN_CHA', 'thuongTruMaXaCha': 'THUONG_TRU_MA_XA_CHA', 'thuongTruMaTinhMe': 'THUONG_TRU_MA_TINH_ME', 'thuongTruMaHuyenMe': 'THUONG_TRU_MA_HUYEN_ME', 'thuongTruMaXaMe': 'THUONG_TRU_MA_XA_ME', 'chuongTrinhDaoTao': 'CHUONG_TRINH_DAO_TAO' };

module.exports = app => {
    const db = 'main';
    const tableName = 'FW_STUDENT';
    const type = 'table';
    const schema = {
        HO: {
            type: 'NVARCHAR2',
            length: '100'
        },
        TEN: {
            type: 'NVARCHAR2',
            length: '30'
        },
        NGAY_SINH: {
            type: 'NUMBER',
            length: '20,0'
        },
        GIOI_TINH: {
            type: 'NUMBER',
            length: '1,0'
        },
        DAN_TOC: {
            type: 'NVARCHAR2',
            length: '2'
        },
        TON_GIAO: {
            type: 'NVARCHAR2',
            length: '2'
        },
        QUOC_GIA: {
            type: 'NVARCHAR2',
            length: '2'
        },
        THUONG_TRU_MA_TINH: {
            type: 'NVARCHAR2',
            length: '3'
        },
        THUONG_TRU_MA_HUYEN: {
            type: 'NVARCHAR2',
            length: '3'
        },
        THUONG_TRU_MA_XA: {
            type: 'NVARCHAR2',
            length: '10'
        },
        THUONG_TRU_SO_NHA: {
            type: 'NVARCHAR2',
            length: '1000'
        },
        LIEN_LAC_MA_TINH: {
            type: 'NVARCHAR2',
            length: '3'
        },
        LIEN_LAC_MA_HUYEN: {
            type: 'NVARCHAR2',
            length: '3'
        },
        LIEN_LAC_MA_XA: {
            type: 'NVARCHAR2',
            length: '10'
        },
        LIEN_LAC_SO_NHA: {
            type: 'NVARCHAR2',
            length: '100'
        },
        LOAI_SINH_VIEN: {
            type: 'NVARCHAR2',
            length: '5'
        },
        TINH_TRANG: {
            type: 'NUMBER',
            length: '22,0'
        },
        DIEN_THOAI_KHAC: {
            type: 'NVARCHAR2',
            length: '15'
        },
        DIEN_THOAI_CA_NHAN: {
            type: 'NVARCHAR2',
            length: '15'
        },
        DIEN_THOAI_LIEN_LAC: {
            type: 'NVARCHAR2',
            length: '15'
        },
        EMAIL_CA_NHAN: {
            type: 'NVARCHAR2',
            length: '50'
        },
        EMAIL_TRUONG: {
            type: 'NVARCHAR2',
            length: '50'
        },
        TEN_CHA: {
            type: 'NVARCHAR2',
            length: '150'
        },
        NGHE_NGHIEP_CHA: {
            type: 'NVARCHAR2',
            length: '150'
        },
        NGAY_SINH_CHA: {
            type: 'NUMBER',
            length: '20,0'
        },
        TEN_ME: {
            type: 'NVARCHAR2',
            length: '150'
        },
        NGHE_NGHIEP_ME: {
            type: 'NVARCHAR2',
            length: '150'
        },
        NGAY_SINH_ME: {
            type: 'NUMBER',
            length: '20,0'
        },
        LOAI_HINH_DAO_TAO: {
            type: 'NVARCHAR2',
            length: '10'
        },
        MA_KHOA: {
            type: 'NVARCHAR2',
            length: '15'
        },
        KHOA: {
            type: 'NVARCHAR2',
            length: '10'
        },
        MA_NGANH: {
            type: 'NVARCHAR2',
            length: '20'
        },
        LOP: {
            type: 'NVARCHAR2',
            length: '20'
        },
        SDT_CHA: {
            type: 'NVARCHAR2',
            length: '15'
        },
        SDT_ME: {
            type: 'NVARCHAR2',
            length: '15'
        },
        HO_TEN_NGUOI_LIEN_LAC: {
            type: 'NVARCHAR2',
            length: '100'
        },
        SDT_NGUOI_LIEN_LAC: {
            type: 'NVARCHAR2',
            length: '15'
        },
        CMND: {
            type: 'NVARCHAR2',
            length: '20'
        },
        CMND_NOI_CAP: {
            type: 'NVARCHAR2',
            length: '100'
        },
        CMND_NGAY_CAP: {
            type: 'NUMBER',
            length: '20,0'
        },
        NAM_TUYEN_SINH: {
            type: 'NUMBER',
            length: '4,0'
        },
        NGAY_NHAP_HOC: {
            type: 'NUMBER',
            length: '20,0'
        },
        MSSV: {
            type: 'NVARCHAR2',
            length: '20',
            primaryKey: true
        },
        NIEN_KHOA: {
            type: 'NVARCHAR2',
            length: '10'
        },
        MA_CTDT: {
            type: 'NVARCHAR2',
            length: '50'
        },
        BAC_DAO_TAO: {
            type: 'NVARCHAR2',
            length: '5'
        },
        NOI_SINH_MA_TINH: {
            type: 'NVARCHAR2',
            length: '2'
        },
        DOI_TUONG_TUYEN_SINH: {
            type: 'NVARCHAR2',
            length: '2'
        },
        KHU_VUC_TUYEN_SINH: {
            type: 'NVARCHAR2',
            length: '7'
        },
        NGAY_VAO_DOAN: {
            type: 'NUMBER',
            length: '20,0'
        },
        NGAY_VAO_DANG: {
            type: 'NUMBER',
            length: '20,0'
        },
        THUONG_TRU_SO_NHA_CHA: {
            type: 'NVARCHAR2',
            length: '200'
        },
        THUONG_TRU_SO_NHA_ME: {
            type: 'NVARCHAR2',
            length: '200'
        },
        PHUONG_THUC_TUYEN_SINH: {
            type: 'NVARCHAR2',
            length: '10'
        },
        DOI_TUONG_CHINH_SACH: {
            type: 'NVARCHAR2',
            length: '500'
        },
        IMAGE: {
            type: 'NVARCHAR2',
            length: '500'
        },
        LAST_MODIFIED: {
            type: 'NUMBER',
            length: '20,0'
        },
        CAN_EDIT: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        ANH_THE: {
            type: 'NVARCHAR2',
            length: '20'
        },
        DIEM_THI: {
            type: 'NUMBER',
            length: '22,2'
        },
        MAT_KHAU: {
            type: 'NVARCHAR2',
            length: '100'
        },
        NGANH_TRUNG_TUYEN: {
            type: 'NUMBER',
            length: '22,0'
        },
        KHOA_SINH_VIEN: {
            type: 'NUMBER',
            length: '4,0'
        },
        NAM_VAO: {
            type: 'NUMBER',
            length: '4,0'
        },
        SO_TK_NH: {
            type: 'NVARCHAR2',
            length: '50'
        },
        CHI_NHANH_NH: {
            type: 'NVARCHAR2',
            length: '200'
        },
        MA_NOI_TRU: {
            type: 'NUMBER',
            length: '22,0'
        },
        MA_TAM_TRU: {
            type: 'NUMBER',
            length: '22,0'
        },
        TOT_NGHIEP_INFO: {
            type: 'NUMBER',
            length: '22,0'
        },
        NOI_SINH_QUOC_GIA: {
            type: 'NVARCHAR2',
            length: '2'
        },
        KHOA_GIAO_DICH: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '1'
        },
        TEN_NGAN_HANG: {
            type: 'NVARCHAR2',
            length: '100'
        },
        PHONG_THU_TUC: {
            type: 'NVARCHAR2',
            length: '5'
        },
        IS_TEST: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        THUONG_TRU_MA_TINH_CHA: {
            type: 'NVARCHAR2',
            length: '3'
        },
        THUONG_TRU_MA_HUYEN_CHA: {
            type: 'NVARCHAR2',
            length: '3'
        },
        THUONG_TRU_MA_XA_CHA: {
            type: 'NVARCHAR2',
            length: '5'
        },
        THUONG_TRU_MA_TINH_ME: {
            type: 'NVARCHAR2',
            length: '3'
        },
        THUONG_TRU_MA_HUYEN_ME: {
            type: 'NVARCHAR2',
            length: '3'
        },
        THUONG_TRU_MA_XA_ME: {
            type: 'NVARCHAR2',
            length: '5'
        },
        CHUONG_TRINH_DAO_TAO: {
            type: 'NVARCHAR2',
            length: '50'
        }
    };
    const methods = {
        'searchPage': 'FW_STUDENT_SEARCH_PAGE',
        'searchAll': 'FW_STUDENT_SEARCH_ALL',
        'getData': 'FW_STUDENT_GET_DATA',
        'getNamTuyenSinhList': 'FW_STUDENT_GET_NAM_TUYEN_SINH_LIST',
        'downloadExcel': 'FW_STUDENT_DOWNLOAD_EXCEL',
        'getDataForm': 'FW_STUDENT_GET_PARAMATER',
        'getDanhSachSinhVienHocPhan': 'DT_HOC_PHAN_STUDENT_LIST',
        'getSvCtdt': 'FW_STUDENT_GET_SV_CTDT',
        'getEmailSvAll': 'FW_SELECT_SINH_VIEN_ALL'
    };
    app.model.fwStudent = {
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
                const sql = 'INSERT INTO FW_STUDENT (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.fwStudent.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM FW_STUDENT' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM FW_STUDENT' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM FW_STUDENT' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT FW_STUDENT.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM FW_STUDENT' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE FW_STUDENT SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.fwStudent.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM FW_STUDENT' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM FW_STUDENT' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=fw_student_search_page(:pagenumber, :pagesize, :searchterm, :filter, :sortkey, :sortmode, :totalitem, :pagetotal); END;',
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

        searchAll: (searchterm, filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=fw_student_search_all(:searchterm, :filter); END;',
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

        getData: (imssv, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=fw_student_get_data(:imssv); END;',
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

        getNamTuyenSinhList: (done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=fw_student_get_nam_tuyen_sinh_list(); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
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
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=fw_student_download_excel(:searchterm, :filter); END;',
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

        getDataForm: (imssv, iform, kieuform, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=fw_student_get_paramater(:imssv, :iform, :kieuform); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, imssv, iform, kieuform }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getDanhSachSinhVienHocPhan: (pagenumber, pagesize, searchterm, filter, sortkey, sortmode, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_hoc_phan_student_list(:pagenumber, :pagesize, :searchterm, :filter, :sortkey, :sortmode, :totalitem, :pagetotal); END;',
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

        getSvCtdt: (idkdt, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=fw_student_get_sv_ctdt(:idkdt); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, idkdt }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getEmailSvAll: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=fw_select_sinh_vien_all(:filter); END;',
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