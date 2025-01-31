module.exports = app => {
    app.executeTask.sendNotifyNhacNoHocPhi = async ({ filter }) => {
        const getMailConfig = async () => {
            const mailConfig = await app.model.tcSetting.getValue('taiChinhEmailList', 'taiChinhEmailPassword');
            if (mailConfig.taiChinhEmailList) {
                return mailConfig.taiChinhEmailList.split(',').map(item => ({ email: item, password: mailConfig.taiChinhEmailPassword }));
            } else
                return [];
        };

        const sendSinhVienRemindMail = async (sinhVien, config, email) => {
            try {
                const emailTruong = sinhVien.emailTruong;
                config = config || await app.model.tcSetting.getValue('hocPhiEmailNhacNhoEditorText', 'hocPhiEmailNhacNhoEditorHtml', 'hocPhiEmailNhacNhoTitle', 'tcPhone', 'tcAddress', 'tcSupportPhone', 'tcEmail');

                const title = config.hocPhiEmailNhacNhoTitle;
                let html = config.hocPhiEmailNhacNhoEditorHtml.replace('{name}', `${sinhVien.ho} ${sinhVien.ten}`.trim()).replace('{mssv}', sinhVien.mssv)
                    .replace('{tc_address}', config.tcAddress).replace('{tc_phone}', config.tcPhone).replace('{support_phone}', config.tcSupportPhone).replace('{tc_email}', config.tcEmail);
                const text = config.hocPhiEmailNhacNhoEditorText.replace('{name}', `${sinhVien.ho} ${sinhVien.ten}`.trim()).replace('{mssv}', sinhVien.mssv)
                    .replace('{tc_address}', config.tcAddress).replace('{tc_phone}', config.tcPhone).replace('{support_phone}', config.tcSupportPhone).replace('{tc_email}', config.tcEmail);
                try {
                    if (!app.isDebug) {
                        await app.model.tcHocPhiSendEmailLog.create({ mssv: sinhVien.mssv, timestamp: Date.now(), namHoc: sinhVien.namHoc, hocKy: sinhVien.hocKy });
                        await app.email.normalSendEmail(email.email, email.password, emailTruong, null, null, (app.isDebug ? 'TEST: ' : '') + title, text, html, null);
                        console.info('SEND EMAIL FOR STUDENT: ', emailTruong);
                    } else {
                        await app.model.tcHocPhiSendEmailLog.create({ mssv: sinhVien.mssv, timestamp: Date.now(), namHoc: sinhVien.namHoc, hocKy: sinhVien.hocKy });
                        await app.email.normalSendEmail(email.email, email.password, 'vucong2018@gmail.com', null, null, (app.isDebug ? 'TEST: ' : '') + title, text, html, null);
                        console.info('SEND EMAIL FOR STUDENT: ', emailTruong);
                    }
                } catch (error) {
                    console.error(error);
                }
            } catch (error) {
                console.error(error);
            }
        };
        let { rows: data } = await app.model.tcHocPhi.remindMail(filter);
        const mailData = await app.model.tcSetting.getValue('hocPhiEmailNhacNhoEditorText', 'hocPhiEmailNhacNhoEditorHtml', 'hocPhiEmailNhacNhoTitle', 'tcPhone', 'tcAddress', 'tcSupportPhone', 'tcEmail');
        const emails = await getMailConfig();

        let mailList = [...emails];
        for (let i = 0; i < data.length; i++) {
            if (mailList.length == 0)
                mailList = [...emails];
            const email = mailList.splice(Math.floor(Math.random() * mailList.length), 1).pop();
            await sendSinhVienRemindMail(data[i], mailData, email);
        }
        return {};
    };
};