module.exports = app => {
    app.isGuest = (req, res, next) => {
        if (req.session.user == null) {
            next();
        } else if (req.method.toLowerCase() === 'get') {
            res.redirect('/');
        } else {
            res.send({ error: 'You has logged in!' });
        }
    };

    app.isUser = (req, res, next) => {
        if (req.session.user) {
            next();
        } else if (req.method.toLowerCase() === 'get') {
            if (req.originalUrl.startsWith('/api')) {
                res.send({ error: 'request-login' });
            } else {
                res.redirect('/request-login');
            }
        } else {
            res.send({ error: 'You must log in first!' });
        }
    };

    app.isHCMUSSH = email => email.endsWith('@hcmussh.edu.vn') ||
        email == app.defaultAdminEmail;

    app.isDeveloper = email => app.developers.includes(email);

    app.isAdmin = (email) => new Promise(resolve =>
        app.model.fwRole.get({ name: 'admin' }, (error, item) => {
            if (error || !item) resolve(false);
            else {
                app.model.fwUserRole.get({ email, roleId: item.id }, (error, user) => resolve(!error && user));
            }
        })
    );

    app.isSdhCandidate = (email) => new Promise(resolve =>
        // app.model.sdhTsThongTinCoBan.get({ email }, (error, item) => {
        //     if (error || !item) resolve(false);
        //     else {
        //         resolve(!error && item);
        //     }
        // })
        app.model.sdhTsThongTinCoBan.getAll({ email }, (error, items) => {
            if (error || !items.length) {
                resolve(false);
            }
            else {
                app.model.sdhTsInfoTime.get({ processingTs: 1 }, (error, _item) => {
                    if (error || !_item) {
                        resolve(false);
                    } else {
                        let candidate = items.filter(item => item.idDot == _item.id && item.isXetDuyet != 2);//đóng gói đợt
                        if (candidate.length && _item.kichHoat) {
                            //đợt đang mở đăng ký => cho phép ứng viên đăng nhập.
                            resolve(candidate[0]);
                        }
                        else {//đóng đăng ký => cho phép email ứng viên được duyệt đăng nhập.
                            let approvedCandidate = candidate.filter(i => i.isXetDuyet != 2);
                            if (!approvedCandidate.length) resolve(false);
                            else
                                //đợt đang mở đăng ký => cho phép ứng viên đăng nhập.
                                resolve(approvedCandidate[0]);// resolve item thoả email, trường hợp trùng hồ sơ xử lý ở hook handleThiSinhSdhLogin
                        }
                    }
                });
                resolve(!error && items);
            }
        })
    );

    app.loginByPassword = async (req, res) => {
        try {
            if (req.session.user != null) {
                res.send({ error: 'You are logged in!' });
            } else {
                let email = req.body.email.trim(), password = req.body.password;
                const student = await app.model.fwStudent.get({ emailTruong: email });
                if (student) { // Nếu có sinh viên
                    if (app.utils.equalPassword(password, student.matKhau)) {
                        let user = await app.model.fwUser.get({ email });
                        if (!user) user = await app.model.fwUser.create({ email, active: 1 });
                        if (user.active) {
                            app.updateSessionUser(req, user, sessionUser => res.send({ user: sessionUser }));
                        } else {
                            res.send({ error: 'Your account is inactive or not a company user!' });
                        }
                    } else {
                        res.send({ error: 'Invalid email or password!' });
                    }
                } else {
                    // TODO: Cán bộ - later
                    res.send({ error: 'Login fail!' });
                }
            }
        } catch {
            res.send({ error: 'Login fail!' });
        }
    };

    app.post('/logout', (req, res) => {
        if (app.casLogout && req.session.casUser) {
            app.casLogout(req, res);
        } else {
            if (req.logout) req.logout();
            if (req.session) {
                req.session.user = null;
                req.session.today = null;
            }
            res.end();
        }
    });

    app.post('/auth/mobile/login-by-password', async (req, res) => {
        try {
            if (req.session.user) throw 'Bạn đã đăng nhập';
            const { email, matKhau } = req.body;
            const user = await app.model.fwUser.get({ email: email.trim() });
            if (!user) throw `Email ${email} không tồn tại trên hệ thống`;
            if (!app.utils.equalPassword(matKhau, user.matKhau)) throw 'Mật khẩu không chính xác';
            if (!user.active) throw `Email ${email} không được kích hoạt`;
            await app.updateSessionUser(req, user, sessionUser => res.send({ user: sessionUser }));
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

};