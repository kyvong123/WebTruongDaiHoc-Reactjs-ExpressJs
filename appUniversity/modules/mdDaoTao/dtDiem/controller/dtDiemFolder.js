module.exports = app => {
    app.permission.add(
        'dtDiemFolderScan:read',
        'dtDiemFolderScan:write',
        'dtDiemFolderScan:delete',
    );

    app.permissionHooks.add('staff', 'addRolesDtDiemFolder', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDiemFolderScan:read', 'dtDiemFolderScan:write', 'dtDiemFolderScan:delete');
            resolve();
        } else resolve();
    }));
    // app.get('/user/dao-tao/diem/folder-scan', app.permission.check('dtDiemFolderScan:read'), app.templates.admin);
};