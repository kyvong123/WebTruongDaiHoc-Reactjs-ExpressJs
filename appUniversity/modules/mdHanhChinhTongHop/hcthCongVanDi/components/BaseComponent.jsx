import { AdminPage, AdminModal } from 'view/component/AdminPage';

export default class BaseVanBanDi extends AdminPage {
    getItem = () => {
        return this.props.hcthCongVanDi?.item;
    }

    getUser = () => {
        return this.props.system?.user;
    }

    getFormLinkData = () => {
        const data = [];
        const userDepartments = [this.getStaff()?.maDonVi, ...(this.getStaff()?.listChucVu || []).map(i => i.maDonVi)].filter(i => i);
        if (userDepartments.includes('30')) {//tccb
            data.push({ id: 'QT_DI_NUOC_NGOAI', text: 'Quá trình đi nước ngoài' });
        }
        return data;
    }

    getStaff = () => {
        return this.getUser()?.staff;
    }


}

export class BaseVanBanDiModal extends AdminModal {
    getUser = () => {
        return this.props.system?.user;
    }

    getStaff = () => {
        return this.getUser()?.staff;
    }


    getFormLinkData = () => {
        const data = [];
        const userDepartments = [this.getStaff()?.maDonVi, ...(this.getStaff()?.listChucVu || []).map(i => i.maDonVi)].filter(i => i);
        if (userDepartments.includes('30')) {//tccb
            data.push({ id: 'QT_DI_NUOC_NGOAI', text: 'Quá trình đi nước ngoài' });
        }
        return data;
    }

    getItem = () => {
        return this.props.hcthCongVanDi?.item;
    }
}