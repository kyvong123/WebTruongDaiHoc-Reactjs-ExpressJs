module.exports = app => {


    const getDonViQuanLy = (req) => req.session?.user?.staff?.donViQuanLy?.map(item => item.maDonVi) || [];
    const getDonVi = (req) => req.session?.user?.staff?.maDonVi;
    const getShcc = (req) => req.session.user?.shcc;
    const getCurrentPermissions = (req) => (req.session && req.session.user && req.session.user.permissions) || [];
    app.get('/user/van-ban-di/files/signing', app.permission.orCheck('hcthCongVanDi:write',), app.templates.admin);
    app.get('/user/hcth/van-ban-di/files/signing', app.permission.orCheck('hcthCongVanDi:write'), app.templates.admin);


    app.get('/api/hcth/van-ban-di/file/sign/search/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let { signType, isProcessed, requireProcessing, donViGui, donViNhan, canBoNhan, capVanBan, loaiVanBan, donViNhanNgoai, status, timeType, fromTime, toTime, congVanYear } = req.query.filter || {};

            //status scheme
            const userDepartments = new Set(getDonViQuanLy(req));
            if (getDonVi(req))
                userDepartments.add(getDonVi(req));

            const userShcc = getShcc(req);
            let reuqiredPermission = await app.model.hcthDoiTuongKiemDuyet.getAll({}, 'permissionList', 'permissionList');
            reuqiredPermission = reuqiredPermission.map(item => item.permissionList);

            let userPermission = getCurrentPermissions(req).intersect(reuqiredPermission).toString();
            const filterData = { signType, isProcessed: Number(isProcessed) || 0, requireProcessing: Number(requireProcessing) || 0, userShcc, userPermission, userDepartments: [...userDepartments].toString(), donViGui, donViNhan, canBoNhan, capVanBan, loaiVanBan, donViNhanNgoai, status, timeType, fromTime, toTime };
            if (congVanYear && Number(congVanYear) > 1900) {
                filterData.timeType = 1;
                filterData.fromTime = new Date(`${congVanYear}-01-01`).getTime();
                filterData.toTime = new Date(`${Number(congVanYear) + 1}-01-01`).getTime();
            }
            // const page = await app.model.hcthCongVanDi.searchPageAlternate(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), searchTerm, app.utils.stringify(scope), app.utils.stringify(filterData));
            const page = await app.model.hcthVanBanDiFile.signSearchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), searchTerm, app.utils.stringify(filterData));
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/mail/recover', app.permission.check('developer:login'), async (req, res) => {
        try {
            const fromTime = Number(req.query.fromTime);
            const condition = {
                statement: 'mailFrom like :fromMail and state=:mailState and createDate > :fromTime',
                parameter: {
                    fromMail: '%no-reply@%', mailState: 'error', fromTime
                }
            };
            const items = await app.model.fwEmailTask.getAll(condition);
            await app.model.fwEmailTask.update(condition, {state: 'waiting'});

            items.forEach(item => {
                app.messageQueue.send('emailService:send', { id: item.id });
            });

            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};