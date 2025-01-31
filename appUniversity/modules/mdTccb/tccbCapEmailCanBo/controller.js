module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3012: {
                title: 'Cấp email trường cho cán bộ', groupIndex: 0, link: '/user/tccb/cap-email-can-bo', icon: 'fa-envelope', backgroundColor: '#fecc2c'
            }
        }
    };

    app.permission.add(
        { name: 'tccbCapEmailCanBo:read', menu },
        { name: 'tccbCapEmailCanBo:write' },
    );

    app.get('/user/tccb/cap-email-can-bo', app.permission.check('tccbCapEmailCanBo:read'), app.templates.admin);

    // API ---------------------------------------------------------------------------------------------------

    app.post('/api/tccb/cap-email-can-bo/xac-nhan', app.permission.check('tccbCapEmailCanBo:read'), async (req, res) => {
        try {
            const { id, emailTruong } = req.body;
            if (!id || !emailTruong) throw 'Dữ liệu truyền không phù hợp!';

            const item = await app.model.tccbCapMaCanBo.get({ id });
            const loaiCanBo = await app.model.tccbLoaiCanBo.get({ ma: item.loaiCanBo });
            if (item.emailTruong) throw 'Cán bộ đã được cấp email trường!';

            await app.model.tccbCapMaCanBo.update({ id }, { emailTruong, thoiGianCapEmail: Date.now(), nguoiCapEmail: req.session.user.email });

            if (loaiCanBo && item.mscb) {
                const checkCb = await app.model[loaiCanBo.model].update({ shcc: item.mscb });
                checkCb && await app.model[loaiCanBo.model].update({ shcc: item.mscb }, { email: emailTruong });
            }

            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });


};