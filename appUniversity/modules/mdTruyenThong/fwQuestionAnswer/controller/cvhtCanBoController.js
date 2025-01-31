module.exports = app => {
    /**
 * Cố vấn học tập
 */
    app.get('/api/cvht/lop-sv/page/:pageNumber/:pageSize', app.permission.check('staff:login'), async (req, res) => {
        try {
            let filter = app.utils.stringify(req.query.filter);
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : null;
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list, dslopcon: dsLopCon } = await app.model.dtLop.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const result = list.map(lop => {
                return {
                    ...lop,
                    lopChuyenNganh: dsLopCon.filter(lopcon => lopcon.maLopCha == lop.ma)
                };
            });
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list: result, dsLopCon } });

        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/cvht/sinh-vien/:maLop', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { maLop } = req.params;
            const items = await app.model.fwStudent.getAll({ lop: maLop });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/cvht/chatbox/create', app.permission.check('staff:login'), async (req, res) => {
        try {
            const user = req.session.user;
            const { maLopList } = req.body;
            const now = Date.now();
            const lopList = await Promise.all(maLopList.map(async (maLop) => await app.model.dtLop.get({ maLop })));
            const chatbox = await app.model.fwQuestionAnswer.create({ noiDung: `Chat học tập cho lớp ${maLopList} (Cố vấn: ${user.lastName} ${user.firstName})`, creatorEmail: user.email, maDoiTuong: user.shcc, createdAt: now, latestChatTime: now, chatBoxType: 'CVHT' });
            await app.model.fwQuestionAnswerMember.create({ ho: user.lastName, ten: user.firstName, email: user.email, maQa: chatbox.id, maMember: user.shcc, ngayThamGia: now, role: 'ADVISOR' });
            for (const lop of lopList) {
                const listSinhVien = await app.model.fwStudent.getAll({ lop: lop.maLop });
                for (const sinhVien of listSinhVien) {
                    await app.model.fwQuestionAnswerMember.create({ ho: sinhVien.ho, ten: sinhVien.ten, email: sinhVien.emailTruong, maQa: chatbox.id, maMember: sinhVien.mssv, ngayThamGia: now, role: 'STUDENT' });
                }
            }

            res.send({ chatbox });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/cvht/chatbox/get-advisor-chatbox', app.permission.check('staff:login'), async (req, res) => {
        try {
            const items = await app.model.fwQuestionAnswer.getAll({ creatorEmail: req.session.user.email, chatBoxType: 'CVHT' });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/cvht/chatbox/detail/:maChatbox', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { maChatbox } = req.params;
            const chatboxItem = await app.model.fwQuestionAnswer.get({ id: maChatbox, chatBoxType: 'CVHT' });
            const messageItems = await app.model.fwQuestionAnswerMessage.getAll({ maQa: maChatbox });
            res.send({ chatboxItem, messageItems });
        } catch (error) {
            res.send({ error });
        }
    });
};