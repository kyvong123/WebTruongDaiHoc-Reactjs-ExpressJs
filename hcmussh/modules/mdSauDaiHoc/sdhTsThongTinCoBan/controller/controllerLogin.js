
module.exports = app => {
    //SDH TS Authencation here  
    app.post('/api/sdh/login', async (req, res) => {
        try {
            // xử lý login
            const { email, password } = req.body.data;
            const user = { isThiSinhSdh: 1, email };
            const dot = await app.model.sdhTsInfoTime.get({ processingTs: 1 });
            if (dot && dot.id) {
                let items = await app.model.sdhTsThongTinCoBan.getAll({ email, idDot: dot.id });
                if (!items.length) return res.send({ error: `Không tìm thấy hồ sơ với email ${email}` });
                // const isValidation = await app.model.sdhTsAccount.get({ email: items[0].email, idThiSinh: items[0].id });
                const isValidation = await app.model.sdhTsAccount.check(items[0].id).then(rs => rs.rows);
                if (!isValidation.length) return res.send({ error: 'Hồ sơ không có thông tin đăng nhập!' });
                const compareResult = app.utils.equalPassword(password, isValidation[0].hashedPassword);
                if (!compareResult) return res.send({ error: 'Sai mật khẩu!' });
                await app.updateSessionUserSdh(req, user);
                res.end();
            } else {
                return res.send('Không tìm thấy đợt dữ liệu đợt tuyển sinh!', 'danger');
            }
            res.end();
        }
        catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.post('/api/sdh/forget-password', async (req, res) => {
        try {
            //TO DO: xử lý quên mật khẩu
            const { email, passwordNew, confirmPasswordNew } = req.body.data;
            const accountCheck = await app.model.sdhTsAccount.checkExist(email);
            const isExisted = accountCheck.rows.length;
            let listHoSo = await app.model.sdhTsThongTinCoBan.getAll({ email });
            listHoSo = listHoSo.map(item => item.id).join(',');
            const lastModified = Date.now();
            const hashedPassword = app.utils.hashPassword(passwordNew);
            if (!(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/).test(passwordNew)) {
                throw 'Mật khẩu phải chứa ít nhất 6 ký tự, bao gồm các ít nhất 1 ký tự từ a-z, ít nhất 1 ký tự từ A-Z, và ít nhất 1 ký tự từ 0-9';
            }
            else if (passwordNew != confirmPasswordNew) {
                throw 'Mật khẩu xác nhận không chính xác';
            } else if (isExisted) {
                const existedAcount = accountCheck.rows[0];
                await app.model.sdhTsAccount.update({ id: existedAcount.id }, { hashedPassword, idHoSo: listHoSo, lastModified });
                res.end();
            } else {
                await app.model.sdhTsAccount.create({ email, lastModified, hashedPassword, idHoSo: listHoSo });
                res.end();
            }
        }
        catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.post('/api/sdh/change-password', async (req, res) => {
        try {
            //TO DO: xử lý quên mật khẩu
            const { idThiSinh, email } = req.session.user;
            const { newPass: passwordNew, confirmPass: confirmPasswordNew, oldPass: passwordOld } = req.body.data;
            // const isValidation = await app.model.sdhTsAccount.check(idThiSinh, passwordOld);
            const isValidation = await app.model.sdhTsAccount.check(idThiSinh).then(rs => rs.rows);
            if (!isValidation.length) return res.send({ error: 'Hồ sơ không có thông tin đăng nhập!' });
            const compareResult = app.utils.equalPassword(passwordOld, isValidation[0].hashedPassword);
            if (!compareResult) return res.send({ error: 'Sai mật khẩu!' });
            let listHoSo = await app.model.sdhTsThongTinCoBan.getAll({ email }).then(rs => rs.map(i => i.id).join(','));
            const lastModified = Date.now();
            const hashedPassword = app.utils.hashPassword(passwordNew);
            if (!(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/).test(passwordNew)) {
                throw 'Mật khẩu phải chứa ít nhất 6 ký tự, bao gồm các ít nhất 1 ký tự từ a-z, ít nhất 1 ký tự từ A-Z, và ít nhất 1 ký tự từ 0-9';
            }
            else if (passwordNew != confirmPasswordNew) {
                throw 'Mật khẩu xác nhận không chính xác';
            }
            const accountCheck = await app.model.sdhTsAccount.checkExist(email);
            const isExisted = accountCheck.rows.length;
            if (isExisted) {
                const existedAcount = accountCheck.rows[0];
                await app.model.sdhTsAccount.update({ id: existedAcount.id }, { hashedPassword, idHoSo: listHoSo, lastModified, email });
                res.end();
            } else {
                await app.model.sdhTsAccount.create({ email, lastModified, hashedPassword, idHoSo: listHoSo });
                res.end();
            }
        }
        catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};