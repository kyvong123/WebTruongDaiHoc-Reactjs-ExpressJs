// Table name: TCHC_CAN_BO { ten, ho, phai, dienThoaiCaNhan, email, ngaySinh, ngayBatDauCongTac, ngayCbgd, ngayBienChe, ngayNghi, ngach, heSoLuong, bacLuong, mocNangLuong, ngayHuongLuong, tyLeVuotKhung, maChucVu, danToc, tonGiao, dangVien, maDonVi, phucLoi, nhaGiaoNhanDan, nhaGiaoUuTu, ghiChu, shcc, emailCaNhan, biDanh, dienThoaiBaoTin, ngheNghiepCu, cmnd, cmndNgayCap, cmndNoiCap, chucVuKhac, quocGia, chucDanh, trinhDoPhoThong, hocVi, chuyenNganh, sucKhoe, canNang, chieuCao, ngayNhapNgu, ngayXuatNgu, quanHamCaoNhat, hangThuongBinh, giaDinhChinhSach, danhHieu, maXaNoiSinh, maHuyenNoiSinh, maTinhNoiSinh, maXaNguyenQuan, maHuyenNguyenQuan, maTinhNguyenQuan, ngayVaoDang, ngayVaoDangChinhThuc, noiDangDb, noiDangCt, ngayVaoDoan, noiVaoDoan, soTheDang, soTruong, nhomMau, soBhxh, doanVien, namChucDanh, namHocVi, noiSinh, queQuan, thuongTruMaHuyen, thuongTruMaTinh, thuongTruMaXa, thuongTruSoNha, hienTaiMaHuyen, hienTaiMaTinh, hienTaiMaXa, hienTaiSoNha, userModified, lastModified, congDoan, ngayVaoCongDoan, maTheBhyt, noiKhamChuaBenhBanDau, quyenLoiKhamChuaBenh, doiTuongBoiDuongKienThucQpan, ngayBatDauBhxh, ngayKetThucBhxh, tuNhanXet, tinhTrangBoiDuong, namBoiDuong, khoaBoiDuong, trinhDoChuyenMon, namTotNghiep, tyLePhuCapThamNien, tyLePhuCapUuDai, loaiDoiTuongBoiDuong, cuNhan, thacSi, tienSi, chuyenNganhChucDanh, coSoChucDanh, donViTuyenDung, noiVaoCongDoan, isCvdt, isHdtn, hocViNoiTotNghiep, mocBacLuongCuoiCung, noiSinhNuocNgoai, lastLogin, isTest, tinhTrangCongViec, loaiCanBo, soTaiKhoan, nganHang, maSoThue, modifyingBy }
const keys = ['SHCC'];
const obj2Db = { 'ten': 'TEN', 'ho': 'HO', 'phai': 'PHAI', 'dienThoaiCaNhan': 'DIEN_THOAI_CA_NHAN', 'email': 'EMAIL', 'ngaySinh': 'NGAY_SINH', 'ngayBatDauCongTac': 'NGAY_BAT_DAU_CONG_TAC', 'ngayCbgd': 'NGAY_CBGD', 'ngayBienChe': 'NGAY_BIEN_CHE', 'ngayNghi': 'NGAY_NGHI', 'ngach': 'NGACH', 'heSoLuong': 'HE_SO_LUONG', 'bacLuong': 'BAC_LUONG', 'mocNangLuong': 'MOC_NANG_LUONG', 'ngayHuongLuong': 'NGAY_HUONG_LUONG', 'tyLeVuotKhung': 'TY_LE_VUOT_KHUNG', 'maChucVu': 'MA_CHUC_VU', 'danToc': 'DAN_TOC', 'tonGiao': 'TON_GIAO', 'dangVien': 'DANG_VIEN', 'maDonVi': 'MA_DON_VI', 'phucLoi': 'PHUC_LOI', 'nhaGiaoNhanDan': 'NHA_GIAO_NHAN_DAN', 'nhaGiaoUuTu': 'NHA_GIAO_UU_TU', 'ghiChu': 'GHI_CHU', 'shcc': 'SHCC', 'emailCaNhan': 'EMAIL_CA_NHAN', 'biDanh': 'BI_DANH', 'dienThoaiBaoTin': 'DIEN_THOAI_BAO_TIN', 'ngheNghiepCu': 'NGHE_NGHIEP_CU', 'cmnd': 'CMND', 'cmndNgayCap': 'CMND_NGAY_CAP', 'cmndNoiCap': 'CMND_NOI_CAP', 'chucVuKhac': 'CHUC_VU_KHAC', 'quocGia': 'QUOC_GIA', 'chucDanh': 'CHUC_DANH', 'trinhDoPhoThong': 'TRINH_DO_PHO_THONG', 'hocVi': 'HOC_VI', 'chuyenNganh': 'CHUYEN_NGANH', 'sucKhoe': 'SUC_KHOE', 'canNang': 'CAN_NANG', 'chieuCao': 'CHIEU_CAO', 'ngayNhapNgu': 'NGAY_NHAP_NGU', 'ngayXuatNgu': 'NGAY_XUAT_NGU', 'quanHamCaoNhat': 'QUAN_HAM_CAO_NHAT', 'hangThuongBinh': 'HANG_THUONG_BINH', 'giaDinhChinhSach': 'GIA_DINH_CHINH_SACH', 'danhHieu': 'DANH_HIEU', 'maXaNoiSinh': 'MA_XA_NOI_SINH', 'maHuyenNoiSinh': 'MA_HUYEN_NOI_SINH', 'maTinhNoiSinh': 'MA_TINH_NOI_SINH', 'maXaNguyenQuan': 'MA_XA_NGUYEN_QUAN', 'maHuyenNguyenQuan': 'MA_HUYEN_NGUYEN_QUAN', 'maTinhNguyenQuan': 'MA_TINH_NGUYEN_QUAN', 'ngayVaoDang': 'NGAY_VAO_DANG', 'ngayVaoDangChinhThuc': 'NGAY_VAO_DANG_CHINH_THUC', 'noiDangDb': 'NOI_DANG_DB', 'noiDangCt': 'NOI_DANG_CT', 'ngayVaoDoan': 'NGAY_VAO_DOAN', 'noiVaoDoan': 'NOI_VAO_DOAN', 'soTheDang': 'SO_THE_DANG', 'soTruong': 'SO_TRUONG', 'nhomMau': 'NHOM_MAU', 'soBhxh': 'SO_BHXH', 'doanVien': 'DOAN_VIEN', 'namChucDanh': 'NAM_CHUC_DANH', 'namHocVi': 'NAM_HOC_VI', 'noiSinh': 'NOI_SINH', 'queQuan': 'QUE_QUAN', 'thuongTruMaHuyen': 'THUONG_TRU_MA_HUYEN', 'thuongTruMaTinh': 'THUONG_TRU_MA_TINH', 'thuongTruMaXa': 'THUONG_TRU_MA_XA', 'thuongTruSoNha': 'THUONG_TRU_SO_NHA', 'hienTaiMaHuyen': 'HIEN_TAI_MA_HUYEN', 'hienTaiMaTinh': 'HIEN_TAI_MA_TINH', 'hienTaiMaXa': 'HIEN_TAI_MA_XA', 'hienTaiSoNha': 'HIEN_TAI_SO_NHA', 'userModified': 'USER_MODIFIED', 'lastModified': 'LAST_MODIFIED', 'congDoan': 'CONG_DOAN', 'ngayVaoCongDoan': 'NGAY_VAO_CONG_DOAN', 'maTheBhyt': 'MA_THE_BHYT', 'noiKhamChuaBenhBanDau': 'NOI_KHAM_CHUA_BENH_BAN_DAU', 'quyenLoiKhamChuaBenh': 'QUYEN_LOI_KHAM_CHUA_BENH', 'doiTuongBoiDuongKienThucQpan': 'DOI_TUONG_BOI_DUONG_KIEN_THUC_QPAN', 'ngayBatDauBhxh': 'NGAY_BAT_DAU_BHXH', 'ngayKetThucBhxh': 'NGAY_KET_THUC_BHXH', 'tuNhanXet': 'TU_NHAN_XET', 'tinhTrangBoiDuong': 'TINH_TRANG_BOI_DUONG', 'namBoiDuong': 'NAM_BOI_DUONG', 'khoaBoiDuong': 'KHOA_BOI_DUONG', 'trinhDoChuyenMon': 'TRINH_DO_CHUYEN_MON', 'namTotNghiep': 'NAM_TOT_NGHIEP', 'tyLePhuCapThamNien': 'TY_LE_PHU_CAP_THAM_NIEN', 'tyLePhuCapUuDai': 'TY_LE_PHU_CAP_UU_DAI', 'loaiDoiTuongBoiDuong': 'LOAI_DOI_TUONG_BOI_DUONG', 'cuNhan': 'CU_NHAN', 'thacSi': 'THAC_SI', 'tienSi': 'TIEN_SI', 'chuyenNganhChucDanh': 'CHUYEN_NGANH_CHUC_DANH', 'coSoChucDanh': 'CO_SO_CHUC_DANH', 'donViTuyenDung': 'DON_VI_TUYEN_DUNG', 'noiVaoCongDoan': 'NOI_VAO_CONG_DOAN', 'isCvdt': 'IS_CVDT', 'isHdtn': 'IS_HDTN', 'hocViNoiTotNghiep': 'HOC_VI_NOI_TOT_NGHIEP', 'mocBacLuongCuoiCung': 'MOC_BAC_LUONG_CUOI_CUNG', 'noiSinhNuocNgoai': 'NOI_SINH_NUOC_NGOAI', 'lastLogin': 'LAST_LOGIN', 'isTest': 'IS_TEST', 'tinhTrangCongViec': 'TINH_TRANG_CONG_VIEC', 'loaiCanBo': 'LOAI_CAN_BO', 'soTaiKhoan': 'SO_TAI_KHOAN', 'nganHang': 'NGAN_HANG', 'maSoThue': 'MA_SO_THUE', 'modifyingBy': 'MODIFYING_BY' };

module.exports = app => {
    const db = 'main';
    const tableName = 'TCHC_CAN_BO';
    const type = 'table';
    const schema = {
        TEN: {
            type: 'NVARCHAR2',
            length: '30'
        },
        HO: {
            type: 'NVARCHAR2',
            length: '100'
        },
        PHAI: {
            type: 'NVARCHAR2',
            length: '2'
        },
        DIEN_THOAI_CA_NHAN: {
            type: 'NVARCHAR2',
            length: '15'
        },
        EMAIL: {
            type: 'NVARCHAR2',
            length: '100'
        },
        NGAY_SINH: {
            type: 'NUMBER',
            length: '20,0'
        },
        NGAY_BAT_DAU_CONG_TAC: {
            type: 'NUMBER',
            length: '20,0'
        },
        NGAY_CBGD: {
            type: 'NUMBER',
            length: '20,0'
        },
        NGAY_BIEN_CHE: {
            type: 'NUMBER',
            length: '20,0'
        },
        NGAY_NGHI: {
            type: 'NUMBER',
            length: '20,0'
        },
        NGACH: {
            type: 'NVARCHAR2',
            length: '10'
        },
        HE_SO_LUONG: {
            type: 'NUMBER',
            length: '10,2'
        },
        BAC_LUONG: {
            type: 'NVARCHAR2',
            length: '5'
        },
        MOC_NANG_LUONG: {
            type: 'NUMBER',
            length: '20,0'
        },
        NGAY_HUONG_LUONG: {
            type: 'NUMBER',
            length: '20,0'
        },
        TY_LE_VUOT_KHUNG: {
            type: 'NUMBER',
            length: '5,0'
        },
        MA_CHUC_VU: {
            type: 'NVARCHAR2',
            length: '3'
        },
        DAN_TOC: {
            type: 'NVARCHAR2',
            length: '2'
        },
        TON_GIAO: {
            type: 'NVARCHAR2',
            length: '2'
        },
        DANG_VIEN: {
            type: 'NUMBER',
            length: '1,0'
        },
        MA_DON_VI: {
            type: 'NVARCHAR2',
            length: '20'
        },
        PHUC_LOI: {
            type: 'NVARCHAR2',
            length: '200'
        },
        NHA_GIAO_NHAN_DAN: {
            type: 'NUMBER',
            length: '4,0'
        },
        NHA_GIAO_UU_TU: {
            type: 'NUMBER',
            length: '4,0'
        },
        GHI_CHU: {
            type: 'NVARCHAR2',
            length: '1000'
        },
        SHCC: {
            type: 'NVARCHAR2',
            length: '20',
            primaryKey: true
        },
        EMAIL_CA_NHAN: {
            type: 'NVARCHAR2',
            length: '100'
        },
        BI_DANH: {
            type: 'NVARCHAR2',
            length: '20'
        },
        DIEN_THOAI_BAO_TIN: {
            type: 'NVARCHAR2',
            length: '20'
        },
        NGHE_NGHIEP_CU: {
            type: 'NVARCHAR2',
            length: '100'
        },
        CMND: {
            type: 'NVARCHAR2',
            length: '20'
        },
        CMND_NGAY_CAP: {
            type: 'NUMBER',
            length: '20,0'
        },
        CMND_NOI_CAP: {
            type: 'NVARCHAR2',
            length: '200'
        },
        CHUC_VU_KHAC: {
            type: 'NVARCHAR2',
            length: '200'
        },
        QUOC_GIA: {
            type: 'NVARCHAR2',
            length: '2'
        },
        CHUC_DANH: {
            type: 'NVARCHAR2',
            length: '100'
        },
        TRINH_DO_PHO_THONG: {
            type: 'NVARCHAR2',
            length: '50'
        },
        HOC_VI: {
            type: 'NVARCHAR2',
            length: '3'
        },
        CHUYEN_NGANH: {
            type: 'NVARCHAR2',
            length: '100'
        },
        SUC_KHOE: {
            type: 'NVARCHAR2',
            length: '50'
        },
        CAN_NANG: {
            type: 'NUMBER',
            length: '22,0'
        },
        CHIEU_CAO: {
            type: 'NUMBER',
            length: '22,0'
        },
        NGAY_NHAP_NGU: {
            type: 'NUMBER',
            length: '20,0'
        },
        NGAY_XUAT_NGU: {
            type: 'NUMBER',
            length: '20,0'
        },
        QUAN_HAM_CAO_NHAT: {
            type: 'NVARCHAR2',
            length: '20'
        },
        HANG_THUONG_BINH: {
            type: 'NVARCHAR2',
            length: '20'
        },
        GIA_DINH_CHINH_SACH: {
            type: 'NVARCHAR2',
            length: '100'
        },
        DANH_HIEU: {
            type: 'NVARCHAR2',
            length: '200'
        },
        MA_XA_NOI_SINH: {
            type: 'NVARCHAR2',
            length: '5'
        },
        MA_HUYEN_NOI_SINH: {
            type: 'NVARCHAR2',
            length: '3'
        },
        MA_TINH_NOI_SINH: {
            type: 'NVARCHAR2',
            length: '3'
        },
        MA_XA_NGUYEN_QUAN: {
            type: 'NVARCHAR2',
            length: '5'
        },
        MA_HUYEN_NGUYEN_QUAN: {
            type: 'NVARCHAR2',
            length: '3'
        },
        MA_TINH_NGUYEN_QUAN: {
            type: 'NVARCHAR2',
            length: '3'
        },
        NGAY_VAO_DANG: {
            type: 'NUMBER',
            length: '20,0'
        },
        NGAY_VAO_DANG_CHINH_THUC: {
            type: 'NUMBER',
            length: '20,0'
        },
        NOI_DANG_DB: {
            type: 'NVARCHAR2',
            length: '200'
        },
        NOI_DANG_CT: {
            type: 'NVARCHAR2',
            length: '200'
        },
        NGAY_VAO_DOAN: {
            type: 'NUMBER',
            length: '20,0'
        },
        NOI_VAO_DOAN: {
            type: 'NVARCHAR2',
            length: '200'
        },
        SO_THE_DANG: {
            type: 'NVARCHAR2',
            length: '20'
        },
        SO_TRUONG: {
            type: 'NVARCHAR2',
            length: '200'
        },
        NHOM_MAU: {
            type: 'NVARCHAR2',
            length: '10'
        },
        SO_BHXH: {
            type: 'NVARCHAR2',
            length: '20'
        },
        DOAN_VIEN: {
            type: 'NUMBER',
            length: '1,0'
        },
        NAM_CHUC_DANH: {
            type: 'NUMBER',
            length: '20,0'
        },
        NAM_HOC_VI: {
            type: 'NUMBER',
            length: '20,0'
        },
        NOI_SINH: {
            type: 'NVARCHAR2',
            length: '200'
        },
        QUE_QUAN: {
            type: 'NVARCHAR2',
            length: '200'
        },
        THUONG_TRU_MA_HUYEN: {
            type: 'NVARCHAR2',
            length: '10'
        },
        THUONG_TRU_MA_TINH: {
            type: 'NVARCHAR2',
            length: '10'
        },
        THUONG_TRU_MA_XA: {
            type: 'NVARCHAR2',
            length: '10'
        },
        THUONG_TRU_SO_NHA: {
            type: 'NVARCHAR2',
            length: '200'
        },
        HIEN_TAI_MA_HUYEN: {
            type: 'NVARCHAR2',
            length: '10'
        },
        HIEN_TAI_MA_TINH: {
            type: 'NVARCHAR2',
            length: '10'
        },
        HIEN_TAI_MA_XA: {
            type: 'NVARCHAR2',
            length: '10'
        },
        HIEN_TAI_SO_NHA: {
            type: 'NVARCHAR2',
            length: '200'
        },
        USER_MODIFIED: {
            type: 'NVARCHAR2',
            length: '50'
        },
        LAST_MODIFIED: {
            type: 'NUMBER',
            length: '20,0'
        },
        CONG_DOAN: {
            type: 'NUMBER',
            length: '1,0'
        },
        NGAY_VAO_CONG_DOAN: {
            type: 'NUMBER',
            length: '20,0'
        },
        MA_THE_BHYT: {
            type: 'NVARCHAR2',
            length: '20'
        },
        NOI_KHAM_CHUA_BENH_BAN_DAU: {
            type: 'NVARCHAR2',
            length: '5'
        },
        QUYEN_LOI_KHAM_CHUA_BENH: {
            type: 'NUMBER',
            length: '3,0'
        },
        DOI_TUONG_BOI_DUONG_KIEN_THUC_QPAN: {
            type: 'NUMBER',
            length: '1,0'
        },
        NGAY_BAT_DAU_BHXH: {
            type: 'NUMBER',
            length: '20,0'
        },
        NGAY_KET_THUC_BHXH: {
            type: 'NUMBER',
            length: '20,0'
        },
        TU_NHAN_XET: {
            type: 'NVARCHAR2',
            length: '200'
        },
        TINH_TRANG_BOI_DUONG: {
            type: 'NUMBER',
            length: '1,0'
        },
        NAM_BOI_DUONG: {
            type: 'NUMBER',
            length: '20,0'
        },
        KHOA_BOI_DUONG: {
            type: 'NVARCHAR2',
            length: '20'
        },
        TRINH_DO_CHUYEN_MON: {
            type: 'NVARCHAR2',
            length: '2'
        },
        NAM_TOT_NGHIEP: {
            type: 'NUMBER',
            length: '4,0'
        },
        TY_LE_PHU_CAP_THAM_NIEN: {
            type: 'NUMBER',
            length: '5,0'
        },
        TY_LE_PHU_CAP_UU_DAI: {
            type: 'NVARCHAR2',
            length: '5'
        },
        LOAI_DOI_TUONG_BOI_DUONG: {
            type: 'NUMBER',
            length: '10,0'
        },
        CU_NHAN: {
            type: 'NUMBER',
            length: '1,0'
        },
        THAC_SI: {
            type: 'NUMBER',
            length: '1,0'
        },
        TIEN_SI: {
            type: 'NUMBER',
            length: '1,0'
        },
        CHUYEN_NGANH_CHUC_DANH: {
            type: 'NVARCHAR2',
            length: '100'
        },
        CO_SO_CHUC_DANH: {
            type: 'NVARCHAR2',
            length: '200'
        },
        DON_VI_TUYEN_DUNG: {
            type: 'NVARCHAR2',
            length: '100'
        },
        NOI_VAO_CONG_DOAN: {
            type: 'NVARCHAR2',
            length: '200'
        },
        IS_CVDT: {
            type: 'NUMBER',
            length: '1,0'
        },
        IS_HDTN: {
            type: 'NUMBER',
            length: '1,0'
        },
        HOC_VI_NOI_TOT_NGHIEP: {
            type: 'NVARCHAR2',
            length: '100'
        },
        MOC_BAC_LUONG_CUOI_CUNG: {
            type: 'NUMBER',
            length: '20,0'
        },
        NOI_SINH_NUOC_NGOAI: {
            type: 'NVARCHAR2',
            length: '5'
        },
        LAST_LOGIN: {
            type: 'NUMBER',
            length: '20,0'
        },
        IS_TEST: {
            type: 'NUMBER',
            length: '1,0'
        },
        TINH_TRANG_CONG_VIEC: {
            type: 'NVARCHAR2',
            length: '200'
        },
        LOAI_CAN_BO: {
            type: 'NVARCHAR2',
            length: '10'
        },
        SO_TAI_KHOAN: {
            type: 'NVARCHAR2',
            length: '200'
        },
        NGAN_HANG: {
            type: 'NVARCHAR2',
            length: '50'
        },
        MA_SO_THUE: {
            type: 'NVARCHAR2',
            length: '100'
        },
        MODIFYING_BY: {
            type: 'NVARCHAR2',
            length: '100'
        }
    };
    const methods = {
        'thongTinGetByShcc': 'TCCB_CAN_BO_THONG_TIN_GET_BY_SHCC',
        'getStaffByMscb': 'TCCB_STAFF_GET_DATA_BY_MSCB',
        'thongTinDownload': 'TCCB_CAN_BO_THONG_TIN_DOWNLOAD_EXCEL',
        'thongTinSearchPage': 'TCCB_CAN_BO_THONG_TIN_SEARCH_PAGE',
        'searchPage': 'TCCB_CAN_BO_SEARCH_PAGE',
        'searchPageByDanhBaDonVi': 'TCCB_CAN_BO_SEARCH_PAGE_BY_DANH_BA_DON_VI',
        'searchPageByDonVi': 'TCCB_CAN_BO_SEARCH_PAGE_BY_DON_VI',
        'searchPageByChuDe': 'TCCB_CAN_BO_SEARCH_PAGE_BY_CHU_DE',
        'download': 'TCCB_CAN_BO_DOWNLOAD_EXCEL',
        'getGiangVien': 'TCHC_CAN_BO_GET_GIANG_VIEN',
        'getLyLich': 'TCHC_CAN_BO_GET_DATA_ALL',
        'getDashboardData': 'TCCB_DASHBOARD_GET_DATA',
        'canBoHdSearchPage': 'CAN_BO_HUONG_DAN_SEARCH_PAGE',
        'getTruongKhoa': 'TCCB_CAN_BO_GET_TRUONG_KHOA',
        'thongTinTaiChinhSearchPage': 'TCCB_THONG_TIN_TAI_CHINH_SEARCH_PAGE',
        'thongTinTaiChinhDownloadExcel': 'TCCB_THONG_TIN_TAI_CHINH_DOWNLOAD_EXCEL'
    };
    app.model.tchcCanBo = {
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
                const sql = 'INSERT INTO TCHC_CAN_BO (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.tchcCanBo.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM TCHC_CAN_BO' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM TCHC_CAN_BO' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM TCHC_CAN_BO' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT TCHC_CAN_BO.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM TCHC_CAN_BO' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE TCHC_CAN_BO SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.tchcCanBo.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM TCHC_CAN_BO' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM TCHC_CAN_BO' + (condition.statement ? ' WHERE ' + condition.statement : '');
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

        thongTinGetByShcc: (isshcc, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tccb_can_bo_thong_tin_get_by_shcc(:isshcc); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, isshcc }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getStaffByMscb: (mscb, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tccb_staff_get_data_by_mscb(:mscb); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, mscb }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        thongTinDownload: (filter, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tccb_can_bo_thong_tin_download_excel(:filter, :searchterm, :canbodonvilist, :canbongoaitruonglist, :qtnghivieclist); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter, searchterm, canbodonvilist: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, canbongoaitruonglist: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, qtnghivieclist: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        thongTinSearchPage: (pagenumber, pagesize, filter, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tccb_can_bo_thong_tin_search_page(:pagenumber, :pagesize, :filter, :searchterm, :totalitem, :pagetotal); END;',
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

        searchPage: (pagenumber, pagesize, filter, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tccb_can_bo_search_page(:pagenumber, :pagesize, :filter, :searchterm, :totalitem, :pagetotal); END;',
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

        searchPageByDanhBaDonVi: (pagenumber, pagesize, filter, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tccb_can_bo_search_page_by_danh_ba_don_vi(:pagenumber, :pagesize, :filter, :searchterm, :totalitem, :pagetotal); END;',
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

        searchPageByDonVi: (pagenumber, pagesize, filter, searchterm, madonvi, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tccb_can_bo_search_page_by_don_vi(:pagenumber, :pagesize, :filter, :searchterm, :madonvi, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, filter, searchterm, madonvi, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        download: (filter, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tccb_can_bo_download_excel(:filter, :searchterm); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter, searchterm }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getGiangVien: (searchterm, filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tchc_can_bo_get_giang_vien(:searchterm, :filter); END;',
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

        getLyLich: (mtcb, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tchc_can_bo_get_data_all(:mtcb, :qtChucVu, :qtDaoTao, :qtHocTapCongTac, :toChucKhac, :quanHeGiaDinh); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, mtcb, qtChucVu: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, qtDaoTao: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, qtHocTapCongTac: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, toChucKhac: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, quanHeGiaDinh: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getDashboardData: (time, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tccb_dashboard_get_data(:time, :nhanSuDonVi, :qtDiNuocNgoai, :qtCongTacTrongNuoc, :qtNghiPhep, :qtNghiThaiSan, :nhanSuCongTac); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, time, nhanSuDonVi: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, qtDiNuocNgoai: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, qtCongTacTrongNuoc: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, qtNghiPhep: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, qtNghiThaiSan: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, nhanSuCongTac: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        canBoHdSearchPage: (pagenumber, pagesize, searchterm, filter, sortkey, sortmode, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=can_bo_huong_dan_search_page(:pagenumber, :pagesize, :searchterm, :filter, :sortkey, :sortmode, :totalitem, :pagetotal); END;',
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

        getTruongKhoa: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tccb_can_bo_get_truong_khoa(:filter); END;',
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

        thongTinTaiChinhSearchPage: (pagenumber, pagesize, searchterm, filter, sortkey, sortmode, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tccb_thong_tin_tai_chinh_search_page(:pagenumber, :pagesize, :searchterm, :filter, :sortkey, :sortmode, :totalitem, :pagetotal); END;',
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

        thongTinTaiChinhDownloadExcel: (filter, searchterm, sortkey, sortmode, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tccb_thong_tin_tai_chinh_download_excel(:filter, :searchterm, :sortkey, :sortmode); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter, searchterm, sortkey, sortmode }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
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