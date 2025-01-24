module.exports = app => {
    app.executeTask.assignRoleNhapDiem = async ({ filter, email }) => {
        let items = await app.model.dtAssignRoleNhapDiem.parseData({ ...filter, isAll: 1 });

        for (const item of items.filter(i => i.giangVien && i.thanhPhan)) {
            await app.model.dtAssignRoleNhapDiem.delete({ ...item, kyThi: item.thanhPhan });

            for (const shcc of (item.giangVien.split(',') || [])) {
                await app.model.dtAssignRoleNhapDiem.create({ ...item, kyThi: item.thanhPhan, userModified: email, timeModified: Date.now(), shcc });
            }
        }
        return {};
    };
};