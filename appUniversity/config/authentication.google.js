module.exports = (app, appConfig) => {
    const { OAuth2Client } = require('google-auth-library');
    const passport = require('passport');
    const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    const GoogleStrategyConfig = {
        clientID: '318805336792-qn8orbdduo1qv0lm7bg6jp14nprcu1cu.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: '/auth/google/callback',
    };

    passport.use(new GoogleStrategy(GoogleStrategyConfig, async (accessToken, refreshToken, profile, done) => {
        // Check no email
        try {
            if (profile.emails.length == 0) {
                return done(null, false, { 'loginMessage': 'Fail to login!' });
            }
            // Check wether you are HCMUSSH or not
            const email = profile.emails[0].value;
            const user = await app.model.fwUser.get({ email });

            const isAdmin = await app.isAdmin(email);

            const isDeveloper = app.isDeveloper(email);

            if (!(isAdmin || app.isHCMUSSH(email) || isDeveloper || (app.isDebug && email.endsWith('@gmail.com')))) {
                return done(null, false, { 'loginMessage': 'Fail to login!' });
            }

            // Return Google user
            if (!user) {
                const staff = await app.model.tchcCanBo.get({ email });
                if (staff) return await app.model.fwUser.create({ email, active: 1 }, done);
                const student = await app.model.fwStudent.get({ emailTruong: email.toLowerCase() });
                if (student) return await app.model.fwUser.create({ email, active: 1 }, done);
                console.error('Login error: ', email);
                return done(`Người dùng với email ${email} không tồn tại trong hệ thống`);
            } else {
                done(null, user);
            }
        } catch (error) {
            done(error);
        }
    }));

    // Configure Passport authenticated session persistence
    passport.serializeUser((user, done) => done(null, user.email));
    passport.deserializeUser((email, done) => app.model.fwUser.get({ email }, done));

    // Initialize Passport and restore authentication state, if any, from the session.
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions

    // Make sure a user is logged in
    app.isLoggedIn = function (req, res, next) {
        if (req.isAuthenticated()) {
            return next(); // If user is authenticated in the session, carry on
        } else {
            res.redirect('/login'); // If they aren't redirect them to the home page
        }
    };

    // Do Google login action
    app.get('/auth/google', (req, res) => {
        try {
            const agentKeys = ['Zalo', 'FBAN', 'FBAV', 'Instagram'];
            const userAgent = req.headers['user-agent'];
            if (agentKeys.some(key => userAgent.includes(key))) {
                res.redirect('/require-browser');
            } else {
                passport.authenticate('google', { scope: ['email', 'profile'] })(req, res);
            }
        } catch (error) {
            console.log('Error: /auth/google', error);
            res.redirect('/');
        }
    });

    // Do Google login callback action
    app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/request-login' }), (req, res) => {
        app.updateSessionUser(req, req.user, (user) => {
            if (user.permissions.includes('developer:login')) {
                res.redirect(301, 'https://canbo.hcmussh.edu.vn/user');
            } else {
                res.redirect('/user');
            }
        });
    });

    app.projectNumber = '318805336792';
    app.projectId = 'hcmussh';

    const googleO2client = new OAuth2Client(GoogleStrategyConfig);
    app.post('/auth/mobile/signin', async (req, res) => {
        try {
            const { idToken, email, clientType } = req.body;
            let userEmail = app.isDebug ? email : '';
            console.info({ idToken, email, clientType });
            if (idToken) {
                const audience = appConfig.mobileGoogleClientId[clientType];
                console.info({ idToken, email, clientType, audience });
                const loginTicket = await googleO2client.verifyIdToken({ idToken, audience });
                const googleUser = loginTicket.getPayload();
                if (googleUser?.email) userEmail = googleUser.email;
            }

            if (!userEmail) {
                throw 'Tài khoản Gmail không hợp lệ!';
            } else {
                let user = await app.model.fwUser.get({ email: userEmail });
                if (!user) {
                    const staff = await app.model.tchcCanBo.get({ email });
                    if (staff) {
                        user = staff;
                        await app.model.fwUser.create({ email, active: 1 });
                    } else {
                        const student = await app.model.fwStudent.get({ emailTruong: email.toLowerCase() });
                        if (student) {
                            user = student;
                            await app.model.fwUser.create({ email, active: 1 });
                        } else {
                            throw 'Tài khoản Gmail chưa liên kết với tài khoản sinh viên hoặc cán bộ của Nhân văn!';
                        }
                    }
                }
                app.updateSessionUser(req, user, sessionUser => res.send({ message: 'Đăng nhập thành công', user: sessionUser }));
            }
        } catch (error) {
            console.error(error);
            res.send({ message: 'Đăng nhập không thành công', error });
        }
    });
};
