module.exports = () => {
    const { trangThaiCongTacItemDict, trangThaiCongTacTicketDict, trangThaiLichCongTacDict, trangThaiLichCongTac, trangThaiCongTacItem, trangThaiCongTacTicket, vaiTroCanBoDict } = require('./tools')({});
    class PermissionChecker {
        constructor(item, user) {
            this.item = item;
            this.user = user;
        }

        hasPermission = (permission) => {
            return this.user?.permissions?.includes(permission);
        }

        getShcc = () => this.user?.staff?.shcc;
        isNguoiTao = () => this.item && (this.item?.nguoiTao == this.getShcc());
        getManageDepartment = () => {
            return this.user?.staff?.listChucVu?.map(i => i.maDonVi) || [];
        }
        getTrangThai = () => this.item?.trangThai;
        getTrangThaiItem = (dict) => dict[this.getTrangThai()];
        isHcthManager = () => {
            return this.hasPermission('hcthCongTac:manage');
        }
    }

    class CongTacItemPermission extends PermissionChecker {
        isChuTri = () => this.item.chuTri == this.getShcc();
        isThuKy = () => this.item?.thanhPhan?.some(i => i.shccCanBoNhan == this.getShcc() && i.vaiTro == vaiTroCanBoDict.THU_KY.id);
        isOrphan = () => !this.item?.congTacTicketId && !this.item?.lichId;
        isEditable = () => {
            return (
                (this.isNguoiTao() || this.isChuTri() || this.isThuKy()) &&
                (
                    this.isOrphan() ||
                    !['DUYET', 'DANG_KY'].includes(this.getTrangThai()) || (this.getTrangThai() == 'DANG_KY' && this.item?.congTacTicket?.trangThai == 'TU_CHOI')
                )
            ) || this.isHcthManager();
        }
        isConcludable = () => { // co the ket luan
            if (this.isEditable()) {
                return true;
            } else {
                return this.item.thanhPhan.some(canBo => canBo.shccCanBoNhan == this.getShcc() && canBo.vaiTro == 'THU_KY');
            }
        };

        isReadable = () => {
            return this.isEditable() || this.item.thanhPhan.some(canBo => canBo.shccCanBoNhan == this.getShcc()) || this.isNguoiTao();
        };
        isInvitable = () => {
            return (this.isNguoiTao() || this.isChuTri() || this.isThuKy()) && (this.isOrphan() || (trangThaiCongTacItem.filter(i => i.isInvitable).map(i => i.id).includes(this.getTrangThai())));
        }
        isCancelable = () => {
            if (this.isOrphan) {
                return this.isEditable();
            } else {
                return this.getTrangThai == trangThaiCongTacItemDict.DUYET.id && this.isEditable();
            }
        }
        isDeletable = () => {
            if (!this.isEditable()) return false;
            return this.getTrangThai() == trangThaiCongTacItemDict.KHOI_TAO.id;
        }
        canUpdatePhongHop = () => {
            return this.isHcthManager() || (
                this.item.dangKyPhongHop && this.isEditable() && ['CHUA_DANG_KY', 'DA_DANG_KY', 'DA_DUYET'].includes(this.item.phongHopTicket.trangThai)
            );
        }
    }

    class CongTacTicketPermission extends PermissionChecker {
        isEditable = () => {
            return this.hasPermission('hcthCongTac:manage') || (this.isNguoiTao() && this.getTrangThaiItem(trangThaiCongTacTicketDict)?.isEditable);
        }

        isSendable = () => {
            return [trangThaiCongTacTicketDict.KHOI_TAO.id, trangThaiCongTacTicketDict.TU_CHOI.id].includes(this.item?.trangThai) && (this.getManageDepartment().includes(this.item?.donVi) || this.item?.nguoiTao == this.getShcc());
        }

        isDeletable = () => {
            return trangThaiCongTacTicket.filter(i => i.isDeletable).find(i => i.id == this.getTrangThai()) && (this.isNguoiTao() || this.hasPermission('hcthCongTac:manage'));
        }
    }

    class LichPermission extends PermissionChecker {

        isCensorStaff = () => {
            return (this.item?.canBoKiemDuyet || []).includes(this.getShcc());
        }
        isEditable = () => {
            return (this.isNguoiTao() || this.hasPermission('hcthCongTac:manage')) && trangThaiLichCongTac.filter(i => i.canEdit).map(i => i.id).includes(this.getTrangThai());
        }
        isRequestable = () => {
            return trangThaiLichCongTac.filter(i => i.canRequest).map(i => i.id).includes(this.item?.trangThai) && this.hasPermission('hcthCongTac:manage');
        }
        isRevokable = () => {
            return trangThaiLichCongTac.filter(i => i.canRevoke).map(i => i.id).includes(this.getTrangThai()) && this.hasPermission('hcthCongTac:manage');
        }
        isReadable = () => {
            return this.hasPermission('hcthCongTac:manage') || this.getTrangThai() == trangThaiLichCongTacDict.DA_PHAT_HANH.id || (this.hasPermission('rectors:login') && [trangThaiLichCongTacDict.KIEM_DUYET.id, trangThaiLichCongTacDict.TU_CHOI.id, trangThaiLichCongTacDict.DA_DUYET.id].includes(this.getTrangThai()));
        }
        isPublishable = () => {
            return this.hasPermission('hcthCongTac:manage') && this.getTrangThai() == trangThaiLichCongTacDict.DA_DUYET.id;
        }
        canNotifyLich = () => {
            return this.hasPermission('hcthCongTac:notify') && this.getTrangThai() == trangThaiLichCongTacDict.DA_PHAT_HANH.id;
        }
        isCensorable = () => {
            return this.isCensorStaff() && this.getTrangThai() == trangThaiLichCongTacDict.KIEM_DUYET.id;
        }
        canAddCensorMessages = () => {
            return trangThaiLichCongTac.filter(i => i.censor).map(i => i.id).includes(this.getTrangThai()) && this.isCensorStaff();
        }
        canReadCensorMessages = () => {
            return this.canAddCensorMessages() || (trangThaiLichCongTac.filter(i => i.censor).map(i => i.id).includes(this.getTrangThai()) && this.hasPermission('hcthCongTac:manage'));
        }
        canResolveCensorMessages = (message) => {
            return !message.isResolved && (message.canBoGui == this.getShcc() || this.hasPermission('hcthCongTac:manage'));
        }
    }

    return {
        CongTacItemPermission,
        CongTacTicketPermission,
        LichPermission
    };
};