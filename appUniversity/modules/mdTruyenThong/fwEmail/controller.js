module.exports = app => {
    // app.permission.add(
    //     {
    //         name: 'system:email',
    //         menu: { parentMenu: { index: 2000, title: 'Cấu hình', icon: 'fa-cog' }, menus: { 2020: { title: 'Email', link: '/user/email' } } },
    //     }
    // );
    // app.get('/user/email', app.permission.check('system:email'), app.templates.admin);

    // Init -----------------------------------------------------------------------------------------------------------------------------------------
    const init = () => {
        if (app.database.oracle.connected && app.model && app.model.fwSetting) {
            app.model.fwSetting.init({
                emailRegisterMemberTitle: 'HCMUSSH: Chào mừng thành viên mới!',
                emailRegisterMemberText: 'Xin chào {name}, Trường Đại học Khoa học Xã hội và Nhân văn (HCMUSSH) chào mừng bạn là thành viên mới. Trước khi bạn có thể đăng nhập, bạn vui lòng kích hoạt tài khoản bằng cách nhấp vào  {url}. Trân trọng, Trường Đại học Khoa học Xã hội và Nhân văn (HCMUSSH), Website: ' + app.rootUrl + '',
                emailRegisterMemberHtml: 'Xin chào <b>{name}</b>,<br/><br/>' +
                    'Trường Đại học Khoa học Xã hội và Nhân văn (HCMUSSH) chào mừng bạn là thành viên mới. Trước khi bạn có thể đăng nhập, bạn vui lòng kích hoạt tài khoản bằng cách nhấp vào link <a href="{url}">{url}</a>.<br/><br/>' +
                    'Trân trọng,<br/>' +
                    'Trường Đại học Khoa học Xã hội và Nhân văn (HCMUSSH)<br/>' +
                    'Website: <a href="' + app.rootUrl + '">' + app.rootUrl + '</a>',
                emailCreateMemberByAdminTitle: 'HCMUSSH: Chào mừng thành viên mới!',
                emailCreateMemberByAdminText: 'Chào {name}, Tài khoản của bạn đã được tạo. Thông tin đăng nhập của bạn là: email: {email}. Mật khẩu: "{password}". Link kích hoạt: {url}. Trân trọng, HCMUSSH Admin.',
                emailCreateMemberByAdminHtml: 'Chào {name},<br/><br/>Tài khoản của bạn đã được tạo. Thông tin đăng nhập của bạn là: <br> - Email: {email}.<br> - Mật khẩu: "{password}".<br/> - Link kích hoạt: <a href="{url}">{url}</a>.<br/><br/>Trân trọng,<br/>HCMUSSH Admin.',
                emailNewPasswordTitle: 'HCMUSSH: Mật khẩu mới!',
                emailNewPasswordText: 'Chào {name}, Mật khẩu mới của bạn là "{password}". Trân trọng, HCMUSSH Admin.',
                emailNewPasswordHtml: 'Chào {name},<br/><br/>Mật khẩu mới của bạn là "<b>{password}</b>".<br/><br/>Trân trọng,<br/>HCMUSSH Admin.',
                emailForgotPasswordTitle: 'HCMUSSH: Quên mật khẩu!',
                emailForgotPasswordText: 'Chào {name}, Bạn vừa mới yếu cầu thay đổi mật khẩu tại trang web ' + app.rootUrl + '. ' +
                    'Bạn dùng đường link bên dưới để thay đổi mật khẩu. ' +
                    'Mật khẩu chỉ có hiệu lực trong 24 giờ kế tiếp. ' +
                    'Link: {url}' +
                    'Trân trọng, ' +
                    'Trường Đại học Khoa học Xã hội và Nhân văn (HCMUSSH)' +
                    'Website: ' + app.rootUrl + '',
                emailForgotPasswordHtml: '<p><b>Chào {name}, </b><br/><br/>Bạn vừa mới yếu cầu thay đổi mật khẩu tại trang web <a href="' + app.rootUrl + '" target="_blank">' + app.rootUrl + '</a>. ' +
                    'Bạn dùng đường link bên dưới để thay đổi mật khẩu. <b>Đường link bên dưới chỉ có hiệu lực trong 24 giờ tiếp theo.</b><br/>' +
                    'Link: <a href="{url}">{url}</a><br/>' +
                    'Trân trọng, <br/>' +
                    'Trường Đại học Khoa học Xã hội và Nhân văn (HCMUSSH)<br/>' +
                    'Website: <a href="' + app.rootUrl + '" target="_blank">' + app.rootUrl + '</a></p>',
                emailContactTitle: 'HCMUSSH: Liên hệ',
                emailContactText: 'Chào bạn, HCMUSSH đã nhận tin nhắn của bạn. Cảm ơn bạn đã liên hệ với chúng tôi. Tiêu đề liên hệ là: "{title}". Thông điệp của bạn là: "{message}". HCMUSSH sẽ trả lời bạn sớm nhất. Trân trọng, HCMUSSH admin.',
                emailContactHtml: 'Chào bạn,<br/><br/>HCMUSSH đã nhận tin nhắn của bạn. Cảm ơn bạn đã liên hệ với chúng tôi.<br/>Tiêu đề liên hệ là: "{title}".<br/>Thông điệp của bạn là: "{message}".<br/>HCMUSSH sẽ trả lời bạn sớm nhất.<br/><br/>Trân trọng,<br/>HCMUSSH admin.',
            });
        } else {
            setTimeout(init, 1000);
        }
    };
    init();

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const EmailParams = [
        'emailRegisterMemberTitle', 'emailRegisterMemberText', 'emailRegisterMemberHtml',
        'emailCreateMemberByAdminTitle', 'emailCreateMemberByAdminText', 'emailCreateMemberByAdminHtml',
        'emailNewPasswordTitle', 'emailNewPasswordText', 'emailNewPasswordHtml',
        'emailForgotPasswordTitle', 'emailForgotPasswordText', 'emailForgotPasswordHtml',
        'emailContactTitle', 'emailContactText', 'emailContactHtml',
    ];

    app.get('/api/tt/email/all', app.permission.check('system:email'), (req, res) => app.model.fwSetting.getValue(EmailParams, result => res.send(result)));

    app.put('/api/tt/email', app.permission.check('system:email'), (req, res) => {
        const title = req.body.type + 'Title',
            text = req.body.type + 'Text',
            html = req.body.type + 'Html',
            changes = {};

        if (EmailParams.indexOf(title) != -1) changes[title] = req.body.email.title;
        if (EmailParams.indexOf(text) != -1) changes[text] = req.body.email.text;
        if (EmailParams.indexOf(html) != -1) changes[html] = req.body.email.html;

        app.model.fwSetting.setValue(changes, error => res.send({ error }));
    });
};