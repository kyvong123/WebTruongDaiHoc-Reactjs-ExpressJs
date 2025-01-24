import { AdminPage, AdminModal } from 'view/component/AdminPage';
const { resolveTrangThai, vaiTroCanBo, trangThaiXacNhan, vaiTroCanBoDict, trangThaiXacNhanDict, trangThaiLichHop, trangThaiLichHopDict, trangThaiCongTacItemDict, trangThaiCongTacItem, trangThaiPhongHopTicket, trangThaiPhongHopTicketDict, trangThaiCongTacTicket, trangThaiCongTacTicketDict, getThanhPhanSummary, trangThaiLichCongTac, trangThaiLichCongTacDict, } = require('../tools')();
const { CongTacItemPermission, CongTacTicketPermission, LichPermission } = require('../permissionClasses')({});

export default class BaseCongTac extends AdminPage {
    vaiTroCanBo = vaiTroCanBo;
    trangThaiXacNhan = trangThaiXacNhan;
    vaiTroCanBoDict = vaiTroCanBoDict;
    trangThaiXacNhanDict = trangThaiXacNhanDict;
    trangThaiLichHop = trangThaiLichHop;
    trangThaiLichHopDict = trangThaiLichHopDict;
    resolveTrangThai = resolveTrangThai;
    trangThaiCongTacItem = trangThaiCongTacItem;
    trangThaiCongTacItemDict = trangThaiCongTacItemDict;
    trangThaiPhongHopTicket = trangThaiPhongHopTicket;
    trangThaiPhongHopTicketDict = trangThaiPhongHopTicketDict;
    trangThaiCongTacTicket = trangThaiCongTacTicket;
    trangThaiCongTacTicketDict = trangThaiCongTacTicketDict;
    getThanhPhanSummary = getThanhPhanSummary;
    trangThaiLichCongTac = trangThaiLichCongTac;
    trangThaiLichCongTacDict = trangThaiLichCongTacDict;

    getUserDepartments = () => {
        const data = [];
        data.push(this.props.system?.user?.staff?.maDonVi);
        this.props.system?.user?.staff?.listChucVu?.forEach((i) => {
            data.push(i.maDonVi);
        });
        return data;
    }

    getCongTacItemPermissionChecker = (item, user) => {
        return new CongTacItemPermission(item || this.getItem(), user || this.props.system?.user);
    }

    getCongTacTicketChecker = (item, user) => {
        return new CongTacTicketPermission(item || this.getTicketItem(), user || this.props.system?.user);
    }

    getLichPermission = (item, user) => {
        return new LichPermission(item || this.getLichItem(), user || this.props.system?.user);
    }

    getItem = () => this.props.hcthCongTac?.item || {};

    getShcc = () => this.props.system?.user?.shcc;

    getLichItem = () => this.props.hcthCongTac?.lichItem;

    isNguoiTao = () => this.getItem()?.nguoiTao == this.getShcc();

    isChuTri = () => this.getItem()?.chuTri == this.getShcc();

    isEditable = () => this.isChuTri() || this.isNguoiTao() || this.props.system?.user?.permissions.includes('hcthCongTac:manage');

    isConcludable = () => { // co the ket luan
        if (this.isEditable()) {
            return true;
        } else {
            return this.getItem().thanhPhan?.some(canBo => canBo.shccCanBoNhan == this.getShcc() && canBo.vaiTro == 'THU_KY');
        }
    };

    canApprove = () => {
        const permissions = this.getCurrentPermissions();
        const item = this.getItem();
        return item.trangThai == trangThaiLichHopDict.DANG_KY.id && permissions.includes('hcthCongTac:manage');
    }

    getTicketItem = () => {
        return this.props.hcthCongTac?.ticket;
    }

}

export class BaseCongTacModal extends AdminModal {
    vaiTroCanBo = vaiTroCanBo;
    trangThaiXacNhan = trangThaiXacNhan;
    vaiTroCanBoDict = vaiTroCanBoDict;
    trangThaiXacNhanDict = trangThaiXacNhanDict;
    trangThaiLichHop = trangThaiLichHop;
    trangThaiLichHopDict = trangThaiLichHopDict;
    resolveTrangThai = resolveTrangThai;
    trangThaiCongTacItem = trangThaiCongTacItem;
    trangThaiCongTacItemDict = trangThaiCongTacItemDict;
    trangThaiPhongHopTicket = trangThaiPhongHopTicket;
    trangThaiPhongHopTicketDict = trangThaiPhongHopTicketDict;
    trangThaiCongTacTicket = trangThaiCongTacTicket;
    trangThaiCongTacTicketDict = trangThaiCongTacTicketDict;
    getThanhPhanSummary = getThanhPhanSummary;

    getItem = () => this.props.hcthCongTac?.item || {};

    getShcc = () => this.props.system?.user?.shcc;

    isNguoiTao = () => this.getItem()?.nguoiTao == this.getShcc();

    isChuTri = () => this.getItem()?.chuTri == this.getShcc();

    isEditable = () => this.isChuTri() || this.isNguoiTao();

    isConcludable = () => { // co the ket luan
        if (this.isEditable()) {
            return true;
        } else {
            return this.getItem().canBoHop.some(canBo => canBo.shccCanBoNhan == this.getShcc() && canBo.vaiTro == 'THU_KY');
        }
    };

    getLichItem = () => this.props.hcthCongTac?.lichItem;

    getDonViQuanLy = () => {
        const data = [];
        this.props.system?.user?.staff?.listChucVu?.forEach(i => {
            data.push(i.maDonVi);
        });
        this.props.system?.user?.staff?.maDonVi && data.push(this.props.system.user.staff.maDonVi);
        return data;
    }

    getTicketItem = () => {
        return this.props.hcthCongTac?.ticket;
    }

    getLichPermission = (item, user) => {
        return new LichPermission(item || this.getLichItem(), user || this.props.system?.user);
    }
}

