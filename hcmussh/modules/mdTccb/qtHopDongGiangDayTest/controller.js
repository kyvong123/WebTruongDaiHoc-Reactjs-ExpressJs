module.exports = (app) => {
  const menu = {
    parentMenu: app.parentMenu.tccb,
    menus: {
      5278: {
        title: "Hợp đồng giảng dạy",
        link: "/user/tccb/hop-dong-giang-day-test",
        icon: "fa-graduation-cap",
        backgroundColor: "#28586F",
        groupIndex: 2,
      },
    },
  };

  app.permission.add(
    { name: "qtHopDongGiangDayTest:read", menu },
    { name: "qtHopDongGiangDayTest:write" },
    { name: "qtHopDongGiangDayTest:export" },
    { name: "qtHopDongGiangDayTest:delete" }
  );
  app.get(
    "/user/tccb/hop-dong-giang-day-test/:ma",
    app.permission.check(
      "qtHopDongGiangDayTest:read",
      "qtHopDongGiangDayTest:write"
    ),
    app.templates.admin
  );
  app.get(
    "/user/tccb/hop-dong-giang-day-test",
    app.permission.check(
      "qtHopDongGiangDayTest:read",
      "qtHopDongGiangDayTest:write",
      "qtHopDongGiangDayTest:export",
      "qtHopDongGiangDayTest:delete"
    ),
    app.templates.admin
  );
  app.get(
    "/user/tccb/hop-dong-giang-day-test/hoc-phan-giang-day-test",
    app.permission.check("qtHopDongGiangDayTest:read"),
    app.templates.admin
  );

  // APIs -----------------------------------------------------------------------------------------------------------------------------------------

  app.get(
    "/api/tccb/hop-dong-giang-day-test/page/:pageNumber/:pageSize",
    app.permission.check("qtHopDongGiangDayTest:read"),
    async (req, res) => {
      try {
        const _pageNumber = parseInt(req.params.pageNumber),
          _pageSize = parseInt(req.params.pageSize),
          searchTerm = req.query.condition,
          filter = app.utils.stringify(req.query.filter);

        const page = await app.model.qtHopDongGiangDayTest.searchPage(
          _pageNumber,
          _pageSize,
          filter,
          searchTerm
        );
        const {
          totalitem: totalItem,
          pagesize: pageSize,
          pagetotal: pageTotal,
          pagenumber: pageNumber,
          rows: list,
        } = page;
        const pageCondition = searchTerm;
        res.send({
          page: {
            totalItem,
            pageSize,
            pageTotal,
            pageNumber,
            pageCondition,
            list,
          },
        });
      } catch (error) {
        app.consoleError(req, error);
        res.send({ error });
      }
    }
  );

  app.get(
    "/api/tccb/hop-dong-giang-day-test/thong-ke-hoc-phan/page/:pageNumber/:pageSize",
    app.permission.check("qtHopDongGiangDayTest:read"),
    async (req, res) => {
      try {
        const _pageNumber = parseInt(req.params.pageNumber),
          _pageSize = parseInt(req.params.pageSize);
        let filter = req.query.filter;

        const { namHocSetting, hocKySetting } =
          await app.model.tcSetting.getSettingNamHocHocKy();
        filter = { namHoc: namHocSetting, hocKy: hocKySetting, ...filter };
        const page = await app.model.qtHopDongGiangDayTest.hocPhanSearchPage(
          _pageNumber,
          _pageSize,
          app.utils.stringify(filter)
        );
        const {
          totalitem: totalItem,
          pagesize: pageSize,
          pagetotal: pageTotal,
          pagenumber: pageNumber,
          rows: list,
        } = page;

        res.send({
          page: { totalItem, pageSize, pageTotal, pageNumber, list, filter },
        });
      } catch (error) {
        app.consoleError(req, error);
        res.send({ error });
      }
    }
  );

  app.get(
    "/api/tccb/hop-dong-giang-day-test/edit/item/:ma",
    app.permission.check("qtHopDongGiangDayTest:read"),
    async (req, res) => {
      try {
        const ma = parseInt(req.params.ma);
        const hopDong = await app.model.qtHopDongGiangDayTest.get({ ma });
        let { namHoc, hocKy } = hopDong;
        if (!hopDong) throw "Không tìm thấy hợp đồng giảng dạy";
        res.send({ namHoc, hocKy, ...hopDong });
      } catch (error) {
        app.consoleError(req, error);
        res.send({ error });
      }
    }
  );

  const tinhToanHeSoChatLuong = async (maHocHam, maHocVi, ngach, namHoc) => {
    const listHeSoChatLuongNamHoc = await app.model.dtDmHeSoChatLuong.getAll({
      namHoc,
    });
    if (maHocHam) {
      const resultByHocHam = listHeSoChatLuongNamHoc.find(
        (item) => item.hocHam == maHocHam
      );
      if (resultByHocHam) return resultByHocHam.heSo;
    }
    if (maHocVi) {
      const resultByHocVi = listHeSoChatLuongNamHoc.find(
        (item) =>
          item.hocVi == maHocVi &&
          ((ngach && item.ngach && item.ngach?.includes(ngach)) ||
            item.ngach == null)
      );
      if (resultByHocVi) return resultByHocVi.heSo;
    }
    if (ngach) {
      const resultByNgach = Math.min(
        ...listHeSoChatLuongNamHoc
          .filter((item) => item.ngach?.split(", ").includes(ngach))
          .map(({ heSo }) => heSo)
      );
      if (resultByNgach) return resultByNgach;
    }
    return 1;
  };

  const tinhToanHeSoKhoiLuong = async (soSinhVien, namHoc) => {
    const listHeSoKhoiLuongNamHoc = await app.model.dtDmHeSoKhoiLuong.getAll({
      namHoc,
    });
    const result = listHeSoKhoiLuongNamHoc.find(
      (element) =>
        element.soLuongDuoi <= soSinhVien && element.soLuongTren >= soSinhVien
    )?.heSo;
    if (result) return result;
    else return 0;
  };

  const tinhToanThanhTienHocPhan = (
    loaiHinhDaoTao,
    heSoKhoiLuong,
    heSoChatLuong,
    donGiaChuan,
    tongSoTiet
  ) => {
    if (loaiHinhDaoTao == "CQ") {
      return donGiaChuan * (1 + heSoKhoiLuong) * heSoChatLuong * tongSoTiet;
    } else if (
      ["VLVH", "VB2", "LT", "TX", "VB2_TX", "VB2_VLVH"].includes(loaiHinhDaoTao)
    ) {
      return donGiaChuan * (heSoChatLuong + heSoKhoiLuong + 0.5) * tongSoTiet;
    }
  };

  const tinhToanTongHeSo = (loaiHinhDaoTao, heSoChatLuong, heSoKhoiLuong) => {
    if (loaiHinhDaoTao == "CQ") return heSoChatLuong + heSoKhoiLuong;
    else if (
      ["VLVH", "VB2", "LT", "TX", "VB2_TX", "VB2_VLVH"].includes(loaiHinhDaoTao)
    )
      return heSoChatLuong + heSoKhoiLuong + 0.5;
  };

  app.get(
    "/api/tccb/hop-dong-giang-day-test/download-word/:ma/:maMauHopDong",
    app.permission.check("qtHopDongGiangDayTest:export"),
    async (req, res) => {
      try {
        const ma = Number(req.params.ma),
          maMauHopDong = req.params.maMauHopDong;
        let canBo = await app.model.qtHopDongGiangDayTest
          .download(ma)
          .then((item) => item.rows[0]);
        const heSoChatLuong = await tinhToanHeSoChatLuong(
          canBo.hocHam,
          canBo.hocVi,
          canBo.ngach,
          canBo.namHoc
        ).then((item) => item.toFixed(1));
        canBo = {
          ...canBo,
          heSoChatLuong: heSoChatLuong,
          ngayKyHopDong: canBo.ngayKyHopDong
            ? app.date.viDateFormatString(new Date(canBo.ngayKyHopDong))
            : "",
          daiDienKy: canBo.daiDienKy?.normalizedName(),
          kyTenUyQuyen:
            canBo.maChucVuNguoiKy == "003" ? "TUQ. HIỆU TRƯỞNG" : "",
          kyTenChucVu:
            canBo.maChucVuNguoiKy == "003"
              ? "TRƯỞNG PHÒNG TC-CB"
              : "HIỆU TRƯỞNG",
          quocTichKy: canBo.quocTichKy?.normalizedName() || "Việt Nam",
          chucVuDaiDienKy: canBo.chucVuNguoiKy + " Tổ chức - Cán bộ",
          hoTenCanBo: canBo.hoTenCanBo?.normalizedName(),
          quocTichCanBo: canBo.quocTichCanBo?.normalizedName() || "Việt Nam",
          ngaySinh: canBo.ngaySinh
            ? app.date.dateTimeFormat(new Date(canBo.ngaySinh), "dd/mm/yyyy")
            : "",
          ngayCapHoChieu: canBo.ngayCapHoChieu
            ? app.date.dateTimeFormat(
                new Date(canBo.ngayCapHoChieu),
                "dd/mm/yyyy"
              )
            : "",
          ngayHetHanHoChieu: canBo.ngayHetHanHoChieu
            ? app.date.dateTimeFormat(
                new Date(canBo.ngayHetHanHoChieu),
                "dd/mm/yyyy"
              )
            : "",
          ngayCapTheTamTru: canBo.ngayCapTheTamTru
            ? app.date.dateTimeFormat(
                new Date(canBo.ngayCapTheTamTru),
                "dd/mm/yyyy"
              )
            : "",
          ngayHetHanTheTamTru: canBo.ngayHetHanTheTamTru
            ? app.date.dateTimeFormat(
                new Date(canBo.ngayHetHanTheTamTru),
                "dd/mm/yyyy"
              )
            : "",
          gioiTinh: app.utils.parse(canBo.gioiTinh)?.vi || "",
          cmndNgayCap: canBo.cmndNgayCap
            ? app.date.dateTimeFormat(new Date(canBo.cmndNgayCap), "dd/mm/yyyy")
            : "",
          batDauHopDong: canBo.batDauHopDong
            ? app.date.dateTimeFormat(
                new Date(canBo.batDauHopDong),
                "dd/mm/yyyy"
              )
            : "",
        };
        console.log(
          "he so",
          canBo.shcc,
          heSoChatLuong,
          canBo.namHoc,
          canBo.loaiHinhDaoTao,
          canBo.loaiCanBo
        );
        let hocPhanTestList = await app.model.dtThuLaoGiangDay.getAll({
          idGiangVien: canBo.shcc,
        });

        let thanhTien = 0;
        let donGiaChuan = 0;
        let tongSoTietQuyDoi = 0;
        hocPhanTestList = await Promise.all(
          hocPhanTestList.map(async (item) => {
            item.soSinhVien = item.soLuongSv;
            item.soTietChuan = item.soTietDuocChia;

            item.donGiaChuan = item.donGia.toString().numberDisplay();
            donGiaChuan = item.donGiaChuan;
            item.heSoKhoiLuong = await tinhToanHeSoKhoiLuong(
              item.soLuongSv,
              item.namHoc
            );

            let heSoTongHop = tinhToanHeSoTongHop(
              item.soSinhVien,
              item.heSoKhoiLuong,
              heSoChatLuong,
              item.vietNamHoc,
              item.lopNuocNgoai,
              item.loaiHinhDaoTao
            );
            console.log("heSoTH", heSoTongHop);
            let monHoc = await app.model.dtThoiKhoaBieu.get({
              maHocPhan: item.maHocPhan,
            });
            let maMonHoc = monHoc.maMonHoc;
            console.log("mamonhoc", maMonHoc);

            item.thoiGianBatDau = app.date.dateTimeFormat(
              new Date(monHoc.ngayBatDau),
              "dd/mm/yyyy"
            );
            item.thoiGianKetThuc = app.date.dateTimeFormat(
              new Date(monHoc.ngayKetThuc),
              "dd/mm/yyyy"
            );

            let layMonHoc = await app.model.dmMonHoc.get({ ma: maMonHoc });
            item.tenMonHoc = JSON.parse(layMonHoc.ten).vi;
            item.soTinChi = layMonHoc.tongTinChi;
            item["thanhTien"] = (
              parseFloat(item.donGia) *
              parseFloat(heSoTongHop) *
              parseInt(item.soTietChuan)
            )
              .toString()
              .numberDisplay();
            item["tongTien"] =
              parseFloat(item.donGia) *
              parseFloat(heSoTongHop) *
              parseInt(item.soTietChuan);
            item.thanhTienHocPhan = item.thanhTien.toString().numberDisplay();
            // item.thanhTienHocPhanLyThuyet = item.thanhTienHocPhanLyThuyet
            //   .toString()
            //   .numberDisplay();
            // item.thanhTienHocPhanThucHanh = item.thanhTienHocPhanThucHanh
            //   .toString()
            //   .numberDisplay();

            thanhTien += item.tongTien;
            item.soTietQuyDoi = item.soTietDuocChia * (1 + item.heSoKhoiLuong);
            tongSoTietQuyDoi += item.soTietDuocChia * (1 + item.heSoKhoiLuong);
            return item;
          })
        );

        // const { thanhTien, donGiaChuan, tongSoTietQuyDoi } = hocPhanTestList[0];
        thuLaoHopDong = {
          thanhTien: thanhTien.toString().numberDisplay(),
          donGiaChuan: donGiaChuan,
          tongSoTietQuyDoi,
          khauTruThue: "10%",
          tienKhauTruThue: (thanhTien * 0.1).toString().numberDisplay(),
          tienSauThue: (thanhTien * 0.9).toString().numberDisplay(),
          tienSauThueBangChu: `${app.utils.numberToVnText(
            thanhTien * 0.9
          )} Việt Nam Đồng`,
        };

        let source, buffer;
        const tenMauHopDong = await app.model.dmTcMauHopDongGiangDay
          .get({ ma: maMauHopDong })
          .then((item) => item.path);
        source = app.path.join(
          app.assetPath,
          "khtc",
          "mauHopDongGiangDayTemplate",
          tenMauHopDong
        );
        canBo = { ...canBo, ...thuLaoHopDong, hocPhanTestList };
        buffer = await app.docx.generateFile(source, canBo);
        res.send({ content: buffer, filename: `HDGD_${canBo.shcc}.docx` });
      } catch (error) {
        app.consoleError(req, error);
        res.send({ error });
      }
    }
  );

  app.get(
    "/api/tccb/hop-dong-giang-day-test/hoc-phan-giang-day/download-excel",
    app.permission.check("tccbThongTinTaiChinhCanBo:export"),
    async (req, res) => {
      try {
        const filter = req.query.filter || "";
        const searchText = req.query.searchText || "",
          list = await app.model.qtHopDongGiangDayTest
            .hocPhanDownloadExcel(app.utils.stringify(filter), searchText)
            .then((item) => item.rows);

        const workBook = app.excel.create();
        const ws = workBook.addWorksheet("Danh sách học phần giảng dạy");

        ws.columns = [
          { header: "STT", key: "stt" },
          { header: "Số HDGD", key: "soHopDong", width: 20 },
          { header: "Mã số thuế", key: "maSoThue", width: 25 },
          { header: "Họ tên", key: "hoTenCanBo", width: 25 },
          { header: "Số CMND", key: "cmnd", width: 25 },
          { header: "Nơi cấp", key: "cmndNoiCap", width: 15 },
          { header: "Học vị", key: "trinhDo", width: 10 },
          { header: "Chức danh", key: "chucDanh", width: 10 },
          { header: "Tên môn học", key: "tenMonHoc", width: 20 },
          { header: "Khóa", key: "namHoc", width: 15 },
          { header: "Lớp", key: "lop", width: 15 },
          { header: "Hệ số", key: "heSo", width: 10 },
          { header: "Số tiêt", key: "soTiet", width: 10 },
          {
            header: "Mức thù lao",
            key: "donGia",
            width: 15,
            style: { numFmt: "###,###" },
          },
          {
            header: "Thành tiền",
            key: "thanhTien",
            width: 15,
            style: { numFmt: "###,###" },
          },
          {
            header: "Khấu trừ thuế TNCN",
            key: "thue",
            width: 15,
            style: { numFmt: "###,###" },
          },
          {
            header: "Thực nhận",
            key: "thucNhan",
            width: 15,
            style: { numFmt: "###,###" },
          },
          { header: "Ghi chú", key: "ghiChu", width: 10 },
        ];

        ws.getRow(1).alignment = {
          ...ws.getRow(1).alignment,
          vertical: "middle",
          wrapText: true,
        };
        ws.getRow(1).font = {
          name: "Times New Roman",
          size: 12,
          bold: true,
          color: { argb: "FF000000" },
        };

        let indexTong = 2;
        const result = Object.values(
          list.reduce(
            (
              newList,
              {
                stt,
                soHopDong,
                maSoThue,
                hoTenCanBo,
                cmnd,
                cmndNoiCap,
                trinhDo,
                chucDanh,
                tongThanhTien,
                tongThue,
                tongThucNhan,
                tenMonHoc,
                namHoc,
                lop,
                soSv,
                soTiet,
                donGia,
                heSo,
                thanhTien,
                thue,
                thucNhan,
              }
            ) => {
              const HopDongInfo = {
                stt,
                soHopDong,
                maSoThue,
                hoTenCanBo,
                cmnd,
                cmndNoiCap,
                trinhDo,
                chucDanh,
                tongThanhTien,
                tongThue,
                tongThucNhan,
                monHocs: [],
              };
              const hocPhanInfo = {
                tenMonHoc,
                namHoc,
                lop,
                soSv,
                soTiet,
                donGia,
                heSo,
                thanhTien,
                thue,
                thucNhan,
              };
              newList[hoTenCanBo] = newList[hoTenCanBo] || HopDongInfo;
              newList[hoTenCanBo]?.monHocs.push(hocPhanInfo);
              return newList;
            },
            {}
          )
        );

        result.forEach((item, index) => {
          ws.addRow({
            ...item,
            stt: index + 1,
            thanhTien: item.tongThanhTien,
            thue: item.tongThue,
            thucNhan: item.tongThucNhan,
          });

          ws.getColumn(14).alignment =
            ws.getColumn(15).alignment =
            ws.getColumn(16).alignment =
            ws.getColumn(17).alignment =
              { vertical: "middle", horizontal: "right", wrapText: true };

          ws.getRow(indexTong).getCell(15).font =
            ws.getRow(indexTong).getCell(16).font =
            ws.getRow(indexTong).getCell(17).font =
              {
                name: "Times New Roman",
                size: 12,
                bold: true,
                color: { argb: "FF000000" },
              };
          indexTong += item.monHocs.length + 1;
          item.monHocs.forEach((element) =>
            ws.addRow({
              ...element,
              thanhTien: element.thanhTien,
              thue: element.thue,
              thucNhan: element.thucNhan,
              donGia: element.donGia,
            })
          );
        });
        ws.addRow({
          stt: "Tổng cộng:",
          thanhTien: list[0].tongCuoiThanhTien,
          thue: list[0].tongCuoiThue,
          thucNhan: list[0].tongCuoiThucNhan,
        });
        ws.getRow(indexTong).getCell(1).font =
          ws.getRow(indexTong).getCell(15).font =
          ws.getRow(indexTong).getCell(16).font =
          ws.getRow(indexTong).getCell(17).font =
            {
              name: "Times New Roman",
              size: 12,
              bold: true,
              color: { argb: "FF000000" },
            };
        const buffer = await workBook.xlsx.writeBuffer();
        res.send({ buffer, filename: "DANH_SACH_THONG_KE.xlsx" });
      } catch (error) {
        app.consoleError(req, error);
        res.send({ error });
      }
    }
  );

  app.get(
    "/api/tccb/hop-dong-giang-day-test/download-excel",
    app.permission.check("tccbThongTinTaiChinhCanBo:export"),
    async (req, res) => {
      try {
        const filter = req.query.filter || "",
          searchTerm = req.query.searchTerm || "",
          { rows: list } = await app.model.qtHopDongGiangDayTest.downloadExcel(
            app.utils.stringify(filter),
            searchTerm
          ),
          workBook = app.excel.create(),
          ws = workBook.addWorksheet("Danh sách hợp đồng giảng dạy");

        ws.columns = [
          { header: "STT", key: "stt" },
          { header: "Số hợp đồng", key: "soHopDong", width: 25 },
          { header: "Ngày ký hợp đồng", key: "ngayKy", width: 25 },
          { header: "Số cán bộ", key: "maCanBo", width: 25 },
          { header: "Họ giảng viên", key: "hoCanBo", width: 25 },
          { header: "Tên giảng viên", key: "tenCanBo", width: 25 },
          { header: "Ngày sinh", key: "ngaySinh", width: 30 },
          { header: "Giới tính", key: "gioiTinh", width: 25 },
          { header: "Đơn vị giảng dạy", key: "donVi", width: 25 },
          {
            header: "Chức danh chuyên môn",
            key: "chucDanhChuyenMon",
            width: 25,
          },
          { header: "Mã cán bộ ký", key: "maNguoiKy", width: 25 },
          { header: "Họ người ký", key: "hoNguoiKy", width: 25 },
          { header: "Tên người ký", key: "tenNguoiKy", width: 25 },
        ];

        ws.getRow(1).alignment = {
          ...ws.getRow(1).alignment,
          vertical: "middle",
          wrapText: true,
        };
        ws.getRow(1).font = {
          name: "Times New Roman",
          size: 12,
          bold: true,
          color: { argb: "FF000000" },
        };

        list.forEach((item, index) => {
          ws.addRow({
            ...item,
            stt: index + 1,
            ngaySinh: item.ngaySinh
              ? app.date.dateTimeFormat(new Date(item.ngaySinh), "dd/mm/yyyy")
              : "",
            ngayKy: item.ngayKy
              ? app.date.dateTimeFormat(new Date(item.ngayKy), "dd/mm/yyyy")
              : "",
          });
        });
        const buffer = await workBook.xlsx.writeBuffer();
        res.send({ buffer, filename: "HOP_DONG_GIANG_DAY.xlsx" });
      } catch (error) {
        app.consoleError(req, error);
        res.send({ error });
      }
    }
  );

  app.post(
    "/api/tccb/hop-dong-giang-day-test",
    app.permission.check("qtHopDongGiangDayTest:write"),
    async (req, res) => {
      try {
        const { data, dataCanBo } = req.body;
        const {
          loaiHinhDaoTao,
          loaiCanBo,
          namHoc,
          hocKy,
          nguoiDuocThue,
          maHocPhan,
        } = data;
        let checkCanBo = await app.model.tchcCanBo.get({ shcc: nguoiDuocThue });
        if (!checkCanBo) throw "Không có thông tin cán bộ!";
        const { chucDanh, trinhDo, ngach } = checkCanBo;
        const maHopDong = await app.model.qtHopDongGiangDayTest
          .create(data)
          .then((item) => item.ma);
        const heSoChatLuong = await tinhToanHeSoChatLuong(
          chucDanh,
          trinhDo,
          ngach,
          namHoc
        );
        // const hopDongChiTietData = await app.model.qtHopDongGiangDayHocPhanTest
        //   .tinhTongHeSo(
        //     nguoiDuocThue,
        //     heSoChatLuong,
        //     namHoc,
        //     loaiHinhDaoTao,
        //     loaiCanBo
        //   )
        //   .then((item) => item.rows);
        await Promise.all([
          app.model.tchcCanBo.update({ shcc: nguoiDuocThue }, dataCanBo),
          // hopDongChiTietData.map((item) => {
          //   app.model.qtHopDongGiangDayHocPhanTest.create({
          //     maHocPhan: maHocPhan,
          //     maHdgd: maHopDong,
          //     giangVien: nguoiDuocThue,
          //     hocKy,
          //     namHoc,
          //     ...item,
          //   });
          // }),
        ]);
        app.tccbSaveCRUD(req.session.user.email, "C", "Hợp đồng giảng dạy");
        res.send({});
      } catch (error) {
        console.error(req.method, req.url, error);
        res.send({ error });
      }
    }
  );

  app.delete(
    "/api/tccb/hop-dong-giang-day-test",
    app.permission.check("qtHopDongGiangDayTest:delete"),
    async (req, res) => {
      try {
        const { ma } = req.body;
        const item = await app.model.qtHopDongGiangDayTest.get({ ma });
        if (!item) throw "Không tìm thấy hợp đồng giảng dạy";

        await app.model.qtHopDongGiangDayTest.delete({ ma });
        await app.model.qtHopDongGiangDayHocPhanTest.delete({ maHdgd: ma });
        app.tccbSaveCRUD(req.session.user.email, "D", "Hợp đồng giảng dạy");
        res.end();
      } catch (error) {
        console.error(req.method, req.url, error);
        res.send({ error });
      }
    }
  );

  app.put(
    "/api/tccb/hop-dong-giang-day-test",
    app.permission.check("qtHopDongGiangDayTest:write"),
    async (req, res) => {
      try {
        const { ma, changes } = req.body;
        const { hocKy, namHoc, nguoiDuocThue, loaiCanBo, loaiHinhDaoTao } =
          changes;
        const hopDong = await app.model.qtHopDongGiangDayTest.get({ ma });
        if (!hopDong) throw "Không tìm thấy hợp đồng giảng dạy";
        let update = await app.model.qtHopDongGiangDayTest.update(
          { ma },
          changes
        );
        const checkCanBo = await app.model.tchcCanBo.get({ ma: nguoiDuocThue });
        const { chucDanh, trinhDo, ngach } = checkCanBo;
        const heSoChatLuong = await tinhToanHeSoChatLuong(
          chucDanh,
          trinhDo,
          ngach,
          namHoc
        );
        const hopDongChiTietData = await app.model.qtHopDongGiangDayHocPhanTest
          .tinhTongHeSo(
            nguoiDuocThue,
            heSoChatLuong,
            namHoc,
            loaiHinhDaoTao,
            loaiCanBo
          )
          .then((item) => item.rows);
        await hopDongChiTietData.map(async (item) => {
          await app.model.qtHopDongGiangDayHocPhanTest.update(
            { maHocPhan: item.maHocPhan, giangVien: nguoiDuocThue },
            {
              maHdgd: ma,
              hocKy,
              namHoc,
              ...item,
            }
          );
        });
        app.tccbSaveCRUD(req.session.user.email, "U", "Hợp đồng giảng dạy");
        res.end();
      } catch (error) {
        app.consoleError(req, error);
        res.send({ error });
      }
    }
  );

  app.put(
    "/api/tccb/hoc-phan-giang-day-test",
    app.permission.check("qtHopDongGiangDayTest:write"),
    async (req, res) => {
      try {
        let { maHocPhan, giangVien, changes, loaiHinhDaoTao } = req.body;
        const hocPhan = await app.model.qtHopDongGiangDayHocPhanTest.get({
            maHocPhan,
            giangVien,
          }),
          { soSinhVien, tongSoTiet } = changes;

        if (!hocPhan) throw "Không tìm thấy học phần giảng dạy";
        const { heSoChatLuong, donGiaChuan } = hocPhan,
          heSoKhoiLuongMoi = await tinhToanHeSoKhoiLuong(
            soSinhVien,
            hocPhan.namHoc
          ),
          thanhTienHocPhan = tinhToanThanhTienHocPhan(
            loaiHinhDaoTao,
            heSoKhoiLuongMoi,
            heSoChatLuong,
            donGiaChuan,
            tongSoTiet
          ),
          tongHeSo = tinhToanTongHeSo(
            loaiHinhDaoTao,
            heSoChatLuong,
            heSoKhoiLuongMoi
          );
        const khauTruThueTncnHocPhan = thanhTienHocPhan * 0.1;
        const thucNhanHocPhan = thanhTienHocPhan * 0.9;
        if (!changes.tinhTrangThanhToan) {
          changes = {
            heSoKhoiLuong: heSoKhoiLuongMoi,
            tongHeSo,
            soTietQuyDoi: tongSoTiet * (1 + heSoKhoiLuongMoi),
            thanhTienHocPhan,
            khauTruThueTncnHocPhan,
            thucNhanHocPhan,
            ...changes,
          };
        }
        await app.model.qtHopDongGiangDayHocPhanTest.update(
          { maHocPhan, giangVien },
          changes
        );
        app.tccbSaveCRUD(req.session.user.email, "U", "Hợp đồng giảng dạy");
        res.end();
      } catch (error) {
        app.consoleError(req, error);
        res.send({ error });
      }
    }
  );

  app.post(
    "/api/tccb/hoc-phan-giang-day-test/chia-tiet/change",
    app.permission.check("qtHopDongGiangDayTest:write"),
    async (req, res) => {
      try {
        const { data } = req.body,
          { list, hocPhan } = data,
          hopDongData = await app.model.qtHopDongGiangDayTest.get({
            ma: hocPhan.maHopDong,
          });

        checkCanBoBanDau = list.find(
          (element) => element.nguoiDuocThue == hopDongData.nguoiDuocThue
        );
        if (!checkCanBoBanDau)
          throw "Cán bộ giảng dạy ban đầu phải tồn tại trong danh sách chia tiết !";

        const uniqueValues = new Set(
          list.map((element) => element.nguoiDuocThue)
        );
        if (uniqueValues.size < list.length) {
          throw "Không được chia thành nhiều tiết có cùng một giảng viên !";
        }

        await Promise.all(
          list.map(async (item) => {
            const {
              tongSoTiet,
              soSinhVien,
              nguoiDuocThue,
              donGiaChuan,
              maHocPhan,
              maHocKy,
            } = item;

            if (item.nguoiDuocThue == hopDongData.nguoiDuocThue) {
              const thanhTienHocPhan = tinhToanThanhTienHocPhan(
                  hopDongData.loaiHinhDaoTao,
                  Number(hocPhan.heSoKhoiLuong),
                  Number(hocPhan.heSoChatLuong),
                  Number(hocPhan.donGiaChuan),
                  Number(hocPhan.tongSoTiet)
                ),
                khauTruThueTncnHocPhan = thanhTienHocPhan * 0.1,
                thucNhanHocPhan = thanhTienHocPhan * 0.9;
              await app.model.qtHopDongGiangDayHocPhanTest.update(
                { maHdgd: hocPhan.maHopDong, maHocPhan },
                {
                  tongSoTiet,
                  thanhTienHocPhan,
                  khauTruThueTncnHocPhan,
                  thucNhanHocPhan,
                }
              );
            } else {
              const { chucDanh, hocVi, ngach } = await app.model.tchcCanBo.get({
                  shcc: nguoiDuocThue,
                }),
                heSoChatLuong = await tinhToanHeSoChatLuong(
                  chucDanh,
                  hocVi,
                  ngach,
                  hocPhan.namHoc
                ),
                heSoKhoiLuong = await tinhToanHeSoKhoiLuong(
                  soSinhVien,
                  hocPhan.namHoc
                ),
                thanhTienHocPhan = tinhToanThanhTienHocPhan(
                  hopDongData.loaiHinhDaoTao,
                  heSoKhoiLuong,
                  heSoChatLuong,
                  donGiaChuan,
                  tongSoTiet
                );
              const khauTruThueTncnHocPhan = thanhTienHocPhan * 0.1;
              const thucNhanHocPhan = thanhTienHocPhan * 0.9;
              let checkHocPhan =
                await app.model.qtHopDongGiangDayHocPhanTest.get({
                  maHocPhan,
                  giangVien: nguoiDuocThue,
                });
              if (!checkHocPhan) {
                await app.model.qtHopDongGiangDayHocPhanTest.create({
                  ...item,
                  thanhTienHocPhan,
                  khauTruThueTncnHocPhan,
                  thucNhanHocPhan,
                  giangVien: nguoiDuocThue,
                  hocKy: maHocKy,
                });
              } else {
                await app.model.qtHopDongGiangDayHocPhanTest.update(
                  {
                    maHocPhan: hocPhan.maHocPhan,
                    giangVien: item.nguoiDuocThue,
                  },
                  {
                    ...item,
                    thanhTienHocPhan,
                    khauTruThueTncnHocPhan,
                    thucNhanHocPhan,
                    hocKy: maHocKy,
                  }
                );
              }
            }
          })
        );
        res.end();
      } catch (error) {
        console.error(req.method, req.url, error);
        res.send({ error });
      }
    }
  );

  app.get(
    "/api/tccb/staff/loai-can-bo/all",
    app.permission.check("qtHopDongGiangDayTest:read"),
    async (req, res) => {
      try {
        const list = await app.model.tccbLoaiCanBo.getAll({
          statement: "LOWER(TEN) LIKE LOWER(:searchTerm)",
          parameter: { searchTerm: `%${req.query.condition || ""}%` },
        });
        res.send(list);
      } catch (error) {
        app.consoleError(req, error);
        res.send({ error });
      }
    }
  );

  const tinhToanHeSoTongHop = (
    soLuongSinhVien,
    heSoKhoiLuong,
    heSoChatLuong,
    lopVietNamHoc,
    lopNuocNgoai,
    heDaoTao
  ) => {
    if (soLuongSinhVien == 0) {
      return 0;
    }

    if (!heSoChatLuong) {
      heSoChatLuong = 1.0;
    }
    if (lopNuocNgoai) {
      heSoKhoiLuong = 0.5;
    } else if (!heSoKhoiLuong) {
      heSoKhoiLuong = 0;
    }

    if (["VHVL", "VB2", "VB2_TX", "VB2_VLVH", "LT", "TX"].includes(heDaoTao)) {
      return heSoChatLuong + heSoKhoiLuong + 0.5;
    } else {
      return heSoChatLuong + heSoKhoiLuong;
    }
  };

  app.get(
    "/api/tccb/hoc-phan-giang-day/:shcc",
    app.permission.check("qtHopDongGiangDayTest:read"),
    async (req, res) => {
      try {
        const shcc = req.params.shcc,
          maMonHoc = req.query.maMonHoc,
          item = await app.model.qtHopDongGiangDayHocPhanTest
            .getByShcc(shcc, maMonHoc)
            .then((item) => item.rows);
        res.send({ item });
      } catch (error) {
        app.consoleError(req, error);
        res.send({ error });
      }
    }
  );

  app.get(
    "/api/tccb/loai-can-bo/item/:ma",
    app.permission.check("qtHopDongGiangDayTest:read"),
    async (req, res) => {
      try {
        const item = await app.model.tccbLoaiCanBo.get({ ma: req.params.ma });

        if (!item) throw "Không có thông tin loại cán bộ";

        res.send({ item });
      } catch (error) {
        res.send({ error });
      }
    }
  );
};
