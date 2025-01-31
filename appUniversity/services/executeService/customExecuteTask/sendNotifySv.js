module.exports = app => {
    // @Parmas
    // 1. Filter: stringify {namTuyenSinh, khoa, }
    // 2. 
    app.executeTask.sendNotifySv = async ({ filter, title, subTitle, icon, iconColor, targetLink, buttonLink, mobileIcon }) => {
        const { rows: data } = await app.model.fwStudent.getEmailSvAll(filter);
        const sql = 'INSERT INTO FW_NOTIFICATION (EMAIL, TITLE, SUB_TITLE, ICON, ICON_COLOR, TARGET_LINK, BUTTON_LINK, SEND_TIME, MOBILE_ICON) VALUES (:email, :title, :subTitle, :icon, :iconColor, :targetLink, :buttonLink, :sendTime, :mobileIcon)';
        const options = {
            autoCommit: true,
            batchErrors: true
        };
        const sendTime = Date.now();
        const listDataChunk = data.chunk(1000);
        for (const chunk of listDataChunk) {
            const listSql = [];
            for (const sinhVien of chunk) {
                listSql.push({
                    email: sinhVien.emailTruong,
                    title,
                    subTitle,
                    icon: icon || 'fa-check',
                    iconColor: iconColor || '#28a745',
                    targetLink: targetLink || null,
                    buttonLink: buttonLink || '[]',
                    sendTime,
                    mobileIcon: mobileIcon || 'check'
                });
            }
            await app.database.oracle.connection.main.executeMany(sql, listSql, options);
        }
        return {};
    };
};