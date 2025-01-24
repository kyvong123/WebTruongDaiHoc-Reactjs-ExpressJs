CREATE OR REPLACE FUNCTION FW_STUDENT_GET_DATA(iMssv IN STRING) RETURN SYS_REFCURSOR
AS
    STUDENT_INFO SYS_REFCURSOR;

BEGIN
    OPEN STUDENT_INFO FOR
        SELECT STU.MSSV                                               AS "mssv",
               STU.HO                                                 as "ho",
               STU.TEN                                                as "ten",
               (STU.HO || ' ' || STU.TEN)                             AS "hoTen",
               STU.KHOA                                               AS "khoa",
               KHOA.TEN                                               AS "tenKhoa",
               STU.TINH_TRANG                                         AS "tinhTrang",
               DMTT.TEN                                               AS "tenTinhTrang",
               STU.EMAIL_CA_NHAN                                      AS "emailCaNhan",
               STU.EMAIL_TRUONG                                       AS "emailTruong",
               CASE
                   WHEN STU.NGAY_SINH IS NULL OR STU.NGAY_SINH <= 0 THEN ''
                   ELSE
                       (select to_char(to_date('01/01/1970', 'dd/mm/yyyy') +
                                       (STU.NGAY_SINH + 14 * 60 * 60 * 1000) / 1000 / 60 / 60 / 24,
                                       'DD/MM/YYYY') datestr
                        from dual) END
                                                                      AS "ngaySinh",
               (CASE WHEN STU.GIOI_TINH = 2 THEN 'Nữ' ELSE 'Nam' end) as "gioiTinh",
               TTSV.TEN                                               AS "noiSinh",
               NSQG.TEN_QUOC_GIA                                      AS "noiSinhQuocGia",
               NDT.TEN_NGANH                                          AS "tenNganh",
               STU.MA_NGANH                                           AS "maNganh",
               STU.DIEN_THOAI_CA_NHAN                                 AS "sdt",
               TONGIAO.TEN                                            AS "tonGiao",
               QG.TEN_QUOC_GIA                                        AS "quocTich",
               DANTOC.TEN                                             AS "danToc",
               LH.TEN                                                 AS "heDaoTao",
               STU.LOAI_HINH_DAO_TAO                                  AS "loaiHinhDaoTao",
               STU.DOI_TUONG_TUYEN_SINH                               AS "doiTuongTuyenSinh",
               STU.DOI_TUONG_CHINH_SACH                               AS "doiTuongChinhSach",
               STU.KHU_VUC_TUYEN_SINH                                 AS "khuVucTuyenSinh",
               PTTS.TEN                                               AS "phuongThucTuyenSinh",
               STU.DIEM_THI                                           AS "diemThi",
               STU.CMND                                               AS "cmnd",
               STU.CMND_NGAY_CAP                                      AS "cmndNgayCap",
               STU.CMND_NOI_CAP                                       AS "cmndNoiCap",
               STU.TEN_CHA                                            AS "tenCha",
               STU.NGAY_SINH_CHA                                      AS "ngaySinhCha",
               STU.NGHE_NGHIEP_CHA                                    AS "ngheNghiepCha",
               STU.SDT_CHA                                            AS "sdtCha",
               CASE
                   WHEN STU.NGAY_NHAP_HOC IS NULL OR STU.NGAY_NHAP_HOC <= 0 THEN ''
                   ELSE
                       (select to_char(to_date('01/01/1970', 'dd/mm/yyyy') +
                                       (STU.NGAY_NHAP_HOC + 14 * 60 * 60 * 1000) / 1000 / 60 / 60 / 24,
                                       'DD/MM/YYYY') datestr
                        from dual) END
                                                                      AS "ngayNhapHoc",
               STU.TEN_ME                                             AS "tenMe",
               STU.NGAY_SINH_ME                                       AS "ngaySinhMe",
               STU.NGHE_NGHIEP_ME                                     AS "ngheNghiepMe",
               STU.SDT_ME                                             AS "sdtMe",
               STU.IMAGE                                              AS "image",
               STU.ANH_THE                                            as "anhThe",
               STU.LAST_MODIFIED                                      AS "lastModified",
               xaThuongTru.TEN_PHUONG_XA                              as "xaThuongTru",
               huyenThuongTru.TEN_QUAN_HUYEN                          as "huyenThuongTru",
               tinhThuongTru.ten                                      as "tinhThuongTru",
               STU.THUONG_TRU_SO_NHA                                  AS "soNhaThuongTru",
               STU.SO_TK_NH                                           AS "soTkNganHang",
               STU.CHI_NHANH_NH                                       AS "chiNhanhNganHang",

               xaThuongTruCha.TEN_PHUONG_XA                           as "xaThuongTruCha",
               huyenThuongTruCha.TEN_QUAN_HUYEN                       as "huyenThuongTruCha",
               tinhThuongTruCha.ten                                   as "tinhThuongTruCha",
               STU.THUONG_TRU_SO_NHA_CHA                              AS "soNhaThuongTruCha",

               xaThuongTruMe.TEN_PHUONG_XA                            as "xaThuongTruMe",
               huyenThuongTruMe.TEN_QUAN_HUYEN                        as "huyenThuongTruMe",
               tinhThuongTruMe.ten                                    as "tinhThuongTruMe",
               STU.THUONG_TRU_SO_NHA_ME                               AS "soNhaThuongTruMe",

               tinhLienLac.TEN                                        AS "tinhLienLac",
               huyenLienLac.TEN_QUAN_HUYEN                            AS "huyenLienLac",
               xaLienLac.TEN_PHUONG_XA                                AS "xaLienLac",
               STU.LIEN_LAC_SO_NHA                                    AS "soNhaLienLac",

               STU.HO_TEN_NGUOI_LIEN_LAC                              AS "hoTenNguoiLienLac",
               STU.SDT_NGUOI_LIEN_LAC                                 AS "sdtNguoiLienLac",
               STU.NGAY_VAO_DOAN                                      as "ngayVaoDoan",
               STU.NGAY_VAO_DANG                                      AS "ngayVaoDang",
               STU.NAM_TUYEN_SINH                                     AS "namTuyenSinh",
               L.KHOA_SINH_VIEN                                       AS "khoaSinhVien",
               STU.LOP                                                AS "lop",
               L.KHOA_SINH_VIEN                                       AS "nienKhoa"
        FROM FW_STUDENT STU
                 LEFT JOIN DM_QUOC_GIA QG ON QG.MA_CODE = STU.QUOC_GIA
                 LEFT JOIN DM_QUOC_GIA NSQG ON NSQG.MA_CODE = STU.NOI_SINH_QUOC_GIA
                 LEFT JOIN DM_DAN_TOC DANTOC ON DANTOC.MA = STU.DAN_TOC
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LH ON LH.MA = STU.LOAI_HINH_DAO_TAO
                 LEFT JOIN DM_TON_GIAO TONGIAO ON TONGIAO.MA = STU.TON_GIAO
                 LEFT JOIN DM_TINH_THANH_PHO TTSV ON TTSV.MA = STU.NOI_SINH_MA_TINH
                 LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = STU.MA_NGANH
                 LEFT JOIN DM_PHUONG_THUC_TUYEN_SINH PTTS ON PTTS.MA = STU.PHUONG_THUC_TUYEN_SINH
                 LEFT JOIN DM_PHUONG_XA xaThuongTru ON STU.THUONG_TRU_MA_XA = xaThuongTru.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenThuongTru ON STU.THUONG_TRU_MA_HUYEN = huyenThuongTru.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhThuongTru ON STU.THUONG_TRU_MA_TINH = tinhThuongTru.MA
                 LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = STU.KHOA
                 LEFT JOIN DM_TINH_TRANG_SINH_VIEN DMTT ON DMTT.MA = STU.TINH_TRANG

                 LEFT JOIN DM_PHUONG_XA xaThuongTruCha ON STU.THUONG_TRU_MA_XA_CHA = xaThuongTruCha.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenThuongTruCha
                           ON STU.THUONG_TRU_MA_HUYEN_CHA = huyenThuongTruCha.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhThuongTruCha ON STU.THUONG_TRU_MA_TINH_CHA = tinhThuongTruCha.MA

                 LEFT JOIN DM_PHUONG_XA xaThuongTruMe ON STU.THUONG_TRU_MA_XA_ME = xaThuongTruMe.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenThuongTruMe ON STU.THUONG_TRU_MA_HUYEN_ME = huyenThuongTruMe.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhThuongTruMe ON STU.THUONG_TRU_MA_TINH_ME = tinhThuongTruMe.MA

                 LEFT JOIN DM_PHUONG_XA xaLienLac ON STU.LIEN_LAC_MA_XA = xaLienLac.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenLienLac ON STU.LIEN_LAC_MA_HUYEN = huyenLienLac.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhLienLac ON STU.LIEN_LAC_MA_TINH = tinhLienLac.MA
                 LEFT JOIN DT_LOP L on L.MA_LOP = STU.LOP
        WHERE (STU.MSSV = iMssv or (iMssv || '@hcmussh.edu.vn') = STU.EMAIL_TRUONG);
    RETURN STUDENT_INFO;
end ;
CREATE OR REPLACE FUNCTION FW_STUDENT_DOWNLOAD_EXCEL(searchTerm IN STRING, filter IN STRING) RETURN SYS_REFCURSOR
AS
    REF_SYS               SYS_REFCURSOR;
    ST                    STRING(500) := '%' || lower(searchTerm) || '%';
    listFaculty           STRING(50);
    listFromCity          STRING(50);
    listEthnic            STRING(50);
    listNationality       STRING(50);
    listReligion          STRING(50);
    listLoaiHinhDaoTao    STRING(50);
    listLop               STRING(1000);
    listLoaiSinhVien      STRING(50);
    listTinhTrangSinhVien STRING(50);
    listKhoaSinhVien      STRING(50);
    fromNhapHoc           NUMBER(20);
    toNhapHoc             NUMBER(20);
    gender                STRING(5);
    choNhapHoc            NUMBER(1);
BEGIN
    SELECT JSON_VALUE(filter, '$.listFaculty') INTO listFaculty FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listFromCity') INTO listFromCity FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listFaculty') INTO listFaculty FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listEthnic') INTO listEthnic FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNationality') INTO listNationality FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listReligion') INTO listReligion FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLop') INTO listLop FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiSinhVien') INTO listLoaiSinhVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listTinhTrangSinhVien') INTO listTinhTrangSinhVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listKhoaSinhVien') INTO listKhoaSinhVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.gender') INTO gender FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromNhapHoc') INTO fromNhapHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toNhapHoc') INTO toNhapHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.choNhapHoc') INTO choNhapHoc FROM DUAL;

    OPEN REF_SYS FOR
        SELECT STU.MSSV                      AS "mssv",
               STU.HO                        AS "ho",
               STU.TEN                       AS "ten",
               STU.EMAIL_CA_NHAN             AS "emailCaNhan",
               STU.EMAIL_TRUONG              AS "emailTruong",
               CASE
                   WHEN STU.NGAY_SINH IS NULL OR STU.NGAY_SINH <= 0 THEN ''
                   ELSE
                       (select to_char(to_date('01/01/1970', 'dd/mm/yyyy') +
                                       (STU.NGAY_SINH + 14 * 60 * 60 * 1000) / 1000 / 60 / 60 / 24,
                                       'DD/MM/YYYY') datestr
                        from dual) END
                                             AS "ngaySinh",
               STU.GIOI_TINH                 AS "maGioiTinh",
               CASE
                   WHEN
                       STU.GIOI_TINH = 1 THEN 'Nam'
                   ELSE 'Nữ'
                   END                       AS "gioiTinh",
               STU.DIEN_THOAI_CA_NHAN        AS "soDienThoai",

               CASE
                   WHEN
                       HP.CONG_NO <= 0 THEN 'Chưa đóng học phí'
                   ELSE 'Đã đóng học phí'
                   END                       AS "tinhTrangHocPhi",

               CASE
                   WHEN
                       STU.HO_TEN_NGUOI_LIEN_LAC IS NULL THEN 'Chưa lưu trực tuyến'
                   ELSE 'Đã lưu trực tuyến'
                   END                       AS "tinhTrangThongTin",
               LSV.MA                        AS "maLoaiSinhVien",
               LSV.TEN                       AS "loaiSinhVien",
               LHDT.MA                       AS "maLoaiHinhDaoTao",
               LHDT.TEN                      AS "loaiHinhDaoTao",
               TTSV.MA                       AS "maTinhTrangSinhVien",
               TTSV.TEN                      AS "tinhTrangSinhVien",

               NS.MA                         AS "maTinhNoiSinh",
               NS.TEN                        AS "noiSinh",

               KHOA.MA                       AS "maKhoaBoMon",
               KHOA.TEN                      AS "khoaBoMon",

               STU.MA_NGANH                  AS "maNganh",
               NDT.TEN_NGANH                 AS "tenNganh",
               STU.CMND                      AS "cccd",
               CASE
                   WHEN STU.CMND_NGAY_CAP IS NULL OR STU.CMND_NGAY_CAP <= 0 THEN ''
                   ELSE
                       (select to_char(to_date('01/01/1970', 'dd/mm/yyyy') +
                                       (STU.CMND_NGAY_CAP + 14 * 60 * 60 * 1000) / 1000 / 60 / 60 / 24,
                                       'DD/MM/YYYY') datestr
                        from dual) END       AS "ngayCapCccd",
               STU.CMND_NOI_CAP              AS "noiCapCccd",
               xaThuongTru.TEN_PHUONG_XA     as "xaThuongTru",
               huyenThuongTru.TEN_QUAN_HUYEN as "huyenThuongTru",
               tinhThuongTru.ten             as "tinhThuongTru",
               STU.THUONG_TRU_SO_NHA         AS "soNhaThuongTru",

               xaThuongTru.MA_PHUONG_XA      AS "maXaThuongTru",
               huyenThuongTru.MA_QUAN_HUYEN  AS "maHuyenThuongTru",
               tinhThuongTru.MA              AS "maTinhThuongTru",

               tinhLienLac.TEN               AS "tinhLienLac",
               huyenLienLac.TEN_QUAN_HUYEN   AS "huyenLienLac",
               xaLienLac.TEN_PHUONG_XA       AS "xaLienLac",
               STU.LIEN_LAC_SO_NHA           AS "soNhaLienLac",

               tinhLienLac.MA                AS "maTinhLienLac",
               huyenLienLac.MA_QUAN_HUYEN    AS "maHuyenLienLac",
               xaLienLac.MA_PHUONG_XA        AS "maXaLienLac",

               STU.HO_TEN_NGUOI_LIEN_LAC     AS "hoTenNguoiLienLac",
               STU.SDT_NGUOI_LIEN_LAC        AS "sdtNguoiLienLac",

               TONGIAO.MA                    AS "maTonGiao",
               TONGIAO.TEN                   AS "tonGiao",

               QG.MA_CODE                    AS "maCodeQuocTich",
               QG.TEN_QUOC_GIA               AS "quocTich",

               DANTOC.MA                     AS "maDanToc",
               DANTOC.TEN                    AS "danToc",
               STU.NAM_TUYEN_SINH            AS "namTuyenSinh",
               CASE
                   WHEN STU.NGAY_NHAP_HOC IS NULL OR STU.NGAY_NHAP_HOC <= 0 THEN ''
                   ELSE
                       (select to_char(to_date('01/01/1970', 'dd/mm/yyyy') +
                                       (STU.NGAY_NHAP_HOC + 14 * 60 * 60 * 1000) / 1000 / 60 / 60 / 24,
                                       'DD/MM/YYYY') datestr
                        from dual) END
                                             AS "ngayNhapHoc",

               STU.KHU_VUC_TUYEN_SINH        AS "khuVucTuyenSinh",
               STU.DOI_TUONG_CHINH_SACH      AS "doiTuongChinhSach",
               STU.DOI_TUONG_TUYEN_SINH      AS "doiTuongTuyenSinh",
               STU.DIEM_THI                  AS "diemThi",
               STU.PHUONG_THUC_TUYEN_SINH    AS "phuongThuc",
               SVTN."totNghiepDaiHoc",
               SVTN."namTotNghiepDaiHoc",
               SVTN."nganhTotNghiepDaiHoc",
               SVTN."maTruongTotNghiepDaiHoc",
               SVTN."truongTotNghiepDaiHoc",
               SVTN."soHieuBangDaiHoc",
               SVTN."soVaoSoCapBangDaiHoc",
               SVTN."totNghiepCaoDang",
               SVTN."namTotNghiepCaoDang",
               SVTN."nganhTotNghiepCaoDang",
               SVTN."maTruongTotNghiepCaoDang",
               SVTN."truongTotNghiepCaoDang",
               SVTN."soHieuBangCaoDang",
               SVTN."soVaoSoCapBangCaoDang",
               SVTN."totNghiepTrungCap",
               SVTN."namTotNghiepTrungCap",
               SVTN."nganhTotNghiepTrungCap",
               SVTN."truongTotNghiepTrungCap",
               SVTN."tinhTotNghiepTrungCap",
               SVTN."soHieuBangTrungCap",
               SVTN."soVaoSoCapBangTrungCap",
               SVTN."totNghiepPhoThong",
               SVTN."namTotNghiepPhoThong",
               SVTN."truongTotNghiepPhoThong",
               SVTN."tinhTotNghiepPhoThong",
               tinhTamTru.TEN                AS "tinhTamTru",
               huyenTamTru.TEN_QUAN_HUYEN    AS "huyenTamTru",
               phuongTamTru.TEN_PHUONG_XA    AS "phuongTamTru",
               STTTT.TAM_TRU_SO_NHA          AS "soNhaTamTru",
               STTNT.KTX_TEN                 AS "tenKyTucXa",
               STTNT.KTX_TOA_NHA             AS "toaKyTucXa",
               STTNT.KTX_SO_PHONG            AS "soPhongKyTucXa",
               STU.TEN_CHA                   as "tenCha",
               CASE
                   WHEN STU.NGAY_SINH_CHA IS NULL OR STU.NGAY_SINH_CHA <= 0 THEN ''
                   ELSE
                       (select to_char(to_date('01/01/1970', 'dd/mm/yyyy') +
                                       (STU.NGAY_SINH_CHA + 14 * 60 * 60 * 1000) / 1000 / 60 / 60 / 24,
                                       'DD/MM/YYYY') datestr
                        from dual) END
                                             AS "ngaySinhCha",
               STU.NGHE_NGHIEP_CHA           as "ngheNgiepCha",
               STU.TEN_ME                    as "tenMe",
               CASE
                   WHEN STU.NGAY_SINH_ME IS NULL OR STU.NGAY_SINH_ME <= 0 THEN ''
                   ELSE
                       (select to_char(to_date('01/01/1970', 'dd/mm/yyyy') +
                                       (STU.NGAY_SINH_ME + 14 * 60 * 60 * 1000) / 1000 / 60 / 60 / 24,
                                       'DD/MM/YYYY') datestr
                        from dual) END
                                             AS "ngaySinhMe",
               STU.NGAY_SINH_ME              as "ngaySinhMe",
               STU.NGHE_NGHIEP_ME            as "ngheNghiepMe",
               STU.LOP                       as "maLop",
               CASE
                   WHEN STU.LAST_MODIFIED IS NULL OR STU.LAST_MODIFIED <= 0 THEN ''
                   ELSE
                       (select to_char(to_date('01/01/1970', 'dd/mm/yyyy') +
                                       (STU.LAST_MODIFIED + 14 * 60 * 60 * 1000) / 1000 / 60 / 60 / 24,
                                       'DD/MM/YYYY') datestr
                        from dual) END
                                         As "lastModified"
--                ,CB.HO || ' ' || CB.TEN        AS "canBoXuLy"
        FROM FW_STUDENT STU
                 --                  LEFT JOIN SV_NHAP_HOC NH ON NH.MSSV = STU.MSSV
--                  LEFT JOIN TCHC_CAN_BO CB ON CB.EMAIL = NH.EMAIL
                 LEFT JOIN (SELECT STTTN.MSSV,
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'ĐH' THEN 'Đại học' ELSE '' END)              AS "totNghiepDaiHoc",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'ĐH' THEN STTTN.NAM_TOT_NGHIEP ELSE null END) AS "namTotNghiepDaiHoc",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'ĐH' THEN STTTN.NGANH ELSE null END)          AS "nganhTotNghiepDaiHoc",
                                   MAX(CASE
                                           WHEN STTTN.TRINH_DO = 'ĐH' THEN (CASE
                                                                                WHEN STTTN.TRUONG_KHAC IS NOT NULL
                                                                                    THEN null
                                                                                ELSE DDH.MA END)
                                           ELSE null END)                                                       AS "maTruongTotNghiepDaiHoc",
                                   MAX(CASE
                                           WHEN STTTN.TRINH_DO = 'ĐH' THEN (CASE
                                                                                WHEN STTTN.TRUONG_KHAC IS NOT NULL
                                                                                    THEN STTTN.TRUONG_KHAC
                                                                                ELSE DDH.TEN_TRUONG END)
                                           ELSE null END)                                                       AS "truongTotNghiepDaiHoc",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'ĐH' THEN STTTN.SO_HIEU_BANG ELSE null END)   AS "soHieuBangDaiHoc",
                                   MAX(CASE
                                           WHEN STTTN.TRINH_DO = 'ĐH' THEN STTTN.SO_VAO_SO_CAP_BANG
                                           ELSE null END)                                                       AS "soVaoSoCapBangDaiHoc",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'CĐ' THEN 'Cao đẳng' ELSE '' END)             AS "totNghiepCaoDang",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'CĐ' THEN STTTN.NAM_TOT_NGHIEP ELSE null END) AS "namTotNghiepCaoDang",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'CĐ' THEN STTTN.NGANH ELSE null END)          AS "nganhTotNghiepCaoDang",
                                   MAX(CASE
                                           WHEN STTTN.TRINH_DO = 'CĐ' THEN (CASE
                                                                                WHEN STTTN.TRUONG_KHAC IS NOT NULL
                                                                                    THEN null
                                                                                ELSE DCDHV.MA END)
                                           ELSE null END)                                                       AS "maTruongTotNghiepCaoDang",
                                   MAX(CASE
                                           WHEN STTTN.TRINH_DO = 'CĐ' THEN (CASE
                                                                                WHEN STTTN.TRUONG_KHAC IS NOT NULL
                                                                                    THEN STTTN.TRUONG_KHAC
                                                                                ELSE DCDHV.TEN_TRUONG END)
                                           ELSE null END)                                                       AS "truongTotNghiepCaoDang",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'CĐ' THEN STTTN.SO_HIEU_BANG ELSE null END)   AS "soHieuBangCaoDang",
                                   MAX(CASE
                                           WHEN STTTN.TRINH_DO = 'CĐ' THEN STTTN.SO_VAO_SO_CAP_BANG
                                           ELSE null END)                                                       AS "soVaoSoCapBangCaoDang",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'TC' THEN 'Trung cấp' ELSE '' END)            AS "totNghiepTrungCap",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'TC' THEN STTTN.NAM_TOT_NGHIEP ELSE null END) AS "namTotNghiepTrungCap",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'TC' THEN STTTN.NGANH ELSE null END)          AS "nganhTotNghiepTrungCap",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'TC' THEN STTTN.TRUONG ELSE null END)         AS "truongTotNghiepTrungCap",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'TC' THEN DMT.TEN ELSE null END)              AS "tinhTotNghiepTrungCap",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'TC' THEN STTTN.SO_HIEU_BANG ELSE null END)   AS "soHieuBangTrungCap",
                                   MAX(CASE
                                           WHEN STTTN.TRINH_DO = 'TC' THEN STTTN.SO_VAO_SO_CAP_BANG
                                           ELSE null END)                                                       AS "soVaoSoCapBangTrungCap",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'PT' THEN 'Phổ thông/GDTX' ELSE '' END)       AS "totNghiepPhoThong",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'PT' THEN STTTN.NAM_TOT_NGHIEP ELSE null END) AS "namTotNghiepPhoThong",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'PT' THEN STTTN.TRUONG ELSE null END)         AS "truongTotNghiepPhoThong",
                                   MAX(CASE WHEN STTTN.TRINH_DO = 'PT' THEN DMT.TEN ELSE null END)              AS "tinhTotNghiepPhoThong"
                            FROM SV_THONG_TIN_TOT_NGHIEP STTTN
                                     LEFT JOIN DM_DAI_HOC DDH on DDH.MA = CASE
                                                                              WHEN REGEXP_LIKE(STTTN.TRUONG, '^\d+(\.\d+)?$')
                                                                                  THEN TO_NUMBER(STTTN.TRUONG)
                                                                              ELSE NULL
                                END
                                     LEFT JOIN DM_CAO_DANG_HOC_VIEN DCDHV on DCDHV.MA = CASE
                                                                                            WHEN REGEXP_LIKE(STTTN.TRUONG, '^\d+(\.\d+)?$')
                                                                                                THEN TO_NUMBER(STTTN.TRUONG)
                                                                                            ELSE NULL
                                END
                                     LEFT JOIN DM_TINH_THANH_PHO DMT ON DMT.MA = STTTN.TINH
                            GROUP BY STTTN.MSSV) SVTN ON SVTN.MSSV = STU.MSSV
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = STU.LOAI_HINH_DAO_TAO
                 LEFT JOIN DM_LOAI_SINH_VIEN LSV on LSV.MA = STU.LOAI_SINH_VIEN
                 LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = STU.MA_NGANH
                 LEFT JOIN DM_QUOC_GIA QG ON QG.MA_CODE = STU.QUOC_GIA
                 LEFT JOIN DM_DAN_TOC DANTOC ON DANTOC.MA = STU.DAN_TOC
                 LEFT JOIN DM_TON_GIAO TONGIAO ON TONGIAO.MA = STU.TON_GIAO
                 LEFT JOIN DM_TINH_THANH_PHO NS ON NS.MA = STU.NOI_SINH_MA_TINH

                 LEFT JOIN DM_PHUONG_XA xaThuongTru ON STU.THUONG_TRU_MA_XA = xaThuongTru.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenThuongTru ON STU.THUONG_TRU_MA_HUYEN = huyenThuongTru.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhThuongTru ON STU.THUONG_TRU_MA_TINH = tinhThuongTru.MA


                 LEFT JOIN DM_PHUONG_XA xaThuongTruCha ON STU.THUONG_TRU_MA_XA_CHA = xaThuongTruCha.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenThuongTruCha
                           ON STU.THUONG_TRU_MA_HUYEN_CHA = huyenThuongTruCha.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhThuongTruCha ON STU.THUONG_TRU_MA_TINH_CHA = tinhThuongTruCha.MA

                 LEFT JOIN DM_PHUONG_XA xaThuongTruMe ON STU.THUONG_TRU_MA_XA_ME = xaThuongTruMe.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenThuongTruMe
                           ON STU.THUONG_TRU_MA_HUYEN_ME = huyenThuongTruMe.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhThuongTruMe ON STU.THUONG_TRU_MA_TINH_ME = tinhThuongTruMe.MA

                 LEFT JOIN DM_PHUONG_XA xaLienLac ON STU.LIEN_LAC_MA_XA = xaLienLac.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenLienLac ON STU.LIEN_LAC_MA_HUYEN = huyenLienLac.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhLienLac ON STU.LIEN_LAC_MA_TINH = tinhLienLac.MA

                 LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = STU.KHOA
                 LEFT JOIN DM_TINH_TRANG_SINH_VIEN TTSV ON TTSV.MA = STU.TINH_TRANG
                 LEFT JOIN (SELECT DISTINCT t.MSSV,
                                            t.TAM_TRU_MA_XA,
                                            t.TAM_TRU_MA_HUYEN,
                                            t.TAM_TRU_SO_NHA,
                                            t.DATE_MODIFIED,
                                            t.TAM_TRU_MA_TINH
                            FROM SV_THONG_TIN_TAM_TRU t
                                     INNER JOIN (SELECT MSSV, MAX(DATE_MODIFIED) AS max_time
                                                 FROM SV_THONG_TIN_TAM_TRU
                                                 GROUP BY MSSV) t2
                                                ON t.MSSV = t2.MSSV AND t.DATE_MODIFIED = t2.max_time) STTTT
                           ON STTTT.MSSV = STU.MSSV
                 LEFT JOIN (SELECT STTNT.MSSV,
                                   MAX(STTNT.DATE_MODIFIED),
                                   STTNT.KTX_TEN,
                                   STTNT.KTX_TOA_NHA,
                                   STTNT.KTX_SO_PHONG
                            FROM SV_THONG_TIN_NOI_TRU STTNT
                            GROUP BY STTNT.MSSV, STTNT.KTX_TEN,
                                     STTNT.KTX_TOA_NHA,
                                     STTNT.KTX_SO_PHONG) STTNT ON STTNT.MSSV = STU.MSSV
                 LEFT JOIN DM_TINH_THANH_PHO tinhTamTru ON STTTT.TAM_TRU_MA_TINH = tinhTamTru.MA
                 LEFT JOIN DM_QUAN_HUYEN huyenTamTru ON STTTT.TAM_TRU_MA_HUYEN = huyenTamTru.MA_QUAN_HUYEN
                 LEFT JOIN DM_PHUONG_XA phuongTamTru ON STTTT.TAM_TRU_MA_XA = phuongTamTru.MA_PHUONG_XA


                LEFT JOIN (SELECT (CASE
                                        WHEN SUM(CONG_NO) > 0 THEN 0
                                        WHEN SUM(CONG_NO) <= 0 THEN 1 END) AS CONG_NO,
                                   MSSV
                            FROM TC_HOC_PHI HP
                            GROUP BY HP.MSSV
                            HAVING SUM(CONG_NO) IS NOT NULL) HP ON HP.MSSV = STU.MSSV
        WHERE (
                (listFaculty IS NOT NULL AND STU.KHOA IN (SELECT regexp_substr(listFaculty, '[^,]+', 1, level)
                                                          from dual
                                                          connect by regexp_substr(listFaculty, '[^,]+', 1, level) is not null) OR
                 listFaculty IS NULL)
                AND (listFromCity IS NOT NULL AND
                     STU.THUONG_TRU_MA_TINH IN (SELECT regexp_substr(listFromCity, '[^,]+', 1, level)
                                                from dual
                                                connect by regexp_substr(listFromCity, '[^,]+', 1, level) is not null) OR
                     listFromCity IS NULL)
                AND (listKhoaSinhVien IS NOT NULL AND
                     STU.NAM_TUYEN_SINH IN (SELECT regexp_substr(listKhoaSinhVien, '[^,]+', 1, level)
                                            from dual
                                            connect by regexp_substr(listKhoaSinhVien, '[^,]+', 1, level) is not null) OR
                     listKhoaSinhVien IS NULL)
                AND (listEthnic IS NOT NULL AND STU.DAN_TOC IN (SELECT regexp_substr(listEthnic, '[^,]+', 1, level)
                                                                from dual
                                                                connect by regexp_substr(listEthnic, '[^,]+', 1, level) is not null) OR
                     listEthnic IS NULL)
                AND (listNationality IS NOT NULL AND
                     STU.QUOC_GIA IN (SELECT regexp_substr(listNationality, '[^,]+', 1, level)
                                      from dual
                                      connect by regexp_substr(listNationality, '[^,]+', 1, level) is not null) OR
                     listNationality IS NULL)
                AND (listReligion IS NOT NULL AND STU.DAN_TOC IN (SELECT regexp_substr(listReligion, '[^,]+', 1, level)
                                                                  from dual
                                                                  connect by regexp_substr(listReligion, '[^,]+', 1, level) is not null)
                OR listReligion IS NULL)
                AND (listLoaiHinhDaoTao IS NOT NULL AND
                     STU.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                               from dual
                                               connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null)
                OR listLoaiHinhDaoTao IS NULL)
                AND (listLoaiSinhVien IS NOT NULL AND
                     STU.LOAI_SINH_VIEN IN (SELECT regexp_substr(listLoaiSinhVien, '[^,]+', 1, level)
                                            from dual
                                            connect by regexp_substr(listLoaiSinhVien, '[^,]+', 1, level) is not null)
                OR listLoaiSinhVien IS NULL)
                AND (listTinhTrangSinhVien IS NOT NULL AND
                     STU.TINH_TRANG IN (SELECT regexp_substr(listTinhTrangSinhVien, '[^,]+', 1, level)
                                        from dual
                                        connect by regexp_substr(listTinhTrangSinhVien, '[^,]+', 1, level) is not null) OR
                     listTinhTrangSinhVien IS NULL)
                AND (listLop IS NULL OR STU.LOP IN (SELECT regexp_substr(listLop, '[^,]+', 1, level)
                                                    from DUAL
                                                    connect by regexp_substr(listLop, '[^,]+', 1, level) is not null))
                AND (gender IS NOT NULL AND ('0' || STU.GIOI_TINH) = gender OR gender IS NULL)
                AND (choNhapHoc is null or choNhapHoc = 0 or (choNhapHoc = 1 and STU.NGAY_NHAP_HOC = -1))
                AND ((fromNhapHoc IS NOT NULL AND toNhapHoc IS NOT NULL AND fromNhapHoc < STU.NGAY_NHAP_HOC AND
                      STU.NGAY_NHAP_HOC < toNhapHoc) OR toNhapHoc IS NULL OR fromNhapHoc IS NULL)
            )
          AND (searchTerm = ''
            OR LOWER(STU.MSSV) = LOWER(searchTerm)
            OR LOWER(TRIM(STU.HO || ' ' || STU.TEN)) LIKE sT
            OR LOWER(STU.MA_NGANH) LIKE sT
            OR LOWER(STU.LOP) LIKE sT
            OR LOWER(STU.DIEN_THOAI_CA_NHAN) LIKE sT
            OR LOWER(STU.DIEN_THOAI_LIEN_LAC) LIKE sT
            OR LOWER(STU.EMAIL_CA_NHAN) LIKE sT)
        ORDER BY STU.NAM_TUYEN_SINH DESC NULLS LAST, STU.MSSV, STU.TEN, STU.HO;
    RETURN REF_SYS;
end ;
CREATE OR REPLACE FUNCTION SV_DRL_DSSV_GIA_HAN_GET_GH_INFO(imssv in string, idDot in number) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        select DSGH.MSSV    as "mssv",
               GHK.TIME_END as "timeEnd"
        from SV_DRL_DSSV_GIA_HAN DSGH
                 LEFT JOIN SV_DRL_GIA_HAN_KHOA GHK on GHK.ID = DSGH.ID_GIA_HAN_KHOA AND GHK.TINH_TRANG = 'A'
        where DSGH.MSSV = imssv
          and GHK.ID_DOT = idDot
        and ROWNUM = 1
        order by DSGH.ID desc ;


    RETURN my_cursor;
END ;
CREATE OR REPLACE FUNCTION SV_DOT_XET_HOC_BONG_KKHT_GET_DATA(paramid IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT SVKT.ID AS "id",
               SVKT.TEN AS "tenDot",
               SVKT.NAM_HOC AS "namHoc",
               SVKT.HOC_KY AS "hocKy",
               SVKT.TONG_KINH_PHI AS "tongKinhPhi",
               JSON_ARRAYAGG(JSON_OBJECT(
                       key 'khoaSinhVien' value TO_CHAR(SVTT.KHOA_SINH_VIEN),
                       key 'heDaoTao' value TO_CHAR(SVTT.HE_DAO_TAO),
                       key 'loaiDieuKien' value SVTT.LOAI_DIEU_KIEN,
                       key 'tongKinhPhi' value SVTT.KINH_PHI,
                       key 'dsNhom' value SVTT."dsNhom"
                   )) AS "dsDieuKien"
        from SV_DOT_XET_HOC_BONG_KKHT SVKT
                 left join (SELECT SVDK.ID,
                                   SVDK.HE_DAO_TAO,
                                   SVDK.ID_DOT,
                                   SVDK.KHOA_SINH_VIEN,
                                   SVDK.KINH_PHI,
                                   SVDK.LOAI_DIEU_KIEN,
                                   JSON_ARRAYAGG(JSON_OBJECT(
                                           key 'idQuery' value SHBN.ID,
                                           key 'tenNhom' value TO_CHAR(SHBN.TEN_NHOM),
                                           key 'tongKinhPhi' value TO_CHAR(SHBN.KINH_PHI),
                                           key 'dsKhoa' value  SHBN."dsKhoa",
                                           key 'dsNganh' value SHBN."dsNganh",
                                           key 'hocBongXuatSac' value SHBN.HOC_BONG_XUAT_SAC,
                                           key 'hocBongGioi' value SHBN.HOC_BONG_GIOI,
                                           key 'hocBongKha' value SHBN.HOC_BONG_KHA
                                       )) AS "dsNhom"
                            FROM SV_DIEU_KIEN_XET_HOC_BONG SVDK
                                     LEFT JOIN (SELECT HBN.TEN_NHOM,
                                                       HBN.KINH_PHI,
                                                       HBN.ID_DIEU_KIEN,
                                                       HBN.ID,
                                                       HBN.HOC_BONG_XUAT_SAC,
                                                       HBN.HOC_BONG_GIOI,
                                                       HBN.HOC_BONG_KHA,
                                                       JSON_ARRAYAGG(JSON_OBJECT(
                                                               key 'idKhoa' value SHBK.ID_KHOA,
                                                               key 'ten' value TO_CHAR(DMDV.TEN),
                                                               key 'kinhPhiKhoa' value SHBK.KINH_PHI,
                                                               key 'soLuongSinhVienKhoa' value SHBK.SO_LUONG_SV
                                                           ) ORDER BY SHBK.ID_KHOA ASC) AS "dsKhoa",
                                                       JSON_ARRAYAGG(JSON_OBJECT(
                                                               key 'idNganh' value TO_CHAR(S.MA_NGANH),
                                                               key 'ten' value TO_CHAR(DNDT.TEN_NGANH),
                                                               key 'kinhPhiNganh' value S.KINH_PHI,
                                                               key 'soLuongSinhVienNganh' value S.SO_LUONG_SV
                                                           ) ORDER  BY S.MA_NGANH ASC) AS "dsNganh"
                                                FROM SV_HOC_BONG_NHOM HBN
                                                         LEFT JOIN (SELECT * FROM SV_HOC_BONG_KHOA ORDER BY SV_HOC_BONG_KHOA.ID_KHOA ASC) SHBK on HBN.ID = SHBK.ID_NHOM
                                                         LEFT JOIN DM_DON_VI DMDV on DMDV.MA = SHBK.ID_KHOA
                                                         LEFT JOIN (SELECT * FROM SV_HOC_BONG_NGANH ORDER BY SV_HOC_BONG_NGANH.MA_NGANH ASC) S on HBN.ID = S.ID_NHOM
                                                         LEFT JOIN DT_NGANH_DAO_TAO  DNDT on S.MA_NGANH = DNDT.MA_NGANH
                                                GROUP BY HBN.TEN_NHOM, HBN.KINH_PHI, HBN.ID_DIEU_KIEN, HBN.ID, HBN.HOC_BONG_XUAT_SAC, HBN.HOC_BONG_GIOI, HBN.HOC_BONG_KHA) SHBN
                                               on SVDK.ID = SHBN.ID_DIEU_KIEN
                            GROUP BY SVDK.ID, SVDK.HE_DAO_TAO, SVDK.KHOA_SINH_VIEN, SVDK.ID_DOT, SVDK.KINH_PHI,
                                     SVDK.LOAI_DIEU_KIEN) SVTT
                           on SVTT.ID_DOT = SVKT.ID
        WHERE SVKT.ID = paramid
        group by SVKT.ID, SVKT.TEN, SVKT.NAM_HOC, SVKT.HOC_KY, SVKT.TONG_KINH_PHI;
    RETURN my_cursor;
END;
CREATE OR REPLACE FUNCTION SV_DANH_GIA_DRL_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                            searchTerm IN STRING, filter IN STRING, sortKey IN STRING,
                                            sortMode IN STRING,
                                            totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    STUDENT_INFO          SYS_REFCURSOR;
    ST                    STRING(500) := '%' || lower(trim(searchTerm)) || '%';
    listFaculty           STRING(500);
    listLoaiHinhDaoTao    STRING(500);
    listTinhTrangSinhVien STRING(500);
    listKhoaSinhVien      STRING(500);
    gender                STRING(5);
    namHoc                STRING(11);
    hocKy                 STRING(3);
    ks_mssv               STRING(50);
    ks_ho                 STRING(50);
    ks_ten                STRING(50);
    listLop               STRING(50);
    isComplete            NUMBER(1);
BEGIN
    SELECT JSON_VALUE(filter, '$.listFaculty') INTO listFaculty FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listFaculty') INTO listFaculty FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listTinhTrangSinhVien') INTO listTinhTrangSinhVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listKhoaSinhVien') INTO listKhoaSinhVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.gender') INTO gender FROM DUAL;
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_mssv') INTO ks_mssv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ho') INTO ks_ho FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ten') INTO ks_ten FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLop') INTO listLop FROM DUAL;
    SELECT JSON_VALUE(filter, '$.isComplete') INTO isComplete FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM FW_STUDENT STU
             LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = STU.LOAI_HINH_DAO_TAO
             LEFT JOIN DM_LOAI_SINH_VIEN LSV on LSV.MA = STU.LOAI_SINH_VIEN
             LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = STU.MA_NGANH
             LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = STU.KHOA
             LEFT JOIN DM_TINH_TRANG_SINH_VIEN TTSV ON TTSV.MA = STU.TINH_TRANG
             LEFT JOIN DT_LOP LOP ON LOP.MA_LOP = STU.LOP
             LEFT JOIN DT_KHUNG_DAO_TAO KHUNGDT ON KHUNGDT.MA_CTDT = LOP.MA_CTDT
             LEFT JOIN (SELECT * FROM SV_DIEM_REN_LUYEN WHERE NAM_HOC = namHoc AND HOC_KY = hocKy) SVTKDRL
                       ON SVTKDRL.MSSV = STU.MSSV
    WHERE (
            (ks_mssv IS NULL OR lower(STU.MSSV) LIKE ('%' || lower(trim(ks_mssv)) || '%'))
            AND (ks_ho IS NULL OR lower(STU.HO) LIKE ('%' || lower(trim(ks_ho)) || '%'))
            AND (ks_ten IS NULL OR lower(STU.TEN) LIKE ('%' || lower(trim(ks_ten)) || '%'))
        )
      AND ((listFaculty IS NULL OR STU.KHOA IN (SELECT regexp_substr(listFaculty, '[^,]+', 1, level)
                                                from DUAL
                                                connect by regexp_substr(listFaculty, '[^,]+', 1, level) is not null))
        AND
           (listKhoaSinhVien IS NULL OR LOP.KHOA_SINH_VIEN IN (SELECT regexp_substr(listKhoaSinhVien, '[^,]+', 1, level)
                                                               from DUAL
                                                               connect by regexp_substr(listKhoaSinhVien, '[^,]+', 1, level) is not null))
        AND (listLop IS NULL OR STU.LOP IN (SELECT regexp_substr(listLop, '[^,]+', 1, level)
                                            from DUAL
                                            connect by regexp_substr(listLop, '[^,]+', 1, level) is not null))
        AND (listLoaiHinhDaoTao IS NULL OR
             STU.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                       from dual
                                       connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
        AND (listTinhTrangSinhVien IS NULL OR
             STU.TINH_TRANG IN (SELECT regexp_substr(listTinhTrangSinhVien, '[^,]+', 1, level)
                                from DUAL
                                connect by regexp_substr(listTinhTrangSinhVien, '[^,]+', 1, level) is not null))
        AND (gender IS NOT NULL AND (0 || STU.GIOI_TINH) = gender OR gender IS NULL))
      AND (isComplete IS NULL OR (isComplete = 1 and SVTKDRL.TK_SUBMIT is not null) OR (isComplete = 0 and SVTKDRL.TK_SUBMIT is null))
      AND (searchTerm = ''
        OR LOWER(TRIM(STU.MSSV)) = lower(trim(searchTerm))
        OR LOWER(TRIM(STU.HO || ' ' || STU.TEN)) LIKE ST
        OR LOWER(STU.MA_NGANH) LIKE ST
        OR LOWER(STU.LOP) LIKE ST
        OR LOWER(STU.DIEN_THOAI_CA_NHAN) LIKE ST
        OR LOWER(STU.DIEN_THOAI_LIEN_LAC) LIKE ST
        OR LOWER(STU.EMAIL_CA_NHAN) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN STUDENT_INFO FOR
        SELECT *
        FROM (SELECT STU.MSSV                                    AS "mssv",
                     STU.HO                                      AS "ho",
                     STU.TEN                                     AS "ten",
                     LHDT.TEN                                    AS "tenLoaiHinhDaoTao",
                     STU.LOAI_HINH_DAO_TAO                       AS "loaiHinhDaoTao",
                     TTSV.TEN                                    AS "tinhTrangSinhVien",
                     STU.TINH_TRANG                              AS "tinhTrang",
                     STU.KHOA                                    AS "khoa",
                     KHOA.TEN                                    AS "tenKhoa",
                     STU.MA_NGANH                                AS "maNganh",
                     STU.LOP                                     AS "lop",
                     NDT.TEN_NGANH                               AS "tenNganh",
                     STU.NAM_TUYEN_SINH                          AS "namTuyenSinh",
                     STU.CAN_EDIT                                AS "canEdit",
                     stu.MA_CTDT                                 AS "maCtdt",
                     CASE
                         WHEN SUM(CASE
                                      WHEN (SDDG.NAM_HOC = namHoc AND SDDG.HOC_KY = hocKy) THEN SDDG.DIEM_SV
                                      ELSE NULL END) > 90 THEN 90
                         ELSE SUM(CASE
                                      WHEN (SDDG.NAM_HOC = namHoc AND SDDG.HOC_KY = hocKy) THEN SDDG.DIEM_SV
                                      ELSE NULL END)
                         END                                     AS "diemSv",
                     CASE
                         WHEN SUM(CASE
                                      WHEN (SDDG.NAM_HOC = namHoc AND SDDG.HOC_KY = hocKy) THEN SDDG.DIEM_LT
                                      ELSE NULL END) > 90 THEN 90
                         ELSE SUM(CASE
                                      WHEN (SDDG.NAM_HOC = namHoc AND SDDG.HOC_KY = hocKy) THEN SDDG.DIEM_LT
                                      ELSE NULL END)
                         END                                     AS "diemLt",
                     CASE
                         WHEN SUM(CASE
                                      WHEN (SDDG.NAM_HOC = namHoc AND SDDG.HOC_KY = hocKy) THEN SDDG.DIEM_F
                                      ELSE NULL END) > 90 THEN 90
                         ELSE SUM(CASE
                                      WHEN (SDDG.NAM_HOC = namHoc AND SDDG.HOC_KY = hocKy) THEN SDDG.DIEM_F
                                      ELSE NULL END)
                         END                                     AS "diemF",
                     nvl(SVTKDRL.DIEM_TB, DTDTB.DIEM_TRUNG_BINH) AS "diemTb",
--                      SVTKDRL.DIEM_TB                      as "diemTb",
                     SVTKDRL.TK_SUBMIT                           AS "diemTk",
                     SVTKDRL.LY_DO_TK                             AS "lyDoTk",
                     SVTKDRL.F_SUBMIT                            AS "diemEditF",
                     SVTKDRL.LY_DO_F                             AS "lyDoEditF",
                     (select rtrim(xmlagg(xmlelement(e, SV_DM_HINH_THUC_KY_LUAT.TEN, '??').extract('//text()')
                                          order by
                                          null).getclobval(), '??')
                      FROM SV_QT_KY_LUAT svqtkl_temp
                               left join SV_DS_KY_LUAT DSKL on DSKL.QD_ID = svqtkl_temp.ID
                               LEFT JOIN SV_DM_HINH_THUC_KY_LUAT
                                         ON svqtkl_temp.LY_DO_HINH_THUC = SV_DM_HINH_THUC_KY_LUAT.ID
                      WHERE (DSKL.MSSV = STU.MSSV AND svqtkl_temp.NAM_HOC = namHoc and
                             svqtkl_temp.HOC_KY = hocKy))        AS "danhSachKyLuat",
                     (select rtrim(xmlagg(xmlelement(e, SV_DM_HINH_THUC_KY_LUAT.DRL_MAX, '??').extract('//text()')
                                          order by
                                          null).getclobval(), '??')
                      FROM SV_QT_KY_LUAT svqtkl_temp
                               left join SV_DS_KY_LUAT DSKL on DSKL.QD_ID = svqtkl_temp.ID
                               LEFT JOIN SV_DM_HINH_THUC_KY_LUAT
                                         ON svqtkl_temp.LY_DO_HINH_THUC = SV_DM_HINH_THUC_KY_LUAT.ID
                      WHERE (DSKL.MSSV = STU.MSSV AND svqtkl_temp.NAM_HOC = namHoc and
                             svqtkl_temp.HOC_KY = hocKy))        AS "danhSachDrlMax",
                     (select rtrim(xmlagg(xmlelement(e, svqtkl_temp.NGAY_XU_LY, '??').extract('//text()')
                                          order by
                                          null).getclobval(), '??')
                      FROM SV_QT_KY_LUAT svqtkl_temp
                               left join SV_DS_KY_LUAT DSKL on DSKL.QD_ID = svqtkl_temp.ID
                      WHERE (DSKL.MSSV = STU.MSSV AND svqtkl_temp.NAM_HOC = namHoc and
                             svqtkl_temp.HOC_KY = hocKy))        AS "danhSachNgayXuLy",
                     (SELECT COUNT(*)
                      FROM SV_QT_KY_LUAT svqtkl_temp
                               left join SV_DS_KY_LUAT DSKL on DSKL.QD_ID = svqtkl_temp.ID
                      WHERE (DSKL.MSSV = STU.MSSV AND svqtkl_temp.NAM_HOC = namHoc and
                             svqtkl_temp.HOC_KY = hocKy))
                                                                 AS "soKyLuat",
                     ROW_NUMBER() OVER (ORDER BY NULL)              R
              FROM FW_STUDENT STU
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = STU.LOAI_HINH_DAO_TAO
                       LEFT JOIN DM_LOAI_SINH_VIEN LSV on LSV.MA = STU.LOAI_SINH_VIEN
                       LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = STU.MA_NGANH
                       LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = STU.KHOA
                       LEFT JOIN DM_TINH_TRANG_SINH_VIEN TTSV ON TTSV.MA = STU.TINH_TRANG
                       LEFT JOIN DT_LOP LOP ON LOP.MA_LOP = STU.LOP
                       LEFT JOIN (SELECT *
                                  FROM SV_DRL_DANH_GIA SDDG
                                           LEFT JOIN SV_BO_TIEU_CHI S on SDDG.MA_TIEU_CHI = S.MA
                                  WHERE S.KICH_HOAT = '1'
                                    AND S.MA_CHA IS NULL) SDDG on STU.MSSV = SDDG.MSSV
                       LEFT JOIN SV_BO_TIEU_CHI SBTC ON SBTC.MA = SDDG.MA_TIEU_CHI
                       LEFT JOIN (SELECT * FROM SV_DIEM_REN_LUYEN WHERE NAM_HOC = namHoc AND HOC_KY = hocKy) SVTKDRL
                                 ON SVTKDRL.MSSV = STU.MSSV
                       LEFT JOIN (SELECT * FROM DT_DIEM_TRUNG_BINH WHERE NAM_HOC = namHoc AND HOC_KY = hocKy) DTDTB
                                 ON DTDTB.MSSV = STU.MSSV
              WHERE (
                      (ks_mssv IS NULL OR lower(STU.MSSV) LIKE ('%' || lower(trim(ks_mssv)) || '%'))
                      AND (ks_ho IS NULL OR lower(STU.HO) LIKE ('%' || lower(trim(ks_ho)) || '%'))
                      AND (ks_ten IS NULL OR lower(STU.TEN) LIKE ('%' || lower(trim(ks_ten)) || '%'))
                  )
                AND ((listFaculty IS NULL OR STU.KHOA IN (SELECT regexp_substr(listFaculty, '[^,]+', 1, level)
                                                          from DUAL
                                                          connect by regexp_substr(listFaculty, '[^,]+', 1, level) is not null))
                  AND
                     (listKhoaSinhVien IS NULL OR
                      LOP.KHOA_SINH_VIEN IN (SELECT regexp_substr(listKhoaSinhVien, '[^,]+', 1, level)
                                             from DUAL
                                             connect by regexp_substr(listKhoaSinhVien, '[^,]+', 1, level) is not null))
                  AND (listLop IS NULL OR STU.LOP IN (SELECT regexp_substr(listLop, '[^,]+', 1, level)
                                                      from DUAL
                                                      connect by regexp_substr(listLop, '[^,]+', 1, level) is not null))
                  AND (listLoaiHinhDaoTao IS NULL OR
                       STU.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                                 from dual
                                                 connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
                  AND (listTinhTrangSinhVien IS NULL OR
                       STU.TINH_TRANG IN (SELECT regexp_substr(listTinhTrangSinhVien, '[^,]+', 1, level)
                                          from DUAL
                                          connect by regexp_substr(listTinhTrangSinhVien, '[^,]+', 1, level) is not null))
                  AND (gender IS NOT NULL AND (0 || STU.GIOI_TINH) = gender OR gender IS NULL))
--                 AND (SBTC.MA_CHA IS NULL AND SBTC.KICH_HOAT = '1')
                AND (isComplete IS NULL OR (isComplete = 1 and SVTKDRL.TK_SUBMIT is not null) OR (isComplete = 0 and SVTKDRL.TK_SUBMIT is null))
                AND (searchTerm = ''
                  OR LOWER(TRIM(STU.MSSV)) = lower(trim(searchTerm))
                  OR LOWER(TRIM(STU.HO || ' ' || STU.TEN)) LIKE ST
                  OR LOWER(STU.MA_NGANH) LIKE ST
                  OR LOWER(STU.LOP) LIKE ST
                  OR LOWER(STU.DIEN_THOAI_CA_NHAN) LIKE ST
                  OR LOWER(STU.DIEN_THOAI_LIEN_LAC) LIKE ST
                  OR LOWER(STU.EMAIL_CA_NHAN) LIKE ST)
              GROUP BY STU.MSSV, STU.HO, STU.TEN, LHDT.TEN, STU.LOAI_HINH_DAO_TAO, TTSV.TEN, STU.TINH_TRANG, STU.KHOA,
                       KHOA.TEN, STU.MA_NGANH, STU.LOP, NDT.TEN_NGANH, STU.NAM_TUYEN_SINH, STU.CAN_EDIT, stu.MA_CTDT,
                       SVTKDRL.TK_SUBMIT, SVTKDRL.LY_DO_F, SVTKDRL.F_SUBMIT, DTDTB.DIEM_TRUNG_BINH, SVTKDRL.DIEM_TB, SVTKDRL.LY_DO_TK
              ORDER BY CASE
                           WHEN STU.TINH_TRANG = '1' THEN 0
                           ELSE 1
                           END, STU.TEN ASC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;

    RETURN STUDENT_INFO;
end;
CREATE OR REPLACE FUNCTION SV_DS_MIEN_GIAM_GET_VALID(timeline IN NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    open my_cursor for
        SELECT DSMG.ID                                                       as "id",
               DSMG.MSSV                                                     AS "mssv",
               (STU.HO || ' ' || STU.TEN)                                    AS "hoTen",
               INITCAP(STU.HO)                                               AS "hoSinhVien",
               INITCAP(STU.TEN)                                              AS "tenSinhVien",
               DDT.TEN                                                       AS "danToc",
               CASE WHEN STU.TINH_TRANG != 1 THEN 0 ELSE DSDTMG.DINH_MUC END AS "mucHuong",
               DDV.TEN                                                       AS "tenKhoa",
               DSDTMG.TEN                                                    AS "doiTuong",
               DL.NIEN_KHOA                                                  AS "khoaHoc",
               STU.LOP                                                       AS "maLop",
               MNMG.NAM_HOC                                                  AS "namHoc",
               MNMG.HOC_KY                                                   AS "hocKy",
               DSMG.QD_ID                                                    AS "qdId",
               SDK.SO_CONG_VAN                                               as "soCongVan",
               DSMG.TIME_START                                               as "timeStart",
               DSMG.TIME_END                                                 as "timeEnd",
               DSMG.LOAI_MIEN_GIAM                                           as "loaiMienGiam",

               CASE
                   WHEN STU.NGAY_SINH IS NULL OR STU.NGAY_SINH <= 0 THEN ''
                   ELSE
                       (select to_char(to_date('01/01/1970', 'dd/mm/yyyy') +
                                       (STU.NGAY_SINH + 14 * 60 * 60 * 1000) / 1000 / 60 / 60 / 24,
                                       'DD/MM/YYYY') datestr
                        from dual) END
                                                                             AS "ngaySinh",
               STU.LOAI_HINH_DAO_TAO                                         AS "loaiHinhDaoTao",
               DMTT.TEN                                                      AS "tinhTrang",
               DMTT.MA                                                       AS "maTinhTrang",
               CASE WHEN MGH.MSSV IS NULL THEN '0' ELSE '1' END              AS "isHoan",
               MGH.LY_DO                                                     AS "lyDoHoan"
        FROM SV_DS_MIEN_GIAM DSMG
                 LEFT JOIN FW_STUDENT STU ON DSMG.MSSV = STU.MSSV
                 LEFT JOIN DM_TINH_TRANG_SINH_VIEN DMTT ON DMTT.MA = STU.TINH_TRANG
                 LEFT JOIN SV_MANAGE_MIEN_GIAM MNMG ON MNMG.ID = DSMG.QD_ID
                 left join HCTH_SO_DANG_KY SDK on SDK.ID = MNMG.SO_QUYET_DINH
                 LEFT JOIN DM_SV_DOI_TUONG_MIEN_GIAM DSDTMG on DSDTMG.MA = DSMG.LOAI_MIEN_GIAM
                 LEFT JOIN DM_DON_VI DDV ON DDV.MA = STU.KHOA
                 LEFT JOIN DM_DAN_TOC DDT on DDT.MA = STU.DAN_TOC
                 LEFT JOIN DT_LOP DL on STU.LOP = DL.MA_LOP
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO HDT on STU.LOAI_HINH_DAO_TAO = HDT.MA
                 LEFT JOIN SV_DS_MIEN_GIAM_HOAN MGH ON DSMG.MSSV = MGH.MSSV AND MGH.TIME_START <= timeline and
                                                       (MGH.TIME_END is null or timeline < MGH.TIME_END)
        WHERE timeline between DSMG.TIME_START and DSMG.TIME_END
        ORDER BY DSMG.ID DESC;

    RETURN my_cursor;
END;
CREATE OR REPLACE FUNCTION SV_MANAGE_QUYET_DINH_GET_DATA(paramid IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT MNQD.FORM_TYPE                                                                              AS "maForm",
               HSDK.SO_CONG_VAN                                                                            AS "soQuyetDinh",
               UPPER(MNQD.STAFF_SIGN_POSITION)                                                             AS "chucVu",
               FWSTU.MSSV                                                                                  AS "mssv",
               UPPER(DV.TEN)                                                                               AS "donVi",
               FWFT.PARAMETERS                                                                             AS "paramaters",
               FWFT.SRC_PATH                                                                               AS "tenFile",
               FWFT.KIEU_FORM                                                                              AS "kieuForm",
               MNQD.DATA_CUSTOM                                                                            AS "dataCustom",
               INITCAP(SIGN.HO || ' ' || SIGN.TEN)                                                         AS "nguoiKy",
               FWFT.NAM_HOC                                                                                AS "namHoc",
               QDV.SO_QUYET_DINH_RA_TRUOC                                                                  AS "soQuyetDinhRaTruoc",
               CASE
                   WHEN LOWER(MNQD.STAFF_SIGN_POSITION) = 'phó hiệu trưởng' THEN 'KT. '
                   ELSE ' ' end                                                                            AS "kyThay",
               CASE
                   WHEN LOWER(MNQD.STAFF_SIGN_POSITION) = 'phó hiệu trưởng' THEN 'PHÓ HIỆU TRƯỞNG'
                   ELSE ' ' end                                                                            AS "phoHieuTruong",
               (CASE
                    WHEN MNQD.NGAY_KY = '0' THEN ' '
                    ELSE
                        (select to_char(to_date('01/01/1970', 'dd/mm/yyyy') +
                                        (MNQD.NGAY_KY + 14 * 60 * 60 * 1000) / 1000 / 60 / 60 / 24,
                                        'DD') datestr
                         from dual) END)
                                                                                                           AS "ngayKy",
               (CASE
                    WHEN MNQD.NGAY_KY = '0' THEN ' '
                    ELSE
                        (SELECT CASE
                                    WHEN TO_NUMBER(TO_CHAR(TO_DATE('01/01/1970', 'dd/mm/yyyy') +
                                                           (MNQD.NGAY_KY + 14 * 60 * 60 * 1000) / 1000 / 60 / 60 /
                                                           24, 'MM')) < 10
                                        THEN
                                        CASE
                                            WHEN TO_NUMBER(TO_CHAR(TO_DATE('01/01/1970', 'dd/mm/yyyy') +
                                                                   (MNQD.NGAY_KY + 14 * 60 * 60 * 1000) / 1000 / 60 /
                                                                   60 / 24, 'MM')) < 3
                                                THEN LPAD(TO_CHAR(TO_DATE('01/01/1970', 'dd/mm/yyyy') +
                                                                  (MNQD.NGAY_KY + 14 * 60 * 60 * 1000) / 1000 / 60 /
                                                                  60 / 24, 'MM'), 2, '0')
                                            ELSE SUBSTR(TO_CHAR(TO_DATE('01/01/1970', 'dd/mm/yyyy') +
                                                                (MNQD.NGAY_KY + 14 * 60 * 60 * 1000) / 1000 / 60 /
                                                                60 / 24, 'MM'), 2)
                                            END
                                    ELSE TO_CHAR(TO_DATE('01/01/1970', 'dd/mm/yyyy') +
                                                 ('1676826000000' + 14 * 60 * 60 * 1000) / 1000 / 60 / 60 / 24, 'MM')
                                    END
                         FROM dual) END)                                                                   AS "thangKy",
               (CASE
                    WHEN MNQD.NGAY_KY = '0' THEN ' '
                    ELSE
                        (select to_char(to_date('01/01/1970', 'dd/mm/yyyy') +
                                        (MNQD.NGAY_KY + 14 * 60 * 60 * 1000) / 1000 / 60 / 60 / 24,
                                        'YYYY') datestr
                         from dual) END)
                                                                                                           AS "namKy",
               (CASE
                    WHEN QDR.NGAY_BAT_DAU = '0' THEN ' '
                    ELSE
                        (select to_char(to_date('01/01/1970', 'dd/mm/yyyy') +
                                        (QDR.NGAY_BAT_DAU + 14 * 60 * 60 * 1000) / 1000 / 60 / 60 / 24,
                                        'MM/YYYY') datestr
                         from dual) END)
                                                                                                           AS "thangBatDauNghi",
               (CASE
                    WHEN QDR.NGAY_HET_HAN = '0' THEN ' '
                    ELSE
                        (select to_char(to_date('01/01/1970', 'dd/mm/yyyy') +
                                        (QDR.NGAY_HET_HAN + 14 * 60 * 60 * 1000) / 1000 / 60 / 60 / 24,
                                        'MM/YYYY') datestr
                         from dual) END)
                                                                                                           AS "thangKetThucNghi",
               DTN.TEN_NGANH                                                                               AS "tenNganhMoi",
               DTNDT.TEN_NGANH                                                                             AS "tenNganhHienTai",
               QDV.KHOA_DT_HIEN_TAI                                                                        AS "khoaDtHienTai",
               DTL.KHOA_SINH_VIEN                                                                          AS "khoaDtMoi",
               DMDV.TEN                                                                                    AS "tenKhoaMoi",
               DMK.TEN                                                                                     AS "tenKhoaHienTai",
               LHDT.TEN                                                                                    AS "lhdtMoi",
               LHDTHT.TEN                                                                                  AS "lhdtHienTai",
               CASE
                   WHEN DTKDT.DOT_TUYEN_SINH IS NOT NULL THEN ('đợt ' || DTKDT.DOT_TUYEN_SINH)
                   ELSE '' END                                                                             AS "dotTuyenSinh"
        FROM SV_MANAGE_QUYET_DINH MNQD
                 LEFT JOIN FW_STUDENT FWSTU ON FWSTU.EMAIL_TRUONG = MNQD.STUDENT
                 LEFT JOIN DT_LOP DTL ON DTL.MA_LOP = FWSTU.LOP
                 LEFT JOIN SV_DM_FORM_TYPE FWFT ON FWFT.MA = MNQD.FORM_TYPE
                 LEFT JOIN SV_MANAGE_QUYET_DINH_VAO QDV ON QDV.QD_ID = MNQD.ID
                 LEFT JOIN SV_MANAGE_QUYET_DINH_RA QDR ON QDR.QD_ID = MNQD.ID
                 LEFT JOIN DT_NGANH_DAO_TAO DTN ON DTN.MA_NGANH = QDV.NGANH_MOI
                 LEFT JOIN DM_DON_VI DMDV ON DMDV.MA = DTN.KHOA
                 LEFT JOIN DT_NGANH_DAO_TAO DTNDT ON DTNDT.MA_NGANH = QDV.NGANH_HIEN_TAI
                 LEFT JOIN DM_DON_VI DMK ON DMK.MA = DTNDT.KHOA
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = QDV.LHDT_MOI
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDTHT ON LHDTHT.MA = QDV.LHDT_HIEN_TAI
                 LEFT JOIN DT_KHUNG_DAO_TAO KCTDT ON KCTDT.MA_CTDT = DTL.MA_CTDT
                 LEFT JOIN DT_KHOA_DAO_TAO DTKDT ON DTKDT.MA_KHOA = KCTDT.DOT_TRUNG_TUYEN
                 LEFT JOIN TCHC_CAN_BO SIGN ON SIGN.SHCC = MNQD.STAFF_SIGN
                 LEFT JOIN DM_DON_VI DV ON DV.MA = SIGN.MA_DON_VI
                 LEFT JOIN HCTH_SO_DANG_KY HSDK on MNQD.SO_QUYET_DINH = HSDK.ID
        WHERE MNQD.ID = paramid;
    RETURN my_cursor;
END;
CREATE OR REPLACE FUNCTION DM_DON_VI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING,
                                      totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DM_DON_VI dv
             LEFT JOIN DM_LOAI_DON_VI ldv on dv.MA_PL = ldv.MA
    WHERE searchTerm = ''
       OR LOWER(TRIM(dv.TEN)) LIKE sT
       OR LOWER(TRIM(dv.TEN_TIENG_ANH)) LIKE ST;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT dv.MA               AS                     "ma",
                        dv.TEN              AS                     "ten",
                        dv.TEN_TIENG_ANH    AS                     "tenTiengAnh",
                        dv.TEN_VIET_TAT     AS                     "tenVietTat",
                        dv.QD_THANH_LAP     AS                     "qdThanhLap",
                        dv.QD_XOA_TEN       AS                     "qdXoaTen",
                        dv.MA_PL            AS                     "maPl",
                        ldv.TEN             AS                     "tenLoaiDonVi",
                        dv.GHI_CHU          AS                     "ghiChu",
                        dv.KICH_HOAT        AS                     "kichHoat",
                        dv.DUONG_DAN        AS                     "duongDan",
                        dv.IMAGE            AS                     "image",
                        dv.IMAGE_DISPLAY    AS                     "imageDisplay",
                        dv.IMAGE_DISPLAY_TA AS                     "imageDisplayTa",
                        dv.PRE_SHCC         AS                     "preShcc",
                        dv.HOME_LANGUAGE    as                     "homeLanguage",
                        ROW_NUMBER() OVER (ORDER BY MA_PL, dv.TEN) R
                 FROM DM_DON_VI dv
                          LEFT JOIN DM_LOAI_DON_VI ldv on dv.MA_PL = ldv.MA
                 WHERE searchTerm = ''
                    OR LOWER(TRIM(dv.TEN)) LIKE sT
                    OR LOWER(TRIM(dv.TEN_TIENG_ANH)) LIKE ST
                 ORDER BY NLSSORT(dv.TEN, 'nls_sort = Vietnamese')
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
CREATE OR REPLACE FUNCTION DT_DM_MON_HOC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                          searchTerm IN STRING, totalItem OUT NUMBER, pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    my_cursor       SYS_REFCURSOR;
    sT              STRING(502) := '%' || lower(searchTerm) || '%';
    donViFilter     STRING(502);
    ks_ma           STRING(502);
    ks_ten          STRING(2000);
    ks_khoa         STRING(20);
    ks_tongTC       STRING(20);
    ks_tclt         STRING(20);
    ks_tcth         STRING(20);
    ks_tongTiet     STRING(20);
    ks_tietLT       STRING(20);
    ks_tietTH       STRING(20);
    ks_phanTramDiem STRING(20);
    ks_kichHoat     STRING(20);
    sortKey         STRING(20);
    sortMode        STRING(20);

BEGIN
    SELECT JSON_VALUE(filter, '$.donViFilter') INTO donViFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ma') INTO ks_ma FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ten') INTO ks_ten FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_khoa') INTO ks_khoa FROM DUAL;

    SELECT JSON_VALUE(filter, '$.ks_tongTC') INTO ks_tongTC FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tclt') INTO ks_tclt FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tcth') INTO ks_tcth FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tongTiet') INTO ks_tongTiet FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tietLT') INTO ks_tietLT FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tietTH') INTO ks_tietTH FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phanTramDiem') INTO ks_phanTramDiem FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_kichHoat') INTO ks_kichHoat FROM DUAL;

    SELECT JSON_VALUE(filter, '$.sortKey') INTO sortKey FROM DUAL;
    SELECT JSON_VALUE(filter, '$.sortMode') INTO sortMode FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM DM_MON_HOC MH
             LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = MH.KHOA
             LEFT JOIN (SELECT LISTAGG((PTDIEM.LOAI_THANH_PHAN || ': ' || PTDIEM.PHAN_TRAM), '; ')
                                       WITHIN GROUP (ORDER BY NULL) AS "phanTram",
                               PTDIEM.MA_MON_HOC                    AS "maMon"
                        FROM DT_MON_HOC_DIEM_THANH_PHAN PTDIEM
                        GROUP BY PTDIEM.MA_MON_HOC) DIEMTP ON DIEMTP."maMon" = MH.MA
    WHERE ((ks_ma IS NULL OR lower(MH.MA) LIKE ('%' || lower(ks_ma) || '%'))
        AND (ks_ten IS NULL OR lower(MH.TEN) LIKE ('%' || lower(ks_ten) || '%'))
        AND (ks_khoa IS NULL OR lower(KHOA.TEN) LIKE ('%' || lower(ks_khoa) || '%'))
        AND (ks_tongTC IS NULL OR TO_NUMBER(ks_tongTC) = MH.TONG_TIN_CHI)
        AND (ks_tclt IS NULL OR TO_NUMBER(ks_tclt) = MH.TIN_CHI_LT)
        AND (ks_tcth IS NULL OR TO_NUMBER(ks_tcth) = MH.TIN_CHI_TH)
        AND (ks_tongTiet IS NULL OR TO_NUMBER(ks_tongTiet) = MH.TONG_TIET)
        AND (ks_tietLT IS NULL OR TO_NUMBER(ks_tietLT) = MH.TIET_LT)
        AND (ks_tietTH IS NULL OR TO_NUMBER(ks_tietTH) = MH.TIET_TH)
        AND (ks_kichHoat IS NULL OR TO_NUMBER(ks_kichHoat) = MH.KICH_HOAT))
      AND (donViFilter IS NULL OR donViFilter = MH.KHOA)
      AND (donViFilter IS NULL OR donViFilter = MH.KHOA)
      AND (searchTerm = ''
        OR LOWER(TRIM(MH.MA)) LIKE sT
        OR LOWER(TRIM(MH.TEN)) LIKE sT
        OR LOWER(TRIM(KHOA.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);


    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT MH.MA             AS              "ma",
                     MH.TEN            AS              "ten",
                     MH.KHOA           AS              "khoa",
                     KHOA.TEN          AS              "tenKhoa",
                     MH.IS_THE_CHAT    AS              "isTheChat",
                     MH.KICH_HOAT      AS              "kichHoat",
                     MH.PHAN_HOI       AS              "phanHoi",
                     MH.TIEN_QUYET     AS              "tienQuyet",
                     MH.TIET_LT        AS              "tietLt",
                     MH.TIET_TH        AS              "tietTh",
                     MH.TIN_CHI_LT     AS              "tinChiLt",
                     MH.TIN_CHI_TH     AS              "tinChiTh",
                     MH.TONG_TIET      AS              "tongTiet",
                     MH.TONG_TIN_CHI   AS              "tongTinChi",
                     DIEMTP."phanTram" AS              "phanTramDiem",
                     SUB_MH.SO_LUONG      AS              "soHocPhan",
                     ROW_NUMBER() OVER (ORDER BY NULL) R
              FROM DM_MON_HOC MH
                       LEFT JOIN (SELECT TKB.MA_MON_HOC, COUNT(TKB.MA_HOC_PHAN) AS SO_LUONG
                                  FROM DT_THOI_KHOA_BIEU TKB
                                  GROUP BY TKB.MA_MON_HOC) SUB_MH ON SUB_MH.MA_MON_HOC = MH.MA
                       LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = MH.KHOA
                       LEFT JOIN (SELECT LISTAGG((PTDIEM.LOAI_THANH_PHAN || ': ' || PTDIEM.PHAN_TRAM), '; ')
                                                 WITHIN GROUP (ORDER BY NULL) AS "phanTram",
                                         PTDIEM.MA_MON_HOC                    AS "maMon"
                                  FROM DT_MON_HOC_DIEM_THANH_PHAN PTDIEM
                                  GROUP BY PTDIEM.MA_MON_HOC) DIEMTP ON DIEMTP."maMon" = MH.MA
              WHERE ((ks_ma IS NULL OR lower(MH.MA) LIKE ('%' || lower(ks_ma) || '%'))
                  AND (ks_ten IS NULL OR lower(MH.TEN) LIKE ('%' || lower(ks_ten) || '%'))
                  AND (ks_khoa IS NULL OR lower(KHOA.TEN) LIKE ('%' || lower(ks_khoa) || '%'))
                  AND (ks_tongTC IS NULL OR TO_NUMBER(ks_tongTC) = MH.TONG_TIN_CHI)
                  AND (ks_tclt IS NULL OR TO_NUMBER(ks_tclt) = MH.TIN_CHI_LT)
                  AND (ks_tcth IS NULL OR TO_NUMBER(ks_tcth) = MH.TIN_CHI_TH)
                  AND (ks_tongTiet IS NULL OR TO_NUMBER(ks_tongTiet) = MH.TONG_TIET)
                  AND (ks_tietLT IS NULL OR TO_NUMBER(ks_tietLT) = MH.TIET_LT)
                  AND (ks_tietTH IS NULL OR TO_NUMBER(ks_tietTH) = MH.TIET_TH)
                  AND (ks_kichHoat IS NULL OR TO_NUMBER(ks_kichHoat) = MH.KICH_HOAT))
                AND (donViFilter IS NULL OR donViFilter = MH.KHOA)
                AND (donViFilter IS NULL OR donViFilter = MH.KHOA)
                AND (searchTerm = ''
                  OR LOWER(TRIM(MH.MA)) LIKE sT
                  OR LOWER(TRIM(MH.TEN)) LIKE sT
                  OR LOWER(TRIM(KHOA.TEN)) LIKE sT)
              ORDER BY CASE
                           WHEN sortMode = 'ASC' THEN
                               DECODE(sortKey,
                                      'ma', NLSSORT(MH.MA, 'NLS_SORT = VIETNAMESE'),
                                      'ten', NLSSORT(MH.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'khoa', NLSSORT(KHOA.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'tongTC', NLSSORT(MH.TONG_TIN_CHI, 'NLS_SORT = BINARY_AI'),
                                      'tclt', NLSSORT(MH.TIN_CHI_LT, 'NLS_SORT = BINARY_AI'),
                                      'tcth', NLSSORT(MH.TIN_CHI_TH, 'NLS_SORT = BINARY_AI'),
                                      'tongTiet', NLSSORT(MH.TONG_TIET, 'NLS_SORT = BINARY_AI'),
                                      'tietLT', NLSSORT(MH.TIET_LT, 'NLS_SORT = BINARY_AI'),
                                      'tietTH', NLSSORT(MH.TIET_TH, 'NLS_SORT = BINARY_AI'),
                                      'phanTramDiem', NLSSORT(DIEMTP."phanTram", 'NLS_SORT = VIETNAMESE'),
                                      'kichHoat', NLSSORT(MH.KICH_HOAT, 'NLS_SORT = BINARY_AI'),
                                      NLSSORT(MH.MA, 'NLS_SORT = BINARY_AI'))
                           END ASC NULLS LAST,
                       CASE
                           WHEN sortMode = 'DESC' THEN
                               DECODE(sortKey,
                                      'ma', NLSSORT(MH.MA, 'NLS_SORT = VIETNAMESE'),
                                      'ten', NLSSORT(MH.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'khoa', NLSSORT(KHOA.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'tongTC', NLSSORT(MH.TONG_TIN_CHI, 'NLS_SORT = BINARY_AI'),
                                      'tclt', NLSSORT(MH.TIN_CHI_LT, 'NLS_SORT = BINARY_AI'),
                                      'tcth', NLSSORT(MH.TIN_CHI_TH, 'NLS_SORT = BINARY_AI'),
                                      'tongTiet', NLSSORT(MH.TONG_TIET, 'NLS_SORT = BINARY_AI'),
                                      'tietLT', NLSSORT(MH.TIET_LT, 'NLS_SORT = BINARY_AI'),
                                      'tietTH', NLSSORT(MH.TIET_TH, 'NLS_SORT = BINARY_AI'),
                                      'phanTramDiem', NLSSORT(DIEMTP."phanTram", 'NLS_SORT = VIETNAMESE'),
                                      'kichHoat', NLSSORT(MH.KICH_HOAT, 'NLS_SORT = BINARY_AI'),
                                      NLSSORT(MH.MA, 'NLS_SORT = BINARY_AI'))
                           END DESC NULLS LAST)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
CREATE OR REPLACE FUNCTION DT_DANG_KY_HOC_PHAN_GET_KET_QUA_DKY(maSinhVien IN STRING, filter IN STRING) RETURN SYS_REFCURSOR
AS
    SCHEDULE_INFO    SYS_REFCURSOR;
    hocKy            STRING(50);
    namHoc           STRING(50);
    tinhTrang        NUMBER;
    ks_maHocPhanKQ   STRING(50);
    ks_tenMonHocKQ   STRING(1000);
    ks_siSoKQ        STRING(50);
    ks_maLoaiDkyKQ   STRING(50);
    ks_tinChiKQ      STRING(50);
    ks_tongTietKQ    STRING(50);
    ks_phongKQ       STRING(50);
    ks_thuKQ         STRING(50);
    ks_tietKQ        STRING(50);
    ks_giangVienKQ   STRING(50);
    ks_troGiangKQ    STRING(50);
    ks_ngayBatDauKQ  STRING(50);
    ks_ngayKetThucKQ STRING(50);
    sortKey          STRING(20);
    sortMode         STRING(20);

BEGIN
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrang') INTO tinhTrang FROM DUAL;

    SELECT JSON_VALUE(filter, '$.ks_maHocPhanKQ') INTO ks_maHocPhanKQ FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tenMonHocKQ') INTO ks_tenMonHocKQ FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_siSoKQ') INTO ks_siSoKQ FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_maLoaiDkyKQ') INTO ks_maLoaiDkyKQ FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tinChiKQ') INTO ks_tinChiKQ FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tongTietKQ') INTO ks_tongTietKQ FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phongKQ') INTO ks_phongKQ FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_thuKQ') INTO ks_thuKQ FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tietKQ') INTO ks_tietKQ FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_giangVienKQ') INTO ks_giangVienKQ FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_troGiangKQ') INTO ks_troGiangKQ FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngayBatDauKQ') INTO ks_ngayBatDauKQ FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngayKetThucKQ') INTO ks_ngayKetThucKQ FROM DUAL;

    SELECT JSON_VALUE(filter, '$.sortKey') INTO sortKey FROM DUAL;
    SELECT JSON_VALUE(filter, '$.sortMode') INTO sortMode FROM DUAL;

    OPEN SCHEDULE_INFO FOR
        SELECT TKB.ID                 AS "id",
               DKHP.MA_HOC_PHAN       AS "maHocPhan",
               DKHP.TIME_MODIFIED     AS "ngayDangKy",
               DKHP.MA_LOAI_DKY       AS "maLoaiDky",
               TKB.TINH_TRANG         AS "tinhTrang",
               DKHP.HOC_KY            AS "hocKy",
               DKHP.NAM_HOC           AS "namHoc",
               TKB.LOAI_HINH_DAO_TAO  AS "loaiHinhDaoTao",
               TKB.KHOA_DANG_KY       AS "khoaDangKy",
               TKB.KHOA_SINH_VIEN     AS "khoaSinhVien",
               DKHP.MA_MON_HOC        AS "maMonHoc",
               TKB.SO_LUONG_DU_KIEN   AS "soLuongDuKien",
               NGAYHOCBATDAU.NGAYHOC  AS "ngayBatDau",
               NGAYHOCKETTHUC.NGAYHOC AS "ngayKetThuc",
               DMMH.TONG_TIN_CHI      AS "tongTinChi",
               DMMH.TONG_TIET         AS "tongTiet",
               GV.giangVien           AS "giangVien",
               GV.troGiang            AS "troGiang",
               TKB.PHONG              AS "phong",
               TKB.THU                AS "thu",
               TKB.TIET_BAT_DAU       AS "tietBatDau",
               TKB.SO_TIET_BUOI       AS "soTietBuoi",
               DMMH.TEN               AS "tenMonHoc",
               TKB.CO_SO              AS "coSo",
               TKB.LOAI_MON_HOC       AS "loaiMonHoc",
               TKB.BUOI               AS "buoi",
               lop.maLop              AS "lop",
               SUB_DKHP.SI_SO         as "siSo",
               TEMPSUBHP."hocPhi"     AS "hocPhi",
               TEMPSUBHP."daDong"     AS "daDong"
        FROM DT_DANG_KY_HOC_PHAN DKHP
                 LEFT JOIN (SELECT MA_HOC_PHAN, COUNT(*) AS SI_SO
                            FROM DT_DANG_KY_HOC_PHAN
                            GROUP BY MA_HOC_PHAN) SUB_DKHP ON SUB_DKHP.MA_HOC_PHAN = DKHP.MA_HOC_PHAN
                 LEFT JOIN DT_THOI_KHOA_BIEU TKB ON DKHP.MA_HOC_PHAN = TKB.MA_HOC_PHAN
                 LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = DKHP.MA_MON_HOC
                 LEFT JOIN (SELECT ID_THOI_KHOA_BIEU, MIN(NGAY_HOC) AS NGAYHOC
                            FROM DT_THOI_KHOA_BIEU_CUSTOM
                            GROUP BY ID_THOI_KHOA_BIEU) NGAYHOCBATDAU ON NGAYHOCBATDAU.ID_THOI_KHOA_BIEU = TKB.ID
                 LEFT JOIN (SELECT ID_THOI_KHOA_BIEU, MAX(NGAY_HOC) AS NGAYHOC
                            FROM DT_THOI_KHOA_BIEU_CUSTOM
                            GROUP BY ID_THOI_KHOA_BIEU) NGAYHOCKETTHUC ON NGAYHOCKETTHUC.ID_THOI_KHOA_BIEU = TKB.ID
                 LEFT JOIN (SELECT NDT.ID_THOI_KHOA_BIEU,
                                   (SELECT LISTAGG(eNDT.ID_NGANH, ',') WITHIN GROUP (ORDER BY NULL)
                                    FROM DT_THOI_KHOA_BIEU_NGANH eNDT
                                    WHERE eNDT.ID_THOI_KHOA_BIEU = NDT.ID_THOI_KHOA_BIEU)
                                       AS maLop
                            FROM DT_THOI_KHOA_BIEU_NGANH NDT
                            GROUP BY NDT.ID_THOI_KHOA_BIEU) lop ON lop.ID_THOI_KHOA_BIEU = TKB.ID
                 LEFT JOIN (SELECT GV.ID_THOI_KHOA_BIEU,
                                   (SELECT LISTAGG(gv, ',')
                                                   WITHIN GROUP (ORDER BY NULL)
                                    FROM (SELECT DISTINCT CASE
                                                              WHEN CB.SHCC IS NOT NULL
                                                                  THEN (TD.VIET_TAT || ' ' || upper(CB.HO) ||
                                                                        ' ' || upper(CB.TEN))
                                                              ELSE
                                                                  (CBNT.TRINH_DO || ' ' || upper(CBNT.HO) ||
                                                                   ' ' || upper(CBNT.TEN)) END AS gv
                                          FROM DT_THOI_KHOA_BIEU_GIANG_VIEN TKBGV
                                                   LEFT JOIN TCHC_CAN_BO CB ON CB.SHCC = TKBGV.GIANG_VIEN
                                                   LEFT JOIN DT_CAN_BO_NGOAI_TRUONG CBNT ON TKBGV.GIANG_VIEN = CBNT.SHCC
                                                   LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                                          WHERE GV.ID_THOI_KHOA_BIEU = TKBGV.ID_THOI_KHOA_BIEU
                                            AND TKBGV.TYPE = 'GV')) AS giangVien,

                                   (SELECT LISTAGG(tg, ',')
                                                   WITHIN GROUP (ORDER BY NULL)
                                    FROM (SELECT DISTINCT CASE
                                                              WHEN CB.SHCC IS NOT NULL
                                                                  THEN (TD.VIET_TAT || ' ' || upper(CB.HO) ||
                                                                        ' ' || upper(CB.TEN))
                                                              ELSE
                                                                  (CBNT.TRINH_DO || ' ' || upper(CBNT.HO) ||
                                                                   ' ' || upper(CBNT.TEN)) END AS tg
                                          FROM DT_THOI_KHOA_BIEU_GIANG_VIEN TKBGV
                                                   LEFT JOIN TCHC_CAN_BO CB ON CB.SHCC = TKBGV.GIANG_VIEN
                                                   LEFT JOIN DT_CAN_BO_NGOAI_TRUONG CBNT ON TKBGV.GIANG_VIEN = CBNT.SHCC
                                                   LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                                          WHERE GV.ID_THOI_KHOA_BIEU = TKBGV.ID_THOI_KHOA_BIEU
                                            AND TKBGV.TYPE = 'TG')) AS troGiang
                            FROM DT_THOI_KHOA_BIEU_GIANG_VIEN GV
                            GROUP BY GV.ID_THOI_KHOA_BIEU) GV ON GV.ID_THOI_KHOA_BIEU = TKB.ID
                 LEFT JOIN (SELECT DISTINCT HP.MA_HOC_PHAN      AS "maHocPhan",
                                            HP.SO_TIEN_CAN_DONG AS "hocPhi",
                                            HP.SO_TIEN_DA_DONG  AS "daDong"
                            FROM TC_HOC_PHI_SUB_DETAIL HP
                            WHERE HP.MSSV = maSinhVien) TEMPSUBHP ON TEMPSUBHP."maHocPhan" = DKHP.MA_HOC_PHAN
        WHERE DKHP.MSSV = maSinhVien
          AND (hocKy IS NULL OR DKHP.HOC_KY = hocKy)
          AND (namHoc IS NULL OR DKHP.NAM_HOC = namHoc)
          AND (
                (ks_maHocPhanKQ IS NULL OR lower(TKB.MA_HOC_PHAN) LIKE ('%' || lower(trim(ks_maHocPhanKQ)) || '%'))
                AND (ks_tenMonHocKQ IS NULL OR lower(DMMH.TEN) LIKE ('%' || lower(trim(ks_tenMonHocKQ)) || '%'))
                AND (ks_siSoKQ IS NULL OR lower((SELECT COUNT(temp.MSSV)
                                                 FROM DT_DANG_KY_HOC_PHAN temp
                                                 WHERE temp.MA_HOC_PHAN = TKB.MA_HOC_PHAN
                                                 GROUP BY temp.MA_HOC_PHAN)) LIKE
                                          ('%' || lower(trim(ks_siSoKQ)) || '%'))
                AND (ks_maLoaiDkyKQ IS NULL OR ks_maLoaiDkyKQ = DKHP.MA_LOAI_DKY)
                AND (ks_tinChiKQ IS NULL OR lower(DMMH.TONG_TIN_CHI) LIKE ('%' || lower(trim(ks_tinChiKQ)) || '%'))
                AND (ks_tongTietKQ IS NULL OR lower(DMMH.TONG_TIET) LIKE ('%' || lower(trim(ks_tongTietKQ)) || '%'))
                AND (ks_phongKQ IS NULL OR lower(TKB.PHONG) LIKE ('%' || lower(trim(ks_phongKQ)) || '%'))
                AND (ks_thuKQ IS NULL OR lower(TKB.THU) LIKE ('%' || lower(trim(ks_thuKQ)) || '%'))
                AND (ks_tietKQ IS NULL OR lower(TKB.TIET_BAT_DAU) LIKE ('%' || lower(trim(ks_tietKQ)) || '%'))
                AND (ks_giangVienKQ IS NULL OR lower(GV.giangVien) LIKE ('%' || lower(trim(ks_giangVienKQ)) || '%'))
                AND (ks_troGiangKQ IS NULL OR lower(GV.troGiang) LIKE ('%' || lower(trim(ks_troGiangKQ)) || '%'))
                AND
                (ks_ngayBatDauKQ IS NULL OR lower(TKB.NGAY_BAT_DAU) LIKE ('%' || lower(trim(ks_ngayBatDauKQ)) || '%'))
                AND (ks_ngayKetThucKQ IS NULL OR
                     lower(TKB.NGAY_KET_THUC) LIKE ('%' || lower(trim(ks_ngayKetThucKQ)) || '%'))
            )
        ORDER BY CASE
                     WHEN sortMode = 'ASC' THEN
                         DECODE(sortKey,
                                'maHocPhanKQ', NLSSORT(TKB.MA_HOC_PHAN, 'NLS_SORT = BINARY_AI'),
                                'tenMonHocKQ', NLSSORT(DMMH.TEN, 'NLS_SORT = VIETNAMESE'),
                                'siSoKQ', NLSSORT((SELECT COUNT(temp.MSSV)
                                                   FROM DT_DANG_KY_HOC_PHAN temp
                                                   WHERE temp.MA_HOC_PHAN = TKB.MA_HOC_PHAN
                                                   GROUP BY temp.MA_HOC_PHAN), 'NLS_SORT = BINARY_AI'),
                                'maLoaiDkyKQ', NLSSORT(DKHP.MA_LOAI_DKY, 'NLS_SORT = BINARY_AI'),
                                'tinChiKQ', NLSSORT(DMMH.TONG_TIN_CHI, 'NLS_SORT = BINARY_AI'),
                                'tongTietKQ', NLSSORT(DMMH.TONG_TIET, 'NLS_SORT = BINARY_AI'),
                                'phongKQ', NLSSORT(TKB.PHONG, 'NLS_SORT = BINARY_AI'),
                                'thuKQ', NLSSORT(TKB.THU, 'NLS_SORT = VIETNAMESE'),
                                'tietKQ', NLSSORT(TKB.TIET_BAT_DAU, 'NLS_SORT = BINARY_AI'),
                                'giangVienKQ', NLSSORT(GV.giangVien, 'NLS_SORT = VIETNAMESE'),
                                'troGiangKQ', NLSSORT(GV.troGiang, 'NLS_SORT = VIETNAMESE'),
                                'ngayBatDauKQ', NLSSORT(TKB.NGAY_BAT_DAU, 'NLS_SORT = BINARY_AI'),
                                'ngayKetThucKQ', NLSSORT(TKB.NGAY_KET_THUC, 'NLS_SORT = BINARY_AI'))
                     END ASC NULLS LAST,
                 CASE
                     WHEN sortMode = 'DESC' THEN
                         DECODE(sortKey,
                                'maHocPhanKQ', NLSSORT(TKB.MA_HOC_PHAN, 'NLS_SORT = BINARY_AI'),
                                'tenMonHocKQ', NLSSORT(DMMH.TEN, 'NLS_SORT = VIETNAMESE'),
                                'siSoKQ', NLSSORT((SELECT COUNT(temp.MSSV)
                                                   FROM DT_DANG_KY_HOC_PHAN temp
                                                   WHERE temp.MA_HOC_PHAN = TKB.MA_HOC_PHAN
                                                   GROUP BY temp.MA_HOC_PHAN), 'NLS_SORT = BINARY_AI'),
                                'maLoaiDkyKQ', NLSSORT(DKHP.MA_LOAI_DKY, 'NLS_SORT = BINARY_AI'),
                                'tinChiKQ', NLSSORT(DMMH.TONG_TIN_CHI, 'NLS_SORT = BINARY_AI'),
                                'tongTietKQ', NLSSORT(DMMH.TONG_TIET, 'NLS_SORT = BINARY_AI'),
                                'phongKQ', NLSSORT(TKB.PHONG, 'NLS_SORT = BINARY_AI'),
                                'thuKQ', NLSSORT(TKB.THU, 'NLS_SORT = VIETNAMESE'),
                                'tietKQ', NLSSORT(TKB.TIET_BAT_DAU, 'NLS_SORT = BINARY_AI'),
                                'giangVienKQ', NLSSORT(GV.giangVien, 'NLS_SORT = VIETNAMESE'),
                                'troGiangKQ', NLSSORT(GV.troGiang, 'NLS_SORT = VIETNAMESE'),
                                'ngayBatDauKQ', NLSSORT(TKB.NGAY_BAT_DAU, 'NLS_SORT = BINARY_AI'),
                                'ngayKetThucKQ', NLSSORT(TKB.NGAY_KET_THUC, 'NLS_SORT = BINARY_AI'))
                     END DESC NULLS LAST;
    return SCHEDULE_INFO;
end ;
CREATE OR REPLACE FUNCTION DT_DANG_KY_HOC_PHAN_CHECK_DIEM(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    maSoSv    STRING(100);
    maMonHoc  STRING(100);

BEGIN
    SELECT JSON_VALUE(filter, '$.maMonHoc') INTO maMonHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.mssv') INTO maSoSv FROM DUAL;

    OPEN my_cursor FOR
        SELECT DKHP.MA_MON_HOC  AS "maMonHoc",
               DKHP.NAM_HOC     AS "namHoc",
               DKHP.HOC_KY      AS "hocKy",
               DKHP.MA_HOC_PHAN AS "maHocPhan",
               DIEM.DIEM        AS "diem"

        FROM DT_DANG_KY_HOC_PHAN DKHP
                 LEFT JOIN DT_DIEM_ALL DIEM ON DIEM.MSSV = DKHP.MSSV AND DIEM.MA_HOC_PHAN = DKHP.MA_HOC_PHAN
        WHERE DKHP.MSSV = maSoSv
          AND DKHP.MA_MON_HOC = maMonHoc
        AND (DIEM.MSSV IS NULL OR DIEM.LOAI_DIEM = 'TK');

    RETURN my_cursor;
end;
CREATE OR REPLACE FUNCTION DT_KIEM_TRA_MA_LOAI_DANG_KY(filter IN STRING) RETURN SYS_REFCURSOR
AS
    DATA   SYS_REFCURSOR;
    maSoSv STRING(20);
    maMon  STRING(20);

BEGIN
    SELECT JSON_VALUE(filter, '$.maSoSv') INTO maSoSv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.maMon') INTO maMon FROM DUAL;


    OPEN DATA FOR
        SELECT DKHP.MA_HOC_PHAN AS "maHocPhan",
               MH.MA            AS "maMonHoc",
               MH.TEN           AS "tenMonHoc",
               DKHP.MA_LOAI_DKY AS "maLoaiDky",
               DIEM.DIEM        AS "diemTongKet",
               DKHP.HOC_KY      AS "hocKy",
               DKHP.NAM_HOC     AS "namHoc"
        FROM DT_DANG_KY_HOC_PHAN DKHP
                 LEFT JOIN DM_MON_HOC MH ON MH.MA = DKHP.MA_MON_HOC
                 LEFT JOIN DT_DIEM_ALL DIEM ON DIEM.MA_HOC_PHAN = DKHP.MA_HOC_PHAN AND DIEM.LOAI_DIEM = 'TK'
        WHERE maSoSv = DKHP.MSSV
          AND maMon = DKHP.MA_MON_HOC
        ORDER BY DKHP.NAM_HOC DESC, DKHP.HOC_KY DESC;
    return DATA;
end ;
CREATE OR REPLACE FUNCTION DT_DIEM_GET_DATA_THI_BY_FILTER(filter IN CLOB, dataSinhVien OUT SYS_REFCURSOR) RETURN SYS_REFCURSOR
AS
    diemCursor      SYS_REFCURSOR;
    listMaHocPhan   STRING(2000);
    listMaGiangVien STRING(2000);
    kyThi           STRING(5);
    studentListMode STRING(1);
BEGIN
    SELECT JSON_VALUE(filter, '$.listMaHocPhan') INTO listMaHocPhan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listMaGiangVien') INTO listMaGiangVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.kyThi') INTO kyThi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.studentListMode') INTO studentListMode FROM DUAL;

    OPEN diemCursor FOR
        SELECT TKB.MA_HOC_PHAN   AS "maHocPhan",
               TKB.BUOI          AS "buoi",
               TKB.HOC_KY        AS "hocKy",
               TKB.NAM_HOC       AS "namHoc",
               TKB.ID_DIEM       AS "idSemester",
               TKB.TEN_NGANH     AS "tenNganh",
               TKB.MA_MON_HOC    AS "maMonHoc",
               TKB.LOAI_HINH     AS "tenHe",
               TKB.NGAY_BAT_DAU  AS "ngayBatDau",
               TKB.NGAY_KET_THUC AS "ngayKetThuc",
               TKB.TIN_CHI       AS "tinChi",
               TKB.TEN_HOC_PHAN  AS "tenMonHoc",
               TKB.TP_HOC_PHAN   AS "tpHocPhan",
               TKB.TP_MON_HOC    AS "tpMonHoc",
               TKB.listNienKhoa  AS "listNienKhoa",
               TKB.LICH_THI      AS "lichThi",
               TKB.TP_MAC_DINH   AS "tpMacDinh",
               TKB.GIANG_VIEN    AS "giangVien"
        FROM (SELECT JSON_ARRAYAGG(JSON_OBJECT(key 'thu' VALUE TO_CHAR(th.TEN),
                                               key 'tgbd' value TO_CHAR(ch.THOI_GIAN_BAT_DAU),
                                               key 'tgkt' value TO_CHAR(CHKT.THOI_GIAN_KET_THUC),
                                               key 'phong' value TO_CHAR(tkb.PHONG)
                                               NULL ON NULL) FORMAT JSON ABSENT ON NULL) as BUOI,
                     TKB.MA_HOC_PHAN,
                     MH.TEN                                                              AS TEN_HOC_PHAN,
                     MH.TONG_TIN_CHI                                                     AS TIN_CHI,
                     MH.MA                                                               AS MA_MON_HOC,
                     MIN(TKB.NGAY_BAT_DAU)                                               AS NGAY_BAT_DAU,
                     MAX(TKB.NGAY_KET_THUC)                                              AS NGAY_KET_THUC,
                     TKB.NAM_HOC,
                     TKB.HOC_KY,
                     DDCHP.LOAI_THANH_PHAN                                               AS TP_HOC_PHAN,
                     PTMH.LOAI_THANH_PHAN                                                AS TP_MON_HOC,
                     CTP.LOAI_THANH_PHAN                                                 AS TP_MAC_DINH,
                     SEM.ID                                                              AS ID_DIEM,
                     LH.TEN                                                              AS LOAI_HINH,
                     LOP.listNienKhoa,
                     COALESCE(lop.tenNganh, lop.tenChuyenNganh)                          AS TEN_NGANH,
                     GV.gv                                                               AS GIANG_VIEN,
                     DE.LICH_THI
              FROM DT_THOI_KHOA_BIEU TKB
                       LEFT JOIN (SELECT sTKB.MA_HOC_PHAN,
                                         REGEXP_REPLACE(LISTAGG(CASE
                                                                    WHEN CB.SHCC IS NOT NULL
                                                                        THEN TRIM(upper(CB.HO) || ' ' || upper(CB.TEN))
                                                                    ELSE
                                                                        TRIM(upper(CBNT.HO) || ' ' || upper(CBNT.TEN)) END,
                                                                ', ')
                                                                WITHIN GROUP (ORDER BY TKBGV.ID),
                                                        '([^,]+)(,\1)+', '\1')
                                             AS gv
                                  FROM DT_THOI_KHOA_BIEU_GIANG_VIEN TKBGV
                                           LEFT JOIN DT_THOI_KHOA_BIEU sTKB ON sTKB.ID = TKBGV.ID_THOI_KHOA_BIEU
                                           LEFT JOIN TCHC_CAN_BO CB ON CB.SHCC = TKBGV.GIANG_VIEN
                                           LEFT JOIN DT_CAN_BO_NGOAI_TRUONG CBNT ON TKBGV.GIANG_VIEN = CBNT.SHCC
                                           LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                                  WHERE TKBGV.TYPE = 'GV'
                                  GROUP BY sTKB.MA_HOC_PHAN) GV ON GV.MA_HOC_PHAN = TKB.MA_HOC_PHAN
                       LEFT JOIN (SELECT CTP.NAM_HOC,
                                         CTP.HOC_KY,
                                         JSON_OBJECTAGG(key TO_CHAR(CTP.MA) VALUE TO_CHAR(CTP.PHAN_TRAM_MAC_DINH) ABSENT
                                                        ON NULL) AS LOAI_THANH_PHAN
                                  FROM DT_DIEM_CONFIG_THANH_PHAN CTP
                                           LEFT JOIN DT_DIEM_DM_LOAI_DIEM LD ON LD.MA = CTP.MA AND LD.IS_THI = 1
                                  GROUP BY CTP.NAM_HOC, CTP.HOC_KY) CTP
                                 ON CTP.NAM_HOC = TKB.NAM_HOC AND CTP.HOC_KY = TKB.HOC_KY
                       LEFT JOIN (SELECT DE.MA_HOC_PHAN,
                                         JSON_ARRAYAGG(JSON_OBJECT(key 'idExam' VALUE DE.ID,
                                                                   key 'kyThi' VALUE TO_CHAR(DE.LOAI_KY_THI),
                                                                   key 'caThi' VALUE TO_CHAR(DE.CA_THI),
                                                                   key 'batDau' VALUE TO_CHAR(DE.BAT_DAU),
                                                                   key 'ketThuc' VALUE TO_CHAR(DE.KET_THUC),
                                                                   key 'phong' VALUE TO_CHAR(DE.PHONG),
                                                                   key 'coSo' VALUE TO_CHAR(DE.CO_SO),
                                                                   key 'soLuong' VALUE TO_CHAR(DS.SO_LUONG)
--                                                                    key 'listSinhVien' VALUE DS.LIST_SV
                                                                   NULL ON NULL)
                                                       FORMAT JSON ORDER BY DE.ID ASC) AS LICH_THI
                                  FROM DT_EXAM DE
                                           LEFT JOIN (SELECT DSSV.ID_EXAM,
                                                             COUNT(DSSV.MSSV) AS SO_LUONG
                                                      FROM DT_EXAM_DANH_SACH_SINH_VIEN DSSV
                                                      GROUP BY DSSV.ID_EXAM) DS ON DS.ID_EXAM = DE.ID
                                  WHERE kyThi IS NOT NULL
                                    AND DE.LOAI_KY_THI = kyThi
                                  GROUP BY DE.MA_HOC_PHAN) DE ON DE.MA_HOC_PHAN = TKB.MA_HOC_PHAN

                       LEFT JOIN DM_MON_HOC MH ON MH.MA = TKB.MA_MON_HOC
                       LEFT JOIN (SELECT DMTP.MA_MON_HOC,
                                         JSON_OBJECTAGG(key TO_CHAR(DMTP.LOAI_THANH_PHAN) value
                                                        DMTP.PHAN_TRAM FORMAT JSON ABSENT ON NULL) AS LOAI_THANH_PHAN
                                  FROM DT_MON_HOC_DIEM_THANH_PHAN DMTP
                                  GROUP BY DMTP.MA_MON_HOC) PTMH ON PTMH.MA_MON_HOC = MH.MA
                       LEFT JOIN (SELECT CHP.MA_HOC_PHAN,
                                         JSON_OBJECTAGG(key TO_CHAR(CHP.LOAI_THANH_PHAN) value CHP.PHAN_TRAM
                                                        FORMAT JSON ABSENT ON NULL) AS LOAI_THANH_PHAN
                                  FROM DT_DIEM_CONFIG_HOC_PHAN CHP
                                  GROUP BY CHP.MA_HOC_PHAN) DDCHP on TKB.MA_HOC_PHAN = DDCHP.MA_HOC_PHAN
                       LEFT JOIN DT_DM_THU TH ON TH.MA = TKB.THU
                       LEFT JOIN DM_CA_HOC CH ON CH.TEN = TKB.TIET_BAT_DAU AND CH.MA_CO_SO = TKB.CO_SO
                       LEFT JOIN DM_CA_HOC CHKT
                                 ON CHKT.TEN = TKB.TIET_BAT_DAU + TKB.SO_TIET_BUOI - 1 AND CHKT.MA_CO_SO = TKB.CO_SO
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LH ON LH.MA = TKB.LOAI_HINH_DAO_TAO
                       LEFT JOIN DT_DIEM_SEMESTER SEM ON SEM.NAM_HOC = TKB.NAM_HOC AND SEM.HOC_KY = TKB.HOC_KY
                       LEFT JOIN (SELECT REGEXP_REPLACE(LISTAGG(DTL.NIEN_KHOA, ',') WITHIN GROUP (ORDER BY DTL.MA_LOP),
                                                        '([^,]+)(,\1)+', '\1') AS listNienKhoa,
                                         REGEXP_REPLACE(LISTAGG(NDT.TEN_NGANH, ',') WITHIN GROUP (ORDER BY DTL.MA_LOP),
                                                        '([^,]+)(,\1)+',
                                                        '\1')                  AS tenNganh,
                                         REGEXP_REPLACE(LISTAGG(DCN.TEN, ',') WITHIN GROUP (ORDER BY NULL),
                                                        '([^,]+)(,\1)+',
                                                        '\1')                  AS tenChuyenNganh,
                                         eNDT.ID_THOI_KHOA_BIEU                AS idTKB
                                  FROM DT_THOI_KHOA_BIEU_NGANH eNDT
                                           LEFT JOIN DT_LOP DTL ON DTL.MA_LOP = eNDT.ID_NGANH
                                           LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = DTL.MA_NGANH
                                           LEFT JOIN DT_CHUYEN_NGANH DCN ON DCN.MA = DTL.MA_CHUYEN_NGANH
                                  GROUP BY eNDT.ID_THOI_KHOA_BIEU) lop
                                 ON lop.idTKB = TKB.ID
              GROUP BY TKB.MA_HOC_PHAN, DDCHP.LOAI_THANH_PHAN, PTMH.LOAI_THANH_PHAN,
                       TKB.NAM_HOC, SEM.ID, MH.TEN, MH.MA,
                       TKB.HOC_KY, LH.TEN, LOP.listNienKhoa, LICH_THI, CTP.LOAI_THANH_PHAN, MH.TONG_TIN_CHI,
                       COALESCE(lop.tenNganh, lop.tenChuyenNganh), GV.gv) TKB
        WHERE TKB.MA_HOC_PHAN IN (SELECT regexp_substr(listMaHocPhan, '[^,]+', 1, level)
                                  from dual
                                  connect by regexp_substr(listMaHocPhan, '[^,]+', 1, level) is not null);

    OPEN dataSinhVien FOR
        SELECT DKHP.MSSV               AS "mssv",
               DKHP.MA_HOC_PHAN        AS "maHocPhan",
               EXAM.PHONG              AS "phong",
               EXAM.BAT_DAU            AS "batDau",
               EXAM.KET_THUC           AS "ketThuc",
               DKHP.TIME_MODIFIED      AS "thoiGianDangKy",
               DDSF.lastPrintTime      AS "lastPrintTime",
               DDSF.lastId             AS "lastId",
               upper(FS.HO)            AS "ho",
               upper(FS.TEN)           AS "ten",
               FS.NGAY_SINH            AS "ngaySinh",
               FS.LOP                  AS "lop",
               COALESCE(HP.CONG_NO, 0) AS "congNo",
               CASE
                   WHEN EXAM.STT IS NULL
                       THEN ROW_NUMBER() OVER (PARTITION BY DKHP.MA_HOC_PHAN
                       ORDER BY DKHP.MA_HOC_PHAN ASC, DKHP.MSSV ASC)
                   ELSE EXAM.STT END      R,
               EXAM.ID                 AS "idExam"
        FROM DT_DANG_KY_HOC_PHAN DKHP
                 LEFT JOIN (SELECT DE.MA_HOC_PHAN, DS.MSSV, DS.STT, DE.PHONG, DE.ID, DE.BAT_DAU, DE.KET_THUC
                            FROM DT_EXAM_DANH_SACH_SINH_VIEN DS
                                     LEFT JOIN DT_EXAM DE ON DS.ID_EXAM = DE.ID
                            WHERE kyThi IS NOT NULL
                              AND DE.LOAI_KY_THI = kyThi
                            ORDER BY MSSV ASC) EXAM ON EXAM.MA_HOC_PHAN = DKHP.MA_HOC_PHAN AND EXAM.MSSV = DKHP.MSSV
                 INNER JOIN FW_STUDENT FS on DKHP.MSSV = FS.MSSV
                 LEFT JOIN (SELECT (CASE
                                        WHEN SUM(CONG_NO) > 0 THEN 0
                                        WHEN SUM(CONG_NO) <= 0 THEN 1 END) AS CONG_NO,
                                   MSSV
                            FROM TC_HOC_PHI HP
                            GROUP BY HP.MSSV
                            HAVING SUM(CONG_NO) IS NOT NULL) HP ON HP.MSSV = FS.MSSV
                 LEFT JOIN (SELECT DDSF.MA_HOC_PHAN,
                                   max(PRINT_TIME) AS lastPrintTime,
                                   max(DDSF.ID)    AS lastId,
                                   jt.STU_ID       AS MSSV
                            FROM DT_DIEM_SCAN_FILE DDSF
                                     CROSS JOIN JSON_TABLE(
                                    DDSF.STU_ID_INDEX,
                                    '$.*'
                                    COLUMNS (STU_ID VARCHAR2(20) PATH '$')
                                ) jt
                            WHERE DDSF.KY_THI = kyThi
                            GROUP BY DDSF.MA_HOC_PHAN, jt.STU_ID) DDSF
                           ON DDSF.MA_HOC_PHAN = DKHP.MA_HOC_PHAN AND DKHP.MSSV = DDSF.MSSV

        WHERE DKHP.MA_HOC_PHAN IN (SELECT regexp_substr(listMaHocPhan, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(listMaHocPhan, '[^,]+', 1, level) is not null)
        ORDER BY R ASC;
    return diemCursor;
end;
CREATE OR REPLACE FUNCTION DT_EXAM_GET_SINH_VIEN(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor     SYS_REFCURSOR;
    listMaHocPhan STRING(1000);
    namHocHocPhi  STRING(11);
    hocKyHocPhi   NUMBER(1);
    kyThi         STRING(5);

BEGIN
    SELECT JSON_VALUE(filter, '$.listMaHocPhan') INTO listMaHocPhan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.namHocHocPhi') INTO namHocHocPhi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKyHocPhi') INTO hocKyHocPhi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.kyThi') INTO kyThi FROM DUAL;

    OPEN my_cursor FOR
        SELECT DISTINCT DKHP.MA_HOC_PHAN      AS "hocPhan",
                        STU.MSSV              AS "mssv",
                        STU.HO                AS "ho",
                        STU.TEN               AS "ten",
                        STU.LOP               AS "lop",
                        STU.NAM_TUYEN_SINH    AS "khoaSinhVien",
                        NDT.TEN_NGANH         AS "tenNganh",
                        STU.LOAI_HINH_DAO_TAO AS "loaiHinhDaoTao",
                        phongThi.PHONG        AS "phong",
                        phongThi.LOAI_KY_THI  AS "maKyThi",
                        phongThi.CA_THI       AS "caThi",
                        phongThi.STT          AS "stt",
                        phongThi.DINH_CHI_THI AS "dinhChi",
                        phongThi.GHI_CHU      AS "ghiChu",
                        DKHP.MA_LOAI_DKY      AS "maLoaiDky",
                        tinhTrangSinhVien.TEN AS "tenTinhTrangSV",
                        NO."congNo"           AS "tinhPhi",
                        STU.TINH_TRANG        AS "tinhTrang"
        FROM DT_DANG_KY_HOC_PHAN DKHP
                 LEFT JOIN FW_STUDENT STU ON DKHP.MSSV = STU.MSSV
                 LEFT JOIN DT_LOP LOP ON LOP.MA_LOP = STU.LOP
                 LEFT JOIN DM_TINH_TRANG_SINH_VIEN tinhTrangSinhVien ON STU.TINH_TRANG = tinhTrangSinhVien.MA
                 LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = LOP.MA_NGANH
                 LEFT JOIN (SELECT (CASE
                                        WHEN SUM(CONG_NO) > 0 THEN '0'
                                        WHEN SUM(CONG_NO) <= 0 THEN '1'
                                        WHEN SUM(CONG_NO) IS NULL THEN '2' END) AS "congNo",
                                   MSSV
                            FROM TC_HOC_PHI
                            WHERE NAM_HOC < TO_NUMBER(SUBSTR(namHocHocPhi, 1, 4))
                               OR (NAM_HOC = TO_NUMBER(SUBSTR(namHocHocPhi, 1, 4)) AND HOC_KY < hocKyHocPhi)
                            GROUP BY MSSV) NO ON NO.MSSV = STU.MSSV
                 LEFT JOIN (SELECT DE.PHONG  AS PHONG,
                                   DESV.MSSV AS MSSV,
                                   DESV.STT,
                                   DESV.DINH_CHI_THI,
                                   DESV.GHI_CHU,
                                   DE.MA_HOC_PHAN,
                                   DE.LOAI_KY_THI,
                                   DE.CA_THI
                            FROM DT_EXAM_DANH_SACH_SINH_VIEN DESV
                                     LEFT JOIN DT_EXAM DE ON DESV.ID_EXAM = DE.ID) phongThi
                           ON phongThi.MSSV = DKHP.MSSV AND phongThi.MA_HOC_PHAN = DKHP.MA_HOC_PHAN AND
                              phongThi.LOAI_KY_THI = kyThi
        WHERE DKHP.MA_HOC_PHAN IN (SELECT regexp_substr(listMaHocPhan, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(listMaHocPhan, '[^,]+', 1, level) is not null)
        ORDER BY DKHP.MA_HOC_PHAN, phongThi.LOAI_KY_THI, phongThi.CA_THI, phongThi.PHONG, STU.MSSV;

    return my_cursor;
END;
CREATE OR REPLACE FUNCTION DT_EXAM_GET_EXAM_SINH_VIEN(maSinhVien IN STRING, filter IN STRING) RETURN SYS_REFCURSOR
AS
    data   SYS_REFCURSOR;
    hocKy  STRING(50);
    namHoc STRING(50);

BEGIN
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;

    OPEN data FOR
        SELECT EXAM.MA_MON_HOC        AS "maMonHoc",
               EXAM.PHONG             AS "phong",
               EXAM.CO_SO             AS "coSo",
               EXAM.MA_HOC_PHAN       AS "maHocPhan",
               EXAM.BAT_DAU           AS "batDau",
               EXAM.KET_THUC          AS "ketThuc",
               EXAM.NAM_HOC           AS "namHoc",
               EXAM.HOC_KY            AS "hocKy",
               EXAM.LOAI_KY_THI       AS "loaiKyThi",
               EXAM.THOI_GIAN_CONG_BO AS "thoiGianCongBo",
               LD.TEN                 AS "tenKyThi",
               DSSV.IS_THANH_TOAN     AS "isThanhToan",
               DSSV.DINH_CHI_THI      AS "dinhChi",
               DSSV.GHI_CHU           AS "ghiChu",
               DMMH.TEN               AS "tenMonHoc"
        FROM DT_EXAM_DANH_SACH_SINH_VIEN DSSV
                 LEFT JOIN DT_EXAM EXAM ON DSSV.ID_EXAM = EXAM.ID
                 LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = EXAM.MA_MON_HOC
                 LEFT JOIN DT_DIEM_DM_LOAI_DIEM LD ON LD.MA = EXAM.LOAI_KY_THI
        WHERE DSSV.MSSV = maSinhVien
          AND DSSV.KICH_HOAT = 1
          AND (namHoc IS NULL OR EXAM.NAM_HOC = namHoc)
          AND (hocKy IS NULL OR EXAM.HOC_KY = hocKy)
        ORDER BY DSSV.DINH_CHI_THI NULLS FIRST, EXAM.MA_MON_HOC, EXAM.MA_HOC_PHAN;
    return data;
end ;
CREATE OR REPLACE FUNCTION DT_LICH_EVENT_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                          searchTerm IN STRING,
                                          totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    data        SYS_REFCURSOR;
    sT          STRING(502) := '%' || lower(searchTerm) || '%';
    ks_ten      STRING(100);
    ks_phong    STRING(100);
    ks_coSo     STRING(100);
    ks_khoa     STRING(100);
    ks_lop      STRING(100);
    ks_ghiChu   STRING(100);
    ks_thoiGian STRING(100);
    sortKey     STRING(20);
    sortMode    STRING(20);

BEGIN
    SELECT JSON_VALUE(filter, '$.ks_ten') INTO ks_ten FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phong') INTO ks_phong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_coSo') INTO ks_coSo FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_khoa') INTO ks_khoa FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_lop') INTO ks_lop FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ghiChu') INTO ks_ghiChu FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_thoiGian') INTO ks_thoiGian FROM DUAL;

    SELECT JSON_VALUE(filter, '$.sortKey') INTO sortKey FROM DUAL;
    SELECT JSON_VALUE(filter, '$.sortMode') INTO sortMode FROM DUAL;


    SELECT COUNT(*)
    INTO totalItem
    FROM DT_LICH_EVENT LICH
             LEFT JOIN DM_CO_SO CS ON CS.MA = LICH.CO_SO
             LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = LICH.KHOA
    WHERE ((ks_ten IS NULL OR lower(LICH.TEN) LIKE ('%' || lower(ks_ten) || '%'))
        AND (ks_phong IS NULL OR lower(LICH.PHONG) LIKE ('%' || lower(ks_phong) || '%'))
        AND (ks_coSo IS NULL OR lower(CS.TEN) LIKE ('%' || lower(ks_coSo) || '%'))
        AND (ks_lop IS NULL OR lower(LICH.LOP) LIKE ('%' || lower(ks_lop) || '%'))
        AND (ks_khoa IS NULL OR lower(KHOA.TEN) LIKE ('%' || lower(ks_khoa) || '%'))
        AND (ks_ghiChu IS NULL OR lower(LICH.GHI_CHU) LIKE ('%' || lower(ks_ghiChu) || '%'))
        AND (ks_thoiGian IS NULL OR lower((LICH.TIET_BAT_DAU || ' - ' || (LICH.TIET_BAT_DAU + LICH.SO_TIET))) LIKE
                                    ('%' || lower(ks_thoiGian) || '%')))
      AND (searchTerm = ''
        OR LOWER(TRIM(LICH.TEN)) LIKE sT
        OR LOWER(TRIM(LICH.PHONG)) LIKE sT
        OR LOWER(TRIM(CS.TEN)) LIKE sT
        OR LOWER(TRIM(LICH.LOP)) LIKE sT
        OR LOWER(TRIM(KHOA.TEN)) LIKE sT
        OR LOWER(TRIM(LICH.GHI_CHU)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);


    OPEN data FOR
        SELECT *
        FROM (SELECT LICH.ID                                                          AS "id",
                     LICH.TEN                                                         AS "ten",
                     CS.TEN                                                           AS "tenCoSo",
                     LICH.CO_SO                                                       AS "coSo",
                     LICH.PHONG                                                       AS "phong",
                     LICH.THOI_GIAN_BAT_DAU                                           AS "thoiGianBatDau",
                     LICH.THOI_GIAN_KET_THUC                                          AS "thoiGianKetThuc",
                     LICH.GHI_CHU                                                     AS "ghiChu",
                     LICH.USER_MODIFIED                                               AS "userModified",
                     LICH.TIME_MODIFIED                                               AS "timeModified",
                     LICH.KHOA                                                        AS "khoa",
                     LICH.LOP                                                         AS "lop",
                     KHOA.TEN                                                         AS "tenKhoa",
                     LICH.TIET_BAT_DAU                                                AS "tietBatDau",
                     LICH.SO_TIET                                                     AS "soTiet",
                     (LICH.TIET_BAT_DAU || ' - ' || (LICH.TIET_BAT_DAU + LICH.SO_TIET)) AS "thoiGian",
                     ROW_NUMBER() OVER (ORDER BY NULL)                                   R
              FROM DT_LICH_EVENT LICH
                       LEFT JOIN DM_CO_SO CS ON CS.MA = LICH.CO_SO
                       LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = LICH.KHOA
              WHERE ((ks_ten IS NULL OR lower(LICH.TEN) LIKE ('%' || lower(ks_ten) || '%'))
                  AND (ks_phong IS NULL OR lower(LICH.PHONG) LIKE ('%' || lower(ks_phong) || '%'))
                  AND (ks_coSo IS NULL OR lower(CS.TEN) LIKE ('%' || lower(ks_coSo) || '%'))
                  AND (ks_lop IS NULL OR lower(LICH.LOP) LIKE ('%' || lower(ks_lop) || '%'))
                  AND (ks_khoa IS NULL OR lower(KHOA.TEN) LIKE ('%' || lower(ks_khoa) || '%'))
                  AND (ks_ghiChu IS NULL OR lower(LICH.GHI_CHU) LIKE ('%' || lower(ks_ghiChu) || '%'))
                  AND (ks_thoiGian IS NULL OR
                       lower((LICH.TIET_BAT_DAU || ' - ' || (LICH.TIET_BAT_DAU + LICH.SO_TIET))) LIKE
                       ('%' || lower(ks_thoiGian) || '%')))
                AND (searchTerm = ''
                  OR LOWER(TRIM(LICH.TEN)) LIKE sT
                  OR LOWER(TRIM(LICH.PHONG)) LIKE sT
                  OR LOWER(TRIM(CS.TEN)) LIKE sT
                  OR LOWER(TRIM(LICH.LOP)) LIKE sT
                  OR LOWER(TRIM(KHOA.TEN)) LIKE sT
                  OR LOWER(TRIM(LICH.GHI_CHU)) LIKE sT)
              ORDER BY CASE
                           WHEN sortMode = 'ASC' THEN
                               DECODE(sortKey,
                                      'ten', NLSSORT(LICH.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'phong', NLSSORT(LICH.PHONG, 'NLS_SORT = BINARY_AI'),
                                      'coSo', NLSSORT(CS.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'thoiGianBatDau', NLSSORT(LICH.THOI_GIAN_BAT_DAU, 'NLS_SORT = BINARY_AI'),
                                      'thoiGianKetThuc', NLSSORT(LICH.THOI_GIAN_KET_THUC, 'NLS_SORT = BINARY_AI'),
                                      'lop', NLSSORT(LICH.LOP, 'NLS_SORT = BINARY_AI'),
                                      'khoa', NLSSORT(KHOA.TEN, 'NLS_SORT = BINARY_AI'),
                                      'ghiChu', NLSSORT(LICH.GHI_CHU, 'NLS_SORT = VIETNAMESE'),
                                      'thoiGian',
                                      NLSSORT((LICH.TIET_BAT_DAU || ' - ' || (LICH.TIET_BAT_DAU + LICH.SO_TIET)),
                                              'NLS_SORT = VIETNAMESE'))
                           END ASC NULLS LAST,
                       CASE
                           WHEN sortMode = 'DESC' THEN
                               DECODE(sortKey,
                                      'ten', NLSSORT(LICH.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'phong', NLSSORT(LICH.PHONG, 'NLS_SORT = BINARY_AI'),
                                      'coSo', NLSSORT(CS.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'thoiGianBatDau', NLSSORT(LICH.THOI_GIAN_BAT_DAU, 'NLS_SORT = BINARY_AI'),
                                      'thoiGianKetThuc', NLSSORT(LICH.THOI_GIAN_KET_THUC, 'NLS_SORT = BINARY_AI'),
                                      'lop', NLSSORT(LICH.LOP, 'NLS_SORT = BINARY_AI'),
                                      'khoa', NLSSORT(KHOA.TEN, 'NLS_SORT = BINARY_AI'),
                                      'ghiChu', NLSSORT(LICH.GHI_CHU, 'NLS_SORT = VIETNAMESE'),
                                      'thoiGian',
                                      NLSSORT((LICH.TIET_BAT_DAU || ' - ' || (LICH.TIET_BAT_DAU + LICH.SO_TIET)),
                                              'NLS_SORT = VIETNAMESE'))
                           END DESC NULLS LAST)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN data;
end;
CREATE OR REPLACE FUNCTION DT_LICH_SU_DKHP_TIME_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                                 searchTerm IN STRING,
                                                 totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    data            SYS_REFCURSOR;
    sT              STRING(502) := '%' || lower(searchTerm) || '%';
    ngayBatDau      STRING(50);
    ngayKetThuc     STRING(50);
    thaoTac         STRING(50);
    ks_mssv         STRING(100);
    ks_hoTen        STRING(100);
    ks_maHocPhan    STRING(100);
    ks_tenMon       STRING(502);
    ks_nguoiThaoTac STRING(100);
    ks_thaoTac      STRING(100);
    ks_ghiChu       STRING(100);
    sortKey         STRING(20);
    sortMode        STRING(20);

BEGIN
    SELECT JSON_VALUE(filter, '$.ngayBatDau') INTO ngayBatDau FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ngayKetThuc') INTO ngayKetThuc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.thaoTac') INTO thaoTac FROM DUAL;

    SELECT JSON_VALUE(filter, '$.ks_mssv') INTO ks_mssv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_hoTen') INTO ks_hoTen FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_maHocPhan') INTO ks_maHocPhan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tenMon') INTO ks_tenMon FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_nguoiThaoTac') INTO ks_nguoiThaoTac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_thaoTac') INTO ks_thaoTac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ghiChu') INTO ks_ghiChu FROM DUAL;

    SELECT JSON_VALUE(filter, '$.sortKey') INTO sortKey FROM DUAL;
    SELECT JSON_VALUE(filter, '$.sortMode') INTO sortMode FROM DUAL;


    SELECT COUNT(*)
    INTO totalItem
    FROM DT_LICH_SU_DKHP LS
             LEFT JOIN FW_STUDENT STU ON STU.MSSV = LS.MSSV
             LEFT JOIN (SELECT DISTINCT TKB.MA_HOC_PHAN AS "maHocPhan",
                                        TKB.MA_MON_HOC  AS "maMonHoc"
                        FROM DT_THOI_KHOA_BIEU TKB) TEMP ON TEMP."maHocPhan" = LS.MA_HOC_PHAN
             LEFT JOIN DM_MON_HOC MH ON MH.MA = TEMP."maMonHoc"
    WHERE (LS.TIME_MODIFIED IS NOT NULL
        AND (ngayBatDau IS NULL OR LS.TIME_MODIFIED >= ngayBatDau)
        AND (ngayKetThuc IS NULL OR LS.TIME_MODIFIED <= ngayKetThuc))
      AND (thaoTac IS NULL
        OR (thaoTac = 'C' AND LS.THAO_TAC != 'A' AND LS.THAO_TAC != 'D' AND LS.THAO_TAC != 'H' AND LS.THAO_TAC != 'U')
        OR (thaoTac = LS.THAO_TAC AND LS.THAO_TAC != 'C'))
      AND (ks_mssv IS NULL OR lower(LS.MSSV) LIKE ('%' || lower(ks_mssv) || '%'))
      AND (ks_hoTen IS NULL OR lower(STU.HO || ' ' || STU.TEN) LIKE ('%' || lower(ks_hoTen) || '%'))
      AND (ks_maHocPhan IS NULL OR lower(LS.MA_HOC_PHAN) LIKE ('%' || lower(ks_maHocPhan) || '%'))
      AND (ks_tenMon IS NULL OR lower(LS.TEN_MON_HOC) LIKE ('%' || lower(trim(ks_tenMon)) || '%'))
      AND (ks_nguoiThaoTac IS NULL OR lower(LS.USER_MODIFIED) LIKE ('%' || lower(ks_nguoiThaoTac) || '%'))
      AND (ks_thaoTac IS NULL
        OR (ks_thaoTac = 'C' AND LS.THAO_TAC != 'A' AND LS.THAO_TAC != 'D' AND LS.THAO_TAC != 'H' AND
            LS.THAO_TAC != 'U')
        OR (ks_thaoTac = LS.THAO_TAC AND LS.THAO_TAC != 'C'))
      AND (ks_ghiChu IS NULL OR lower(LS.GHI_CHU) LIKE ('%' || lower(ks_ghiChu) || '%'))
      AND (searchTerm = ''
        OR LOWER(TRIM(STU.HO || ' ' || STU.TEN)) LIKE sT
        OR LOWER(TRIM(LS.MA_HOC_PHAN)) LIKE sT
        OR LOWER(TRIM(LS.TEN_MON_HOC)) LIKE sT
        OR LOWER(TRIM(LS.USER_MODIFIED)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);


    OPEN data FOR
        SELECT *
        FROM (SELECT LS.ID                      AS     "id",
                     LS.MSSV                    AS     "mssv",
                     (STU.HO || ' ' || STU.TEN) AS     "hoTen",
                     LS.MA_HOC_PHAN             AS     "maHocPhan",
                     MH.TEN                     AS     "tenMonHoc",
                     LS.THAO_TAC                AS     "thaoTac",
                     LS.GHI_CHU                 AS     "ghiChu",
                     LS.NAM_HOC                 AS     "namHoc",
                     LS.HOC_KY                  AS     "hocKy",
                     LS.USER_MODIFIED           AS     "userModified",
                     LS.TIME_MODIFIED           AS     "timeModified",
                     ROW_NUMBER() OVER (ORDER BY NULL) R
              FROM DT_LICH_SU_DKHP LS
                       LEFT JOIN FW_STUDENT STU ON STU.MSSV = LS.MSSV
                       LEFT JOIN (SELECT DISTINCT TKB.MA_HOC_PHAN AS "maHocPhan",
                                                  TKB.MA_MON_HOC  AS "maMonHoc"
                                  FROM DT_THOI_KHOA_BIEU TKB) TEMP ON TEMP."maHocPhan" = LS.MA_HOC_PHAN
                       LEFT JOIN DM_MON_HOC MH ON MH.MA = TEMP."maMonHoc"
              WHERE (LS.TIME_MODIFIED IS NOT NULL
                  AND (ngayBatDau IS NULL OR LS.TIME_MODIFIED >= ngayBatDau)
                  AND (ngayKetThuc IS NULL OR LS.TIME_MODIFIED <= ngayKetThuc))
                AND (thaoTac IS NULL
                  OR (thaoTac = 'C' AND LS.THAO_TAC != 'A' AND LS.THAO_TAC != 'D' AND LS.THAO_TAC != 'H' AND
                      LS.THAO_TAC != 'U')
                  OR (thaoTac = LS.THAO_TAC AND LS.THAO_TAC != 'C'))
                AND (ks_mssv IS NULL OR lower(LS.MSSV) LIKE ('%' || lower(ks_mssv) || '%'))
                AND (ks_hoTen IS NULL OR lower(STU.HO || ' ' || STU.TEN) LIKE ('%' || lower(ks_hoTen) || '%'))
                AND (ks_maHocPhan IS NULL OR lower(LS.MA_HOC_PHAN) LIKE ('%' || lower(ks_maHocPhan) || '%'))
                AND (ks_tenMon IS NULL OR lower(LS.TEN_MON_HOC) LIKE ('%' || lower(trim(ks_tenMon)) || '%'))
                AND (ks_nguoiThaoTac IS NULL OR lower(LS.USER_MODIFIED) LIKE ('%' || lower(ks_nguoiThaoTac) || '%'))
                AND (ks_thaoTac IS NULL
                  OR (ks_thaoTac = 'C' AND LS.THAO_TAC != 'A' AND LS.THAO_TAC != 'D' AND LS.THAO_TAC != 'H' AND
                      LS.THAO_TAC != 'U')
                  OR (ks_thaoTac = LS.THAO_TAC AND LS.THAO_TAC != 'C'))
                AND (ks_ghiChu IS NULL OR lower(LS.GHI_CHU) LIKE ('%' || lower(ks_ghiChu) || '%'))
                AND (searchTerm = ''
                  OR LOWER(TRIM(STU.HO || ' ' || STU.TEN)) LIKE sT
                  OR LOWER(TRIM(LS.MA_HOC_PHAN)) LIKE sT
                  OR LOWER(TRIM(LS.TEN_MON_HOC)) LIKE sT
                  OR LOWER(TRIM(LS.USER_MODIFIED)) LIKE sT)
              ORDER BY CASE
                           WHEN sortMode = 'ASC' THEN
                               DECODE(sortKey,
                                      'mssv', NLSSORT(LS.MSSV, 'NLS_SORT = BINARY_AI'),
                                      'hoTen', NLSSORT((STU.HO || ' ' || STU.TEN), 'NLS_SORT = VIETNAMESE'),
                                      'maHocPhan', NLSSORT(LS.MA_HOC_PHAN, 'NLS_SORT = VIETNAMESE'),
                                      'tenMon', NLSSORT(MH.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'nguoiThaoTac', NLSSORT(LS.USER_MODIFIED, 'NLS_SORT = VIETNAMESE'),
                                      'thoiGian', NLSSORT(LS.TIME_MODIFIED, 'NLS_SORT = BINARY_AI'),
                                      'thaoTac', NLSSORT(LS.THAO_TAC, 'NLS_SORT = VIETNAMESE'),
                                      'ghiChu', NLSSORT(LS.GHI_CHU, 'NLS_SORT = VIETNAMESE'))
                           END ASC NULLS LAST,
                       CASE
                           WHEN sortMode = 'DESC' THEN
                               DECODE(sortKey,
                                      'mssv', NLSSORT(LS.MSSV, 'NLS_SORT = BINARY_AI'),
                                      'hoTen', NLSSORT((STU.HO || ' ' || STU.TEN), 'NLS_SORT = VIETNAMESE'),
                                      'maHocPhan', NLSSORT(LS.MA_HOC_PHAN, 'NLS_SORT = VIETNAMESE'),
                                      'tenMon', NLSSORT(MH.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'nguoiThaoTac', NLSSORT(LS.USER_MODIFIED, 'NLS_SORT = VIETNAMESE'),
                                      'thoiGian', NLSSORT(LS.TIME_MODIFIED, 'NLS_SORT = BINARY_AI'),
                                      'thaoTac', NLSSORT(LS.THAO_TAC, 'NLS_SORT = VIETNAMESE'),
                                      'ghiChu', NLSSORT(LS.GHI_CHU, 'NLS_SORT = VIETNAMESE'))
                           END DESC NULLS LAST)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN data;
end;
CREATE OR REPLACE FUNCTION DT_THONG_KE_SINH_VIEN_QUI_MO_GET_DATA(filter IN STRING) RETURN SYS_REFCURSOR
AS
    data           SYS_REFCURSOR;
    namHoc         STRING(11);
    hocKy          STRING(1);
    loaiHinhDaoTao STRING(50);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHinhDaoTao') INTO loaiHinhDaoTao FROM DUAL;

    OPEN data FOR
        SELECT COUNT(SINHVIEN."mssv")  AS "soLuong",
               SINHVIEN."khoa"         AS "khoa",
               SINHVIEN."maNganh"      AS "maNganh",
               NGANH.TEN_NGANH         AS "tenNganh",
               SINHVIEN."tinhTrang"     AS"tinhTrang",
               SINHVIEN."tenTinhTrang"  AS "tenTinhTrang"
        FROM (SELECT STU.MSSV       AS "mssv",
                     STU.TINH_TRANG AS "tinhTrang",
                     TTSV.TEN       AS "tenTinhTrang",
                     (CASE
                          WHEN LOP.MA_NGANH IS NOT NULL THEN LOP.MA_NGANH
                          WHEN LOP.MA_NGANH IS NULL THEN STU.MA_NGANH
                         END)       AS "maNganh",
                     KHOA.TEN       AS "khoa"
              FROM FW_STUDENT STU
                       LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = STU.KHOA
                       LEFT JOIN DT_LOP LOP ON LOP.MA_LOP = STU.LOP
                       LEFT JOIN DT_NGANH_DAO_TAO NGANHDT ON NGANHDT.MA_NGANH = LOP.MA_NGANH
                       LEFT JOIN DM_TINH_TRANG_SINH_VIEN TTSV ON TTSV.MA = STU.TINH_TRANG
              WHERE (loaiHinhDaoTao = STU.LOAI_HINH_DAO_TAO)) SINHVIEN
                 LEFT JOIN DT_NGANH_DAO_TAO NGANH ON NGANH.MA_NGANH = SINHVIEN."maNganh"
        GROUP BY SINHVIEN."khoa", SINHVIEN."maNganh", NGANH.TEN_NGANH, SINHVIEN."tinhTrang",SINHVIEN."tenTinhTrang"
        ORDER BY SINHVIEN."khoa", NGANH.TEN_NGANH, SINHVIEN."tinhTrang";
    RETURN data;
end;
CREATE OR REPLACE FUNCTION DT_THOI_KHOA_BIEU_BAO_BU_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                                     totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor    SYS_REFCURSOR;
    hocKy        STRING(50);
    namHoc       STRING(50);
    sortKey      STRING(20);
    sortMode     STRING(20);
    ks_maHocPhan STRING(50);
    ks_tenMonHoc STRING(100);
    ks_ngayBu    NUMBER(20);
    ks_phong     STRING(50);
    ks_thu       STRING(50);
    ks_tiet      STRING(50);
    ks_ngayNghi  NUMBER(20);
    ks_thuNghi   STRING(50);
    ks_tietNghi  STRING(100);
    ks_userMod   STRING(50);
    ks_timeMod   NUMBER(20);
    ks_giangVien         STRING(100);
    ks_troGiang          STRING(100);

BEGIN
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;

    SELECT JSON_VALUE(filter, '$.sortKey') INTO sortKey FROM DUAL;
    SELECT JSON_VALUE(filter, '$.sortMode') INTO sortMode FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_maHocPhan') INTO ks_maHocPhan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tenMonHoc') INTO ks_tenMonHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngayBu') INTO ks_ngayBu FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phong') INTO ks_phong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_thu') INTO ks_thu FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tiet') INTO ks_tiet FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngayNghi') INTO ks_ngayNghi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_thuNghi') INTO ks_thuNghi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tietNghi') INTO ks_tietNghi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_userMod') INTO ks_userMod FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_timeMod') INTO ks_timeMod FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_giangVien') INTO ks_giangVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_troGiang') INTO ks_troGiang FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM DT_THOI_KHOA_BIEU_CUSTOM BU
    WHERE BU.IS_BU = 1
      AND BU.NAM_HOC = namHoc
      AND BU.HOC_KY = hocKy;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT BU.ID                                            AS   "id",
                     MH.TEN                                           AS   "tenMonHoc",
                     BU.MA_MON_HOC                                    AS   "maMonHoc",
                     BU.THU                                           AS   "thu",
                     BU.MA_HOC_PHAN                                   AS   "maHocPhan",
                     BU.PHONG                                         AS   "phong",
                     BU.TIET_BAT_DAU                                  AS   "tietBatDau",
                     BU.NGAY_HOC                                      AS   "ngayBu",
                     BU.SO_TIET_BUOI                                  AS   "soTietBuoi",
                     REPLACE(BU.MODIFIER, '@hcmussh.edu.vn', '')      AS   "userModified",
                     BU.TIME_MODIFIED                                 AS   "timeModified",
                     NGHI.NGAY_HOC                                     AS   "ngayNghi",
                     NGHI.THU                                           AS   "thuNghi",
                     NGHI.TIET_BAT_DAU                                  AS   "tietNghi",
                     NGHI.SO_TIET_BUOI                                  AS   "soTietNghi",
                     GV.giangVien                                       AS "giangVien",
                     GV.troGiang                                        AS "troGiang",
                     ROW_NUMBER() OVER (ORDER BY BU.THU, BU.MA_HOC_PHAN) R
              FROM DT_THOI_KHOA_BIEU_CUSTOM BU
                       LEFT JOIN DT_THOI_KHOA_BIEU_CUSTOM NGHI ON BU.ID_NGAY_NGHI = NGHI.ID
                       LEFT JOIN DM_MON_HOC MH ON MH.MA = BU.MA_MON_HOC
                       LEFT JOIN (SELECT GV.ID_NGAY_BU,
                                         (SELECT LISTAGG(gv, ',') WITHIN GROUP (ORDER BY NULL)
                                          FROM (SELECT DISTINCT CASE
                                                                    WHEN CB.SHCC IS NOT NULL
                                                                        THEN (TD.VIET_TAT || ' ' ||
                                                                              upper(CB.HO) ||
                                                                              ' ' ||
                                                                              upper(CB.TEN))
                                                                    ELSE
                                                                        (CBNT.TRINH_DO || ' ' ||
                                                                         upper(CBNT.HO) ||
                                                                         ' ' ||
                                                                         upper(CBNT.TEN)) END AS gv
                                                FROM DT_THOI_KHOA_BIEU_GIANG_VIEN TKBGV
                                                         LEFT JOIN TCHC_CAN_BO CB ON CB.SHCC = TKBGV.GIANG_VIEN
                                                         LEFT JOIN DT_CAN_BO_NGOAI_TRUONG CBNT ON TKBGV.GIANG_VIEN = CBNT.SHCC
                                                         LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                                                WHERE GV.ID_NGAY_BU = TKBGV.ID_NGAY_BU
                                                  AND TKBGV.TYPE = 'GV')) AS giangVien,
                                         (SELECT LISTAGG(tg, ',')
                                                         WITHIN GROUP (ORDER BY NULL)
                                          FROM (SELECT DISTINCT CASE
                                                                    WHEN CB.SHCC IS NOT NULL
                                                                        THEN (TD.VIET_TAT || ' ' ||
                                                                              upper(CB.HO) ||
                                                                              ' ' ||
                                                                              upper(CB.TEN))
                                                                    ELSE
                                                                        (CBNT.TRINH_DO || ' ' ||
                                                                         upper(CBNT.HO) ||
                                                                         ' ' ||
                                                                         upper(CBNT.TEN)) END AS tg
                                                FROM DT_THOI_KHOA_BIEU_GIANG_VIEN TKBGV
                                                         LEFT JOIN TCHC_CAN_BO CB ON CB.SHCC = TKBGV.GIANG_VIEN
                                                         LEFT JOIN DT_CAN_BO_NGOAI_TRUONG CBNT ON TKBGV.GIANG_VIEN = CBNT.SHCC
                                                         LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                                                WHERE GV.ID_NGAY_BU = TKBGV.ID_NGAY_BU
                                                  AND TKBGV.TYPE = 'TG')) AS troGiang
                                  FROM DT_THOI_KHOA_BIEU_GIANG_VIEN GV
                                  GROUP BY GV.ID_NGAY_BU) GV ON GV.ID_NGAY_BU = BU.ID
              WHERE BU.IS_BU = 1
                AND BU.HOC_KY = hocKy
                AND BU.NAM_HOC = namHoc
                AND (
                      (ks_maHocPhan IS NULL OR lower(BU.MA_HOC_PHAN) LIKE ('%' || lower(ks_maHocPhan) || '%'))
                      AND (ks_tenMonHoc IS NULL OR lower(MH.TEN) LIKE ('%' || lower(ks_tenMonHoc) || '%'))
                      AND (ks_ngayBu IS NULL OR BU.NGAY_HOC = ks_ngayBu)
                      AND (ks_phong IS NULL OR BU.PHONG = ks_phong)
                      AND (ks_thu IS NULL OR BU.THU = ks_thu)
                      AND
                      (ks_tiet IS NULL OR ks_tiet BETWEEN BU.TIET_BAT_DAU AND (BU.SO_TIET_BUOI + BU.TIET_BAT_DAU - 1))
                      AND (ks_ngayNghi IS NULL OR NGHI.NGAY_HOC = ks_ngayNghi)
                      AND (ks_thuNghi IS NULL OR NGHI.THU = ks_thuNghi)
                      AND (ks_tietNghi IS NULL OR
                           ks_tietNghi BETWEEN NGHI.TIET_BAT_DAU AND (NGHI.SO_TIET_BUOI + NGHI.TIET_BAT_DAU - 1))
                      AND (ks_userMod IS NULL OR lower(BU.MODIFIER) LIKE ('%' || lower(ks_userMod) || '%'))
                      AND (ks_timeMod IS NULL OR BU.TIME_MODIFIED = ks_timeMod)
                      AND (ks_giangVien IS NULL OR INSTR(LOWER(GV.giangVien), LOWER(ks_giangVien)) > 0)
                      AND (ks_troGiang IS NULL OR INSTR(LOWER(GV.troGiang), LOWER(ks_troGiang)) > 0)
                  )
              ORDER BY CASE
                           WHEN sortMode = 'ASC' THEN
                               DECODE(sortKey,
                                      'maHocPhan', NLSSORT(BU.MA_HOC_PHAN, 'NLS_SORT = BINARY_AI'),
                                      'tenMonHoc', NLSSORT(MH.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'ngayBu', NLSSORT(BU.NGAY_HOC, 'NLS_SORT = BINARY_AI'),
                                      'phong', NLSSORT(BU.PHONG, 'NLS_SORT = BINARY_AI'),
                                      'thu', NLSSORT(BU.THU, 'NLS_SORT = VIETNAMESE'),
                                      'tiet', NLSSORT(BU.TIET_BAT_DAU, 'NLS_SORT = BINARY_AI'),
                                      'ngayNghi', NLSSORT(NGHI.NGAY_HOC, 'NLS_SORT = BINARY_AI'),
                                      'thuNghi', NLSSORT(NGHI.THU, 'NLS_SORT = BINARY_AI'),
                                      'tietNghi', NLSSORT(NGHI.TIET_BAT_DAU, 'NLS_SORT = BINARY_AI'),
                                      'userMod', NLSSORT(NGHI.MODIFIER, 'NLS_SORT = BINARY_AI'),
                                      'timeMod', NLSSORT(NGHI.TIME_MODIFIED, 'NLS_SORT = BINARY_AI'),
                                      NLSSORT(BU.MA_HOC_PHAN, 'NLS_SORT = BINARY_AI'))
                           END ASC NULLS LAST,

                       CASE
                           WHEN sortMode = 'DESC' THEN
                               DECODE(sortKey,
                                      'maHocPhan', NLSSORT(BU.MA_HOC_PHAN, 'NLS_SORT = BINARY_AI'),
                                      'tenMonHoc', NLSSORT(MH.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'ngayBu', NLSSORT(BU.NGAY_HOC, 'NLS_SORT = BINARY_AI'),
                                      'phong', NLSSORT(BU.PHONG, 'NLS_SORT = BINARY_AI'),
                                      'thu', NLSSORT(BU.THU, 'NLS_SORT = VIETNAMESE'),
                                      'tiet', NLSSORT(BU.TIET_BAT_DAU, 'NLS_SORT = BINARY_AI'),
                                      'ngayNghi', NLSSORT(NGHI.NGAY_HOC, 'NLS_SORT = BINARY_AI'),
                                      'thuNghi', NLSSORT(NGHI.THU, 'NLS_SORT = BINARY_AI'),
                                      'tietNghi', NLSSORT(NGHI.TIET_BAT_DAU, 'NLS_SORT = BINARY_AI'),
                                      'userMod', NLSSORT(NGHI.MODIFIER, 'NLS_SORT = BINARY_AI'),
                                      'timeMod', NLSSORT(NGHI.TIME_MODIFIED, 'NLS_SORT = BINARY_AI'),
                                      NLSSORT(BU.MA_HOC_PHAN, 'NLS_SORT = BINARY_AI'))
                           END DESC NULLS LAST)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;
CREATE OR REPLACE FUNCTION TC_HOAN_TRA_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        searchTerm IN STRING, filter IN STRING,
                                        totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM TC_HOAN_TRA HT
             LEFT JOIN FW_STUDENT FS on HT.MSSV = FS.MSSV;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *

        FROM (SELECT HT.MSSV                  AS                        "mssv",
                     HT.NAM_HOC               AS                        "namHoc",
                     HT.HOC_KY                AS                        "hocKy",
                     FS.HO                    AS                        "ho",
                     FS.TEN                   AS                        "ten",
                     (FS.HO || ' ' || FS.TEN) AS                        "hoVaTen",
                     HT.SO_TIEN               AS                        "soTien",
                     HT.LY_DO                 AS                        "lyDo",
                     HT.GHI_CHU               AS                        "ghiChu",
                     HT.SO_QUYET_DINH         AS                        "soQuyetDinh",
                     HT.NGAY_RA_QUYET_DINH    AS                        "ngayRaQuyetDinh",
                     HT.CHU_TAI_KHOAN         AS                        "chuTaiKhoan",
                     HT.STK                   AS                        "stk",
                     HT.NGAN_HANG             AS                        "nganHang",
                     HT.TINH_TRANG_HOAN_TRA   AS                        "tinhTrangHoanTra",
                     HT.NGAY_HOAN_TRA         AS                        "thoiGianHoanTra",
                     ROW_NUMBER() OVER (ORDER BY HT.NGAY_RA_QUYET_DINH) R

              FROM TC_HOAN_TRA HT
                       LEFT JOIN FW_STUDENT FS on HT.MSSV = FS.MSSV
              WHERE (searchTerm = ''
                  OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT
                  OR LOWER(FS.MSSV) LIKE sT))
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY R;
    RETURN my_cursor;
END ;
CREATE OR REPLACE FUNCTION SDH_CAU_TRUC_KHUNG_DAO_TAO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                       searchTerm IN STRING,
                                                       totalItem OUT NUMBER, pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM SDH_CAU_TRUC_KHUNG_DAO_TAO cauTrucKhungDt
    WHERE searchTerm = ''
       OR cauTrucKhungDt.TEN_KHUNG LIKE st;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT cauTrucKhungDt.ID                           AS       "id",
                     cauTrucKhungDt.BAT_DAU_DANG_KY              AS       "batDauDangKy",
                     cauTrucKhungDt.KET_THUC_DANG_KY             AS       "ketThucDangKy",
                     cauTrucKhungDt.MUC_CHA                      AS       "mucCha",
                     cauTrucKhungDt.MUC_CON                      AS       "mucCon",
                     cauTrucKhungDt.NAM_DAO_TAO                  AS       "namDaoTao",
                     BDT.TEN_BAC                                 AS       "tenBacDaoTao",
                     cauTrucKhungDt.MA_KHUNG                     AS       "maKhung",
                     cauTrucKhungDt.TEN_KHUNG                    AS       "tenKhung",
                     (select count(*)
                      from SDH_KHUNG_DAO_TAO KDT
                      where KDT.MA_KHUNG = cauTrucKhungDt.ID) AS       "inUsed",
                     ROW_NUMBER() OVER (ORDER BY cauTrucKhungDt.MA_KHUNG) R
              FROM SDH_CAU_TRUC_KHUNG_DAO_TAO cauTrucKhungDt
                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT ON BDT.MA_BAC = cauTrucKhungDt.BAC_DAO_TAO

              WHERE searchTerm = ''
                 OR cauTrucKhungDt.TEN_KHUNG LIKE st)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
CREATE OR REPLACE FUNCTION SDH_KHUNG_DAO_TAO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                              searchTerm IN STRING, filter IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor      SYS_REFCURSOR;
    sT             STRING(502) := '%' || lower(searchTerm) || '%';
    donVi          STRING(10);
    namDaoTao      NUMBER(4);
    listBacDaoTao  STRING(50);
    heDaoTaoFilter STRING(10);
    khoaHocVien    STRING(20);
    ks_maNganh     STRING(20);
    ks_tenNganh    STRING(100);
    phanHeFilter   STRING(50);
    ks_thoiGianDT  STRING(20);
    khoaDTFilter   STRING(100);
    ks_maCTDT      STRING(50);
    ks_lopHocVien  STRING(50);
    ks_id          STRING(50);


BEGIN
    SELECT JSON_VALUE(filter, '$.donVi') INTO donVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.namDaoTao') INTO namDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listBacDaoTao') INTO listBacDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.heDaoTaoFilter') INTO heDaoTaoFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.khoaHocVien') INTO khoaHocVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_maNganh') INTO ks_maNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tenNganh') INTO ks_tenNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.phanHeFilter') INTO phanHeFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_thoiGianDT') INTO ks_thoiGianDT FROM DUAL;
    SELECT JSON_VALUE(filter, '$.khoaDTFilter') INTO khoaDTFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_maCTDT') INTO ks_maCTDT FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_lopHocVien') INTO ks_lopHocVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_id') INTO ks_id FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM SDH_KHUNG_DAO_TAO KDT
             LEFT JOIN SDH_TS_INFO_TIME INFOTIME ON KDT.DOT_TRUNG_TUYEN = INFOTIME.ID
             LEFT JOIN DM_KHOA_SAU_DAI_HOC DV ON DV.MA = KDT.MA_KHOA
             LEFT JOIN DM_NGANH_SAU_DAI_HOC DNDT on KDT.MA_NGANH = DNDT.MA_NGANH
             LEFT JOIN SDH_CAU_TRUC_KHUNG_DAO_TAO KHUNG ON KHUNG.ID = KDT.NAM_DAO_TAO
             LEFT JOIN DM_HOC_SDH LHDT ON LHDT.MA = KDT.BAC_DAO_TAO
             LEFT JOIN (SELECT LOP.MA_CTDT,
                               (SELECT LISTAGG(lhv.MA, ',') WITHIN GROUP (ORDER BY NULL)
                                FROM SDH_LOP_HOC_VIEN lhv
                                WHERE lhv.MA_CTDT = LOP.MA_CTDT) as maLop
                        FROM SDH_LOP_HOC_VIEN LOP
                        GROUP BY LOP.MA_CTDT) lop ON lop.MA_CTDT = KDT.MA_CTDT
             LEFT JOIN (SELECT CTDT.MA_KHUNG_DAO_TAO,
                               (SELECT COUNT(DISTINCT MA_MON_HOC)
                                FROM SDH_CHUONG_TRINH_DAO_TAO ctdttemp) as monHoc
                        FROM SDH_CHUONG_TRINH_DAO_TAO CTDT
                        GROUP BY CTDT.MA_KHUNG_DAO_TAO) COUNTCTDT on COUNTCTDT.MA_KHUNG_DAO_TAO = KDT.ID

    WHERE (donVi IS NULL OR donVi = '' OR TO_NUMBER(donVi) = KDT.MA_KHOA)
      AND (khoaHocVien IS NULL OR khoaHocVien = '' OR khoaHocVien = KDT.KHOA_HOC_VIEN)
      AND (ks_maNganh IS NULL OR lower(KDT.MA_NGANH) LIKE ('%' || lower(ks_maNganh) || '%'))
      AND (ks_tenNganh IS NULL OR lower(TRIM(DNDT.TEN)) LIKE ('%' || lower(ks_tenNganh) || '%'))
      AND (phanHeFilter IS NULL OR phanHeFilter = '' OR phanHeFilter = LHDT.MA)
      AND (ks_thoiGianDT IS NULL OR lower(KDT.THOI_GIAN_DAO_TAO) LIKE ('%' || lower(ks_thoiGianDT) || '%'))
      AND (khoaDTFilter IS NULL OR khoaDTFilter = '' OR khoaDTFilter = KDT.MA_KHOA)
      AND (ks_id IS NULL OR ks_id = '' OR ks_id = KDT.ID)
      AND (ks_maCTDT IS NULL OR lower(KDT.MA_CTDT) LIKE ('%' || lower(ks_maCTDT) || '%'))
      AND (ks_lopHocVien IS NULL OR ks_lopHocVien = '' OR
           LOWER(lop.maLop) LIKE ('%' || LOWER(TRIM(ks_lopHocVien)) || '%'))
      AND (listBacDaoTao IS NULL OR
           listBacDaoTao IS NOT NULL AND
           KDT.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                               from dual
                               connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
      AND (searchTerm = ''
        OR LOWER(TRIM(DNDT.MA_NGANH)) LIKE sT
        OR LOWER(TRIM(DNDT.TEN)) LIKE sT
        OR LOWER(TRIM(KDT.NAM_DAO_TAO)) LIKE sT
        OR LOWER(TRIM(DV.TEN)) LIKE sT)
      AND (heDaoTaoFilter IS NULL OR heDaoTaoFilter = '' OR heDaoTaoFilter = KDT.BAC_DAO_TAO)
      AND (namDaoTao IS NULL OR namDaoTao = '' OR TO_NUMBER(namDaoTao) = KDT.NAM_DAO_TAO);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT KDT.MA_KHOA           AS                          "maKhoa",
                     KDT.ID                AS                          "id",
                     KDT.MA_NGANH          AS                          "maNganh",
                     DNDT.TEN              AS                          "tenNganhTuyenSinh",
                     CTKHUNG.TEN_KHUNG     AS                          "tenCauTrucKhung",
                     KDT.MA_KHUNG          AS                          "maKhung",
                     KDT.KHOA_HOC_VIEN     AS                          "khoaHocVien",
                     KDT.BAC_DAO_TAO       AS                          "bacDaoTao",
                     KDT.THOI_GIAN_DAO_TAO AS                          "thoiGianDaoTao",
                     KDT.TEN_NGANH         AS                          "tenNganh",
                     KDT.TEN_VAN_BANG      AS                          "tenVanBang",
                     KDT.SO_HOC_KY         AS                          "soHocKy",
                     KDT.MA_CTDT           AS                          "maCtdt",
                     KDT.HOC_KY_BAT_DAU    AS                          "hocKyBatDau",
                     KDT.DOT_TRUNG_TUYEN   AS                          "dotTrungTuyen",
                     KDT.MUC_TIEU          AS                          "mucTieu",
                     BDT.TEN_BAC           AS                          "trinhDoDaoTao",
                     LHDT.TEN              AS                          "loaiHinhDaoTao",
                     DV.TEN                AS                          "tenKhoaBoMon",
                     lop.maLop             AS                          "maLop",
                     INFOTIME.ID           AS                          "idInfoTime",
                     INFOTIME.TEN          AS                          "tenDotTuyenSinh",
                     COUNTCTDT.monHoc      AS                          "monHoc",
                     ROW_NUMBER() OVER (ORDER BY KDT.NAM_DAO_TAO DESC) R
              FROM SDH_KHUNG_DAO_TAO KDT
                       LEFT JOIN SDH_TS_INFO_TIME INFOTIME ON KDT.DOT_TRUNG_TUYEN = INFOTIME.ID
                       LEFT JOIN DM_KHOA_SAU_DAI_HOC DV ON DV.MA = KDT.MA_KHOA
                       LEFT JOIN DM_NGANH_SAU_DAI_HOC DNDT on KDT.MA_NGANH = DNDT.MA_NGANH
                       LEFT JOIN SDH_CAU_TRUC_KHUNG_DAO_TAO CTKHUNG ON CTKHUNG.ID = KDT.NAM_DAO_TAO
                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT ON BDT.MA_BAC = KDT.TRINH_DO_DAO_TAO
                       LEFT JOIN DM_HOC_SDH LHDT ON LHDT.MA = KDT.BAC_DAO_TAO
                       LEFT JOIN (SELECT LOP.MA_CTDT,
                                         (SELECT LISTAGG(lhv.MA, ',') WITHIN GROUP (ORDER BY NULL)
                                          FROM SDH_LOP_HOC_VIEN lhv
                                          WHERE lhv.MA_CTDT = LOP.MA_CTDT) as maLop
                                  FROM SDH_LOP_HOC_VIEN LOP
                                  GROUP BY LOP.MA_CTDT) lop ON lop.MA_CTDT = KDT.MA_CTDT
                       LEFT JOIN (SELECT CTDT.MA_KHUNG_DAO_TAO,
                                         (SELECT COUNT(DISTINCT MA_MON_HOC)
                                          FROM SDH_CHUONG_TRINH_DAO_TAO ctdttemp) as monHoc
                                  FROM SDH_CHUONG_TRINH_DAO_TAO CTDT
                                  GROUP BY CTDT.MA_KHUNG_DAO_TAO) COUNTCTDT on COUNTCTDT.MA_KHUNG_DAO_TAO = KDT.ID
              WHERE (donVi IS NULL OR donVi = '' OR TO_NUMBER(donVi) = KDT.MA_KHOA)
                AND (khoaHocVien IS NULL OR khoaHocVien = '' OR khoaHocVien = KDT.KHOA_HOC_VIEN)
                AND (ks_maNganh IS NULL OR lower(KDT.MA_NGANH) LIKE ('%' || lower(ks_maNganh) || '%'))
                AND (ks_tenNganh IS NULL OR lower(TRIM(DNDT.TEN)) LIKE ('%' || lower(ks_tenNganh) || '%'))
                AND (phanHeFilter IS NULL OR phanHeFilter = '' OR phanHeFilter = LHDT.MA)
                AND (ks_thoiGianDT IS NULL OR lower(KDT.THOI_GIAN_DAO_TAO) LIKE ('%' || lower(ks_thoiGianDT) || '%'))
                AND (khoaDTFilter IS NULL OR khoaDTFilter = '' OR khoaDTFilter = KDT.MA_KHOA)
                AND (ks_maCTDT IS NULL OR lower(KDT.MA_CTDT) LIKE ('%' || lower(ks_maCTDT) || '%'))
                AND (ks_id IS NULL OR ks_id = '' OR ks_id = KDT.ID)
                AND (ks_lopHocVien IS NULL OR ks_lopHocVien = '' OR
                     LOWER(lop.maLop) LIKE ('%' || LOWER(TRIM(ks_lopHocVien)) || '%'))
                AND (listBacDaoTao IS NULL OR
                     listBacDaoTao IS NOT NULL AND
                     KDT.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                         from dual
                                         connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
                AND (searchTerm = ''
                  OR LOWER(TRIM(DNDT.MA_NGANH)) LIKE sT
                  OR LOWER(TRIM(DNDT.TEN)) LIKE sT
                  OR LOWER(TRIM(KDT.NAM_DAO_TAO)) LIKE sT
                  OR LOWER(TRIM(DV.TEN)) LIKE sT)
                AND (heDaoTaoFilter IS NULL OR heDaoTaoFilter = '' OR heDaoTaoFilter = KDT.BAC_DAO_TAO)
                AND (namDaoTao IS NULL OR namDaoTao = '' OR TO_NUMBER(namDaoTao) = KDT.NAM_DAO_TAO)
              ORDER BY KDT.NAM_DAO_TAO DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
CREATE OR REPLACE FUNCTION SDH_CHKTTS_NGANH_GET_BY_FILTER(filter IN STRING) RETURN SYS_REFCURSOR
AS
    listNganh      SYS_REFCURSOR;
    maDot          STRING(10);
    idCauHinhPH          STRING(10);
    maPhanHe         STRING(10);
    maHinhThuc       STRING(10);
BEGIN
    SELECT JSON_VALUE(filter, '$.maHinhThuc') INTO maHinhThuc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.maDot') INTO maDot FROM DUAL;
    SELECT JSON_VALUE(filter, '$.maPhanHe') INTO maPhanHe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.idCauHinhPH') INTO idCauHinhPH FROM DUAL;
    OPEN listNganh FOR
        SELECT CH.MA_NGANH AS "maNganh",
               DM.TEN AS "tenNganh"
        FROM SDH_TS_INFO_NGANH CH
            LEFT JOIN DM_NGANH_SAU_DAI_HOC DM ON CH.MA_NGANH = DM.MA_NGANH
            LEFT JOIN SDH_TS_INFO_PHAN_HE CHPH ON CH.ID_PHAN_HE = CHPH.ID
        WHERE CHPH.ID = idCauHinhPH;
    RETURN listNganh;
end;
CREATE OR REPLACE FUNCTION SDH_TS_GET_PHAN_HE_HINH_THUC(maKyThi IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;

BEGIN
    OPEN my_cursor FOR
        SELECT CHPH.ID          AS "idPhanHe",
               CHPH.ID_DOT      AS "dotTuyenSinh",
               CHPH.MA_PHAN_HE  AS "maPhanHe",
               DMPH.TEN AS "tenPhanHe",
               HT.MA_HINH_THUC  AS "maHinhThuc",
               HT.TEN_HINH_THUC AS "tenHinhThuc"


        FROM DM_HOC_SDH DMPH
                 LEFT JOIN SDH_TS_INFO_PHAN_HE CHPH  ON CHPH.MA_PHAN_HE = DMPH.MA
                 LEFT JOIN
             (SELECT *
              FROM SDH_TS_INFO_HINH_THUC CHHT
                       LEFT JOIN SDH_TS_HINH_THUC DMHT
                                 ON CHHT.MA_HINH_THUC = DMHT.MA) HT
             ON HT.ID_PHAN_HE = CHPH.ID
        WHERE (CHPH.ID_DOT = maKyThi)
     ;


    RETURN my_cursor;
END;
CREATE OR REPLACE FUNCTION SDH_CHUONG_TRINH_DAO_TAO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                                     searchTerm IN STRING,
                                                     totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
    maKhung   NUMBER(20);

BEGIN
    SELECT JSON_VALUE(filter, '$.maKhung' RETURNING NUMBER) INTO maKhung FROM DUAL;
    SELECT COUNT(*)
    INTO totalItem
    FROM SDH_CHUONG_TRINH_DAO_TAO CTDT
             LEFT JOIN TCHC_CAN_BO GV ON GV.SHCC = CTDT.GIANG_VIEN
             LEFT JOIN SDH_KHUNG_DAO_TAO KDT ON CTDT.MA_KHUNG_DAO_TAO = KDT.ID
             LEFT JOIN DM_KHOA_SAU_DAI_HOC SKDT ON KDT.MA_KHOA = SKDT.MA
             LEFT JOIN SDH_DM_CA_HOC CAHOC ON CTDT.TIET_BAT_DAU = CAHOC.MA

    WHERE (CTDT.MA_KHUNG_DAO_TAO = maKhung);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT CTDT.ID                    AS        "id",
                     CTDT.MA_MON_HOC            AS        "maMonHoc",
                     CTDT.LOAI_MON_HOC          AS        "loaiMonHoc",
                     CTDT.TIN_CHI_LY_THUYET     AS        "tinChiLyThuyet",
                     CTDT.TIN_CHI_THUC_HANH     AS        "tinChiThucHanh",
                     CTDT.GHI_CHU               AS        "ghiChu",
                     CTDT.KICH_HOAT             AS        "kichHoat",
                     CTDT.MA_KHOI_KIEN_THUC     AS        "maKhoiKienThuc",
                     CTDT.MA_KHUNG_DAO_TAO      AS        "maKhungDaoTao",
                     CTDT.TEN_MON_HOC           AS        "tenMonHoc",
                     CTDT.MA_KHOI_KIEN_THUC_CON AS        "maKhoiKienThucCon",
                     CTDT.HOC_KY                AS        "hocKy",
                     CTDT.THU                   AS        "thu",
                     CTDT.TIET_BAT_DAU          AS        "tietBatDau",
                     CAHOC.TEN                  AS        "tenTietBatDau",
                     CTDT.CO_SO                 AS        "coSo",
                     CTDT.SO_TIET_BUOI          AS        "soTietBuoi",
                     CTDT.NGAY_BAT_DAU          AS        "ngayBatDau",
                     CTDT.NGAY_KET_THUC         AS        "ngayKetThuc",
                     CTDT.IS_DUYET              AS        "isDuyet",
                     CTDT.MO_LAI                AS        "moLai",
                     CTDT.MA_HOC_PHAN           AS        "maHocPhan",
                     GV.HO || ' ' || GV.TEN     AS        "tenGiangVien",
                     CTDT.GIANG_VIEN            AS        "giangVien",
                     SKDT.TEN                   AS        "tenKhoa",
                     CTDT.PHONG                 AS        "phong",
                     ROW_NUMBER() OVER (ORDER BY CTDT.ID) R
              FROM SDH_CHUONG_TRINH_DAO_TAO CTDT
                       LEFT JOIN TCHC_CAN_BO GV ON GV.SHCC = CTDT.GIANG_VIEN
                       LEFT JOIN SDH_KHUNG_DAO_TAO KDT ON CTDT.MA_KHUNG_DAO_TAO = KDT.ID
                       LEFT JOIN DM_KHOA_SAU_DAI_HOC SKDT ON KDT.MA_KHOA = SKDT.MA
                       LEFT JOIN SDH_DM_CA_HOC CAHOC ON CTDT.TIET_BAT_DAU = CAHOC.MA
              WHERE (CTDT.MA_KHUNG_DAO_TAO = maKhung)
              ORDER BY CTDT.ID)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
CREATE OR REPLACE FUNCTION SDH_DANG_KY_HOC_PHAN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                                 totalItem OUT NUMBER, pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    my_cursor         SYS_REFCURSOR;
    listKhoa          STRING(50);
    listNganh         STRING(50);
    listKhungDaoTao   STRING(50);
    listDotDangKy     STRING(50);
    ks_mssv           STRING(50);
    ks_ho             STRING(50);
    ks_ten            STRING(50);
    ks_tenMonHoc      STRING(50);
    ks_tinChiLyThuyet STRING(10);
    ks_tinChiThucHanh STRING(10);
    ks_tietBatDau     STRING(10);
    ks_phong          STRING(50);
    ks_soTietBuoi     STRING(50);
    ks_nam            STRING(50);
    ks_hocKy          STRING(50);


BEGIN
    SELECT JSON_VALUE(filter, '$.listKhoa') INTO listKhoa FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNganh') INTO listNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listKhungDaoTao') INTO listKhungDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDotDangKy') INTO listDotDangKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_mssv') INTO ks_mssv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ho') INTO ks_ho FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ten') INTO ks_ten FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tenMonHoc') INTO ks_tenMonHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tinChiLyThuyet') INTO ks_tinChiLyThuyet FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tinChiThucHanh') INTO ks_tinChiThucHanh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tietBatDau') INTO ks_tietBatDau FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phong') INTO ks_phong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_soTietBuoi') INTO ks_soTietBuoi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_nam') INTO ks_nam FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_hocKy') INTO ks_hocKy FROM DUAL;


    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT DISTINCT MH.TEN_TIENG_VIET       AS "tenMonHoc",
                          MH.TC_LY_THUYET         AS "tinChiLyThuyet",
                          MH.TC_THUC_HANH         AS "tinChiThucHanh",
                          MH.MA                   AS "maMonHoc",
                          CB.HO                   AS "giangVienHo",
                          CB.TEN                  AS "giangVienName",
                          DKT.NAM                 AS "namDotDangKy",
                          DKT.HOC_KY              AS "hocKyDotDangKy",
                          DKHP.ID_DOT_DANG_KY     AS "idDotDangKyHocPhan",
                          TB_COUNT.COUNT          AS "soLuong",
                          TKB.TIET_BAT_DAU        AS "tietBatDau",
                          TKB.NGAY_BAT_DAU        AS "ngayBatDau",
                          TKB.PHONG               AS "phong",
                          TKB.NHOM                AS "nhom",
                          TKB.THU                 AS "thu",
                          TKB.SO_TIET_BUOI        AS "soTietBuoi",
                          DKHP.MA_HOC_PHAN        AS "maHocPhan",
                          SV.HO                   AS "ho",
                          SV.TEN                  AS "ten",
                          SV.MSSV                 AS "mssv",
                          SV.MA_KHOA              AS "maKhoa",
                          SV.MA_NGANH             AS "maNganh",
                          NDT.TEN                 AS "tenNganh",
                          DV.TEN                  AS "tenKhoa",
                          DVI.TEN                 AS "tenDonVi",
                          TRINH_DO.TEN            AS "trinhDo",
                          DMT.TEN                 AS "tenThu",
                          DMCH.THOI_GIAN_BAT_DAU  AS "thoiGianBatDau",
                          DMCH.THOI_GIAN_KET_THUC AS "thoiGianKetThuc"
          FROM SDH_DANG_KY_HOC_PHAN DKHP
                   LEFT JOIN SDH_KHUNG_DAO_TAO KDT ON
              KDT.ID = DKHP.MA_KHUNG_DAO_TAO
                   LEFT JOIN SDH_DOT_DANG_KY DKT ON
              DKT.ID = DKHP.ID_DOT_DANG_KY
                   LEFT JOIN SDH_THOI_KHOA_BIEU TKB ON
                      TKB.MA_HOC_PHAN = DKHP.MA_HOC_PHAN
                  AND TKB.HOC_KY = DKT.HOC_KY
                  AND TKB.NAM = DKT.NAM
                   LEFT JOIN TCHC_CAN_BO CB ON
              CB.SHCC = TKB.GIANG_VIEN
                   LEFT JOIN DM_DON_VI DVI on CB.MA_DON_VI = DVI.MA
                   LEFT JOIN DM_TRINH_DO TRINH_DO ON TRINH_DO.MA = CB.HOC_VI
                   LEFT JOIN FW_SINH_VIEN_SDH SV ON
              SV.MSSV = DKHP.MSSV
                   LEFT JOIN DM_KHOA_SAU_DAI_HOC DV ON
              KDT.MA_KHOA = DV.MA
                   LEFT JOIN DM_NGANH_SAU_DAI_HOC NDT ON
              KDT.MA_NGANH = NDT.MA_NGANH
                   LEFT JOIN SDH_DM_MON_HOC_MOI MH ON TKB.MA_MON_HOC = MH.MA
                   LEFT JOIN SDH_DM_THU DMT ON DMT.MA = TKB.THU
                   LEFT JOIN SDH_DM_CA_HOC DMCH ON DMCH.MA = TKB.TIET_BAT_DAU

                   LEFT JOIN (SELECT HP.MA_HOC_PHAN,
                                     HP.ID_DOT_DANG_KY,
                                     COUNT(HP.MA_HOC_PHAN) AS COUNT
                              FROM SDH_DANG_KY_HOC_PHAN HP
                              GROUP BY HP.MA_HOC_PHAN, HP.ID_DOT_DANG_KY) TB_COUNT
                             ON TB_COUNT.ID_DOT_DANG_KY = DKHP.ID_DOT_DANG_KY
                                 AND TB_COUNT.MA_HOC_PHAN = DKHP.MA_HOC_PHAN
          WHERE (
                            DKHP.IS_DELETE = '0'
                        AND
                            (ks_mssv IS NULL OR lower(SV.MSSV) LIKE ('%' || lower(trim(ks_mssv)) || '%'))
                        AND
                            (ks_ho IS NULL OR lower(SV.HO) LIKE ('%' || lower(trim(ks_ho)) || '%'))
                        AND
                            (ks_ten IS NULL OR lower(SV.TEN) LIKE ('%' || lower(trim(ks_ten)) || '%'))
                        AND
                            (ks_tenMonHoc IS NULL OR lower(MH.MA) LIKE ('%' || lower(trim(ks_tenMonHoc)) || '%'))
                        AND
                            (ks_tinChiLyThuyet IS NULL OR
                             lower(MH.TC_LY_THUYET) LIKE ('%' || lower(trim(ks_tinChiLyThuyet)) || '%'))
                        AND
                            (ks_tinChiThucHanh IS NULL OR
                             lower(MH.TC_THUC_HANH) LIKE ('%' || lower(trim(ks_tinChiThucHanh)) || '%'))
                        AND
                            (ks_tietBatDau IS NULL OR
                             lower(TKB.TIET_BAT_DAU) LIKE ('%' || lower(trim(ks_tietBatDau)) || '%'))
                        AND
                            (ks_phong IS NULL OR
                             lower(TKB.NHOM) LIKE ('%' || lower(trim(ks_phong)) || '%'))
                        AND
                            (ks_nam IS NULL OR
                             lower(TKB.NAM) LIKE ('%' || lower(trim(ks_nam)) || '%'))
                        AND
                            (ks_hocKy IS NULL OR
                             lower(TKB.HOC_KY) LIKE ('%' || lower(trim(ks_hocKy)) || '%'))
                        AND (
                                    (listKhoa IS NOT NULL AND
                                     DV.MA IN (SELECT regexp_substr(listKhoa, '[^,]+', 1, level)
                                               from dual
                                               connect by regexp_substr(listKhoa, '[^,]+', 1, level) is not null) OR
                                     listKhoa IS NULL)
                                    AND
                                    (listNganh IS NOT NULL AND
                                     NDT.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
                                                      from dual
                                                      connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null) OR
                                     listNganh IS NULL)
                                    AND
                                    (listKhungDaoTao IS NOT NULL AND
                                     KDT.ID IN (SELECT regexp_substr(listKhungDaoTao, '[^,]+', 1, level)
                                                from dual
                                                connect by regexp_substr(listKhungDaoTao, '[^,]+', 1, level) is not null) OR
                                     listKhungDaoTao IS NULL)
                                    AND
                                    (listDotDangKy IS NOT NULL AND
                                     DKT.ID IN (SELECT regexp_substr(listDotDangKy, '[^,]+', 1, level)
                                                from dual
                                                connect by regexp_substr(listDotDangKy, '[^,]+', 1, level) is not null) OR
                                     listDotDangKy IS NULL)
                                ))
          GROUP BY MH.TEN_TIENG_VIET,
                   MH.TC_LY_THUYET,
                   MH.TC_THUC_HANH,
                   MH.MA,
                   CB.HO,
                   CB.TEN,
                   DKT.NAM,
                   DKT.HOC_KY,
                   DKHP.ID_DOT_DANG_KY,
                   TB_COUNT.COUNT,
                   TKB.TIET_BAT_DAU,
                   TKB.NGAY_BAT_DAU,
                   TKB.PHONG,
                   TKB.NHOM,
                   TKB.THU,
                   TKB.SO_TIET_BUOI,
                   DKHP.MA_HOC_PHAN,
                   SV.HO,
                   SV.TEN,
                   SV.MSSV,
                   SV.MA_KHOA,
                   SV.MA_NGANH,
                   NDT.TEN,
                   DV.TEN,
                   DVI.TEN,
                   TRINH_DO.TEN,
                   DMT.TEN,
                   DMCH.THOI_GIAN_BAT_DAU,
                   DMCH.THOI_GIAN_KET_THUC);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT table_tem.*,
                     ROW_NUMBER() OVER (ORDER BY
                         table_tem."mssv" ) R
              FROM (SELECT DISTINCT MH.TEN_TIENG_VIET       AS "tenMonHoc",
                                    MH.TC_LY_THUYET         AS "tinChiLyThuyet",
                                    MH.TC_THUC_HANH         AS "tinChiThucHanh",
                                    MH.MA                   AS "maMonHoc",
                                    CB.HO || ' ' || CB.TEN  AS "giangVien",
                                    DKT.NAM                 AS "nam",
                                    DKT.HOC_KY              AS "hocKy",
                                    DKHP.ID_DOT_DANG_KY     AS "dotDangKy",
                                    TB_COUNT.COUNT          AS "soLuong",
                                    TKB.TIET_BAT_DAU        AS "tietBatDau",
                                    TKB.NGAY_BAT_DAU        AS "ngayBatDau",
                                    TKB.PHONG               AS "phong",
                                    TKB.NHOM                AS "nhom",
                                    TKB.THU                 AS "thu",
                                    TKB.SO_TIET_BUOI        AS "soTietBuoi",
                                    DKHP.MA_HOC_PHAN        AS "maHocPhan",
                                    SV.HO                   AS "ho",
                                    SV.TEN                  AS "ten",
                                    SV.MSSV                 AS "mssv",
                                    SV.MA_KHOA              AS "maKhoa",
                                    SV.MA_NGANH             AS "maNganh",
                                    NDT.TEN                 AS "tenNganh",
                                    DV.TEN                  AS "tenKhoa",
                                    DVI.TEN                 AS "donVi",
                                    TRINH_DO.TEN            AS "trinhDo",
                                    DMT.TEN                 AS "dmThu",
                                    DMCH.THOI_GIAN_BAT_DAU  AS "batDau",
                                    DMCH.THOI_GIAN_KET_THUC AS "ketThuc"
                    FROM SDH_DANG_KY_HOC_PHAN DKHP
                             LEFT JOIN SDH_KHUNG_DAO_TAO KDT ON
                        KDT.ID = DKHP.MA_KHUNG_DAO_TAO
                             LEFT JOIN SDH_DOT_DANG_KY DKT ON
                        DKT.ID = DKHP.ID_DOT_DANG_KY
                             LEFT JOIN SDH_THOI_KHOA_BIEU TKB ON
                        TKB.MA_HOC_PHAN = DKHP.MA_HOC_PHAN
                             LEFT JOIN TCHC_CAN_BO CB ON
                        CB.SHCC = TKB.GIANG_VIEN
                             LEFT JOIN FW_SINH_VIEN_SDH SV ON
                        SV.MSSV = DKHP.MSSV
                             LEFT JOIN DM_KHOA_SAU_DAI_HOC DV ON
                        KDT.MA_KHOA = DV.MA
                             LEFT JOIN DM_NGANH_SAU_DAI_HOC NDT ON
                        KDT.MA_NGANH = NDT.MA_NGANH
                             LEFT JOIN SDH_DM_MON_HOC_MOI MH ON TKB.MA_MON_HOC = MH.MA
                             LEFT JOIN DM_DON_VI DVI on CB.MA_DON_VI = DVI.MA
                             LEFT JOIN DM_TRINH_DO TRINH_DO ON TRINH_DO.MA = CB.HOC_VI
                             LEFT JOIN SDH_DM_THU DMT ON DMT.MA = TKB.THU
                             LEFT JOIN SDH_DM_CA_HOC DMCH ON
                        DMCH.MA = TKB.TIET_BAT_DAU

                             LEFT JOIN (SELECT HP.MA_HOC_PHAN,
                                               HP.ID_DOT_DANG_KY,
                                               COUNT(HP.MA_HOC_PHAN) AS COUNT
                                        FROM SDH_DANG_KY_HOC_PHAN HP
                                        GROUP BY HP.MA_HOC_PHAN, HP.ID_DOT_DANG_KY) TB_COUNT
                                       ON TB_COUNT.ID_DOT_DANG_KY = DKHP.ID_DOT_DANG_KY
                                           AND TB_COUNT.MA_HOC_PHAN = DKHP.MA_HOC_PHAN
                    WHERE (
                                      DKHP.IS_DELETE = '0'
                                  AND
                                      (ks_mssv IS NULL OR lower(SV.MSSV) LIKE ('%' || lower(trim(ks_mssv)) || '%'))
                                  AND
                                      (ks_ho IS NULL OR lower(SV.HO) LIKE ('%' || lower(trim(ks_ho)) || '%'))
                                  AND
                                      (ks_ten IS NULL OR lower(SV.TEN) LIKE ('%' || lower(trim(ks_ten)) || '%'))
                                  AND
                                      (ks_tenMonHoc IS NULL OR
                                       lower(MH.MA) LIKE ('%' || lower(trim(ks_tenMonHoc)) || '%'))
                                  AND
                                      (ks_tinChiLyThuyet IS NULL OR
                                       lower(MH.TC_LY_THUYET) LIKE ('%' || lower(trim(ks_tinChiLyThuyet)) || '%'))
                                  AND
                                      (ks_tinChiThucHanh IS NULL OR
                                       lower(MH.TC_THUC_HANH) LIKE ('%' || lower(trim(ks_tinChiThucHanh)) || '%'))
                                  AND
                                      (ks_tietBatDau IS NULL OR
                                       lower(TKB.TIET_BAT_DAU) LIKE ('%' || lower(trim(ks_tietBatDau)) || '%'))
                                  AND
                                      (ks_phong IS NULL OR
                                       lower(TKB.NHOM) LIKE ('%' || lower(trim(ks_phong)) || '%'))
                                  AND
                                      (ks_nam IS NULL OR
                                       lower(TKB.NAM) LIKE ('%' || lower(trim(ks_nam)) || '%'))
                                  AND
                                      (ks_hocKy IS NULL OR
                                       lower(TKB.HOC_KY) LIKE ('%' || lower(trim(ks_hocKy)) || '%'))
                                  AND (
                                              (listKhoa IS NOT NULL AND
                                               DV.MA IN (SELECT regexp_substr(listKhoa, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listKhoa, '[^,]+', 1, level) is not null) OR
                                               listKhoa IS NULL)
                                              AND
                                              (listNganh IS NOT NULL AND
                                               NDT.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
                                                                from dual
                                                                connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null) OR
                                               listNganh IS NULL)
                                              AND
                                              (listKhungDaoTao IS NOT NULL AND
                                               KDT.ID IN (SELECT regexp_substr(listKhungDaoTao, '[^,]+', 1, level)
                                                          from dual
                                                          connect by regexp_substr(listKhungDaoTao, '[^,]+', 1, level) is not null) OR
                                               listKhungDaoTao IS NULL)
                                              AND
                                              (listDotDangKy IS NOT NULL AND
                                               DKT.ID IN (SELECT regexp_substr(listDotDangKy, '[^,]+', 1, level)
                                                          from dual
                                                          connect by regexp_substr(listDotDangKy, '[^,]+', 1, level) is not null) OR
                                               listDotDangKy IS NULL)
                                          ))
                    GROUP BY MH.TEN_TIENG_VIET,
                             MH.TC_LY_THUYET,
                             MH.TC_THUC_HANH,
                             MH.MA,
                             CB.HO,
                             CB.TEN,
                             DKT.NAM,
                             DKT.HOC_KY,
                             DKHP.ID_DOT_DANG_KY,
                             TB_COUNT.COUNT,
                             TKB.TIET_BAT_DAU,
                             TKB.NGAY_BAT_DAU,
                             TKB.PHONG,
                             TKB.NHOM,
                             TKB.THU,
                             TKB.SO_TIET_BUOI,
                             DKHP.MA_HOC_PHAN,
                             SV.HO,
                             SV.TEN,
                             SV.MSSV,
                             SV.MA_KHOA,
                             SV.MA_NGANH,
                             NDT.TEN,
                             DV.TEN,
                             DVI.TEN,
                             TRINH_DO.TEN,
                             DMT.TEN,
                             DMCH.THOI_GIAN_BAT_DAU,
                             DMCH.THOI_GIAN_KET_THUC) table_tem)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
CREATE OR REPLACE FUNCTION SDH_DANG_KY_HOC_PHAN_GET_DATA_HOC_PHAN(filterHP IN STRING) RETURN SYS_REFCURSOR
AS
    SCHEDULE_INFO  SYS_REFCURSOR;
    loaiHinhDaoTao STRING(50);
    khoaDaoTao     STRING(50);
    khoaSinhVien   STRING(50);
    listDotDangKy  STRING(50);
    hocKy          STRING(50);
    namHoc         STRING(50);
    ks_maHocPhan   STRING(50);
    ks_tenMonHoc   STRING(1000);
    maMonHoc       STRING(50);
    lopSV          STRING(50);
BEGIN
    SELECT JSON_VALUE(filterHP, '$.loaiHinhDaoTao') INTO loaiHinhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filterHP, '$.khoaDaoTao') INTO khoaDaoTao FROM DUAL;
    SELECT JSON_VALUE(filterHP, '$.khoaSinhVien') INTO khoaSinhVien FROM DUAL;
    SELECT JSON_VALUE(filterHP, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filterHP, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filterHP, '$.ks_maHocPhan') INTO ks_maHocPhan FROM DUAL;
    SELECT JSON_VALUE(filterHP, '$.ks_tenMonHoc') INTO ks_tenMonHoc FROM DUAL;
    SELECT JSON_VALUE(filterHP, '$.maMonHoc') INTO maMonHoc FROM DUAL;
    SELECT JSON_VALUE(filterHP, '$.lopSV') INTO lopSV FROM DUAL;
    SELECT JSON_VALUE(filterHP, '$.listDotDangKy') INTO listDotDangKy FROM DUAL;

    OPEN SCHEDULE_INFO FOR
        SELECT distinct TKB.MA_MON_HOC                                AS "maMonHoc",
                        TKB.HOC_KY                                    AS "hocKy",
                        TKB.NAM                                       AS "namHoc",
                        TKB.KHOA_DANG_KY                              AS "khoaDangKy",
                        DV1.TEN                                       AS "tenKhoaDangKy",
                        TKB.LOAI_HINH_DAO_TAO                         AS "loaiHinhDaoTao",
                        TKB.KHOA_SINH_VIEN                            AS "khoaSinhVien",
                        TKB.MA_HOC_PHAN                               AS "maHocPhan",
                        TKB.THU                                       AS "thu",
                        TKB.PHONG                                     AS "phong",
                        TKB.TIET_BAT_DAU                              AS "tietBatDau",
                        TKB.SO_TIET_BUOI                              AS "soTietBuoi",
                        TKB.HOC_KY                                    AS "semester",
                        TKB.NGAY_BAT_DAU                              AS "ngayBatDau",
                        TKB.NGAY_KET_THUC                             AS "ngayKetThuc",
                        DMMH.TEN_TIENG_VIET                           AS "tenMonHoc",
                        DMMH.MA                                       AS "maMonHoc",
                        TKB.TINH_TRANG                                AS "tinhTrang",
                        TTHP.TEN                                      AS "tenTinhTrang",
                        GV.HO || ' ' || GV.TEN                        AS "giangVien",
                        ''                                            AS "troGiang",
                        DMMH.TC_LY_THUYET + DMMH.TC_THUC_HANH         AS "tongTinChi",
                        TKB.SO_TIET_THUC_HANH + TKB.SO_TIET_LY_THUYET AS "tongTiet",
                        (SELECT COUNT(temp.MSSV)
                         FROM SDH_DANG_KY_HOC_PHAN temp
                         WHERE temp.MA_HOC_PHAN = TKB.MA_HOC_PHAN
                         GROUP BY temp.MA_HOC_PHAN)                   AS "siSo",
                        TKB.SO_LUONG_DU_KIEN                          AS "soLuongDuKien"
        FROM SDH_DSHP_DOT_DKHP SDDD
                 LEFT JOIN SDH_THOI_KHOA_BIEU TKB on TKB.MA_HOC_PHAN = SDDD.MA_HOC_PHAN
                 LEFT JOIN DM_KHOA_SAU_DAI_HOC DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                 LEFT JOIN SDH_KHUNG_DAO_TAO KDT ON KDT.ID = TKB.MA_KHUNG_DAO_TAO
                 LEFT JOIN DM_NGANH_SAU_DAI_HOC NGANHSDH ON NGANHSDH.MA_NGANH = KDT.MA_NGANH
                 LEFT JOIN DM_MON_HOC_SDH DMMH ON DMMH.MA = TKB.MA_MON_HOC
                 LEFT JOIN TCHC_CAN_BO GV ON GV.SHCC = TKB.GIANG_VIEN
                 LEFT JOIN DM_HOC_SDH PH ON PH.MA = TKB.BAC_DAO_TAO
                 LEFT JOIN SDH_TINH_TRANG_HOC_PHAN TTHP ON TTHP.MA = TKB.TINH_TRANG
                 LEFT JOIN SDH_DOT_DANG_KY DDK ON TKB.NAM = DDK.NAM
            AND TKB.HOC_KY = DDK.HOC_KY
        WHERE TTHP.MA = 2
          AND listDotDangKy IS NOT NULL
          AND TKB.MA_MON_HOC IS NOT NULL
          AND listDotDangKy LIKE SDDD.ID_DOT
          AND (loaiHinhDaoTao IS NULL OR
               (TKB.BAC_DAO_TAO IN (SELECT regexp_substr(loaiHinhDaoTao, '[^,]+', 1, level)
                                    from dual
                                    connect by regexp_substr(loaiHinhDaoTao, '[^,]+', 1, level) is not null)))

          AND (khoaDaoTao IS NULL OR
               (DV1.MA IN (SELECT regexp_substr(khoaDaoTao, '[^,]+', 1, level)
                           from dual
                           connect by regexp_substr(khoaDaoTao, '[^,]+', 1, level) is not null)))
          AND (khoaSinhVien IS NULL OR
               (TKB.KHOA_SINH_VIEN IN (SELECT regexp_substr(khoaSinhVien, '[^,]+', 1, level)
                                       from dual
                                       connect by regexp_substr(khoaSinhVien, '[^,]+', 1, level) is not null)));


    RETURN SCHEDULE_INFO;
end ;
CREATE OR REPLACE FUNCTION SDH_MA_HOC_PHAN_DOT_DKHP_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                                     totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor          SYS_REFCURSOR;
    namFilter          STRING(11);
    hocKy              STRING(1);
    phanHeFilter       STRING(10);
    khoaSinhVienFilter STRING(4);
    thuFilter          STRING(5);
    monHocFilter       STRING(20);
    ks_tinhTrang       STRING(5);
    ks_maMon           STRING(20);
    ks_maHocPhan       STRING(20);
    ks_tenMonHoc       STRING(100);
    ks_phong           STRING(20);
    ks_sldk            STRING(5);
    ks_thu             STRING(10);
    ks_tietBatDau      STRING(5);
    ks_ngayBatDau      NUMBER(20);
    ks_ngayKetThuc     NUMBER(20);
    --   ks_giangVien       STRING(50);
    ks_phanHe          STRING(20);
    ks_khoaSinhVien    STRING(5);
    ks_namHoc          STRING(5);
    ks_hocKy           STRING(5);
    ks_nganhDaoTao     STRING(50);
    dotDangKy          STRING(50);
    ks_maMonHoc        STRING(50);
BEGIN
    SELECT JSON_VALUE(filter, '$.namFilter') INTO namFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.phanHeFilter') INTO phanHeFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.khoaSinhVienFilter') INTO khoaSinhVienFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.thuFilter') INTO thuFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tinhTrang') INTO ks_tinhTrang FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_maMon') INTO ks_maMon FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_maHocPhan') INTO ks_maHocPhan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tenMonHoc') INTO ks_tenMonHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phong') INTO ks_phong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_sldk') INTO ks_sldk FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_thu') INTO ks_thu FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tietBatDau') INTO ks_tietBatDau FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngayBatDau') INTO ks_ngayBatDau FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngayKetThuc') INTO ks_ngayKetThuc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phanHe') INTO ks_phanHe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_khoaSinhVien') INTO ks_khoaSinhVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_namHoc') INTO ks_namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_hocKy') INTO ks_hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_nganhDaoTao') INTO ks_nganhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.dotDangKy') INTO dotDangKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_maMonHoc') INTO ks_maMonHoc FROM DUAL;


    SELECT COUNT(*)
    INTO totalItem
    FROM SDH_DSHP_DOT_DKHP SDDD
             LEFT JOIN SDH_THOI_KHOA_BIEU TKB on TKB.MA_HOC_PHAN = SDDD.MA_HOC_PHAN
             LEFT JOIN DM_KHOA_SAU_DAI_HOC DV1 ON DV1.MA = TKB.KHOA_DANG_KY
             LEFT JOIN SDH_KHUNG_DAO_TAO KDT ON KDT.ID = TKB.MA_KHUNG_DAO_TAO
             LEFT JOIN DM_NGANH_SAU_DAI_HOC NGANHSDH ON NGANHSDH.MA_NGANH = KDT.MA_NGANH
             LEFT JOIN DM_MON_HOC_SDH DMMH ON DMMH.MA = TKB.MA_MON_HOC
             LEFT JOIN TCHC_CAN_BO GV ON GV.SHCC = TKB.GIANG_VIEN
             LEFT JOIN DM_HOC_SDH PH ON PH.MA = TKB.BAC_DAO_TAO
             LEFT JOIN SDH_TINH_TRANG_HOC_PHAN TTHP ON TTHP.MA = TKB.TINH_TRANG
             LEFT JOIN SDH_DOT_DANG_KY DDK ON DDK.ID = SDDD.ID_DOT

    WHERE (dotDangKy IS NULL OR DDK.ID = dotDangKy)
      AND TTHP.MA = 2
      AND (ks_tinhTrang IS NULL OR lower(TTHP.TEN) like ('%' || lower(ks_tinhTrang) || '%'))
      AND (ks_maMon IS NULL OR lower(DMMH.MA) like ('%' || lower(ks_maMon) || '%'))
      AND (ks_maHocPhan IS NULL OR lower(TKB.MA_HOC_PHAN) like ('%' || lower(ks_maHocPhan) || '%'))
      AND (ks_tenMonHoc IS NULL OR lower(DMMH.TEN_TIENG_VIET) like ('%' || lower(ks_tenMonHoc) || '%'))
      --  AND (ks_tenMonHoc IS NULL OR lower(DMMH.TEN_TIENG_ANH) like ('%' || lower(ks_tenMonHoc) || '%'))
      AND (ks_phong IS NULL OR lower(TKB.PHONG) like ('%' || lower(ks_phong) || '%'))
      AND (ks_sldk IS NULL OR TKB.SO_LUONG_DU_KIEN = ks_sldk)
      AND (ks_thu IS NULL OR TKB.THU = ks_thu)
      AND (ks_tietBatDau IS NULL OR TKB.TIET_BAT_DAU = ks_tietBatDau)
      AND (ks_ngayBatDau IS NULL OR TKB.NGAY_BAT_DAU = ks_ngayBatDau)
      AND (ks_ngayKetThuc IS NULL OR TKB.NGAY_KET_THUC = ks_ngayKetThuc)
      AND (ks_phanHe IS NULL OR lower(PH.TEN) like ('%' || lower(ks_phanHe) || '%'))
      AND (ks_khoaSinhVien IS NULL OR lower(TKB.KHOA_SINH_VIEN) like ('%' || lower(ks_khoaSinhVien) || '%'))
      AND (ks_namHoc IS NULL OR TKB.NAM = ks_namHoc)
      AND (ks_hocKy IS NULL OR TKB.HOC_KY = ks_hocKy)
      AND (ks_nganhDaoTao IS NULL OR lower(NGANHSDH.ten) like ('%' || lower(ks_nganhDaoTao) || '%')
        AND SDDD.MA_HOC_PHAN IS NOT NULL);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        select *
        from (SELECT tem."id",
                     tem."phong",
                     tem."thu",
                     tem."tietBatDau",
                     tem."soTietBuoi",
                     tem."hocKy",
                     tem."namHoc",
                     tem."maMonHoc",
                     tem."maHocPhan",
                     tem."ngayBatDau",
                     tem."ngayKetThuc",
                     tem."loaiMonHoc",
                     tem."nhom",
                     tem."soLuongDuKien",
                     tem."tenMonHoc",
                     tem."khoaDangKy",
                     tem."tenKhoaDangKy",
                     tem."sucChua",
                     tem."buoi",
                     tem."isMo",
                     tem."bacDaoTao",
                     tem."loaiHinhDaoTao",
                     tem."khoaSinhVien",
                     tem."tinhTrang",
                     tem."giangVien",
                     tem."tenPhanHe",
                     tem."nganhDaoTao",
                     tem."kichHoat"
                      ,
                     ROW_NUMBER() OVER (ORDER BY tem."id") R
              FROM (SELECT distinct SDDD.ID                AS "id",
                                    TKB.PHONG              AS "phong",
                                    TKB.THU                AS "thu",
                                    TKB.TIET_BAT_DAU       AS "tietBatDau",
                                    TKB.SO_TIET_BUOI       AS "soTietBuoi",
                                    TKB.HOC_KY             AS "hocKy",
                                    TKB.NAM                AS "namHoc",
                                    TKB.MA_MON_HOC         AS "maMonHoc",
                                    TKB.MA_HOC_PHAN        AS "maHocPhan",
                                    TKB.NGAY_BAT_DAU       AS "ngayBatDau",
                                    TKB.NGAY_KET_THUC      AS "ngayKetThuc",
                                    TKB.LOAI_MON_HOC       AS "loaiMonHoc",
                                    TKB.NHOM               AS "nhom",
                                    TKB.SO_LUONG_DU_KIEN   AS "soLuongDuKien",
                                    DMMH.TEN_TIENG_VIET    AS "tenMonHoc",
                                    TKB.KHOA_DANG_KY       AS "khoaDangKy",
                                    DV1.TEN                AS "tenKhoaDangKy",
                                    TKB.SUC_CHUA           AS "sucChua",
                                    TKB.BUOI               AS "buoi",
                                    TKB.IS_MO              AS "isMo",
                                    TKB.BAC_DAO_TAO        AS "bacDaoTao",
                                    TKB.LOAI_HINH_DAO_TAO  AS "loaiHinhDaoTao",
                                    TKB.KHOA_SINH_VIEN     AS "khoaSinhVien",
                                    TKB.TINH_TRANG         AS "tinhTrang",
                                    GV.HO || ' ' || GV.TEN AS "giangVien",
                                    PH.TEN                 AS "tenPhanHe",
                                    NGANHSDH.TEN           AS "nganhDaoTao",
                                    SDDD.KICH_HOAT         AS "kichHoat"
                    FROM SDH_DSHP_DOT_DKHP SDDD
                             LEFT JOIN SDH_THOI_KHOA_BIEU TKB on TKB.MA_HOC_PHAN = SDDD.MA_HOC_PHAN
                             LEFT JOIN DM_KHOA_SAU_DAI_HOC DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                             LEFT JOIN SDH_KHUNG_DAO_TAO KDT ON KDT.ID = TKB.MA_KHUNG_DAO_TAO
                             LEFT JOIN DM_NGANH_SAU_DAI_HOC NGANHSDH ON NGANHSDH.MA_NGANH = KDT.MA_NGANH
                             LEFT JOIN DM_MON_HOC_SDH DMMH ON DMMH.MA = TKB.MA_MON_HOC
                             LEFT JOIN TCHC_CAN_BO GV ON GV.SHCC = TKB.GIANG_VIEN
                             LEFT JOIN DM_HOC_SDH PH ON PH.MA = TKB.BAC_DAO_TAO
                             LEFT JOIN SDH_TINH_TRANG_HOC_PHAN TTHP ON TTHP.MA = TKB.TINH_TRANG
                             LEFT JOIN SDH_DOT_DANG_KY DDK ON DDK.ID = SDDD.ID_DOT


                    WHERE (dotDangKy IS NULL OR SDDD.ID_DOT = dotDangKy)
                      AND TTHP.MA = 2
                      AND (ks_tinhTrang IS NULL OR lower(TTHP.TEN) like ('%' || lower(ks_tinhTrang) || '%'))
                      AND (ks_maMon IS NULL OR lower(DMMH.MA) like ('%' || lower(ks_maMon) || '%'))
                      AND (ks_maMonHoc IS NULL OR lower(TKB.MA_MON_HOC) like ('%' || lower(ks_maMonHoc) || '%'))
                      AND (ks_maHocPhan IS NULL OR lower(TKB.MA_HOC_PHAN) like ('%' || lower(ks_maHocPhan) || '%'))
                      AND (ks_tenMonHoc IS NULL OR lower(DMMH.TEN_TIENG_VIET) like ('%' || lower(ks_tenMonHoc) || '%'))
                      --  AND (ks_tenMonHoc IS NULL OR lower(DMMH.TEN_TIENG_ANH) like ('%' || lower(ks_tenMonHoc) || '%'))
                      AND (ks_phong IS NULL OR lower(TKB.PHONG) like ('%' || lower(ks_phong) || '%'))
                      AND (ks_sldk IS NULL OR TKB.SO_LUONG_DU_KIEN = ks_sldk)
                      AND (ks_thu IS NULL OR TKB.THU = ks_thu)
                      AND (ks_tietBatDau IS NULL OR TKB.TIET_BAT_DAU = ks_tietBatDau)
                      AND (ks_ngayBatDau IS NULL OR TKB.NGAY_BAT_DAU = ks_ngayBatDau)
                      AND (ks_ngayKetThuc IS NULL OR TKB.NGAY_KET_THUC = ks_ngayKetThuc)
                      AND (ks_phanHe IS NULL OR lower(PH.TEN) like ('%' || lower(ks_phanHe) || '%'))
                      AND (ks_khoaSinhVien IS NULL OR
                           lower(TKB.KHOA_SINH_VIEN) like ('%' || lower(ks_khoaSinhVien) || '%'))
                      AND (ks_namHoc IS NULL OR TKB.NAM = ks_namHoc)
                      AND (ks_hocKy IS NULL OR TKB.HOC_KY = ks_hocKy)
                      AND (ks_nganhDaoTao IS NULL OR lower(NGANHSDH.ten) like ('%' || lower(ks_nganhDaoTao) || '%'))
                      AND SDDD.MA_HOC_PHAN IS NOT NULL

                    ORDER BY TKB.NAM, TKB.KHOA_DANG_KY) tem)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
CREATE OR REPLACE FUNCTION SDH_GET_NGANH_BY_KHOA_DAO_TAO(idKhoaDaoTao IN STRING)
    RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR SELECT *
                       FROM (SELECT DISTINCT NGANH.TEN         AS "ten",
                                             NGANH.MA_NGANH    AS "maNganh",
                                             NGANH.MA_LOP      AS "maLop",
                                             NGANH.MA_VIET_TAT AS "tenVietTat"
                             FROM SDH_KHOA_DAO_TAO KDT
                                      LEFT JOIN SDH_TS_INFO_PHAN_HE PH ON KDT.ID_INFO_PHAN_HE = PH.ID
                                      LEFT JOIN SDH_TS_INFO_NGANH NG
                                                ON NG.PHAN_HE = PH.MA_PHAN_HE AND NG.ID_PHAN_HE = PH.ID
                                      LEFT JOIN DM_NGANH_SAU_DAI_HOC NGANH ON NGANH.MA_NGANH = NG.MA_NGANH
                             WHERE KDT.ID LIKE idKhoaDaoTao
                               AND NGANH.MA_NGANH IS NOT NULL
                             ORDER BY NGANH.TEN,
                                      NGANH.MA_NGANH,
                                      NGANH.MA_LOP,
                                      NGANH.MA_VIET_TAT);
    RETURN my_cursor;
END ;
CREATE OR REPLACE FUNCTION SDH_CHECK_KHUNG_DAO_TAO(filterHP IN STRING, dotTuyen OUT SYS_REFCURSOR) RETURN SYS_REFCURSOR
AS
    SCHEDULE_INFO SYS_REFCURSOR;
    maKhoa        STRING(50);
    maNganh       STRING(50);
    heDaoTao      STRING(50);
    khoaSinhVien  STRING(50);
    dotTrungTuyen STRING(50);
    idKhoaDaoTao  STRING(50);
BEGIN
    SELECT JSON_VALUE(filterHP, '$.maKhoa') INTO maKhoa FROM DUAL;
    SELECT JSON_VALUE(filterHP, '$.maNganh') INTO maNganh FROM DUAL;
    SELECT JSON_VALUE(filterHP, '$.heDaoTao') INTO heDaoTao FROM DUAL;
    SELECT JSON_VALUE(filterHP, '$.khoaSinhVien') INTO khoaSinhVien FROM DUAL;
    SELECT JSON_VALUE(filterHP, '$.dotTrungTuyen') INTO dotTrungTuyen FROM DUAL;
    SELECT JSON_VALUE(filterHP, '$.idKhoaDaoTao') INTO idKhoaDaoTao FROM DUAL;

    OPEN dotTuyen FOR
        SELECT PHE.ID_DOT AS "dotThiTuyen"
        FROM SDH_KHOA_DAO_TAO KDT
                 LEFT JOIN SDH_TS_INFO_PHAN_HE PHE ON PHE.ID = KDT.ID_INFO_PHAN_HE
            AND PHE.MA_PHAN_HE = heDaoTao
            AND PHE.KICH_HOAT = 1
        WHERE PHE.ID_DOT IS NOT NULL;

    OPEN SCHEDULE_INFO FOR
        SELECT KHUNG.MA_CTDT AS "maCtdt",
               KDT.ID        AS "khungDaoTao"
        FROM SDH_KHOA_DAO_TAO KDT
                 LEFT JOIN SDH_TS_INFO_PHAN_HE PHE ON PHE.ID = KDT.ID_INFO_PHAN_HE
                 LEFT JOIN SDH_KHUNG_DAO_TAO KHUNG ON KHUNG.DOT_TRUNG_TUYEN = PHE.ID_DOT
        WHERE (idKhoaDaoTao IS NOT NULL AND KDT.ID = idKhoaDaoTao)
          AND (maNganh IS NOT NULL AND KHUNG.MA_NGANH = maNganh)
          AND (heDaoTao IS NOT NULL AND KHUNG.BAC_DAO_TAO = heDaoTao)
          AND (khoaSinhVien IS NOT NULL AND KHUNG.KHOA_HOC_VIEN = khoaSinhVien);

    RETURN SCHEDULE_INFO;
end ;
CREATE OR REPLACE FUNCTION SDH_THOI_KHOA_BIEU_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                               searchTerm IN STRING,
                                               totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor            SYS_REFCURSOR;
    sT                   STRING(502) := '%' || lower(searchTerm) || '%';
    namFilter            STRING(11);
    hocKy                STRING(1);
    phanHeFilter         STRING(10);
    khoaHocVienFilter    STRING(10);
    loaiHinhDaoTaoFilter STRING(10);
    thuFilter            STRING(5);
    monHocFilter         STRING(20);
    sortMode             STRING(20);
    sortKey              STRING(20);
    ks_tinhTrang         STRING(5);
    ks_maMon             STRING(20);
    ks_maHocPhan         STRING(20);
    ks_tenMonHoc         STRING(100);
    ks_phong             STRING(20);
    ks_sldk              STRING(5);
    ks_thu               STRING(10);
    ks_tietBatDau        STRING(5);
    ks_ngayBatDau        NUMBER(20);
    ks_ngayKetThuc       NUMBER(20);
    --   ks_giangVien       STRING(50);
    ks_phanHe            STRING(20);
    ks_khoaHocVien       STRING(5);
    ks_namHoc            STRING(5);
    ks_hocKy             STRING(5);
    ks_nganhDaoTao       STRING(50);
BEGIN
    SELECT JSON_VALUE(filter, '$.namFilter') INTO namFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.phanHeFilter') INTO phanHeFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.khoaHocVienFilter') INTO khoaHocVienFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.thuFilter') INTO thuFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tinhTrang') INTO ks_tinhTrang FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_maMon') INTO ks_maMon FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_maHocPhan') INTO ks_maHocPhan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tenMonHoc') INTO ks_tenMonHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phong') INTO ks_phong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_sldk') INTO ks_sldk FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_thu') INTO ks_thu FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tietBatDau') INTO ks_tietBatDau FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngayBatDau') INTO ks_ngayBatDau FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngayKetThuc') INTO ks_ngayKetThuc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phanHe') INTO ks_phanHe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_khoaHocVien') INTO ks_khoaHocVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_namHoc') INTO ks_namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_hocKy') INTO ks_hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_nganhDaoTao') INTO ks_nganhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHinhDaoTaoFilter') INTO loaiHinhDaoTaoFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.sortMode') INTO sortMode FROM DUAL;
    SELECT JSON_VALUE(filter, '$.sortKey') INTO sortKey FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM SDH_THOI_KHOA_BIEU TKB
             LEFT JOIN DM_KHOA_SAU_DAI_HOC DV1 ON DV1.MA = TKB.KHOA_DANG_KY
             LEFT JOIN SDH_CHUONG_TRINH_DAO_TAO CTDT ON TKB.ID = CTDT.ID
             LEFT JOIN SDH_KHUNG_DAO_TAO KDT ON CTDT.MA_KHUNG_DAO_TAO = KDT.ID
             LEFT JOIN DM_NGANH_SAU_DAI_HOC NGANHSDH ON NGANHSDH.MA_NGANH = KDT.MA_NGANH
             LEFT JOIN DM_MON_HOC_SDH DMMH ON DMMH.MA = TKB.MA_MON_HOC
             LEFT JOIN TCHC_CAN_BO GV ON GV.SHCC = TKB.GIANG_VIEN
             LEFT JOIN DM_HOC_SDH PH ON PH.MA = TKB.LOAI_HINH_DAO_TAO
             LEFT JOIN SDH_TINH_TRANG_HOC_PHAN TTHP ON TTHP.MA = TKB.TINH_TRANG
             LEFT JOIN SDH_DM_CA_HOC CAHOC ON TKB.TIET_BAT_DAU = CAHOC.MA

    WHERE (thuFilter IS NULL OR thuFilter = '' OR thuFilter = TKB.THU)
      AND (monHocFilter IS NULL OR monHocFilter = '' OR monHocFilter = TKB.MA_MON_HOC)
      AND (ks_tinhTrang IS NULL OR lower(TTHP.TEN) like ('%' || lower(ks_tinhTrang) || '%'))
      AND (ks_maMon IS NULL OR lower(DMMH.MA) like ('%' || lower(ks_maMon) || '%'))
      AND (ks_maHocPhan IS NULL OR lower(TKB.MA_HOC_PHAN) like ('%' || lower(ks_maHocPhan) || '%'))
      AND (ks_tenMonHoc IS NULL OR lower(DMMH.TEN_TIENG_VIET) like ('%' || lower(ks_tenMonHoc) || '%'))
      --  AND (ks_tenMonHoc IS NULL OR lower(DMMH.TEN_TIENG_ANH) like ('%' || lower(ks_tenMonHoc) || '%'))
      AND (ks_phong IS NULL OR lower(TKB.PHONG) like ('%' || lower(ks_phong) || '%'))
      AND (ks_sldk IS NULL OR TKB.SO_LUONG_DU_KIEN = ks_sldk)
      AND (ks_thu IS NULL OR TKB.THU = ks_thu)
      AND (ks_tietBatDau IS NULL OR TKB.TIET_BAT_DAU = ks_tietBatDau)
      AND (ks_ngayBatDau IS NULL OR TKB.NGAY_BAT_DAU = ks_ngayBatDau)
      AND (ks_ngayKetThuc IS NULL OR TKB.NGAY_KET_THUC = ks_ngayKetThuc)
      AND (ks_phanHe IS NULL OR lower(PH.TEN) like ('%' || lower(ks_phanHe) || '%'))
      AND (loaiHinhDaoTaoFilter IS NULL OR TKB.BAC_DAO_TAO = loaiHinhDaoTaoFilter)
      AND (ks_khoaHocVien IS NULL OR lower(TKB.KHOA_SINH_VIEN) like ('%' || lower(ks_khoaHocVien) || '%'))
      AND (ks_namHoc IS NULL OR TKB.NAM = ks_namHoc)
      AND (ks_hocKy IS NULL OR TKB.HOC_KY = ks_hocKy)
      AND (ks_nganhDaoTao IS NULL OR lower(NGANHSDH.ten) like ('%' || lower(ks_nganhDaoTao) || '%'))

      AND (searchTerm = ''
        OR LOWER(TRIM(TKB.MA_MON_HOC)) LIKE sT
        OR LOWER(TRIM(TKB.HOC_KY)) LIKE sT
        OR LOWER(TRIM(DMMH.TEN_TIENG_VIET)) LIKE sT
        OR LOWER('thứ' || ' ' || TRIM(TKB.THU)) LIKE lower(searchTerm)
        OR LOWER(TRIM(TKB.PHONG)) LIKE lower(searchTerm));

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT TKB.ID                 AS            "id",
                     TKB.PHONG              AS            "phong",
                     TKB.THU                AS            "thu",
                     TKB.TIET_BAT_DAU       AS            "tietBatDau",
                     TKB.SO_TIET_BUOI       AS            "soTietBuoi",
                     TKB.HOC_KY             AS            "hocKy",
                     TKB.NAM                AS            "namHoc",
                     TKB.MA_MON_HOC         AS            "maMonHoc",
                     TKB.MA_HOC_PHAN        AS            "maHocPhan",
                     TKB.NGAY_BAT_DAU       AS            "ngayBatDau",
                     TKB.NGAY_KET_THUC      AS            "ngayKetThuc",
                     TKB.LOAI_MON_HOC       AS            "loaiMonHoc",
                     TKB.NHOM               AS            "nhom",
                     TKB.SO_LUONG_DU_KIEN   AS            "soLuongDuKien",
                     TKB.CO_SO              AS            "coSo",
                     DMMH.TEN_TIENG_VIET    AS            "tenMonHoc",
                     TKB.KHOA_DANG_KY       AS            "khoaDangKy",
                     DV1.TEN                AS            "tenKhoaDangKy",
                     TKB.SUC_CHUA           AS            "sucChua",
                     TKB.BUOI               AS            "buoi",
                     TKB.IS_MO              AS            "isMo",
                     TKB.BAC_DAO_TAO        AS            "bacDaoTao",
                     TKB.LOAI_HINH_DAO_TAO  AS            "loaiHinhDaoTao",
                     TKB.KHOA_SINH_VIEN     AS            "khoaSinhVien",
                     TKB.TINH_TRANG         AS            "tinhTrang",
                     GV.HO || ' ' || GV.TEN AS            "giangVien",
                     PH.TEN                 AS            "tenPhanHe",
                     NGANHSDH.TEN           AS            "nganhDaoTao",
                     CAHOC.TEN              AS            "tenTietBatDau",
                     ROW_NUMBER() OVER (ORDER BY TKB.THU) R
              FROM SDH_THOI_KHOA_BIEU TKB
                       LEFT JOIN DM_KHOA_SAU_DAI_HOC DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                       LEFT JOIN SDH_CHUONG_TRINH_DAO_TAO CTDT ON TKB.ID = CTDT.ID
                       LEFT JOIN SDH_KHUNG_DAO_TAO KDT ON CTDT.MA_KHUNG_DAO_TAO = KDT.ID
                       LEFT JOIN DM_NGANH_SAU_DAI_HOC NGANHSDH ON NGANHSDH.MA_NGANH = KDT.MA_NGANH
                       LEFT JOIN DM_MON_HOC_SDH DMMH ON DMMH.MA = TKB.MA_MON_HOC
                       LEFT JOIN TCHC_CAN_BO GV ON GV.SHCC = TKB.GIANG_VIEN
                       LEFT JOIN DM_HOC_SDH PH ON PH.MA = TKB.LOAI_HINH_DAO_TAO
                       LEFT JOIN SDH_TINH_TRANG_HOC_PHAN TTHP ON TTHP.MA = TKB.TINH_TRANG
                       LEFT JOIN SDH_DM_CA_HOC CAHOC ON TKB.TIET_BAT_DAU = CAHOC.MA

              WHERE (thuFilter IS NULL OR thuFilter = '' OR thuFilter = TKB.THU)
                AND (monHocFilter IS NULL OR monHocFilter = '' OR monHocFilter = TKB.MA_MON_HOC)
                AND (ks_tinhTrang IS NULL OR lower(TTHP.TEN) like ('%' || lower(ks_tinhTrang) || '%'))
                AND (ks_maMon IS NULL OR lower(DMMH.MA) like ('%' || lower(ks_maMon) || '%'))
                AND (ks_maHocPhan IS NULL OR lower(TKB.MA_HOC_PHAN) like ('%' || lower(ks_maHocPhan) || '%'))
                AND (ks_tenMonHoc IS NULL OR lower(DMMH.TEN_TIENG_VIET) like ('%' || lower(ks_tenMonHoc) || '%'))
                --  AND (ks_tenMonHoc IS NULL OR lower(DMMH.TEN_TIENG_ANH) like ('%' || lower(ks_tenMonHoc) || '%'))
                AND (ks_phong IS NULL OR lower(TKB.PHONG) like ('%' || lower(ks_phong) || '%'))
                AND (ks_sldk IS NULL OR TKB.SO_LUONG_DU_KIEN = ks_sldk)
                AND (ks_thu IS NULL OR TKB.THU = ks_thu)
                AND (ks_tietBatDau IS NULL OR TKB.TIET_BAT_DAU = ks_tietBatDau)
                AND (ks_ngayBatDau IS NULL OR TKB.NGAY_BAT_DAU = ks_ngayBatDau)
                AND (ks_ngayKetThuc IS NULL OR TKB.NGAY_KET_THUC = ks_ngayKetThuc)
                AND (ks_phanHe IS NULL OR lower(PH.TEN) like ('%' || lower(ks_phanHe) || '%'))
--                AND (ks_khoaSinhVien IS NULL OR lower(TKB.KHOA_SINH_VIEN) like ('%' || lower(ks_khoaSinhVien) || '%'))
                AND (ks_namHoc IS NULL OR TKB.NAM = ks_namHoc)
                AND (ks_hocKy IS NULL OR TKB.HOC_KY = ks_hocKy)
                AND (ks_nganhDaoTao IS NULL OR lower(NGANHSDH.ten) like ('%' || lower(ks_nganhDaoTao) || '%'))

                AND (searchTerm = ''
                  OR LOWER(TRIM(TKB.MA_MON_HOC)) LIKE sT
                  OR LOWER(TRIM(TKB.HOC_KY)) LIKE sT
                  OR LOWER(TRIM(DMMH.TEN_TIENG_VIET)) LIKE sT
                  OR LOWER('thứ' || ' ' || TRIM(TKB.THU)) LIKE lower(searchTerm)
                  OR LOWER(TRIM(TKB.PHONG)) LIKE lower(searchTerm))
              ORDER BY CASE
                           WHEN sortMode = 'ASC' THEN
                               DECODE(sortKey,
                                      'maMonHoc', NLSSORT(TKB.MA_MON_HOC, 'NLS_SORT = BINARY_AI'),
                                      'maHocPhan', NLSSORT(TKB.MA_HOC_PHAN, 'NLS_SORT = BINARY_AI'))
                           END ASC,
                       CASE
                           WHEN sortMode = 'DESC' THEN
                               DECODE(sortKey,
                                      'maMonHoc', NLSSORT(TKB.MA_MON_HOC, 'NLS_SORT = BINARY_AI'),
                                      'maHocPhan', NLSSORT(TKB.MA_HOC_PHAN, 'NLS_SORT = BINARY_AI'))
                           END DESC)
             --            ORDER BY TKB.THU NULLS FIRST, TKB.KHOA_DANG_KY)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
CREATE OR REPLACE FUNCTION SDH_TS_DANH_SACH_THI_SINH_CA_THI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                             filter IN STRING, searchTerm IN STRING,
                                                             totalItem OUT NUMBER, pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    my_cursor       SYS_REFCURSOR;
    sT              STRING(500) := '%' || lower(trim(searchTerm)) || '%';
    idLichThi       STRING(50);
    ks_soBaoDanh    STRING(50);
    ks_maNganh      STRING(50);
    ks_phanHe       STRING(50);
    ks_hinhThuc     STRING(50);
    ks_ho           STRING(50);
    ks_ten          STRING(50);
    ks_ngaySinh     STRING(50);
    ks_gioiTinh     STRING(50);
    ks_ngheNghiep   STRING(50);
    ks_donVi        STRING(50);
    ks_diaChiLienHe STRING(50);
    ks_dienThoai    STRING(50);
    ks_email        STRING(50);
    sortKey         STRING(20);
    sortMode        STRING(20);

BEGIN
    SELECT JSON_VALUE(filter, '$.idLichThi') INTO idLichThi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_soBaoDanh') INTO ks_soBaoDanh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_maNganh') INTO ks_maNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phanHe') INTO ks_phanHe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_hinhThuc') INTO ks_hinhThuc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ho') INTO ks_ho FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ten') INTO ks_ten FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngaySinh') INTO ks_ngaySinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_gioiTinh') INTO ks_gioiTinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngheNghiep') INTO ks_ngheNghiep FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_donVi') INTO ks_donVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_diaChiLienHe') INTO ks_diaChiLienHe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_dienThoai') INTO ks_dienThoai FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_email') INTO ks_email FROM DUAL;
    SELECT JSON_VALUE(filter, '$.sortKey') INTO sortKey FROM DUAL;
    SELECT JSON_VALUE(filter, '$.sortMode') INTO sortMode FROM DUAL;
    SELECT COUNT(*)
    INTO totalItem
    FROM SDH_TS_THONG_TIN_CO_BAN TTCB
             LEFT JOIN DM_GIOI_TINH GT on TTCB.GIOI_TINH = GT.MA
             LEFT JOIN SDH_TS_INFO_TIME DOT ON DOT.ID = TTCB.ID_DOT
             LEFT JOIN DM_HOC_SDH PH ON PH.MA = TTCB.PHAN_HE
             LEFT JOIN SDH_TS_HINH_THUC HT ON HT.MA = TTCB.HINH_THUC
             RIGHT JOIN SDH_TS_INFO_CA_THI_THI_SINH TS ON TTCB.SBD = TS.SBD
    WHERE (TS.SBD IS NOT NULL AND TTCB.SBD IS NOT NULL AND TS.ID_LICH_THI = idLichThi)
      AND (
            (ks_soBaoDanh IS NULL OR lower(TTCB.SBD) LIKE ('%' || lower(trim(ks_soBaoDanh)) || '%')) AND
            (ks_maNganh IS NULL OR lower(TTCB.MA_NGANH) LIKE ('%' || lower(trim(ks_maNganh)) || '%')) AND
            (ks_phanHe IS NULL OR lower(PH.TEN) LIKE ('%' || lower(trim(ks_phanHe)) || '%')) AND
            (ks_hinhThuc IS NULL OR lower(HT.TEN_HINH_THUC) LIKE ('%' || lower(trim(ks_hinhThuc)) || '%')) AND
            (ks_ho IS NULL OR lower(TTCB.HO) LIKE ('%' || lower(trim(ks_ho)) || '%')) AND
            (ks_ten IS NULL OR lower(TTCB.TEN) LIKE ('%' || lower(trim(ks_ten)) || '%')) AND
            (ks_ngaySinh IS NULL OR TTCB.NGAY_SINH = ks_ngaySinh) AND
            (ks_ngheNghiep IS NULL OR lower(TTCB.NGHE_NGHIEP) LIKE ('%' || lower(trim(ks_ngheNghiep)) || '%')) AND
            (ks_donVi IS NULL OR lower(TTCB.DON_VI) LIKE ('%' || lower(trim(ks_donVi)) || '%')) AND
            (ks_diaChiLienHe IS NULL OR
             lower(TTCB.DIA_CHI_LIEN_HE) LIKE ('%' || lower(trim(ks_diaChiLienHe)) || '%')) AND
            (ks_dienThoai IS NULL OR lower(TTCB.DIEN_THOAI) LIKE ('%' || lower(trim(ks_dienThoai)) || '%')) AND
            (ks_email IS NULL OR lower(TTCB.EMAIL) LIKE ('%' || lower(trim(ks_email)) || '%')))
      AND (
        (ks_gioiTinh IS NOT NULL AND (TTCB.GIOI_TINH) = ks_gioiTinh OR ks_gioiTinh IS NULL)
        )

      AND (searchTerm = ''
        OR TTCB.SBD LIKE ST
        OR LOWER(TRIM(TTCB.HO || ' ' || TTCB.TEN)) LIKE ST
        OR LOWER(TTCB.MA_NGANH) LIKE ST
        OR LOWER(PH.TEN) LIKE ST
        OR LOWER(HT.TEN_HINH_THUC) LIKE ST
        OR LOWER(TTCB.DIEN_THOAI) LIKE ST
        OR LOWER(TTCB.EMAIL) LIKE ST
        OR LOWER(TTCB.NGHE_NGHIEP) LIKE ST
        OR LOWER(TTCB.DON_VI) LIKE ST
        OR LOWER(TTCB.DIA_CHI_LIEN_HE) LIKE ST);


    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT TTCB.ID              AS           "id",
                     TTCB.SBD             AS           "soBaoDanh",
                     TTCB.MA_NGANH        as           "maNganh",
                     PH.TEN               as           "phanHe",
                     HT.TEN_HINH_THUC     as           "hinhThuc",
                     PH.MA                as           "maPhanHe",
                     HT.MA                as           "maHinhThuc",
                     TTCB.HO              AS           "ho",
                     TTCB.TEN             AS           "ten",
                     TTCB.NGAY_SINH       AS           "ngaySinh",
                     GT.TEN               AS           "gioiTinh",
                     TTCB.NGHE_NGHIEP     AS           "ngheNghiep",
                     TTCB.DON_VI          AS           "donVi",
                     TTCB.DIA_CHI_LIEN_HE AS           "diaChiLienHe",
                     TTCB.DIEN_THOAI      AS           "dienThoai",
                     TTCB.EMAIL           AS           "email",
                     DOT.MA_DOT   AS           "maDot",

                     ROW_NUMBER() OVER (ORDER BY NULL) R

              FROM SDH_TS_THONG_TIN_CO_BAN TTCB
                       LEFT JOIN DM_GIOI_TINH GT on TTCB.GIOI_TINH = GT.MA
                       LEFT JOIN SDH_TS_INFO_TIME DOT ON DOT.ID = TTCB.ID_DOT
                       LEFT JOIN DM_HOC_SDH PH ON PH.MA = TTCB.PHAN_HE
                       LEFT JOIN SDH_TS_HINH_THUC HT ON HT.MA = TTCB.HINH_THUC
                       RIGHT JOIN SDH_TS_INFO_CA_THI_THI_SINH TS ON TTCB.SBD = TS.SBD
              WHERE (TS.SBD IS NOT NULL AND TTCB.SBD IS NOT NULL AND TS.ID_LICH_THI = idLichThi)
                AND (
                      (ks_soBaoDanh IS NULL OR lower(TTCB.SBD) LIKE ('%' || lower(trim(ks_soBaoDanh)) || '%')) AND
                      (ks_maNganh IS NULL OR lower(TTCB.MA_NGANH) LIKE ('%' || lower(trim(ks_maNganh)) || '%')) AND
                      (ks_phanHe IS NULL OR lower(PH.TEN) LIKE ('%' || lower(trim(ks_phanHe)) || '%')) AND
                      (ks_hinhThuc IS NULL OR lower(HT.TEN_HINH_THUC) LIKE ('%' || lower(trim(ks_hinhThuc)) || '%')) AND
                      (ks_ho IS NULL OR lower(TTCB.HO) LIKE ('%' || lower(trim(ks_ho)) || '%')) AND
                      (ks_ten IS NULL OR lower(TTCB.TEN) LIKE ('%' || lower(trim(ks_ten)) || '%')) AND
                      (ks_ngaySinh IS NULL OR TTCB.NGAY_SINH = ks_ngaySinh) AND
                      (ks_ngheNghiep IS NULL OR
                       lower(TTCB.NGHE_NGHIEP) LIKE ('%' || lower(trim(ks_ngheNghiep)) || '%')) AND
                      (ks_donVi IS NULL OR lower(TTCB.DON_VI) LIKE ('%' || lower(trim(ks_donVi)) || '%')) AND
                      (ks_diaChiLienHe IS NULL OR
                       lower(TTCB.DIA_CHI_LIEN_HE) LIKE ('%' || lower(trim(ks_diaChiLienHe)) || '%')) AND
                      (ks_dienThoai IS NULL OR
                       lower(TTCB.DIEN_THOAI) LIKE ('%' || lower(trim(ks_dienThoai)) || '%')) AND
                      (ks_email IS NULL OR lower(TTCB.EMAIL) LIKE ('%' || lower(trim(ks_email)) || '%')))
                AND (
                  (ks_gioiTinh IS NOT NULL AND (TTCB.GIOI_TINH) = ks_gioiTinh OR ks_gioiTinh IS NULL)
                  )

                AND (searchTerm = ''
                  OR TTCB.SBD LIKE ST
                  OR LOWER(TRIM(TTCB.HO || ' ' || TTCB.TEN)) LIKE ST
                  OR LOWER(TTCB.MA_NGANH) LIKE ST
                  OR LOWER(PH.TEN) LIKE ST
                  OR LOWER(HT.TEN_HINH_THUC) LIKE ST
                  OR LOWER(TTCB.DIEN_THOAI) LIKE ST
                  OR LOWER(TTCB.EMAIL) LIKE ST
                  OR LOWER(TTCB.NGHE_NGHIEP) LIKE ST
                  OR LOWER(TTCB.DON_VI) LIKE ST
                  OR LOWER(TTCB.DIA_CHI_LIEN_HE) LIKE ST)
              ORDER BY CASE
                           WHEN sortMode = 'ASC' THEN
                               DECODE(sortKey,
                                      'soBaoDanh', NLSSORT(TTCB.SBD, 'NLS_SORT = BINARY_AI'),
                                      'maNganh', NLSSORT(TTCB.MA_NGANH, 'NLS_SORT = BINARY_AI'),
                                      'phanHe', NLSSORT(PH.TEN, 'NLS_SORT = BINARY_AI'),
                                      'hinhThuc', NLSSORT(HT.TEN_HINH_THUC, 'NLS_SORT = BINARY_AI'),
                                      'ho', NLSSORT(TTCB.HO, 'NLS_SORT = VIETNAMESE'),
                                      'ten', NLSSORT(TTCB.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'ngaySinh', NLSSORT(TTCB.NGAY_SINH, 'NLS_SORT = BINARY_AI'),
                                      'ngheNghiep', NLSSORT(TTCB.NGHE_NGHIEP, 'NLS_SORT = VIETNAMESE'),
                                      'donVi', NLSSORT(TTCB.DON_VI, 'NLS_SORT = VIETNAMESE'),
                                      'diaChiLienHe', NLSSORT(TTCB.DIA_CHI_LIEN_HE, 'NLS_SORT = VIETNAMESE'),
                                      'dienThoai', NLSSORT(TTCB.DIEN_THOAI, 'NLS_SORT = BINARY_AI'),
                                      'email', NLSSORT(TTCB.EMAIL, 'NLS_SORT = BINARY_AI'))
                           END ASC NULLS LAST,
                       CASE
                           WHEN sortMode = 'DESC' THEN
                               DECODE(sortKey,
                                      'soBaoDanh', NLSSORT(TTCB.SBD, 'NLS_SORT = BINARY_AI'),
                                      'maNganh', NLSSORT(TTCB.MA_NGANH, 'NLS_SORT = BINARY_AI'),
                                      'maNganh', NLSSORT(TTCB.MA_NGANH, 'NLS_SORT = BINARY_AI'),
                                      'phanHe', NLSSORT(PH.TEN, 'NLS_SORT = BINARY_AI'),
                                      'hinhThuc', NLSSORT(HT.TEN_HINH_THUC, 'NLS_SORT = BINARY_AI'),
                                      'ho', NLSSORT(TTCB.HO, 'NLS_SORT = VIETNAMESE'),
                                      'ten', NLSSORT(TTCB.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'ngaySinh', NLSSORT(TTCB.NGAY_SINH, 'NLS_SORT = BINARY_AI'),
                                      'ngheNghiep', NLSSORT(TTCB.NGHE_NGHIEP, 'NLS_SORT = VIETNAMESE'),
                                      'donVi', NLSSORT(TTCB.DON_VI, 'NLS_SORT = VIETNAMESE'),
                                      'diaChiLienHe', NLSSORT(TTCB.DIA_CHI_LIEN_HE, 'NLS_SORT = VIETNAMESE'),
                                      'dienThoai', NLSSORT(TTCB.DIEN_THOAI, 'NLS_SORT = BINARY_AI'),
                                      'email', NLSSORT(TTCB.EMAIL, 'NLS_SORT = BINARY_AI'))
                           END DESC NULLS LAST)

        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;
CREATE OR REPLACE FUNCTION SDH_TS_DANH_SACH_THEM_THI_SINH_CA_THI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                                  filter IN STRING, searchTerm IN STRING,
                                                                  totalItem OUT NUMBER, pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    my_cursor       SYS_REFCURSOR;
    sT              STRING(500) := '%' || lower(trim(searchTerm)) || '%';
    idLichThi       STRING(50);
    listChosen      STRING(1000);
    ks_soBaoDanh    STRING(50);
    ks_maNganh      STRING(50);
    ks_phanHe       STRING(50);
    ks_hinhThuc     STRING(50);
    ks_ho           STRING(50);
    ks_ten          STRING(50);
    ks_ngaySinh     STRING(50);
    ks_gioiTinh     STRING(50);
    ks_ngheNghiep   STRING(50);
    ks_donVi        STRING(50);
    ks_diaChiLienHe STRING(50);
    ks_dienThoai    STRING(50);
    ks_email        STRING(50);
    sortKey         STRING(20);
    sortMode        STRING(20);

BEGIN
    SELECT JSON_VALUE(filter, '$.idLichThi') INTO idLichThi FROM DUAL;
SELECT JSON_VALUE(filter, '$.listChosen') INTO listChosen FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_soBaoDanh') INTO ks_soBaoDanh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_maNganh') INTO ks_maNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phanHe') INTO ks_phanHe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_hinhThuc') INTO ks_hinhThuc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ho') INTO ks_ho FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ten') INTO ks_ten FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngaySinh') INTO ks_ngaySinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_gioiTinh') INTO ks_gioiTinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngheNghiep') INTO ks_ngheNghiep FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_donVi') INTO ks_donVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_diaChiLienHe') INTO ks_diaChiLienHe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_dienThoai') INTO ks_dienThoai FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_email') INTO ks_email FROM DUAL;
    SELECT JSON_VALUE(filter, '$.sortKey') INTO sortKey FROM DUAL;
    SELECT JSON_VALUE(filter, '$.sortMode') INTO sortMode FROM DUAL;
    SELECT COUNT(*)
    INTO totalItem
    FROM SDH_TS_THONG_TIN_CO_BAN TTCB
             LEFT JOIN DM_GIOI_TINH GT on TTCB.GIOI_TINH = GT.MA
             LEFT JOIN DM_HOC_SDH PH ON PH.MA = TTCB.PHAN_HE
             LEFT JOIN SDH_TS_HINH_THUC HT ON HT.MA = TTCB.HINH_THUC
    WHERE (TTCB.SBD IS NOT NULL)
      AND (listChosen is NULL OR listChosen NOT LIKE ('%'||TTCB.SBD||'%') )
      AND (
            (ks_soBaoDanh IS NULL OR lower(TTCB.SBD) LIKE ('%' || lower(trim(ks_soBaoDanh)) || '%')) AND
            (ks_maNganh IS NULL OR lower(TTCB.MA_NGANH) LIKE ('%' || lower(trim(ks_maNganh)) || '%')) AND
            (ks_phanHe IS NULL OR lower(PH.TEN) LIKE ('%' || lower(trim(ks_phanHe)) || '%')) AND
            (ks_hinhThuc IS NULL OR lower(HT.TEN_HINH_THUC) LIKE ('%' || lower(trim(ks_hinhThuc)) || '%')) AND
            (ks_ho IS NULL OR lower(TTCB.HO) LIKE ('%' || lower(trim(ks_ho)) || '%')) AND
            (ks_ten IS NULL OR lower(TTCB.TEN) LIKE ('%' || lower(trim(ks_ten)) || '%')) AND
            (ks_ngaySinh IS NULL OR TTCB.NGAY_SINH = ks_ngaySinh) AND
            (ks_ngheNghiep IS NULL OR lower(TTCB.NGHE_NGHIEP) LIKE ('%' || lower(trim(ks_ngheNghiep)) || '%')) AND
            (ks_donVi IS NULL OR lower(TTCB.DON_VI) LIKE ('%' || lower(trim(ks_donVi)) || '%')) AND
            (ks_diaChiLienHe IS NULL OR
             lower(TTCB.DIA_CHI_LIEN_HE) LIKE ('%' || lower(trim(ks_diaChiLienHe)) || '%')) AND
            (ks_dienThoai IS NULL OR lower(TTCB.DIEN_THOAI) LIKE ('%' || lower(trim(ks_dienThoai)) || '%')) AND
            (ks_email IS NULL OR lower(TTCB.EMAIL) LIKE ('%' || lower(trim(ks_email)) || '%')))
      AND (
        (ks_gioiTinh IS NOT NULL AND (TTCB.GIOI_TINH) = ks_gioiTinh OR ks_gioiTinh IS NULL)
        )

      AND (searchTerm = ''
        OR TTCB.SBD LIKE ST
        OR LOWER(TRIM(TTCB.HO || ' ' || TTCB.TEN)) LIKE ST
        OR LOWER(TTCB.MA_NGANH) LIKE ST
        OR LOWER(PH.TEN) LIKE ST
        OR LOWER(HT.TEN_HINH_THUC) LIKE ST
        OR LOWER(TTCB.DIEN_THOAI) LIKE ST
        OR LOWER(TTCB.EMAIL) LIKE ST
        OR LOWER(TTCB.NGHE_NGHIEP) LIKE ST
        OR LOWER(TTCB.DON_VI) LIKE ST
        OR LOWER(TTCB.DIA_CHI_LIEN_HE) LIKE ST);


    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT
                     TTCB.ID              AS                                 "id",
                     TTCB.SBD             AS                                 "soBaoDanh",
                     TTCB.MA_NGANH        as                                 "maNganh",
                     PH.TEN               as                                 "phanHe",
                     HT.TEN_HINH_THUC     as                                 "hinhThuc",
                     PH.MA                as                                 "maPhanHe",
                     HT.MA                as                                 "maHinhThuc",
                     TTCB.HO              AS                                 "ho",
                     TTCB.TEN             AS                                 "ten",
                     TTCB.NGAY_SINH       AS                                 "ngaySinh",
                     GT.TEN               AS                                 "gioiTinh",
                     TTCB.NGHE_NGHIEP     AS                                 "ngheNghiep",
                     TTCB.DON_VI          AS                                 "donVi",
                     TTCB.DIA_CHI_LIEN_HE AS                                 "diaChiLienHe",
                     TTCB.DIEN_THOAI      AS                                 "dienThoai",
                     TTCB.EMAIL           AS                                 "email",


                     ROW_NUMBER() OVER (ORDER BY NULL)                       R,
                     ROW_NUMBER() OVER (PARTITION BY TTCB.SBD ORDER BY NULL) RN

              FROM SDH_TS_THONG_TIN_CO_BAN TTCB
                       LEFT JOIN DM_GIOI_TINH GT on TTCB.GIOI_TINH = GT.MA
                       LEFT JOIN DM_HOC_SDH PH ON PH.MA = TTCB.PHAN_HE
                       LEFT JOIN SDH_TS_HINH_THUC HT ON HT.MA = TTCB.HINH_THUC
              WHERE (TTCB.SBD IS NOT NULL)
                AND (listChosen is NULL OR listChosen NOT LIKE ('%'||TTCB.SBD||'%') )
                AND (
                      (ks_soBaoDanh IS NULL OR lower(TTCB.SBD) LIKE ('%' || lower(trim(ks_soBaoDanh)) || '%')) AND
                      (ks_maNganh IS NULL OR lower(TTCB.MA_NGANH) LIKE ('%' || lower(trim(ks_maNganh)) || '%')) AND
                      (ks_phanHe IS NULL OR lower(PH.TEN) LIKE ('%' || lower(trim(ks_phanHe)) || '%')) AND
                      (ks_hinhThuc IS NULL OR lower(HT.TEN_HINH_THUC) LIKE ('%' || lower(trim(ks_hinhThuc)) || '%')) AND
                      (ks_ho IS NULL OR lower(TTCB.HO) LIKE ('%' || lower(trim(ks_ho)) || '%')) AND
                      (ks_ten IS NULL OR lower(TTCB.TEN) LIKE ('%' || lower(trim(ks_ten)) || '%')) AND
                      (ks_ngaySinh IS NULL OR TTCB.NGAY_SINH = ks_ngaySinh) AND
                      (ks_ngheNghiep IS NULL OR
                       lower(TTCB.NGHE_NGHIEP) LIKE ('%' || lower(trim(ks_ngheNghiep)) || '%')) AND
                      (ks_donVi IS NULL OR lower(TTCB.DON_VI) LIKE ('%' || lower(trim(ks_donVi)) || '%')) AND
                      (ks_diaChiLienHe IS NULL OR
                       lower(TTCB.DIA_CHI_LIEN_HE) LIKE ('%' || lower(trim(ks_diaChiLienHe)) || '%')) AND
                      (ks_dienThoai IS NULL OR
                       lower(TTCB.DIEN_THOAI) LIKE ('%' || lower(trim(ks_dienThoai)) || '%')) AND
                      (ks_email IS NULL OR lower(TTCB.EMAIL) LIKE ('%' || lower(trim(ks_email)) || '%')))
                AND (
                  (ks_gioiTinh IS NOT NULL AND (TTCB.GIOI_TINH) = ks_gioiTinh OR ks_gioiTinh IS NULL)
                  )

                AND (searchTerm = ''
                  OR TTCB.SBD LIKE ST
                  OR LOWER(TRIM(TTCB.HO || ' ' || TTCB.TEN)) LIKE ST
                  OR LOWER(TTCB.MA_NGANH) LIKE ST
                  OR LOWER(PH.TEN) LIKE ST
                  OR LOWER(HT.TEN_HINH_THUC) LIKE ST
                  OR LOWER(TTCB.DIEN_THOAI) LIKE ST
                  OR LOWER(TTCB.EMAIL) LIKE ST
                  OR LOWER(TTCB.NGHE_NGHIEP) LIKE ST
                  OR LOWER(TTCB.DON_VI) LIKE ST
                  OR LOWER(TTCB.DIA_CHI_LIEN_HE) LIKE ST)
              ORDER BY CASE
                           WHEN sortMode = 'ASC' THEN
                               DECODE(sortKey,
                                      'soBaoDanh', NLSSORT(TTCB.SBD, 'NLS_SORT = BINARY_AI'),
                                      'maNganh', NLSSORT(TTCB.MA_NGANH, 'NLS_SORT = BINARY_AI'),
                                      'phanHe', NLSSORT(PH.TEN, 'NLS_SORT = BINARY_AI'),
                                      'hinhThuc', NLSSORT(HT.TEN_HINH_THUC, 'NLS_SORT = BINARY_AI'),
                                      'ho', NLSSORT(TTCB.HO, 'NLS_SORT = VIETNAMESE'),
                                      'ten', NLSSORT(TTCB.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'ngaySinh', NLSSORT(TTCB.NGAY_SINH, 'NLS_SORT = BINARY_AI'),
                                      'ngheNghiep', NLSSORT(TTCB.NGHE_NGHIEP, 'NLS_SORT = VIETNAMESE'),
                                      'donVi', NLSSORT(TTCB.DON_VI, 'NLS_SORT = VIETNAMESE'),
                                      'diaChiLienHe', NLSSORT(TTCB.DIA_CHI_LIEN_HE, 'NLS_SORT = VIETNAMESE'),
                                      'dienThoai', NLSSORT(TTCB.DIEN_THOAI, 'NLS_SORT = BINARY_AI'),
                                      'email', NLSSORT(TTCB.EMAIL, 'NLS_SORT = BINARY_AI'))
                           END ASC NULLS LAST,
                       CASE
                           WHEN sortMode = 'DESC' THEN
                               DECODE(sortKey,
                                      'soBaoDanh', NLSSORT(TTCB.SBD, 'NLS_SORT = BINARY_AI'),
                                      'maNganh', NLSSORT(TTCB.MA_NGANH, 'NLS_SORT = BINARY_AI'),
                                      'maNganh', NLSSORT(TTCB.MA_NGANH, 'NLS_SORT = BINARY_AI'),
                                      'phanHe', NLSSORT(PH.TEN, 'NLS_SORT = BINARY_AI'),
                                      'hinhThuc', NLSSORT(HT.TEN_HINH_THUC, 'NLS_SORT = BINARY_AI'),
                                      'ho', NLSSORT(TTCB.HO, 'NLS_SORT = VIETNAMESE'),
                                      'ten', NLSSORT(TTCB.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'ngaySinh', NLSSORT(TTCB.NGAY_SINH, 'NLS_SORT = BINARY_AI'),
                                      'ngheNghiep', NLSSORT(TTCB.NGHE_NGHIEP, 'NLS_SORT = VIETNAMESE'),
                                      'donVi', NLSSORT(TTCB.DON_VI, 'NLS_SORT = VIETNAMESE'),
                                      'diaChiLienHe', NLSSORT(TTCB.DIA_CHI_LIEN_HE, 'NLS_SORT = VIETNAMESE'),
                                      'dienThoai', NLSSORT(TTCB.DIEN_THOAI, 'NLS_SORT = BINARY_AI'),
                                      'email', NLSSORT(TTCB.EMAIL, 'NLS_SORT = BINARY_AI'))
                           END DESC NULLS LAST)

        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
          AND RN = 1;
    RETURN my_cursor;
END ;
CREATE OR REPLACE FUNCTION SDH_TS_INFO_HINH_THUC_GET_DATA(idPhanHe IN STRING)
RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    open my_cursor
        for SELECT
            TS_HT.ID AS "id",
            DM.MA AS "ma",
            DM.TEN_HINH_THUC AS "ten"
            FROM SDH_TS_HINH_THUC DM
                LEFT JOIN (SELECT * FROM SDH_TS_INFO_HINH_THUC
            WHERE ID_PHAN_HE = idPhanHe) TS_HT ON  DM.MA = TS_HT.MA_HINH_THUC WHERE DM.KICH_HOAT=1;
    RETURN my_cursor;
END;
CREATE OR REPLACE FUNCTION SDH_TS_INFO_HINH_THUC_GET_ALL(filter IN STRING)
RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    open my_cursor
        for SELECT
            TS_TH.ID AS "id",
            TS_TH.ID_PHAN_HE AS "idPhanHe",
            DM.MA AS "ma",
            DM.TEN_HINH_THUC AS "ten"
            FROM SDH_TS_HINH_THUC DM
                RIGHT JOIN  SDH_TS_INFO_HINH_THUC TS_TH ON  DM.MA = TS_TH.MA_HINH_THUC
            ORDER BY "ma" ASC;
    RETURN my_cursor;
END;
CREATE OR REPLACE FUNCTION SDH_TS_GET_DANH_SACH_THI_SINH_BY_FILTER(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                        filter IN STRING, totalItem OUT NUMBER,
                                                        pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    my_cursor     SYS_REFCURSOR;
    f_id          STRING(10);
    ky            STRING(50);
    dot           STRING(50);
    phanHe        STRING(50);
    hinhThuc      STRING(50);
    nganh         STRING(50);
    loaiDanhSach  STRING(10);
    ks_ky         STRING(50);
    ks_dot        STRING(50);
    ks_soBaoDanh  STRING(50);
    ks_maNganh    STRING(50);
    ks_phanHe     STRING(50);
    ks_hinhThuc   STRING(50);
    ks_ho         STRING(50);
    ks_ten        STRING(50);
    ks_ngaySinh   STRING(50);
    ks_gioiTinh   STRING(50);
    ks_ngheNghiep STRING(50);
    ks_donVi      STRING(50);
    ks_tinh       STRING(50);
    ks_quan       STRING(50);
    ks_phuong     STRING(50);
    ks_dienThoai  STRING(50);
    ks_email      STRING(50);
    sortKey       STRING(20);
    sortMode      STRING(20);

BEGIN
    SELECT JSON_VALUE(filter, '$.loaiDanhSach') INTO loaiDanhSach FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ky') INTO ky FROM DUAL;
    SELECT JSON_VALUE(filter, '$.dot') INTO dot FROM DUAL;
    SELECT JSON_VALUE(filter, '$.phanHe') INTO phanHe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hinhThuc') INTO hinhThuc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.nganh') INTO nganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.f_id') INTO f_id FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ky') INTO ks_ky FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_dot') INTO ks_dot FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_soBaoDanh') INTO ks_soBaoDanh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_maNganh') INTO ks_maNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phanHe') INTO ks_phanHe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_hinhThuc') INTO ks_hinhThuc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ho') INTO ks_ho FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ten') INTO ks_ten FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngaySinh') INTO ks_ngaySinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_gioiTinh') INTO ks_gioiTinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngheNghiep') INTO ks_ngheNghiep FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_donVi') INTO ks_donVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tinh') INTO ks_tinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_quan') INTO ks_quan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phuong') INTO ks_phuong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_dienThoai') INTO ks_dienThoai FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_email') INTO ks_email FROM DUAL;
    SELECT JSON_VALUE(filter, '$.sortKey') INTO sortKey FROM DUAL;
    SELECT JSON_VALUE(filter, '$.sortMode') INTO sortMode FROM DUAL;
    SELECT COUNT(*)
    INTO totalItem
    FROM SDH_TS_THONG_TIN_CO_BAN TTCB
             LEFT JOIN DM_GIOI_TINH GT on TTCB.GIOI_TINH = GT.MA
             LEFT JOIN DM_HOC_SDH PH ON PH.MA = TTCB.PHAN_HE
             LEFT JOIN SDH_TS_HINH_THUC HT ON HT.MA = TTCB.HINH_THUC
             LEFT JOIN DM_QUAN_HUYEN QUAN ON QUAN.MA_QUAN_HUYEN = TTCB.MA_QUAN_HUYEN
             LEFT JOIN DM_PHUONG_XA PHUONG ON PHUONG.MA_PHUONG_XA = TTCB.MA_PHUONG_XA
             LEFT JOIN DM_TINH_THANH_PHO TP ON TP.MA = TTCB.MA_TINH_THANH_PHO
             LEFT JOIN SDH_TS_INFO_TIME DOT ON DOT.ID = TTCB.ID_DOT
             LEFT JOIN SDH_TS_INFO KY ON KY.MA = DOT.MA_INFO_TS
    WHERE (
            (loaiDanhSach = '02' AND TTCB.SBD IS NOT NULL) OR
            (loaiDanhSach = '01')
        )
      AND (f_id IS NULL OR f_id IS NOT NULL AND TTCB.ID=f_id)
      AND (
            (ky IS NULL OR ky IS NOT NULL AND KY.MA = ky) AND
            (dot IS NULL OR dot IS NOT NULL AND TTCB.ID_DOT = dot) AND
            (phanHe IS NULL OR phanHe IS NOT NULL AND TTCB.PHAN_HE = phanHe) AND
            (hinhThuc IS NULL OR hinhThuc IS NOT NULL AND TTCB.HINH_THUC = hinhThuc) AND
            (nganh IS NULL OR nganh IS NOT NULL AND TTCB.MA_NGANH LIKE ('%' || nganh || '%'))
        )
      AND (
            (ks_ky IS NULL OR lower(KY.NAM_TUYEN_SINH) LIKE ('%' || lower(trim(ks_ky)) || '%')) AND
            (ks_dot IS NULL OR lower(DOT.MA_DOT) LIKE ('%' || lower(trim(ks_dot)) || '%')) AND
            (ks_soBaoDanh IS NULL OR lower(TTCB.SBD) LIKE ('%' || lower(trim(ks_soBaoDanh)) || '%')) AND
            (ks_maNganh IS NULL OR lower(TTCB.MA_NGANH) LIKE ('%' || lower(trim(ks_maNganh)) || '%')) AND
            (ks_phanHe IS NULL OR lower(PH.TEN) LIKE ('%' || lower(trim(ks_phanHe)) || '%')) AND
            (ks_hinhThuc IS NULL OR lower(HT.TEN_HINH_THUC) LIKE ('%' || lower(trim(ks_hinhThuc)) || '%')) AND
            (ks_ho IS NULL OR lower(TTCB.HO) LIKE ('%' || lower(trim(ks_ho)) || '%')) AND
            (ks_ten IS NULL OR lower(TTCB.TEN) LIKE ('%' || lower(trim(ks_ten)) || '%')) AND
            (ks_ngaySinh IS NULL OR TTCB.NGAY_SINH = ks_ngaySinh) AND
            (ks_ngheNghiep IS NULL OR lower(TTCB.NGHE_NGHIEP) LIKE ('%' || lower(trim(ks_ngheNghiep)) || '%')) AND
            (ks_donVi IS NULL OR lower(TTCB.DON_VI) LIKE ('%' || lower(trim(ks_donVi)) || '%')) AND
            (ks_tinh IS NULL OR
             lower(TP.MA) LIKE ('%' || lower(trim(ks_tinh)) || '%')) AND
            (ks_quan IS NULL OR
             lower(QUAN.MA_QUAN_HUYEN) LIKE ('%' || lower(trim(ks_quan)) || '%')) AND
            (ks_phuong IS NULL OR
             lower(PHUONG.MA_PHUONG_XA) LIKE ('%' || lower(trim(ks_phuong)) || '%')) AND
            (ks_dienThoai IS NULL OR lower(TTCB.DIEN_THOAI) LIKE ('%' || lower(trim(ks_dienThoai)) || '%')) AND
            (ks_email IS NULL OR lower(TTCB.EMAIL) LIKE ('%' || lower(trim(ks_email)) || '%')))
      AND (
        (lower(TTCB.GIOI_TINH) = ks_gioiTinh OR ks_gioiTinh IS NULL)
        );


    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT TTCB.ID              AS           "id",
                     TTCB.SBD             AS           "soBaoDanh",
                     TTCB.MA_NGANH        as           "maNganh",
                     PH.TEN               as           "phanHe",
                     HT.TEN_HINH_THUC     as           "hinhThuc",
                     PH.MA                as           "maPhanHe",
                     HT.MA                as           "maHinhThuc",
                     TTCB.HO              AS           "ho",
                     TTCB.TEN             AS           "ten",
                     TTCB.NGAY_SINH       AS           "ngaySinh",
                     GT.TEN               AS           "gioiTinh",
                     TTCB.NGHE_NGHIEP     AS           "ngheNghiep",
                     TTCB.DON_VI          AS           "donVi",

                     PHUONG.TEN_PHUONG_XA AS           "tenPhuongXa",
                     QUAN.TEN_QUAN_HUYEN  AS           "tenQuanHuyen",
                     TP.TEN               AS           "tenTinhThanhPho",

                     TTCB.DIEN_THOAI      AS           "dienThoai",
                     TTCB.EMAIL           AS           "email",
                     DOT.MA_DOT           AS           "maDot",
                     KY.TEN               AS           "tenKy",
                     KY.NAM_TUYEN_SINH    AS           "namTuyenSinh",
                     ROW_NUMBER() OVER (ORDER BY NULL) R

              FROM SDH_TS_THONG_TIN_CO_BAN TTCB
                       LEFT JOIN DM_GIOI_TINH GT on TTCB.GIOI_TINH = GT.MA
                       LEFT JOIN DM_HOC_SDH PH ON PH.MA = TTCB.PHAN_HE
                       LEFT JOIN SDH_TS_HINH_THUC HT ON HT.MA = TTCB.HINH_THUC
                       LEFT JOIN DM_QUAN_HUYEN QUAN ON QUAN.MA_QUAN_HUYEN = TTCB.MA_QUAN_HUYEN
                       LEFT JOIN DM_PHUONG_XA PHUONG ON PHUONG.MA_PHUONG_XA = TTCB.MA_PHUONG_XA
                       LEFT JOIN DM_TINH_THANH_PHO TP ON TP.MA = TTCB.MA_TINH_THANH_PHO
                       LEFT JOIN SDH_TS_INFO_TIME DOT ON DOT.ID = TTCB.ID_DOT
                       LEFT JOIN SDH_TS_INFO KY ON KY.MA = DOT.MA_INFO_TS
              WHERE (
                      (loaiDanhSach = '02' AND TTCB.SBD IS NOT NULL) OR
                      (loaiDanhSach = '01')
                  )
                AND (f_id IS NULL OR f_id IS NOT NULL AND TTCB.ID=f_id)
                AND (
                      (ky IS NULL OR ky IS NOT NULL AND KY.MA = ky) AND
                      (dot IS NULL OR dot IS NOT NULL AND TTCB.ID_DOT = dot) AND
                      (phanHe IS NULL OR phanHe IS NOT NULL AND TTCB.PHAN_HE = phanHe) AND
                      (hinhThuc IS NULL OR hinhThuc IS NOT NULL AND TTCB.HINH_THUC = hinhThuc) AND
                      (nganh IS NULL OR nganh IS NOT NULL AND TTCB.MA_NGANH LIKE ('%' || nganh || '%'))
                  )
                AND (
                      (ks_ky IS NULL OR lower(KY.NAM_TUYEN_SINH) LIKE ('%' || lower(trim(ks_ky)) || '%')) AND
                      (ks_dot IS NULL OR lower(DOT.MA_DOT) LIKE ('%' || lower(trim(ks_dot)) || '%')) AND
                      (ks_soBaoDanh IS NULL OR lower(TTCB.SBD) LIKE ('%' || lower(trim(ks_soBaoDanh)) || '%')) AND
                      (ks_maNganh IS NULL OR lower(TTCB.MA_NGANH) LIKE ('%' || lower(trim(ks_maNganh)) || '%')) AND
                      (ks_phanHe IS NULL OR lower(PH.TEN) LIKE ('%' || lower(trim(ks_phanHe)) || '%')) AND
                      (ks_hinhThuc IS NULL OR lower(HT.TEN_HINH_THUC) LIKE ('%' || lower(trim(ks_hinhThuc)) || '%')) AND
                      (ks_ho IS NULL OR lower(TTCB.HO) LIKE ('%' || lower(trim(ks_ho)) || '%')) AND
                      (ks_ten IS NULL OR lower(TTCB.TEN) LIKE ('%' || lower(trim(ks_ten)) || '%')) AND
                      (ks_ngaySinh IS NULL OR TTCB.NGAY_SINH = ks_ngaySinh) AND
                      (ks_ngheNghiep IS NULL OR
                       lower(TTCB.NGHE_NGHIEP) LIKE ('%' || lower(trim(ks_ngheNghiep)) || '%')) AND
                      (ks_donVi IS NULL OR lower(TTCB.DON_VI) LIKE ('%' || lower(trim(ks_donVi)) || '%')) AND
                      (ks_tinh IS NULL OR
                       lower(TP.MA) LIKE ('%' || lower(trim(ks_tinh)) || '%')) AND
                      (ks_quan IS NULL OR
                       lower(QUAN.MA_QUAN_HUYEN) LIKE ('%' || lower(trim(ks_quan)) || '%')) AND
                      (ks_phuong IS NULL OR
                       lower(PHUONG.MA_PHUONG_XA) LIKE ('%' || lower(trim(ks_phuong)) || '%')) AND
                      (ks_dienThoai IS NULL OR
                       lower(TTCB.DIEN_THOAI) LIKE ('%' || lower(trim(ks_dienThoai)) || '%')) AND
                      (ks_email IS NULL OR lower(TTCB.EMAIL) LIKE ('%' || lower(trim(ks_email)) || '%')))
                AND (
                  (lower(TTCB.GIOI_TINH) = ks_gioiTinh OR ks_gioiTinh IS NULL)
                  )
              ORDER BY CASE
                           WHEN sortMode = 'ASC' THEN
                               DECODE(sortKey,
                                      'soBaoDanh', NLSSORT(TTCB.SBD, 'NLS_SORT = BINARY_AI'),
                                      'maNganh', NLSSORT(TTCB.MA_NGANH, 'NLS_SORT = BINARY_AI'),
                                      'phanHe', NLSSORT(PH.TEN, 'NLS_SORT = BINARY_AI'),
                                      'hinhThuc', NLSSORT(HT.TEN_HINH_THUC, 'NLS_SORT = BINARY_AI'),
                                      'ho', NLSSORT(TTCB.HO, 'NLS_SORT = VIETNAMESE'),
                                      'ten', NLSSORT(TTCB.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'ngaySinh', NLSSORT(TTCB.NGAY_SINH, 'NLS_SORT = BINARY_AI'),
                                      'ngheNghiep', NLSSORT(TTCB.NGHE_NGHIEP, 'NLS_SORT = VIETNAMESE'),
                                      'donVi', NLSSORT(TTCB.DON_VI, 'NLS_SORT = VIETNAMESE'),
                                      'dienThoai', NLSSORT(TTCB.DIEN_THOAI, 'NLS_SORT = BINARY_AI'),
                                      'email', NLSSORT(TTCB.EMAIL, 'NLS_SORT = BINARY_AI'))
                           END ASC NULLS LAST,
                       CASE
                           WHEN sortMode = 'DESC' THEN
                               DECODE(sortKey,
                                      'soBaoDanh', NLSSORT(TTCB.SBD, 'NLS_SORT = BINARY_AI'),
                                      'maNganh', NLSSORT(TTCB.MA_NGANH, 'NLS_SORT = BINARY_AI'),
                                      'phanHe', NLSSORT(PH.TEN, 'NLS_SORT = BINARY_AI'),
                                      'hinhThuc', NLSSORT(HT.TEN_HINH_THUC, 'NLS_SORT = BINARY_AI'),
                                      'ho', NLSSORT(TTCB.HO, 'NLS_SORT = VIETNAMESE'),
                                      'ten', NLSSORT(TTCB.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'ngaySinh', NLSSORT(TTCB.NGAY_SINH, 'NLS_SORT = BINARY_AI'),
                                      'ngheNghiep', NLSSORT(TTCB.NGHE_NGHIEP, 'NLS_SORT = VIETNAMESE'),
                                      'donVi', NLSSORT(TTCB.DON_VI, 'NLS_SORT = VIETNAMESE'),
                                      'dienThoai', NLSSORT(TTCB.DIEN_THOAI, 'NLS_SORT = BINARY_AI'),
                                      'email', NLSSORT(TTCB.EMAIL, 'NLS_SORT = BINARY_AI'))
                           END DESC NULLS LAST)

        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;
CREATE OR REPLACE FUNCTION SDH_TS_INFO_TO_HOP_GET_BY_HINH_THUC(idHinhThuc IN STRING)
RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    open my_cursor
        for SELECT
            TS_TH.ID AS "id",
            DM.MA AS "ma",
            DM.LOAI_MON_THI AS "ten"
            FROM SDH_LOAI_MON_THI DM
                LEFT JOIN (SELECT * FROM SDH_TS_INFO_TO_HOP_THI
            WHERE ID_HINH_THUC = idHinhThuc) TS_TH ON  DM.MA = TS_TH.MA_TO_HOP
            ORDER BY "ma" ASC;
    RETURN my_cursor;
END;
CREATE OR REPLACE FUNCTION SDH_TS_THONG_TIN_CO_BAN_OF_KY_THI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                              filter IN STRING, searchTerm IN STRING,
                                                              maKyThi IN STRING,
                                                              totalItem OUT NUMBER, pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    my_cursor     SYS_REFCURSOR;
    sT            STRING(500) := '%' || lower(trim(searchTerm)) || '%';
    ks_soBaoDanh  STRING(50);
    ks_maNganh    STRING(50);
    ks_phanHe     STRING(50);
    ks_hinhThuc   STRING(50);
    ks_ho         STRING(50);
    ks_ten        STRING(50);
    ks_ngaySinh   STRING(50);
    ks_gioiTinh   STRING(50);
    ks_ngheNghiep STRING(50);
    ks_donVi      STRING(50);
    ks_tinh       STRING(50);
    ks_quan       STRING(50);
    ks_phuong     STRING(50);
    ks_dienThoai  STRING(50);
    ks_email      STRING(50);
    sortKey       STRING(20);
    sortMode      STRING(20);

BEGIN
    SELECT JSON_VALUE(filter, '$.ks_soBaoDanh') INTO ks_soBaoDanh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_maNganh') INTO ks_maNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phanHe') INTO ks_phanHe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_hinhThuc') INTO ks_hinhThuc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ho') INTO ks_ho FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ten') INTO ks_ten FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngaySinh') INTO ks_ngaySinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_gioiTinh') INTO ks_gioiTinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngheNghiep') INTO ks_ngheNghiep FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_donVi') INTO ks_donVi FROM DUAL;

    SELECT JSON_VALUE(filter, '$.ks_tinh') INTO ks_tinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_quan') INTO ks_quan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phuong') INTO ks_phuong FROM DUAL;

    SELECT JSON_VALUE(filter, '$.ks_dienThoai') INTO ks_dienThoai FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_email') INTO ks_email FROM DUAL;

    SELECT JSON_VALUE(filter, '$.sortKey') INTO sortKey FROM DUAL;
    SELECT JSON_VALUE(filter, '$.sortMode') INTO sortMode FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM SDH_TS_THONG_TIN_CO_BAN TTCB
             LEFT JOIN DM_GIOI_TINH GT on TTCB.GIOI_TINH = GT.MA
             LEFT JOIN DM_HOC_SDH PH ON PH.MA = TTCB.PHAN_HE
             LEFT JOIN SDH_TS_HINH_THUC HT ON HT.MA = TTCB.HINH_THUC
             LEFT JOIN DM_QUAN_HUYEN QUAN ON QUAN.MA_QUAN_HUYEN = TTCB.MA_QUAN_HUYEN
             LEFT JOIN DM_PHUONG_XA PHUONG ON PHUONG.MA_PHUONG_XA = TTCB.MA_PHUONG_XA
             LEFT JOIN DM_TINH_THANH_PHO TP ON TP.MA = TTCB.MA_TINH_THANH_PHO
             LEFT JOIN SDH_TS_INFO_TIME DOT ON DOT.ID = TTCB.ID_DOT
             LEFT JOIN SDH_TS_INFO KY ON KY.MA = DOT.MA_INFO_TS
    WHERE (TTCB.ID_DOT = maKyThi)
      AND (
            (ks_soBaoDanh IS NULL OR lower(TTCB.SBD) LIKE ('%' || lower(trim(ks_soBaoDanh)) || '%')) AND
            (ks_maNganh IS NULL OR lower(TTCB.MA_NGANH) LIKE ('%' || lower(trim(ks_maNganh)) || '%')) AND
            (ks_phanHe IS NULL OR lower(PH.TEN) LIKE ('%' || lower(trim(ks_phanHe)) || '%')) AND
            (ks_hinhThuc IS NULL OR lower(HT.TEN_HINH_THUC) LIKE ('%' || lower(trim(ks_hinhThuc)) || '%')) AND
            (ks_ho IS NULL OR lower(TTCB.HO) LIKE ('%' || lower(trim(ks_ho)) || '%')) AND
            (ks_ten IS NULL OR lower(TTCB.TEN) LIKE ('%' || lower(trim(ks_ten)) || '%')) AND
            (ks_ngaySinh IS NULL OR TTCB.NGAY_SINH = ks_ngaySinh) AND
            (ks_ngheNghiep IS NULL OR lower(TTCB.NGHE_NGHIEP) LIKE ('%' || lower(trim(ks_ngheNghiep)) || '%')) AND
            (ks_donVi IS NULL OR lower(TTCB.DON_VI) LIKE ('%' || lower(trim(ks_donVi)) || '%')) AND
            (ks_tinh IS NULL OR
             lower(TP.TEN) LIKE ('%' || lower(trim(ks_tinh)) || '%')) AND
            (ks_quan IS NULL OR
             lower(QUAN.TEN_QUAN_HUYEN) LIKE ('%' || lower(trim(ks_quan)) || '%')) AND
            (ks_phuong IS NULL OR
             lower(PHUONG.TEN_PHUONG_XA) LIKE ('%' || lower(trim(ks_phuong)) || '%')) AND
            (ks_dienThoai IS NULL OR lower(TTCB.DIEN_THOAI) LIKE ('%' || lower(trim(ks_dienThoai)) || '%')) AND
            (ks_email IS NULL OR lower(TTCB.EMAIL) LIKE ('%' || lower(trim(ks_email)) || '%')))
      AND (
        (ks_gioiTinh IS NOT NULL AND (TTCB.GIOI_TINH) = ks_gioiTinh OR ks_gioiTinh IS NULL)
        )

      AND (searchTerm = ''
        OR TTCB.SBD LIKE ST
        OR LOWER(TRIM(TTCB.HO || ' ' || TTCB.TEN)) LIKE ST
        OR LOWER(TTCB.MA_NGANH) LIKE ST
        OR LOWER(PH.TEN) LIKE ST
        OR LOWER(HT.TEN_HINH_THUC) LIKE ST
        OR LOWER(TTCB.DIEN_THOAI) LIKE ST
        OR LOWER(TTCB.EMAIL) LIKE ST
        OR LOWER(TTCB.NGHE_NGHIEP) LIKE ST
        OR LOWER(TTCB.DON_VI) LIKE ST);


    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT TTCB.ID              AS           "id",
                     TTCB.SBD             AS           "soBaoDanh",
                     TTCB.MA_NGANH        as           "maNganh",
                     PH.TEN               as           "phanHe",
                     HT.TEN_HINH_THUC     as           "hinhThuc",
                     PH.MA                as           "maPhanHe",
                     HT.MA                as           "maHinhThuc",
                     TTCB.HO              AS           "ho",
                     TTCB.TEN             AS           "ten",
                     TTCB.NGAY_SINH       AS           "ngaySinh",
                     GT.TEN               AS           "gioiTinh",
                     TTCB.NGHE_NGHIEP     AS           "ngheNghiep",
                     TTCB.DON_VI          AS           "donVi",
                     TTCB.ID_DOT             AS           "idDot",
                     PHUONG.TEN_PHUONG_XA AS           "tenPhuongXa",
                     QUAN.TEN_QUAN_HUYEN  AS           "tenQuanHuyen",
                     TP.TEN               AS           "tenTinhThanhPho",

                     TTCB.DIEN_THOAI      AS           "dienThoai",
                     TTCB.EMAIL           AS           "email",
                     DOT.MA_DOT           AS           "maDot",
                     KY.TEN               AS           "tenKy",
                     KY.NAM_TUYEN_SINH    AS           "namTuyenSinh",
                     ROW_NUMBER() OVER (ORDER BY NULL) R

              FROM SDH_TS_THONG_TIN_CO_BAN TTCB
                       LEFT JOIN DM_GIOI_TINH GT on TTCB.GIOI_TINH = GT.MA
                       LEFT JOIN DM_HOC_SDH PH ON PH.MA = TTCB.PHAN_HE
                       LEFT JOIN SDH_TS_HINH_THUC HT ON HT.MA = TTCB.HINH_THUC
                       LEFT JOIN DM_QUAN_HUYEN QUAN ON QUAN.MA_QUAN_HUYEN = TTCB.MA_QUAN_HUYEN
                       LEFT JOIN DM_PHUONG_XA PHUONG ON PHUONG.MA_PHUONG_XA = TTCB.MA_PHUONG_XA
                       LEFT JOIN DM_TINH_THANH_PHO TP ON TP.MA = TTCB.MA_TINH_THANH_PHO
                       LEFT JOIN SDH_TS_INFO_TIME DOT ON DOT.ID = TTCB.ID_DOT
                       LEFT JOIN SDH_TS_INFO KY ON KY.MA = DOT.MA_INFO_TS
              WHERE (TTCB.ID_DOT = maKyThi)
                AND (
                      (ks_soBaoDanh IS NULL OR lower(TTCB.SBD) LIKE ('%' || lower(trim(ks_soBaoDanh)) || '%')) AND
                      (ks_maNganh IS NULL OR lower(TTCB.MA_NGANH) LIKE ('%' || lower(trim(ks_maNganh)) || '%')) AND
                      (ks_phanHe IS NULL OR lower(PH.TEN) LIKE ('%' || lower(trim(ks_phanHe)) || '%')) AND
                      (ks_hinhThuc IS NULL OR lower(HT.TEN_HINH_THUC) LIKE ('%' || lower(trim(ks_hinhThuc)) || '%')) AND
                      (ks_ho IS NULL OR lower(TTCB.HO) LIKE ('%' || lower(trim(ks_ho)) || '%')) AND
                      (ks_ten IS NULL OR lower(TTCB.TEN) LIKE ('%' || lower(trim(ks_ten)) || '%')) AND
                      (ks_ngaySinh IS NULL OR TTCB.NGAY_SINH = ks_ngaySinh) AND
                      (ks_ngheNghiep IS NULL OR
                       lower(TTCB.NGHE_NGHIEP) LIKE ('%' || lower(trim(ks_ngheNghiep)) || '%')) AND
                      (ks_donVi IS NULL OR lower(TTCB.DON_VI) LIKE ('%' || lower(trim(ks_donVi)) || '%')) AND
                      (ks_tinh IS NULL OR
                       lower(TP.TEN) LIKE ('%' || lower(trim(ks_tinh)) || '%')) AND
                      (ks_quan IS NULL OR
                       lower(QUAN.TEN_QUAN_HUYEN) LIKE ('%' || lower(trim(ks_quan)) || '%')) AND
                      (ks_phuong IS NULL OR
                       lower(PHUONG.TEN_PHUONG_XA) LIKE ('%' || lower(trim(ks_phuong)) || '%')) AND
                      (ks_dienThoai IS NULL OR
                       lower(TTCB.DIEN_THOAI) LIKE ('%' || lower(trim(ks_dienThoai)) || '%')) AND
                      (ks_email IS NULL OR lower(TTCB.EMAIL) LIKE ('%' || lower(trim(ks_email)) || '%')))
                AND (
                  (ks_gioiTinh IS NOT NULL AND (TTCB.GIOI_TINH) = ks_gioiTinh OR ks_gioiTinh IS NULL)
                  )

                AND (searchTerm = ''
                  OR TTCB.SBD LIKE ST
                  OR LOWER(TRIM(TTCB.HO || ' ' || TTCB.TEN)) LIKE ST
                  OR LOWER(TTCB.MA_NGANH) LIKE ST
                  OR LOWER(PH.TEN) LIKE ST
                  OR LOWER(HT.TEN_HINH_THUC) LIKE ST
                  OR LOWER(TTCB.DIEN_THOAI) LIKE ST
                  OR LOWER(TTCB.EMAIL) LIKE ST
                  OR LOWER(TTCB.NGHE_NGHIEP) LIKE ST
                  OR LOWER(TTCB.DON_VI) LIKE ST
                  OR LOWER(PHUONG.TEN_PHUONG_XA) LIKE ST
                  OR LOWER(QUAN.TEN_QUAN_HUYEN) LIKE ST
                  OR LOWER(TP.TEN) LIKE ST)

              ORDER BY CASE
                           WHEN sortMode = 'ASC' THEN
                               DECODE(sortKey,
                                      'soBaoDanh', NLSSORT(TTCB.SBD, 'NLS_SORT = BINARY_AI'),
                                      'maNganh', NLSSORT(TTCB.MA_NGANH, 'NLS_SORT = BINARY_AI'),
                                      'phanHe', NLSSORT(PH.TEN, 'NLS_SORT = BINARY_AI'),
                                      'hinhThuc', NLSSORT(HT.TEN_HINH_THUC, 'NLS_SORT = BINARY_AI'),
                                      'ho', NLSSORT(TTCB.HO, 'NLS_SORT = VIETNAMESE'),
                                      'ten', NLSSORT(TTCB.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'ngaySinh', NLSSORT(TTCB.NGAY_SINH, 'NLS_SORT = BINARY_AI'),
                                      'ngheNghiep', NLSSORT(TTCB.NGHE_NGHIEP, 'NLS_SORT = VIETNAMESE'),
                                      'donVi', NLSSORT(TTCB.DON_VI, 'NLS_SORT = VIETNAMESE'),
                                      'dienThoai', NLSSORT(TTCB.DIEN_THOAI, 'NLS_SORT = BINARY_AI'),
                                      'email', NLSSORT(TTCB.EMAIL, 'NLS_SORT = BINARY_AI'))
                           END ASC NULLS LAST,
                       CASE
                           WHEN sortMode = 'DESC' THEN
                               DECODE(sortKey,
                                      'soBaoDanh', NLSSORT(TTCB.SBD, 'NLS_SORT = BINARY_AI'),
                                      'maNganh', NLSSORT(TTCB.MA_NGANH, 'NLS_SORT = BINARY_AI'),
                                      'phanHe', NLSSORT(PH.TEN, 'NLS_SORT = BINARY_AI'),
                                      'hinhThuc', NLSSORT(HT.TEN_HINH_THUC, 'NLS_SORT = BINARY_AI'),
                                      'ho', NLSSORT(TTCB.HO, 'NLS_SORT = VIETNAMESE'),
                                      'ten', NLSSORT(TTCB.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'ngaySinh', NLSSORT(TTCB.NGAY_SINH, 'NLS_SORT = BINARY_AI'),
                                      'ngheNghiep', NLSSORT(TTCB.NGHE_NGHIEP, 'NLS_SORT = VIETNAMESE'),
                                      'donVi', NLSSORT(TTCB.DON_VI, 'NLS_SORT = VIETNAMESE'),
                                      'dienThoai', NLSSORT(TTCB.DIEN_THOAI, 'NLS_SORT = BINARY_AI'),
                                      'email', NLSSORT(TTCB.EMAIL, 'NLS_SORT = BINARY_AI'))
                           END DESC NULLS LAST)

        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;
CREATE OR REPLACE FUNCTION SDH_TS_GET_DANH_SACH_THI_SINH_BY_FILTER(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                        filter IN STRING, totalItem OUT NUMBER,
                                                        pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    my_cursor     SYS_REFCURSOR;
    f_id          STRING(10);
    ky            STRING(50);
    dot           STRING(50);
    phanHe        STRING(50);
    hinhThuc      STRING(50);
    nganh         STRING(50);
    loaiDanhSach  STRING(10);
    ks_ky         STRING(50);
    ks_dot        STRING(50);
    ks_soBaoDanh  STRING(50);
    ks_maNganh    STRING(50);
    ks_phanHe     STRING(50);
    ks_hinhThuc   STRING(50);
    ks_ho         STRING(50);
    ks_ten        STRING(50);
    ks_ngaySinh   STRING(50);
    ks_gioiTinh   STRING(50);
    ks_ngheNghiep STRING(50);
    ks_donVi      STRING(50);
    ks_tinh       STRING(50);
    ks_quan       STRING(50);
    ks_phuong     STRING(50);
    ks_dienThoai  STRING(50);
    ks_email      STRING(50);
    sortKey       STRING(20);
    sortMode      STRING(20);

BEGIN
    SELECT JSON_VALUE(filter, '$.loaiDanhSach') INTO loaiDanhSach FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ky') INTO ky FROM DUAL;
    SELECT JSON_VALUE(filter, '$.dot') INTO dot FROM DUAL;
    SELECT JSON_VALUE(filter, '$.phanHe') INTO phanHe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hinhThuc') INTO hinhThuc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.nganh') INTO nganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.f_id') INTO f_id FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ky') INTO ks_ky FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_dot') INTO ks_dot FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_soBaoDanh') INTO ks_soBaoDanh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_maNganh') INTO ks_maNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phanHe') INTO ks_phanHe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_hinhThuc') INTO ks_hinhThuc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ho') INTO ks_ho FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ten') INTO ks_ten FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngaySinh') INTO ks_ngaySinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_gioiTinh') INTO ks_gioiTinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_ngheNghiep') INTO ks_ngheNghiep FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_donVi') INTO ks_donVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_tinh') INTO ks_tinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_quan') INTO ks_quan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_phuong') INTO ks_phuong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_dienThoai') INTO ks_dienThoai FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ks_email') INTO ks_email FROM DUAL;
    SELECT JSON_VALUE(filter, '$.sortKey') INTO sortKey FROM DUAL;
    SELECT JSON_VALUE(filter, '$.sortMode') INTO sortMode FROM DUAL;
    SELECT COUNT(*)
    INTO totalItem
    FROM SDH_TS_THONG_TIN_CO_BAN TTCB
             LEFT JOIN DM_GIOI_TINH GT on TTCB.GIOI_TINH = GT.MA
             LEFT JOIN DM_HOC_SDH PH ON PH.MA = TTCB.PHAN_HE
             LEFT JOIN SDH_TS_HINH_THUC HT ON HT.MA = TTCB.HINH_THUC
             LEFT JOIN DM_QUAN_HUYEN QUAN ON QUAN.MA_QUAN_HUYEN = TTCB.MA_QUAN_HUYEN
             LEFT JOIN DM_PHUONG_XA PHUONG ON PHUONG.MA_PHUONG_XA = TTCB.MA_PHUONG_XA
             LEFT JOIN DM_TINH_THANH_PHO TP ON TP.MA = TTCB.MA_TINH_THANH_PHO
             LEFT JOIN SDH_TS_INFO_TIME DOT ON DOT.ID = TTCB.ID_DOT
             LEFT JOIN SDH_TS_INFO KY ON KY.MA = DOT.MA_INFO_TS
    WHERE (
            (loaiDanhSach = '02' AND TTCB.SBD IS NOT NULL) OR
            (loaiDanhSach = '01')
        )
      AND (f_id IS NULL OR f_id IS NOT NULL AND TTCB.ID=f_id)
      AND (
            (ky IS NULL OR ky IS NOT NULL AND KY.MA = ky) AND
            (dot IS NULL OR dot IS NOT NULL AND TTCB.ID_DOT = dot) AND
            (phanHe IS NULL OR phanHe IS NOT NULL AND TTCB.PHAN_HE = phanHe) AND
            (hinhThuc IS NULL OR hinhThuc IS NOT NULL AND TTCB.HINH_THUC = hinhThuc) AND
            (nganh IS NULL OR nganh IS NOT NULL AND TTCB.MA_NGANH LIKE ('%' || nganh || '%'))
        )
      AND (
            (ks_ky IS NULL OR lower(KY.NAM_TUYEN_SINH) LIKE ('%' || lower(trim(ks_ky)) || '%')) AND
            (ks_dot IS NULL OR lower(DOT.MA_DOT) LIKE ('%' || lower(trim(ks_dot)) || '%')) AND
            (ks_soBaoDanh IS NULL OR lower(TTCB.SBD) LIKE ('%' || lower(trim(ks_soBaoDanh)) || '%')) AND
            (ks_maNganh IS NULL OR lower(TTCB.MA_NGANH) LIKE ('%' || lower(trim(ks_maNganh)) || '%')) AND
            (ks_phanHe IS NULL OR lower(PH.TEN) LIKE ('%' || lower(trim(ks_phanHe)) || '%')) AND
            (ks_hinhThuc IS NULL OR lower(HT.TEN_HINH_THUC) LIKE ('%' || lower(trim(ks_hinhThuc)) || '%')) AND
            (ks_ho IS NULL OR lower(TTCB.HO) LIKE ('%' || lower(trim(ks_ho)) || '%')) AND
            (ks_ten IS NULL OR lower(TTCB.TEN) LIKE ('%' || lower(trim(ks_ten)) || '%')) AND
            (ks_ngaySinh IS NULL OR TTCB.NGAY_SINH = ks_ngaySinh) AND
            (ks_ngheNghiep IS NULL OR lower(TTCB.NGHE_NGHIEP) LIKE ('%' || lower(trim(ks_ngheNghiep)) || '%')) AND
            (ks_donVi IS NULL OR lower(TTCB.DON_VI) LIKE ('%' || lower(trim(ks_donVi)) || '%')) AND
            (ks_tinh IS NULL OR
             lower(TP.MA) LIKE ('%' || lower(trim(ks_tinh)) || '%')) AND
            (ks_quan IS NULL OR
             lower(QUAN.MA_QUAN_HUYEN) LIKE ('%' || lower(trim(ks_quan)) || '%')) AND
            (ks_phuong IS NULL OR
             lower(PHUONG.MA_PHUONG_XA) LIKE ('%' || lower(trim(ks_phuong)) || '%')) AND
            (ks_dienThoai IS NULL OR lower(TTCB.DIEN_THOAI) LIKE ('%' || lower(trim(ks_dienThoai)) || '%')) AND
            (ks_email IS NULL OR lower(TTCB.EMAIL) LIKE ('%' || lower(trim(ks_email)) || '%')))
      AND (
        (lower(TTCB.GIOI_TINH) = ks_gioiTinh OR ks_gioiTinh IS NULL)
        );


    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT TTCB.ID              AS           "id",
                     TTCB.SBD             AS           "soBaoDanh",
                     TTCB.MA_NGANH        as           "maNganh",
                     PH.TEN               as           "phanHe",
                     HT.TEN_HINH_THUC     as           "hinhThuc",
                     PH.MA                as           "maPhanHe",
                     HT.MA                as           "maHinhThuc",
                     TTCB.HO              AS           "ho",
                     TTCB.TEN             AS           "ten",
                     TTCB.NGAY_SINH       AS           "ngaySinh",
                     GT.TEN               AS           "gioiTinh",
                     TTCB.NGHE_NGHIEP     AS           "ngheNghiep",
                     TTCB.DON_VI          AS           "donVi",

                     PHUONG.TEN_PHUONG_XA AS           "tenPhuongXa",
                     QUAN.TEN_QUAN_HUYEN  AS           "tenQuanHuyen",
                     TP.TEN               AS           "tenTinhThanhPho",

                     TTCB.DIEN_THOAI      AS           "dienThoai",
                     TTCB.EMAIL           AS           "email",
                     DOT.MA_DOT           AS           "maDot",
                     KY.TEN               AS           "tenKy",
                     KY.NAM_TUYEN_SINH    AS           "namTuyenSinh",
                     ROW_NUMBER() OVER (ORDER BY NULL) R

              FROM SDH_TS_THONG_TIN_CO_BAN TTCB
                       LEFT JOIN DM_GIOI_TINH GT on TTCB.GIOI_TINH = GT.MA
                       LEFT JOIN DM_HOC_SDH PH ON PH.MA = TTCB.PHAN_HE
                       LEFT JOIN SDH_TS_HINH_THUC HT ON HT.MA = TTCB.HINH_THUC
                       LEFT JOIN DM_QUAN_HUYEN QUAN ON QUAN.MA_QUAN_HUYEN = TTCB.MA_QUAN_HUYEN
                       LEFT JOIN DM_PHUONG_XA PHUONG ON PHUONG.MA_PHUONG_XA = TTCB.MA_PHUONG_XA
                       LEFT JOIN DM_TINH_THANH_PHO TP ON TP.MA = TTCB.MA_TINH_THANH_PHO
                       LEFT JOIN SDH_TS_INFO_TIME DOT ON DOT.ID = TTCB.ID_DOT
                       LEFT JOIN SDH_TS_INFO KY ON KY.MA = DOT.MA_INFO_TS
              WHERE (
                      (loaiDanhSach = '02' AND TTCB.SBD IS NOT NULL) OR
                      (loaiDanhSach = '01')
                  )
                AND (f_id IS NULL OR f_id IS NOT NULL AND TTCB.ID=f_id)
                AND (
                      (ky IS NULL OR ky IS NOT NULL AND KY.MA = ky) AND
                      (dot IS NULL OR dot IS NOT NULL AND TTCB.ID_DOT = dot) AND
                      (phanHe IS NULL OR phanHe IS NOT NULL AND TTCB.PHAN_HE = phanHe) AND
                      (hinhThuc IS NULL OR hinhThuc IS NOT NULL AND TTCB.HINH_THUC = hinhThuc) AND
                      (nganh IS NULL OR nganh IS NOT NULL AND TTCB.MA_NGANH LIKE ('%' || nganh || '%'))
                  )
                AND (
                      (ks_ky IS NULL OR lower(KY.NAM_TUYEN_SINH) LIKE ('%' || lower(trim(ks_ky)) || '%')) AND
                      (ks_dot IS NULL OR lower(DOT.MA_DOT) LIKE ('%' || lower(trim(ks_dot)) || '%')) AND
                      (ks_soBaoDanh IS NULL OR lower(TTCB.SBD) LIKE ('%' || lower(trim(ks_soBaoDanh)) || '%')) AND
                      (ks_maNganh IS NULL OR lower(TTCB.MA_NGANH) LIKE ('%' || lower(trim(ks_maNganh)) || '%')) AND
                      (ks_phanHe IS NULL OR lower(PH.TEN) LIKE ('%' || lower(trim(ks_phanHe)) || '%')) AND
                      (ks_hinhThuc IS NULL OR lower(HT.TEN_HINH_THUC) LIKE ('%' || lower(trim(ks_hinhThuc)) || '%')) AND
                      (ks_ho IS NULL OR lower(TTCB.HO) LIKE ('%' || lower(trim(ks_ho)) || '%')) AND
                      (ks_ten IS NULL OR lower(TTCB.TEN) LIKE ('%' || lower(trim(ks_ten)) || '%')) AND
                      (ks_ngaySinh IS NULL OR TTCB.NGAY_SINH = ks_ngaySinh) AND
                      (ks_ngheNghiep IS NULL OR
                       lower(TTCB.NGHE_NGHIEP) LIKE ('%' || lower(trim(ks_ngheNghiep)) || '%')) AND
                      (ks_donVi IS NULL OR lower(TTCB.DON_VI) LIKE ('%' || lower(trim(ks_donVi)) || '%')) AND
                      (ks_tinh IS NULL OR
                       lower(TP.MA) LIKE ('%' || lower(trim(ks_tinh)) || '%')) AND
                      (ks_quan IS NULL OR
                       lower(QUAN.MA_QUAN_HUYEN) LIKE ('%' || lower(trim(ks_quan)) || '%')) AND
                      (ks_phuong IS NULL OR
                       lower(PHUONG.MA_PHUONG_XA) LIKE ('%' || lower(trim(ks_phuong)) || '%')) AND
                      (ks_dienThoai IS NULL OR
                       lower(TTCB.DIEN_THOAI) LIKE ('%' || lower(trim(ks_dienThoai)) || '%')) AND
                      (ks_email IS NULL OR lower(TTCB.EMAIL) LIKE ('%' || lower(trim(ks_email)) || '%')))
                AND (
                  (lower(TTCB.GIOI_TINH) = ks_gioiTinh OR ks_gioiTinh IS NULL)
                  )
              ORDER BY CASE
                           WHEN sortMode = 'ASC' THEN
                               DECODE(sortKey,
                                      'soBaoDanh', NLSSORT(TTCB.SBD, 'NLS_SORT = BINARY_AI'),
                                      'maNganh', NLSSORT(TTCB.MA_NGANH, 'NLS_SORT = BINARY_AI'),
                                      'phanHe', NLSSORT(PH.TEN, 'NLS_SORT = BINARY_AI'),
                                      'hinhThuc', NLSSORT(HT.TEN_HINH_THUC, 'NLS_SORT = BINARY_AI'),
                                      'ho', NLSSORT(TTCB.HO, 'NLS_SORT = VIETNAMESE'),
                                      'ten', NLSSORT(TTCB.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'ngaySinh', NLSSORT(TTCB.NGAY_SINH, 'NLS_SORT = BINARY_AI'),
                                      'ngheNghiep', NLSSORT(TTCB.NGHE_NGHIEP, 'NLS_SORT = VIETNAMESE'),
                                      'donVi', NLSSORT(TTCB.DON_VI, 'NLS_SORT = VIETNAMESE'),
                                      'dienThoai', NLSSORT(TTCB.DIEN_THOAI, 'NLS_SORT = BINARY_AI'),
                                      'email', NLSSORT(TTCB.EMAIL, 'NLS_SORT = BINARY_AI'))
                           END ASC NULLS LAST,
                       CASE
                           WHEN sortMode = 'DESC' THEN
                               DECODE(sortKey,
                                      'soBaoDanh', NLSSORT(TTCB.SBD, 'NLS_SORT = BINARY_AI'),
                                      'maNganh', NLSSORT(TTCB.MA_NGANH, 'NLS_SORT = BINARY_AI'),
                                      'phanHe', NLSSORT(PH.TEN, 'NLS_SORT = BINARY_AI'),
                                      'hinhThuc', NLSSORT(HT.TEN_HINH_THUC, 'NLS_SORT = BINARY_AI'),
                                      'ho', NLSSORT(TTCB.HO, 'NLS_SORT = VIETNAMESE'),
                                      'ten', NLSSORT(TTCB.TEN, 'NLS_SORT = VIETNAMESE'),
                                      'ngaySinh', NLSSORT(TTCB.NGAY_SINH, 'NLS_SORT = BINARY_AI'),
                                      'ngheNghiep', NLSSORT(TTCB.NGHE_NGHIEP, 'NLS_SORT = VIETNAMESE'),
                                      'donVi', NLSSORT(TTCB.DON_VI, 'NLS_SORT = VIETNAMESE'),
                                      'dienThoai', NLSSORT(TTCB.DIEN_THOAI, 'NLS_SORT = BINARY_AI'),
                                      'email', NLSSORT(TTCB.EMAIL, 'NLS_SORT = BINARY_AI'))
                           END DESC NULLS LAST)

        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;
CREATE OR REPLACE FUNCTION QT_HOP_DONG_DON_VI_TRA_LUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                         filter IN STRING, searchTerm IN STRING,
                                                         totalItem OUT NUMBER,
                                                         pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc  STRING(100);
    listDv    STRING(100);
    fromYear  NUMBER(20);
    toYear    NUMBER(20);
    fromDate  STRING(20);
    toDate    STRING(20);
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO listDv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear' RETURNING NUMBER) INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear' RETURNING NUMBER) INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromDate') INTO fromDate FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toDate') INTO toDate FROM DUAL;


    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOP_DONG_DON_VI_TRA_LUONG hd
             LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
             LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd.LOAI_HOP_DONG = dhd.MA
             LEFT JOIN TCCB_CAN_BO_DON_VI benA ON hd.SHCC = benA.SHCC
             LEFT JOIN DM_DON_VI dv on hd.DON_VI_TRA_LUONG = dv.MA
             LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.NGACH = ncdnn.MA
             LEFT JOIN DM_CHUC_DANH_NGHE_NGHIEP cdnn on hd.CHUC_DANH_NGHE_NGHIEP = cdnn.MA
    WHERE (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((listShcc IS NOT NULL AND
              ((INSTR(listShcc, ',') != 0 AND INSTR(listShcc, benA.SHCC) != 0) OR (listShcc = benA.SHCC)))
            OR (listDv IS NOT NULL AND INSTR(listDv, benA.MA_DON_VI) != 0)
            OR (listShcc IS NULL AND listDv IS NULL))
            AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_HOP_DONG >= fromYear))
            AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd.NGAY_KY_HOP_DONG <= (toYear + 86399999)))
               ))
      AND (fromDate IS NULL OR (hd.NGAY_TAI_KY IS NOT NULL AND hd.NGAY_TAI_KY >= fromDate))
      AND (toDate IS NULL OR (hd.NGAY_TAI_KY IS NOT NULL AND hd.NGAY_TAI_KY <= toDate))
      AND (searchTerm = ''
        OR LOWER(hd.NGUOI_KY) LIKE sT
        OR LOWER(hd.SHCC) LIKE sT
        OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
        OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
        OR LOWER(hd.SO_HOP_DONG) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT hd.SHCC                  AS             "shcc",
                     hd.ID                    AS             "ID",
                     benA.HO                  AS             "hoBenA",
                     benA.TEN                 AS             "tenBenA",
                     nguoiKy.SHCC             as             "shccNguoiKy",
                     nguoiKy.HO               as             "hoNguoiKy",
                     nguoiKy.TEN              as             "tenNguoiKy",
                     nguoiKy.MA_CHUC_VU       as             "chucVuNguoiKy",
                     nguoiKy.MA_DON_VI        as             "donviNguoiKy",
                     hd.SO_HOP_DONG           as             "soHopDong",
                     hd.LOAI_HOP_DONG         as             "loaiHopDong",
                     dhd.TEN                  as             "tenLoaiHopDong",
                     hd.BAT_DAU_LAM_VIEC      as             "batDauLamViec",
                     hd.KET_THUC_HOP_DONG     as             "ketThucHopDong",
                     hd.NGAY_TAI_KY           as             "ngayTaiKy",
                     hd.DON_VI_TRA_LUONG      as             "diaDiemLamViec",
                     dv.TEN                   as             "tenDiaDiemLamViec",
                     hd.CHUC_DANH_NGHE_NGHIEP as             "chucDanhNgheNghiep",
                     cdnn.TEN                 as             "tenChucDanhChuyenMon",
                     hd.NGACH                 as             "maNgach",
                     hd.BAC                   as             "bac",
                     hd.HE_SO                 as             "heSo",
                     hd.NGAY_KY_HOP_DONG      as             "ngayKyHopDong",
                     hd.PHAN_TRAM_HUONG       as             "phanTramHuong",
                     ROW_NUMBER() OVER (ORDER BY hd.ID DESC) R
              FROM QT_HOP_DONG_DON_VI_TRA_LUONG hd
                       LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
                       LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd.LOAI_HOP_DONG = dhd.MA
                       LEFT JOIN TCCB_CAN_BO_DON_VI benA ON hd.SHCC = benA.SHCC
                       LEFT JOIN DM_DON_VI dv on hd.DON_VI_TRA_LUONG = dv.MA
                       LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.NGACH = ncdnn.MA
                       LEFT JOIN DM_NGACH_CDNN cdnn on hd.CHUC_DANH_NGHE_NGHIEP = cdnn.MA
              WHERE (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                  OR (((listShcc IS NOT NULL AND
                        ((INSTR(listShcc, ',') != 0 AND INSTR(listShcc, benA.SHCC) != 0) OR
                         (listShcc = benA.SHCC)))
                      OR (listDv IS NOT NULL AND INSTR(listDv, benA.MA_DON_VI) != 0)
                      OR (listShcc IS NULL AND listDv IS NULL))
                      AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_HOP_DONG >= fromYear))
                      AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND
                           (toYear IS NULL OR hd.NGAY_KY_HOP_DONG <= (toYear + 86399999)))
                         ))
                AND (fromDate IS NULL OR (hd.NGAY_TAI_KY IS NOT NULL AND hd.NGAY_TAI_KY >= fromDate))
                AND (toDate IS NULL OR (hd.NGAY_TAI_KY IS NOT NULL AND hd.NGAY_TAI_KY <= toDate))
                AND (searchTerm = ''
                  OR LOWER(hd.NGUOI_KY) LIKE sT
                  OR LOWER(hd.SHCC) LIKE sT
                  OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                  OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                  OR LOWER(hd.SO_HOP_DONG) LIKE sT)
              ORDER BY hd.NGAY_KY_HOP_DONG DESC, benA.TEN DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
CREATE OR REPLACE FUNCTION QT_NGHI_KHONG_LUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                list_shcc IN STRING, list_dv IN STRING,
                                                fromYear IN NUMBER, toYear IN NUMBER, tinhTrang IN NUMBER,
                                                timeType IN NUMBER, searchTerm IN STRING,
                                                totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHI_KHONG_LUONG qtnkl
             LEFT JOIN TCHC_CAN_BO cb on qtnkl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnkl.SHCC) != 0)
        OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
        OR (list_shcc IS NULL AND list_dv IS NULL))
        AND (timeType = 0 OR (timeType = 1
            AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
            AND (toYear IS NULL OR qtnkl.KET_THUC IS NULL OR qtnkl.KET_THUC <= toYear))
            OR (timeType = 2 AND
                (fromYear IS NULL OR qtnkl.THOI_GIAN_DI_LAM IS NULL OR fromYear <= qtnkl.THOI_GIAN_DI_LAM)
                AND (toYear IS NULL OR qtnkl.THOI_GIAN_DI_LAM IS NULL OR toYear >= qtnkl.THOI_GIAN_DI_LAM))
            OR (timeType = 3 AND
                (fromYear IS NULL OR qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR
                 fromYear <= qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC)
                AND (toYear IS NULL OR qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR
                     toYear >= qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC)))
        AND (tinhTrang IS NULL OR ((qtnkl.KET_THUC = -1 OR qtnkl.KET_THUC >= today) AND tinhTrang = 2) OR
             (qtnkl.KET_THUC IS NOT NULL AND qtnkl.KET_THUC != -1 AND qtnkl.KET_THUC < today AND tinhTrang = 1)))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtnkl.SO_VAN_BAN) LIKE sT
        OR LOWER(qtnkl.SO_THONG_BAO) LIKE sT
        OR LOWER(qtnkl.THONG_BAO_SO) LIKE sT
        OR LOWER(qtnkl.GHI_CHU) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnkl.ID                         AS             "id",
                     qtnkl.HO                         AS             "ho",
                     qtnkl.TEN                        AS             "ten",
                     qtnkl.SHCC                       AS             "shcc",
                     qtnkl.TEMP                       AS             "temp",
                     qtnkl.SO_VAN_BAN                 AS             "soVanBan",
                     qtnkl.THOI_GIAN_DI_LAM           AS             "thoiGianDiLam",
                     qtnkl.GHI_CHU                    AS             "ghiChu",
                     qtnkl.SO_THONG_BAO               AS             "soThongBao",
                     qtnkl.TONG_THOI_GIAN             AS             "tongThoiGian",
                     qtnkl.BAT_DAU                    AS             "batDau",
                     qtnkl.BAT_DAU_TYPE               AS             "batDauType",
                     qtnkl.KET_THUC                   AS             "ketThuc",
                     qtnkl.KET_THUC_TYPE              AS             "ketThucType",
                     qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC AS             "thoiGianTroLaiCongTac",
                     qtnkl.THONG_BAO_SO               AS             "thongBaoSo",
                     qtnkl.THAM_GIA_BHXH              AS             "thamGiaBhxh",
                     qtnkl.THOI_GIAN_BAO_GIAM         AS             "thoiGianBaoGiam",
                     qtnkl.THOI_GIAN_BAO_TANG         AS             "thoiGianBaoTang",

                     today                            AS             "today",

                     cb.HO                            AS             "hoCanBo",
                     cb.TEN                           AS             "tenCanBo",

                     dv.MA                            AS             "maDonVi",
                     dv.TEN                           AS             "tenDonVi",

                     ROW_NUMBER() OVER (ORDER BY qtnkl.BAT_DAU DESC) R
              FROM QT_NGHI_KHONG_LUONG qtnkl
                       LEFT JOIN TCHC_CAN_BO cb on qtnkl.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
              WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnkl.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
                AND (toYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU <= toYear)
                AND (tinhTrang IS NULL OR ((qtnkl.KET_THUC = -1 OR qtnkl.KET_THUC >= today) AND tinhTrang = 2) OR
                     (qtnkl.KET_THUC IS NOT NULL AND qtnkl.KET_THUC != -1 AND qtnkl.KET_THUC < today AND tinhTrang = 1))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtnkl.SO_VAN_BAN) LIKE sT
                  OR LOWER(qtnkl.SO_THONG_BAO) LIKE sT
                  OR LOWER(qtnkl.THONG_BAO_SO) LIKE sT
                  OR LOWER(qtnkl.GHI_CHU) LIKE sT)
              ORDER BY qtnkl.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
CREATE OR REPLACE FUNCTION QT_SANG_KIEN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
--                                          listShcc IN STRING, listDonVi IN STRING,
                                         filter IN STRING,
                                         searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    /* Object */------------------------------------------------------------------------------------------
    my_cursor SYS_REFCURSOR;

    /* Search term */-------------------------------------------------------------------------------------
    sT        STRING(500) := '%' || lower(searchTerm) || '%';

    /* List params in filter*/----------------------------------------------------------------------------
    listDonVi STRING(100);
    listShcc  STRING(100);
    filterCapAnhHuong NUMBER(10);
BEGIN

    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDonVi') INTO listDonVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.filterCapAnhHuong') INTO filterCapAnhHuong FROM DUAL;

    /* Init pageSize, pageNumber */---------------------------------------------------------------
    SELECT COUNT(*)
    INTO totalItem

    /* Data Field: Get data with filter & search term  */ ---------------------------------------------------------------

    -- 1. Map
    FROM QT_SANG_KIEN qtsk
             LEFT JOIN TCHC_CAN_BO cb on qtsk.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)

    -- 2. Conditions (filter + searchTerm)
    WHERE ((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                 from dual
                                                 connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
        OR (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
        OR (filterCapAnhHuong IS NOT NULL AND qtsk.CAP_ANH_HUONG = filterCapAnhHuong)
        OR (listShcc IS NULL AND listDonVi IS NULL AND filterCapAnhHuong IS NULL))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtsk.MA_SO) LIKE sT
        OR LOWER(qtsk.TEN_SANG_KIEN) LIKE sT);
    /* End Data Field */ ---------------------------------------------------------------

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    /* END: Init pageSize, pageNumber */---------------------------------------------------------------

    OPEN my_cursor FOR
        SELECT *
        FROM (
                /* GET nameTable.COLUMN                AS   "key" */-------------------------------------------------------
                 SELECT qtsk.ID                        AS   "id",
                        qtsk.SHCC                      AS   "shcc",
                        qtsk.MA_SO                     AS   "maSo",
                        qtsk.TEN_SANG_KIEN             AS   "tenSangKien",
                        qtsk.SO_QUYET_DINH             AS   "soQuyetDinh",
                        qtsk.CAP_ANH_HUONG             AS   "capAnhHuong",

                        cb.HO                          AS   "hoCanBo",
                        cb.TEN                         AS   "tenCanBo",

                        (select dmcv.TEN
                         from QT_CHUC_VU qtcv
                                  left join DM_CHUC_VU dmcv on qtcv.MA_CHUC_VU = dmcv.MA
                         where qtcv.shcc = qtsk.SHCC
                           and qtcv.CHUC_VU_CHINH = 1) as   "tenChucVu",
                        (select dmdv.TEN
                         from QT_CHUC_VU qtcv
                                  left join DM_DON_VI dmdv on qtcv.MA_DON_VI = dmdv.MA
                         where qtcv.shcc = qtsk.SHCC
                           and qtcv.CHUC_VU_CHINH = 1) as   "tenDonVi",
                        (select dmbm.TEN
                         from QT_CHUC_VU qtcv
                                  left join DM_BO_MON dmbm on qtcv.MA_BO_MON = dmbm.MA
                         where qtcv.shcc = qtsk.SHCC
                           and qtcv.CHUC_VU_CHINH = 1) as   "tenBoMon",

                        td.MA                          AS   "maHocVi",
                        td.TEN                         AS   "tenHocVi",

                        cdnn.MA                        AS   "maChucDanhNgheNghiep",
                        cdnn.TEN                       AS   "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY cb.TEN) R

                 /*  Data Field */
                 FROM QT_SANG_KIEN qtsk
                          LEFT JOIN TCHC_CAN_BO cb on qtsk.SHCC = cb.SHCC
                          LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                          LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                 WHERE ((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                     OR (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
                     OR (filterCapAnhHuong IS NOT NULL AND qtsk.CAP_ANH_HUONG = filterCapAnhHuong)
                     OR (listShcc IS NULL AND listDonVi IS NULL AND filterCapAnhHuong IS NULL))
                   AND (searchTerm = ''
                     OR LOWER(cb.SHCC) LIKE sT
                     OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                     OR LOWER(qtsk.MA_SO) LIKE sT
                     OR LOWER(qtsk.TEN_SANG_KIEN) LIKE sT)
                 /* End Data Field */

                 ORDER BY cb.TEN
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
DROP FUNCTION TC_HOC_PHI_THONG_TIN_SV;
