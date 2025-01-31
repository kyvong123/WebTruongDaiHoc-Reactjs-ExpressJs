const { MdTruyenThong } = require('../constant');
module.exports = app => {
    // Config
    const { userPermission, messageMaxLen } = require('./config')();

    app.get('/user/tt/lien-he/box-detail/:id', app.permission.check(userPermission), app.templates.admin);

    const { getUserTtLienUploadFolder, getFwQaMessageUploadFolder, getFwQaMessageUploadFolderUrl } = require('./util')(app);
    const { emitFwChatboxRefreshEvent, emitFwQaBlackboxNotiEvent } = require('./emitSocketEvent')(app);

    // Common APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.delete('/api/tt/lien-he/clear-unsave-message', app.permission.check(userPermission), async (req, res) => {
        try {
            const user = req.session.user;
            const folderPath = getUserTtLienUploadFolder(user);

            // Clear hết files trong thư mục người dùng
            const images = app.fs.existsSync(folderPath) && app.fs.readdirSync(folderPath);
            if (images) {
                for (const img of images) {
                    let filePath = app.path.join(folderPath, img);
                    app.fs.unlinkSync(filePath);
                }
            }
            res.send();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/lien-he/get-qa-box-detail', app.permission.check(userPermission), async (req, res) => {
        try {
            const email = req.session.user.email;
            const { fwQaId } = typeof req.query.condition === 'object' ? req.query.condition : {};
            let accessAllowed = 0;
            let isChatAllowed = 0;
            if (fwQaId) {
                let fwQaItem = (await app.model.fwQuestionAnswer.getDetailById(fwQaId)).rows[0];
                if (email == fwQaItem.creatorEmail || email == fwQaItem.emailNguoiPhuTrach) { accessAllowed = 1; isChatAllowed = 1; }
                if (accessAllowed == 0) throw 'Bạn không có quyền truy cập hộp thư';
                let { rows: fwQaMessageItems } = await app.model.fwQuestionAnswerMessage.searchByBoxId(fwQaId);

                for (let i = 0; i < fwQaMessageItems.length; i++) {
                    let fwQaMessageId = fwQaMessageItems[i].id;
                    const images = app.fs.existsSync(getFwQaMessageUploadFolder(fwQaId, fwQaMessageId)) && app.fs.readdirSync(getFwQaMessageUploadFolder(fwQaId, fwQaMessageId));
                    if (images) fwQaMessageItems[i].imagesUrl = images.map(url => app.path.join(getFwQaMessageUploadFolderUrl(fwQaId, fwQaMessageId), url));
                }
                if (fwQaItem.isBlackBox == 1) {
                    // Ẩn ngưởi trả lời
                    if (email == fwQaItem.creatorEmail) fwQaItem = { ...fwQaItem, emailNguoiPhuTrach: null, maNguoiPhuTrach: null, hoNguoiPhuTrach: null, tenNguoiPhuTrach: null };
                    // Ẩn người hỏi
                    else fwQaItem = { ...fwQaItem, maDoiTuong: null, creatorEmail: null, hoNguoiTao: null, tenNguoiTao: null };
                    for (let i = 0; i < fwQaMessageItems.length; i++) {
                        if (fwQaMessageItems[i].email != email) fwQaMessageItems[i] = { ...fwQaMessageItems[i], senderId: null, email: null, ho: null, ten: null };
                    }
                }
                res.send({ page: { fwQaItem, fwQaMessageItems, isChatAllowed, dmChuDe: { ten: fwQaItem.tenChuDe, id: fwQaItem.maChuDe } } });
            } else {
                throw 'Vui lòng gửi kèm mã box QA để DB biết nên lấy dữ liệu ở box nào';
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/chatbox/messages/page/:pageNumber/:pageSize', app.permission.orCheck('user:login'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { maQa } = req.query;
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: listMessage } = await app.model.fwQuestionAnswerMessage.searchPage(_pageNumber, _pageSize, app.utils.stringify({ fwQaId: maQa }));
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, listMessage: listMessage.sort((a, b) => a.createdAt - b.createdAt) } });
        } catch (error) {
            app.consoleError(req, error);
            res.send(error);
        }
    });

    app.post('/api/tt/lien-he/new-message', app.permission.orCheck(userPermission), async (req, res) => {
        try {
            const user = req.session.user;
            const { fwQaId, messageContent } = typeof req.body.data === 'object' ? req.body.data : {};
            let maDoiTuong = user.isStudent ? user.mssv : user.isStaff ? user.shcc : null;
            if (fwQaId) {
                let fwQaItem = (await app.model.fwQuestionAnswer.getDetailById(fwQaId)).rows[0];
                if (!fwQaItem) throw 'Không tìm thấy box nào';
                if (messageContent.length > messageMaxLen) throw `Độ dài tin nhắn vượt quá giới hạn cho phép (${messageMaxLen} ký tự)`;

                const now = Date.now();
                let newFwQaMessageItem = await app.model.fwQuestionAnswerMessage.create({ maQa: fwQaId, senderId: maDoiTuong, email: user.email, noiDung: messageContent, createdAt: Date.now(), ho: user.lastName, ten: user.firstName, });
                let fwQaChanges = { latestChatTime: now };

                // Check lần đầu trả lời tin nhắn từ cán bộ phụ trách
                if (fwQaItem.emailNguoiPhuTrach && fwQaItem.emailNguoiPhuTrach == user.email && !fwQaItem.responsedAt) fwQaChanges.responsedAt = now;
                await app.model.fwQuestionAnswer.update({ id: fwQaId }, fwQaChanges);

                // Lưu file hình
                const fwQaMessageId = newFwQaMessageItem.id;
                const folderImageUser = getUserTtLienUploadFolder(user);
                const imageFiles = app.fs.existsSync(folderImageUser) && app.fs.readdirSync(folderImageUser);
                imageFiles && imageFiles.length && await Promise.all(imageFiles.map(async img => {
                    return await app.fs.rename(app.path.join(folderImageUser, img), app.path.join(getFwQaMessageUploadFolder(fwQaId, fwQaMessageId), img));
                }));

                res.send({ page: { fwQaItem, newFwQaMessageItem } });
                newMessageNotify(fwQaItem, user, newFwQaMessageItem);
            } else {
                throw 'Vui lòng gửi kèm mã box QA để DB biết nên lấy dữ liệu ở box nào';
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const newMessageNotify = async (fwQaItem, user, newFwQaMessageItem) => {
        if (fwQaItem.emailNguoiPhuTrach) {
            let notifyEmail = user.email == fwQaItem.emailNguoiPhuTrach ? fwQaItem.creatorEmail : fwQaItem.emailNguoiPhuTrach,
                title = `Hộp thư${fwQaItem.isBlackBox == 1 ? ' ẩn danh' : ''} có tin nhắn mới: ${fwQaItem.noiDung.length < 30 ? fwQaItem.noiDung : fwQaItem.noiDung.substring(0, 30) + '...'}`,
                subTitle = `${user.email != fwQaItem.emailNguoiPhuTrach ? (fwQaItem.isBlackBox == 1 ? 'Người dùng ẩn danh' : fwQaItem.creatorEmail) : fwQaItem.emailNguoiPhuTrach} nhắn: ${newFwQaMessageItem.noiDung.length < 100 ? newFwQaMessageItem.noiDung : newFwQaMessageItem.noiDung.substring(0, 100) + '...'}`,
                pathArguments = `{"id":${fwQaItem.id}}`;

            await app.model.fwQuestionAnswerNotification.create({ email: notifyEmail, title, subTitle, icon: 'fa-envelope', read: 0, targetLink: `/user/tt/lien-he/box-detail/${fwQaItem.id}`, sendTime: Date.now(), mobilePath: fwQaItem.isBlackBox == 1 ? MdTruyenThong.chatBlackboxDetail : MdTruyenThong.chatQaDetail, mobileArguments: pathArguments });

            console.log('inside fwQaItem.creatorEmail', fwQaItem.creatorEmail);
            console.log('inside fwQaItem.emailNguoiPhuTrach', fwQaItem.emailNguoiPhuTrach);

            emitFwChatboxRefreshEvent({ email: fwQaItem.creatorEmail, maChatBox: fwQaItem.id });
            emitFwChatboxRefreshEvent({ email: fwQaItem.emailNguoiPhuTrach, maChatBox: fwQaItem.id });
            emitFwQaBlackboxNotiEvent({ email: notifyEmail });
            app.firebase.sendToEmails({ listEmail: [notifyEmail], title, body: subTitle });
        } else {
            emitFwChatboxRefreshEvent({ email: fwQaItem.creatorEmail, maChatBox: fwQaItem.id });
        }
    };
};