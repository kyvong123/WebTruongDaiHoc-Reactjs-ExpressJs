module.exports = (app) => {
  const menu = {
    parentMenu: app.parentMenu.category,
    menus: {
      4120: {
        title: "Mẫu hợp đồng giảng dạy",
        link: "/user/category/mau-hop-dong-giang-day",
      },
    },
  };
  app.permission.add(
    { name: "dmTcMauHopDongGiangDay:read", menu },
    { name: "dmTcMauHopDongGiangDay:write" },
    { name: "dmTcMauHopDongGiangDay:delete" },
    { name: "dmTcMauHopDongGiangDay:export" }
  );

  app.permissionHooks.add(
    "staff",
    "addRolesDmTcMauHopDongGiangDay",
    (user, staff) =>
      new Promise((resolve) => {
        if (staff.maDonVi && staff.maDonVi == "34") {
          app.permissionHooks.pushUserPermission(
            user,
            "dmTcMauHopDongGiangDay:read",
            "dmTcMauHopDongGiangDay:write",
            "dmTcMauHopDongGiangDay:delete",
            "dmTcMauHopDongGiangDay:export"
          );
          resolve();
        } else resolve();
      })
  );

  app.uploadHooks.add(
    "dmTcMauHopDongGiangDayFile",
    (req, fields, files, params, done) =>
      app.permission.has(
        req,
        () => dmTcMauHopDongGiangDayFile(fields, files, done),
        done,
        "dmTcMauHopDongGiangDay:write"
      )
  );

  app.fs.createFolder(
    app.path.join(app.assetPath, "khtc", "mauHopDongGiangDayTemplate")
  );

  const dmTcMauHopDongGiangDayFile = async (fields, files, done) => {
    try {
      if (
        files.dmTcMauHopDongGiangDayFile &&
        files.dmTcMauHopDongGiangDayFile.length > 0
      ) {
        const srcPath = files.dmTcMauHopDongGiangDayFile[0].path,
          file = files.dmTcMauHopDongGiangDayFile[0],
          body = app.utils.parse(fields.data),
          validUploadFileType = [".docx"],
          baseNamePath = app.path.extname(srcPath);
        if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
          done && done({ error: "Định dạng tập tin không hợp lệ!" });
          app.fs.deleteFile(srcPath);
        } else {
          const newData = {
            ma: body.ma,
            ten: body.ten,
            loaiHinhDaoTao: body.loaiHinhDaoTao,
          };
          if (body.isCreate) {
            const checkTontai = await app.model.dmTcMauHopDongGiangDay.get({
              ma: body.ma,
            });
            if (checkTontai)
              done && done({ error: "Đã tồn tại mẫu hợp đồng giảng dạy!" });
            else {
              const item = await app.model.dmTcMauHopDongGiangDay
                .create({ ...newData, path: file.originalFilename })
                .catch((error) => {
                  app.fs.deleteFile(srcPath);
                  throw error;
                });
              app.fs.renameSync(
                srcPath,
                app.path.join(
                  app.assetPath,
                  "khtc",
                  "mauHopDongGiangDayTemplate",
                  item.path
                )
              );
              done && done({ item });
            }
          } else {
            let item = await app.model.dmTcMauHopDongGiangDay.get({
              ma: body.ma,
            });
            await app.fs.deleteFile(
              app.path.join(
                app.assetPath,
                "khtc",
                "mauHopDongGiangDayTemplate",
                item.path
              )
            );
            app.fs.renameSync(
              srcPath,
              app.path.join(
                app.assetPath,
                "khtc",
                "mauHopDongGiangDayTemplate",
                file.originalFilename
              )
            );
            item = await app.model.dmTcMauHopDongGiangDay.update(
              { ma: body.ma },
              { ...newData, path: file.originalFilename }
            );
            done && done({ item });
          }
        }
      }
    } catch (error) {
      app.consoleError(error);
      done && done({ error });
    }
  };

  app.get(
    "/user/category/mau-hop-dong-giang-day",
    app.permission.check("dmTcMauHopDongGiangDay:read"),
    app.templates.admin
  );

  // APIs -----------------------------------------------------------------------------------------------------------------------------------------
  app.get(
    "/api/danh-muc/mau-hop-dong-giang-day/page/:pageNumber/:pageSize",
    app.permission.check("dmTcMauHopDongGiangDay:read"),
    async (req, res) => {
      try {
        const _pageNumber = parseInt(req.params.pageNumber),
          _pageSize = parseInt(req.params.pageSize);
        let condition = req.query.condition;

        if (req.query.condition) {
          condition = {
            statement:
              "lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText OR lower(path) LIKE :searchText",
            parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
          };
        }
        let page = await app.model.dmTcMauHopDongGiangDay.getPage(
          _pageNumber,
          _pageSize,
          condition,
          null,
          "ma ASC"
        );
        let listLoaiHinhDaoTao = await app.model.dmSvLoaiHinhDaoTao.getAll();

        listLoaiHinhDaoTao = listLoaiHinhDaoTao.mapArrayToObject("ma");
        let { totalItem, pageSize, pageTotal, pageNumber, list } = page;
        const listReturn = list.map((item) => {
          if (item.loaiHinhDaoTao) {
            item.loaiHinhDaoTao = item.loaiHinhDaoTao?.split(",");
            if (!item.tenLoaiHinhDaoTao) {
              item.tenLoaiHinhDaoTao = [];
              item.loaiHinhDaoTao.map((element) =>
                item.tenLoaiHinhDaoTao.push(listLoaiHinhDaoTao[element]?.ten)
              );
              item.tenLoaiHinhDaoTao = item.tenLoaiHinhDaoTao.join(", ");
            }
          }

          return item;
        });
        res.send({
          page: {
            totalItem,
            pageSize,
            pageTotal,
            pageNumber,
            list: listReturn,
            condition,
          },
        });
      } catch (error) {
        app.consoleError(error);
        res.send({ error });
      }
    }
  );

  app.get(
    "/api/danh-muc/mau-hop-dong-giang-day/all",
    app.permission.check("dmTcMauHopDongGiangDay:read"),
    async (req, res) => {
      try {
        const item = await app.model.dmTcMauHopDongGiangDay.getAll();
        res.send({ item });
      } catch (error) {
        app.consoleError(error);
        res.send({ error });
      }
    }
  );

  app.get(
    "/api/danh-muc/mau-hop-dong-giang-day/item/:ma",
    app.permission.check("dmTcMauHopDongGiangDay:read"),
    async (req, res) => {
      try {
        const item = await app.model.dmTcMauHopDongGiangDay.get({
          ma: req.params.ma,
        });
        res.send({ item });
      } catch (error) {
        app.consoleError(error);
        res.send({ error });
      }
    }
  );

  app.post(
    "/api/danh-muc/mau-hop-dong-giang-day",
    app.permission.check("dmTcMauHopDongGiangDay:write"),
    async (req, res) => {
      try {
        const { loaiHinhDaoTao } = req.body?.item;
        const checkTontai = await app.model.dmTcMauHopDongGiangDay.get({
          ma: req.body?.item?.ma,
        });
        if (checkTontai) {
          throw "Đẫ tồn tại mẫu hợp đồng giảng dạy trong danh mục";
        }
        const item = await app.model.dmTcMauHopDongGiangDay.create({
          ...req.body.item,
          loaiHinhDaoTao: loaiHinhDaoTao.toString(),
        });
        res.send({ item });
      } catch (error) {
        app.consoleError(error);
        res.send({ error });
      }
    }
  );

  app.put(
    "/api/danh-muc/mau-hop-dong-giang-day",
    app.permission.check("dmTcMauHopDongGiangDay:write"),
    async (req, res) => {
      try {
        let item = await app.model.dmTcMauHopDongGiangDay.get({
          ma: req.body.ma,
        });

        if (!item) {
          throw "Không tồn tại mẫu hợp đồng giảng dạy cần cập nhật!";
        }
        const { loaiHinhDaoTao } = req.body.changes;
        item = await app.model.dmTcMauHopDongGiangDay.update(
          { ma: req.body.ma },
          {
            ...req.body.changes,
            loaiHinhDaoTao: loaiHinhDaoTao.toString(),
          }
        );
        res.send({ item });
      } catch (error) {
        app.consoleError(error);
        res.send({ error });
      }
    }
  );

  app.delete(
    "/api/danh-muc/mau-hop-dong-giang-day",
    app.permission.check("dmTcMauHopDongGiangDay:delete"),
    async (req, res) => {
      try {
        let pathDeleteFile = app.path.join(
          app.assetPath,
          "khtc",
          "mauHopDongGiangDayTemplate"
        );
        let itemCheck = await app.model.dmTcMauHopDongGiangDay.get({
          ma: req.body.ma,
        });
        if (itemCheck) {
          pathDeleteFile = app.path.join(pathDeleteFile, itemCheck.path);
          if (app.fs.existsSync(pathDeleteFile))
            app.fs.deleteFile(pathDeleteFile);
        }
        await app.model.dmTcMauHopDongGiangDay.delete({ ma: req.body.ma });
        res.end();
      } catch (error) {
        app.consoleError(req, error);
        res.send({ error });
      }
    }
  );

  app.get(
    "/api/danh-muc/mau-hop-dong-giang-day/download/:ma",
    app.permission.check("dmTcMauHopDongGiangDay:export"),
    async (req, res) => {
      try {
        const ma = req.params.ma;
        console.log("ma la", ma);
        if (!ma) {
          throw "Không tồn tại mẫu hợp đồng giảng dạy!";
        }
        const path = await app.model.dmTcMauHopDongGiangDay
          .get({ ma })
          .then((item) => item.path);
        let source = app.path.join(
          app.assetPath,
          "khtc",
          "mauHopDongGiangDayTemplate",
          path
        );
        if (!app.fs.existsSync(source)) {
          throw "Không tồn tại mẫu hợp đồng giảng dạy!";
        }
        res.download(source);
      } catch (error) {
        app.consoleError(error);
        res.send({ error });
      }
    }
  );
};
