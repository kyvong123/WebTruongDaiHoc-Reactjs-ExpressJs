module.exports = () => {
    const isTtLienHeBeta = false;
    return {
        messageMaxLen: 1600,
        maxImgNum: 4,
        maxImgBoxNum: 20,
        isTtLienHeBeta,
        userPermission: isTtLienHeBeta ? 'fwQuestionAnswer:userTest' : 'user:login',
        staffPermission: isTtLienHeBeta ? 'fwQuestionAnswer:staffTest' : 'staff:login',
        managerPermission: isTtLienHeBeta ? 'fwQuestionAnswer:managerTest' : 'manager:login',
        blackBoxManagePermission: isTtLienHeBeta ? 'fwQuestionAnswer:blackBoxManageTest' : 'fwQuestionAnswer:blackBoxManage',
        blackBoxAdminPermission: isTtLienHeBeta ? 'fwQuestionAnswer:blackBoxAdminTest' : 'fwQuestionAnswer:blackBoxAdmin',
    };
};