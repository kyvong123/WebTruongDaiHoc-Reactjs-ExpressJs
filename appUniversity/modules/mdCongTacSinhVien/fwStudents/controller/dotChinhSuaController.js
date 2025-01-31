module.exports = app => {
    app.get('/api/ctsv/dot-chinh-sua-info/page/:pageNumber/:pageSize', app.permission.check('student:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter;
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.svDotEditStudentInfo.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter));
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/dot-chinh-sua-info/create', app.permission.check('student:manage'), async (req, res) => {
        try {
            const user = req.session.user;
            const changes = req.body.changes;
            changes.staffModified = user.email;
            changes.timeModified = new Date().getTime();
            await checkTimeCH(changes, null);
            const item = await app.model.svDotEditStudentInfo.create(changes);
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const checkTimeCH = async (data, id) => {
        let listLoaiHinhDaoTao = data.heDaoTao.split(', '),
            listKhoaSV = data.khoaSinhVien.split(', '),
            listSectionEdit = data.sectionEdit.split(', ');
        let checkLHDT = false,
            checkKhoaSV = false,
            checkSectionEdit = false;
        let listDot = await app.model.svDotEditStudentInfo.getAll({
            statement: '(timeEnd >= :timeStart OR :timeEnd <= timeStart) AND isDeleted = 0',
            parameter: {
                timeStart: data.timeStart,
                timeEnd: data.timeEnd
            }
        }, '*'); //list cấu hình hx phần đã tạo ở NH, HK này
        if (id) listDot = listDot.filter(e => e.id != id);
        if (listDot.length != 0) {
            for (let itemDot of listDot) {
                let listLHDT = itemDot.heDaoTao.split(', '); //Kiểm tra Loại hình đào tạo có trùng!!
                for (let itemLHDT of listLHDT) {
                    let checkItem = listLoaiHinhDaoTao.includes(itemLHDT);
                    if (checkItem == true) {
                        checkLHDT = true;
                        break;
                    }
                }
                let listKSV = itemDot.khoaSinhVien.split(', '); //Kiểm tra Khóa sinh viên có trùng!!
                for (let itemKSV of listKSV) {
                    let checkItem = listKhoaSV.includes(itemKSV);
                    if (checkItem == true) {
                        checkKhoaSV = true;
                        break;
                    }
                }
                let listSection = itemDot.sectionEdit.split(', ');
                for (let itemSectionEdit of listSection) {
                    let checkItem = listSectionEdit.includes(itemSectionEdit);
                    if (checkItem == true) {
                        checkSectionEdit = true;
                        break;
                    }
                }
                if (checkLHDT == true && checkKhoaSV == true && checkSectionEdit) {
                    throw 'Bị trùng thời gian đăng ký với đợt ' + itemDot.tenDot;
                }
            }
        }
    };

    app.put('/api/ctsv/dot-chinh-sua-info/update', app.permission.check('student:manage'), async (req, res) => {
        try {
            const user = req.session.user;
            const { id, changes } = req.body;
            changes.staffModified = user.email;
            changes.timeModified = new Date().getTime();
            await checkTimeCH(changes, id);
            const item = await app.model.svDotEditStudentInfo.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/dot-chinh-sua-info/delete', app.permission.check('student:manage'), async (req, res) => {
        try {
            const user = req.session.user;
            const { id } = req.body;
            const item = await app.model.svDotEditStudentInfo.update({ id }, { timeModified: new Date().getTime(), isDeleted: 1, staffModified: user.email });
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};
