module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3009: { title: 'Cán bộ đơn vị', link: '/user/tccb/can-bo-don-vi', icon: 'fa-address-card-o', backgroundColor: '#4297ff', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'tccbCanBoDonVi:read', menu },
        { name: 'tccbCanBoDonVi:write' },
    );
    app.get('/user/tccb/can-bo-don-vi', app.permission.check('tccbCanBoDonVi:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleTccbCanBoDonVi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'tccbCanBoDonVi:read', 'tccbCanBoDonVi:write');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/can-bo-don-vi/page/:pageNumber/:pageSize', app.permission.check('tccbCanBoDonVi:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const filter = app.utils.stringify(req.query.filter || {});
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.tccbCanBoDonVi.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    }
    );

    app.post('/api/tccb/can-bo-don-vi', app.permission.check('tccbCanBoDonVi:write'), async (req, res) => {
        try {
            const data = req.body.data;
            let item = await app.model.tccbCanBoDonVi.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/can-bo-don-vi', app.permission.check('tccbCanBoDonVi:write'), async (req, res) => {
        try {
            const { changes, shcc } = req.body;
            let item = await app.model.tccbCanBoDonVi.update({ shcc }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/can-bo-don-vi/edit/item', app.permission.check('tccbCanBoDonVi:read'), async (req, res) => {
        app.model.tccbCanBoDonVi.get(req.query.condition, (error, canBoDonVi) => {
            if (error) {
                res.send({ error: 'Lỗi khi lấy thông tin cán bộ đơn vị' });
            } else {
                app.getCanBoDonViProfile(res, canBoDonVi);
            }
        });
    });

    app.getCanBoDonViProfile = (res, canBoDonVi) => {
        let result = app.clone(canBoDonVi),
            curTime = new Date().getTime();
        new Promise(resolve => {
            app.model.fwUser.get({ email: canBoDonVi.email }, (error, user) => {
                result = app.clone(canBoDonVi, { image: user?.image || '' });
                resolve(result);
            });
        }).then((result) => new Promise(resolve => {
            app.model.quanHeCanBo.getQhByShcc(canBoDonVi.shcc, (error, quanHeCanBo) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin quan hệ gia đình cán bộ !' });
                } else {
                    result = app.clone(result, { quanHeCanBo: quanHeCanBo?.rows || [] });
                }
                resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.dmDonVi.get({ ma: canBoDonVi.maDonVi, kichHoat: 1 }, (error, item) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin đơn vị cán bộ !' });
                } else if (item == null) {
                    result = app.clone(result, { tenDonVi: '' });
                } else {
                    result = app.clone(result, { tenDonVi: item.ten });
                }
                resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.tccbToChucKhac.getAll({ shcc: canBoDonVi.shcc }, (error, toChucKhac) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin tổ chức chính trị - xã hội, nghề nghiệp cán bộ !' });
                } else {
                    result = app.clone(result, { toChucKhac: toChucKhac || [] });
                }
                resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.qtDaoTao.getCurrentOfStaff(canBoDonVi.shcc, curTime, (error, daoTaoCurrent) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin đào tạo hiện tại!' });
                } else if (daoTaoCurrent == null || daoTaoCurrent.length == 0) {
                    result = app.clone(result, { daoTaoCurrent: [] });
                } else {
                    result = app.clone(result, { daoTaoCurrent: daoTaoCurrent.rows });
                }
                resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.qtDaoTao.getHV(canBoDonVi.shcc, (error, daoTaoBoiDuong) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin đào tạo, bồi dưỡng!' });
                } else {
                    result = app.clone(result, { daoTaoBoiDuong: daoTaoBoiDuong.rows || [] });
                }
                resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.trinhDoNgoaiNgu.getAll({ shcc: canBoDonVi.shcc }, (error, trinhDoNN) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin trình độ ngoại ngữ cán bộ !' });
                }
                else {
                    result = app.clone(result, { trinhDoNN: trinhDoNN || [] });
                }
                resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            let chucVuChinhQuyen = [], chucVuDoanThe = [];
            app.model.qtChucVu.getByShcc(canBoDonVi.shcc, (error, chucVu) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin quá trình chức vụ!' });
                } else {
                    chucVuChinhQuyen = chucVu.rows.filter(i => i.loaiChucVu == 1);
                    chucVuDoanThe = chucVu.rows.filter(i => i.loaiChucVu != 1);
                    result = app.clone(result, { chucVuChinhQuyen, chucVuDoanThe });
                }
                resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.qtHopDongDonViTraLuong.get({ shcc: canBoDonVi.shcc }, 'ngayKyHopDong,loaiHopDong', 'NGAY_KY_HOP_DONG DESC', (error, dvtl) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin hợp đồng đơn vị!' });
                } else if (dvtl) {
                    result = app.clone(result, { hopDongCanBo: 'DVTL', hopDongCanBoNgay: new Date(dvtl.ngayKyHopDong).setHours(0, 0, 0), loaiHopDongCanBo: dvtl.loaiHopDong });
                    resolve(result);
                } else
                    resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.qtHopDongTrachNhiem.get({ nguoiDuocThue: canBoDonVi.shcc }, 'ngayKyHopDong', 'NGAY_KY_HOP_DONG DESC', (error, tn) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin hợp đồng trách nhiệm!' });
                } else if (tn) {
                    let ngayKyHopDong = new Date(tn.ngayKyHopDong).setHours(0, 0, 0);
                    if (result.hopDongCanBoNgay && result.hopDongCanBoNgay < ngayKyHopDong) {
                        result = app.clone(result, { hopDongCanBo: 'TN', hopDongCanBoNgay: ngayKyHopDong, loaiHopDongCanBo: '' });
                    } resolve(result);
                } else
                    resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.qtHopDongLaoDong.get({ nguoiDuocThue: canBoDonVi.shcc }, 'ngayKyHopDong,loaiHopDong', 'NGAY_KY_HOP_DONG DESC', (error, hdld) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin hợp đồng lao động !' });
                } else if (hdld) {
                    let ngayKyHopDong = new Date(hdld.ngayKyHopDong).setHours(0, 0, 0);
                    if (result.hopDongCanBoNgay && result.hopDongCanBoNgay < ngayKyHopDong) {
                        result = app.clone(result, { hopDongCanBo: 'LĐ', hopDongCanBoNgay: ngayKyHopDong, loaiHopDongCanBo: hdld.loaiHopDong });
                    } resolve(result);
                } else
                    resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.qtHopDongVienChuc.get({ nguoiDuocThue: canBoDonVi.shcc }, 'ngayKyHopDong,loaiHopDong', 'NGAY_KY_HOP_DONG DESC', (error, hdvc) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin hợp đồng làm việc !' });
                } else if (hdvc) {
                    let ngayKyHopDong = new Date(hdvc.ngayKyHopDong).setHours(0, 0, 0);
                    if (result.hopDongCanBoNgay && result.hopDongCanBoNgay < ngayKyHopDong) {
                        result = app.clone(result, { hopDongCanBo: 'VC', hopDongCanBoNgay: ngayKyHopDong, loaiHopDongCanBo: hdvc.loaiHopDong });
                    } resolve(result);
                } else
                    resolve(result);
            });
        })).then((result) => {
            if (!result.hopDongCanBo || result.hopDongCanBo == '') {
                result.loaiHopDongCanBo = '00';
                result.hopDongCanBo = '00';
            }
            res.send({ item: result });
        });
    };

    app.get('/api/tccb/can-bo-don-vi/by-email/:email', app.permission.check('tccbCanBoDonVi:read'), (req, res) => {
        app.model.tccbCanBoDonVi.get({ email: req.params.email }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/tccb/can-bo-don-vi/item/:shcc', app.permission.check('tccbCanBoDonVi:read'), async (req, res) => {
        try {
            let canBo = await app.model.tccbCanBoDonVi.get({ shcc: req.params.shcc });
            if (!canBo) {
                canBo = await app.model.dtCanBoNgoaiTruong.get({ shcc: req.params.shcc });
            }
            let [hocVi, donVi] = await Promise.all([
                app.model.dmTrinhDo.get({ ma: canBo.hocVi || canBo.trinhDo }),
                app.model.dmDonVi.get({ ma: canBo.maDonVi || canBo.donVi }),
            ]);
            res.send({ item: { ...canBo, trinhDo: hocVi ? hocVi.vietTat : '', tenDonVi: donVi ? donVi.ten : '' } });
        } catch (error) {
            res.send({ error });
        }
    });
};