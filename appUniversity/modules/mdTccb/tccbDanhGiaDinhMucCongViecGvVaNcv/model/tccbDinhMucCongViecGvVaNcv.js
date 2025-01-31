// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.tccbDinhMucCongViecGvVaNcv.foo = () => { };
    app.model.tccbDinhMucCongViecGvVaNcv.deleteByYear = async (nam) => {
        const listNhom = await app.model.tccbNhomDanhGiaNhiemVu.getAll({ nam });
        const listId = listNhom.map(nhom => nhom.id);
        if (listId.length > 0) {
            const listCount = await Promise.all(listId.map(idNhomDangKy => app.model.tccbDanhGiaCaNhanDangKy.count({ idNhomDangKy })));
            if (listCount.some(count => count.rows[0]['COUNT(*)'] > 0)) {
                throw 'Nhóm định mức đã có thông tin đăng ký, không thể xoá';
            }
            await Promise.all([
                app.model.tccbNhomDanhGiaNhiemVu.delete({ nam }),
                app.model.tccbDinhMucCongViecGvVaNcv.delete({ statement: 'idNhom IN (:listId)', parameter: { listId } }),
            ]);
        }
    };

    app.model.tccbDinhMucCongViecGvVaNcv.getAllByYear = async (nam) => {
        const [listNhom, listNgach, listChucDanhKhoaHoc] = await Promise.all([
            app.model.tccbNhomDanhGiaNhiemVu.getAll({ nam }, '*', 'thuTu ASC'),
            app.model.dmNgachCdnn.getAll(),
            app.model.dmChucDanhKhoaHoc.getAll(),
        ]);
        const chucDanhMapper = {};
        listNgach.forEach(item => chucDanhMapper[item.ma] = item.ten);
        listChucDanhKhoaHoc.forEach(item => chucDanhMapper[item.ma] = item.ten);
        if (listNhom.length == 0) return [];

        let items = await app.model.tccbDinhMucCongViecGvVaNcv.getAll({ statement: 'idNhom IN (:listId)', parameter: { listId: listNhom.map(nhom => nhom.id) } }, '*', 'id');
        items.forEach(item => {
            const itemChucDanhIds = item.maChucDanh.split(',');
            item.chucDanhs = itemChucDanhIds.map(ma => chucDanhMapper[ma] || '').join('; ');
        });

        listNhom.forEach(nhom => {
            nhom.submenus = items.filter(item => item.idNhom == nhom.id);
        });

        return listNhom;
    };

    app.model.tccbDinhMucCongViecGvVaNcv.cloneByYear = async (oldNam, newNam) => {
        const listNhom = await app.model.tccbNhomDanhGiaNhiemVu.getAll({ nam: oldNam });
        const listId = listNhom.map(nhom => nhom.id);
        if (listId.length == 0) return;
        const listDinhMuc = await app.model.tccbDinhMucCongViecGvVaNcv.getAll({ statement: 'idNhom IN (:listId)', parameter: { listId } }, '*', 'idNhom');
        const sortDinhMuc = listNhom.map(nhom => ({ ...nhom, submenus: listDinhMuc.filter(item => item.idNhom == nhom.id) }));
        const listNewNhom = await Promise.all(listNhom.map(nhom => {
            delete nhom.id;
            delete nhom.submenus;
            nhom.nam = newNam;
            return app.model.tccbNhomDanhGiaNhiemVu.create(nhom);
        }));
        let listNewDinhMuc = sortDinhMuc.map((parentItem, index) =>
            parentItem.submenus.map(submenu => {
                delete submenu.id;
                delete submenu.idNhom;
                return { ...submenu, idNhom: listNewNhom[index].id };
            })
        );
        listNewDinhMuc = listNewDinhMuc.reduce((prev, cur) => prev.concat(cur));
        await Promise.all(listNewDinhMuc.map(newDinhMuc => app.model.tccbDinhMucCongViecGvVaNcv.create(newDinhMuc)));
    };
};