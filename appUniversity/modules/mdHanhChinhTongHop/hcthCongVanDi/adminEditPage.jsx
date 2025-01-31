import { SelectAdapter_DmDonVi, SelectAdapter_DmDonViFilter } from 'modules/mdDanhMuc/dmDonVi/redux';
import { EditModal } from 'modules/mdDanhMuc/dmDonViGuiCv/adminPage';
import { createDmDonViGuiCv, SelectAdapter_DmDonViGuiCongVan } from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import { SelectAdapter_DmLoaiVanBan } from 'modules/mdDanhMuc/dmLoaiVanBan/redux/dmLoaiVanBan';
import { SelectAdapter_FwCanBoWithDonVi } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FormCheckbox, FormDatePicker, FormRichTextBox, FormSelect, loadSpinner } from 'view/component/AdminPage';
import { createCongVanTrinhKy, deleteCongVanTrinhKy, updateCongVanTrinhKy } from '../hcthCongVanTrinhKy/redux';
import { TaoHoSoModal, ThemVaoHoSoModal } from '../hcthHoSo/component';
import { createHoSo, updateHoSo } from '../hcthHoSo/redux';
import { ThemVaoNhiemVuModal } from '../hcthNhiemVu/components/component';
import { themVaoNhiemVu } from '../hcthNhiemVu/redux';
import { CreateModal } from '../hcthSoDangKy/adminPage';
import { createSoNhapTay, createSoTuDong, SelectAdapter_SoDangKy } from '../hcthSoDangKy/redux/soDangKy';
//TODO
// import { FileHistoryModal } from './component';
import { SelectAdapter_DmNgoaiNguV2 } from 'modules/mdDanhMuc/dmNgoaiNgu/redux';
import { LichSu, PhanHoi, VanBanDiFileV2 } from './components/index';
import { default as SwitchStatusModal, SimpleSwitchModal } from './components/switchStatusModal';
import { readNotification, contentAprrove, createHcthCongVanDi, createPhanHoi, deleteFile, deleteHcthCongVanDi, formailtyAprrove, getCongVanDi, getFile, getHcthCongVanDiSearchPage, getHistory, getPhanHoi, ready, setStatus, updateHcthCongVanDi } from './redux/vanBanDi';

import { CreateRequest } from 'modules/mdHanhChinhTongHop/hcthSoDangKy/components/createRequest';
import { createRequest } from 'modules/mdHanhChinhTongHop/hcthSoDangKy/redux/request';
import { SelectAdapter_HcthVanBanDiStatusSystem } from '../hcthVanBanDiStatusSystem/redux/statusSystem';
import { SelectAdapter_DmDoKhanVanBan } from 'modules/mdDanhMuc/dmDoKhanVanBan/redux';
import NhiemVuSection from '../hcthNhiemVu/components/nhiemVuSection';
import { SelectAdapter_DmNhomDonVi } from 'modules/mdDanhMuc/dmNhomDonVi/redux';
import LinkModal from './components/linkModal';
import BaseVanBanDi from './components/BaseComponent';
const { capVanBan, loaiLienKet, vanBanDi, MA_HCTH, TIENG_VIET } = require('../constant.js');
const trangThaiCongVanDi = vanBanDi.trangThai;


class AdminEditPage extends BaseVanBanDi {
    constructor(props) {
        super(props);
        this.updateFileRef = React.createRef();
    }

    listFileRefs = {};

    state = {
        id: null,
        listFile: [],
        newPhanHoi: [],
        phanHoi: [],
        listDonViQuanLy: [],
        maDonVi: [],
        isLoading: true,
        historySortType: 'DESC',
        laySoTuDong: true,
        isPhysical: 1
    };

    componentDidMount() {
        const settings = this.getSiteSetting();
        T.ready(settings.readyUrl, this.onDomReady);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location.pathname != this.props.location.pathname) {
            this.onDomReady();
        }
    }

    onDomReady = () => {
        const queryParams = new URLSearchParams(window.location.search);
        const isConverted = Number(queryParams.get('isConverted'));
        const settings = this.getSiteSetting();
        const params = T.routeMatcher(settings.routeMatcherUrl).parse(window.location.pathname),
            user = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '', staff: {}, lastName: '', firstName: '', maDonVi: '' },
            { shcc, maDonVi } = user;

        let listDonViQuanLy = this.props.system && this.props.system.user.staff && this.props.system.user.staff.donViQuanLy ? this.props.system.user.staff.donViQuanLy : [];

        this.setState({
            id: params.id === 'new' ? null : params.id,
            isLoading: params.id === 'new' ? false : true,
            isConverted,
            shcc,
            user,
            listDonViQuanLy: listDonViQuanLy.filter(item => item.isManager).map(item => item.maDonVi),
            maDonVi: [maDonVi],
            donViGui: this.getListDonVi()[0] || '',
            capVanBan: capVanBan.TRUONG.id
        }, () => {
            this.getData();
            setTimeout(() => this.props.readNotification(this.state.id), 2000);
        });
    }

    isManager = (checkPermission = 'donViCongVanDi:manage') => {
        const permissions = this.getCurrentPermissions(), donViQuanLy = this.getDonViQuanLy(), donVi = this.getDonVi();
        return permissions.includes(checkPermission) && [...donViQuanLy, donVi].includes(this.state.donViGui);
    }


    getDonViQuanLy = () => {
        return this.props.system?.user?.staff?.donViQuanLy || [];
    }

    getDonVi = () => this.props.system?.user?.staff?.maDonVi;

    getListDonVi = () => {
        const donVi = this.getDonViQuanLy().map(item => item.maDonVi);
        if (this.getDonVi()) donVi.push(this.getDonVi());
        return [...new Set(donVi)];
    }

    isCreator = () => {
        const shcc = this.props.system?.user?.shcc;
        return this.state.nguoiTao == shcc;
    }

    forwardStatus = () => {
        this.simpleSwitchModal.show({
            forward: 1,
            title: 'Cập nhật trạng thái văn bản',
            message: '*Lưu ý: Các thay đổi được thực hiện sẽ được lưu vết và trạng thái văn bản sẽ được cập nhật',
            onConfig: (phanHoi) => {
                this.simpleSwitchModal.hide();
                this.switchStatusModal.show({ phanHoi });
            },
            onSubmit: (phanHoi, shccCanBoXuLy, done, onFinish) => {
                if (this.canSave()) {
                    console.log('hello2');
                    this.save(() => this.props.setStatus({ phanHoi, forward: 1, id: this.state.id, shccCanBoXuLy }, done, onFinish), false);
                }
                else {
                    this.props.setStatus({ phanHoi, forward: 1, id: this.state.id, shccCanBoXuLy }, done, onFinish);
                }
            },
        });
    }

    backStatus = () => {
        this.simpleSwitchModal.show({
            title: 'Trả lại văn bản',
            message: '*Lưu ý: Các thay đổi được thực hiện sẽ được lưu vết và văn bản sẽ được trả lại',
            back: 1,
            onConfig: (phanHoi) => {
                this.simpleSwitchModal.hide();
                this.switchStatusModal.show({ phanHoi, backTo: true });
            },
            onSubmit: (phanHoi, shccCanBoXuLy, done, onFinish) => {
                if (this.canSave()) {
                    this.save(() => this.props.setStatus({ phanHoi, back: 1, id: this.state.id, shccCanBoXuLy }, done, onFinish));
                }
                else {
                    this.props.setStatus({ phanHoi, back: 1, id: this.state.id, shccCanBoXuLy }, done, onFinish);
                }
            },
        });
    }

    getButtons = () => {
        // const shcc = this.props.system.user.shcc;
        const buttons = [];
        if (this.canSwitchStatus()) {
            const status = this.props.hcthCongVanDi.item.status;
            if (status.forwardTo)
                buttons.push({ className: 'btn-success', icon: 'fa-check', tooltip: 'Duyệt', onClick: e => e.preventDefault() || this.forwardStatus() });
            if (status.backTo)
                buttons.push({ className: 'btn-danger', icon: 'fa-times', tooltip: 'Trả lại', onClick: e => e.preventDefault() || this.backStatus() });
        }
        if (this.getFormLinkData().length) {
            buttons.push({ className: 'btn-warning', icon: 'fa-code', tooltip: 'Liên kết', onClick: e => e.preventDefault() || this.linkModal.show() });
        }
        return buttons;
    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth'))
            return {
                readyUrl: '/user/hcth',
                routeMatcherUrl: '/user/hcth/van-ban-di/:id',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    <Link key={1} to='/user/hcth/van-ban-di'>Danh sách văn bản đi</Link>,
                    this.state.id ? 'Cập nhật' : 'Tạo mới'
                ],
                backRoute: '/user/hcth/van-ban-di'
            };
        else
            return {
                routeMatcherUrl: '/user/van-ban-di/:id',
                readyUrl: '/user/van-phong-dien-tu',
                breadcrumb: [
                    <Link key={0} to='/user/van-phong-dien-tu'>...</Link>,
                    <Link key={1} to='/user/van-ban-di'>Danh sách văn bản đi</Link>,
                    this.state.id ? 'Cập nhật' : 'Tạo mới'
                ],
                backRoute: '/user/van-ban-di'
            };
    }


    getData = () => {
        if (this.state.id) {
            const queryParams = new URLSearchParams(window.location.search);
            const nhiemVu = queryParams.get('nhiemVu');
            const context = { historySortType: this.state.historySortType };
            if (nhiemVu) context.nhiemVu = nhiemVu;
            this.setState({ isLoading: false });
            this.props.getCongVanDi(Number(this.state.id), context, (item) => this.setData(item));
        }
        else this.setData();
    }

    setData = (data = null) => {
        if (!data) {
            this.danhSachVanBan?.setFiles([]);
            this.banLuu?.value(MA_HCTH);
            this.ngoaiNgu?.value(TIENG_VIET);
            this.donViGui?.value(this.getListDonVi()[0] || '');
            this.capVanBan?.value(capVanBan.TRUONG.id);
            this.isPhysical?.value(this.state.isPhysical);
            this.doKhanVanBan?.value('THUONG');
            this.vanBanChonDonVi?.value(false);
            this.donViSoanThao?.value(this.getListDonVi()[0] || '');
        } else {
            let { vanBanChonDonVi = false, donViSoanThao, isConverted, trichYeu, nguoiTao = '', ngayGui, ngayKy, donViGui, donViNhan, canBoNhan, donViNhanNgoai, listFile = [], danhSachPhanHoi = [], trangThai, capVanBan, loaiVanBan, history = [], soDi, soCongVan = '', ngoaiNgu, banLuu, files = [], soDangKy, isPhysical, status, vanBanCongKhai = 0, systemId, doKhanVanBan, nhomDonViNhan = [] } = data ? data :
                { id: '', trichYeu: '', ngayGui: '', ngayKy: '', donViGui: '', donViNhan: '', canBoNhan: '', donViNhanNgoai: '', trangThai: '', loaiVanBan: '', capVanBan: 'TRUONG', soDi: '', ngoaiNgu: '10', banLuu: '29', soDangKy: '', isPhysical: 1 };

            this.setState({
                status, soDi, nguoiTao, trangThai, donViGui, donViNhan, capVanBan, history, soCongVan, checkDonViGui: this.state.listDonViQuanLy.includes(donViGui), listFile, phanHoi: danhSachPhanHoi, loaiVanBan, isPhysical, vanBanChonDonVi, trichYeu, nhomDonViNhan,
                isConverted: this.state.id ? isConverted : this.state.isConverted, vanBanCongKhai
            }, () => {
                this.vanBanCongKhai?.value(vanBanCongKhai);
                this.danhSachVanBan?.setFiles(files);
                this.trichYeu?.value(trichYeu);
                this.ngayGui?.value(ngayGui);
                this.ngayKy?.value(ngayKy);
                this.donViGui?.value(donViGui);
                this.banLuu?.value(banLuu);
                this.loaiVanBan?.value(loaiVanBan);
                this.capVanBan?.value(capVanBan);
                this.trangThai?.value(trangThai || '');
                this.soCongVan?.value(soDangKy);
                this.donViNhan?.value(donViNhan);
                this.nhomDonViNhan?.value(nhomDonViNhan);
                this.donViNhanNgoai?.value(donViNhanNgoai ? donViNhanNgoai : '');
                this.canBoNhan?.value(canBoNhan ? canBoNhan : '');
                this.ngoaiNgu?.value(ngoaiNgu);
                this.isPhysical?.value(isPhysical);
                this.systemId?.value(systemId);
                this.doKhanVanBan?.value(doKhanVanBan || '');
                this.vanBanChonDonVi?.value(vanBanChonDonVi || '');
                this.donViSoanThao?.value(donViSoanThao || '');
            });
        }
    }

    onViTriChange = (e, index) => {
        e.preventDefault();
        let listFile = [...this.state.listFile];
        listFile[index].viTri = this.listFileRefs[index].value() || '';
        setTimeout(() => this.setState({ listFile }), 500);
    }

    getValue = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    getValidatedData = () => {
        const changes = {
            trichYeu: this.trichYeu.value(),
            ngayGui: Number(this.ngayGui.value()),
            ngayKy: Number(this.ngayKy.value()),
            capVanBan: this.capVanBan.value(),
            donViGui: this.donViGui.value(),
            donViNhan: this.donViNhan.value(),
            nhomDonViNhan: this.nhomDonViNhan.value(),
            canBoNhan: this.canBoNhan.value(),
            donViNhanNgoai: this.donViNhanNgoai.value(),
            loaiVanBan: this.loaiVanBan.value() ? this.loaiVanBan.value().toString() : '',
            soCongVan: this.soCongVan?.value() || null,
            trangThai: this.state.trangThai,
            banLuu: this.banLuu.value(),
            ngoaiNgu: this.ngoaiNgu.value() || null,
            files: this.danhSachVanBan.getFiles(),
            isPhysical: Number(this.isPhysical.value()) || 0,
            vanBanCongKhai: Number(this.vanBanCongKhai.value()) || 0,
            doKhanVanBan: this.doKhanVanBan.value(),
            systemId: this.systemId.value(),
            vanBanChonDonVi: Number(this.vanBanChonDonVi.value()),
            donViSoanThao: this.state.vanBanChonDonVi ? this.donViSoanThao.value() : this.state.donViGui
        };
        if (!changes.banLuu.includes('29')) {
            changes.banLuu.push('29');
            this.banLuu.value(changes.banLuu);
        }
        if (changes.vanBanChonDonVi && !changes.donViSoanThao) {
            T.notify('Đơn vị soạn thảo trống', 'danger');
            this.donViSoanThao.focus();
        } else if (!changes.donViGui) {
            T.notify('Đơn vị phát hành bị trống', 'danger');
            this.donViGui.focus();
        } else if (!changes.capVanBan) {
            T.notify('Cấp văn bản bị trống', 'danger');
            this.capVanBan.focus();
        } else if (!changes.trichYeu) {
            T.notify('Trích yếu bị trống', 'danger');
            this.trichYeu.focus();
        } else if (!changes.systemId) {
            this.systemId.focus();
        }
        else return changes;
        return null;
    }

    save = (done, saveHisotry = true) => {
        const changes = this.getValidatedData();
        if (changes) {
            if (this.state.id) {
                this.props.updateHcthCongVanDi(this.state.id, changes, () => (done && done()) || this.getData(), saveHisotry);
            } else {
                changes.ngayTao = new Date().getTime();
                this.props.createHcthCongVanDi({ ...changes, isConverted: Number(this.state.isConverted) ? 1 : 0 }, (item) => (window.location.pathname.startsWith('/user/hcth') ? (window.location.href = '/user/hcth/van-ban-di/' + item.id) : (window.location.href = '/user/van-ban-di/' + item.id)));
            }
        }
    }

    onCreateDonViNhanNgoai = (data, done) => {
        this.props.createDmDonViGuiCv(data, ({ error, item }) => {
            if (!error) {
                const { id } = item;
                let donViNhanNgoai = this.donViNhanNgoai.value();
                donViNhanNgoai.push(id);
                this.donViNhanNgoai.value(donViNhanNgoai);
                done && done({ error, item });
            }
            this.donViGuiNhanModal.hide();
        });
    }

    checkNotDonVi = () => {
        return this.state.id && ((this.state.listDonViQuanLy.length != 0 && !this.state.checkDonViGui) || (this.state.listDonViQuanLy.length == 0 && (this.state.maDonVi != this.state.donViGui)));
    }

    canReadComment = () => {
        return this.state.id;
    }

    canReadOnly = () => {
        return !this.canSave();
    }

    canPartialEdit = () => {
        if (!this.state.id) return true;
        const item = this.props.hcthCongVanDi?.item;
        if (!item?.status?.isPartialEditable) return false;
        const partialEditors = item.status.partialEditors;
        return this.hasItemPermission(partialEditors);
    }

    isMinimalSwitchStatusModal = () => {
        if (!this.state.id) return false;
        const item = this.props.hcthCongVanDi?.item;
        const minimalSwitchStatusModal = item.status.minimalSwitchStatusModal;
        return this.hasItemPermission(minimalSwitchStatusModal);
    }

    canSwitchStatus = () => {
        if (!this.state.id) return false;
        const item = this.props.hcthCongVanDi?.item;
        if (!item || !(item.status?.backTo || item.status?.forwardTo)) return false;
        const censors = item.status.censor;
        return this.hasItemPermission(censors);
    }

    isViceManager = () => {
        const chucVu = this.props.system?.user?.staff?.listChucVu || [];
        return chucVu.some(i => i.maDonVi == this.state.donViGui && i.isViceManager);
    }

    hasItemPermission = (targets) => {
        const permissions = this.getCurrentPermissions();
        return targets.some(target => {
            if (target.isCreator) return this.isCreator();
            else if (target.isDepartment && target.isViceManager) {
                return this.isViceManager();
            }
            else if (target.isDepartment && this.isManager(target.permission)) return true;
            else {
                if (permissions.includes(target.permission)) return true;
            }
        });
    }

    canSave = () => {
        if (!this.state.id) return true;
        const item = this.props.hcthCongVanDi?.item;
        if (!item || !item.status.isEditable) return false;
        const editors = item.status.editor;
        return this.hasItemPermission(editors);
    }

    onCreateSo = (data) => {
        if (data.tuDong) {
            this.props.createSoTuDong(data, res => {
                if (!res.error) {
                    const { id, loaiVanBan, donViGui, capVanBan } = res.item;
                    this.setState({ donViGui, loaiVanBan, capVanBan }, () => {
                        this.loaiVanBan?.value(loaiVanBan);
                        this.soCongVan?.value(id);
                        this.donViGui?.value(donViGui);
                        this.capVanBan?.value(capVanBan);
                    });
                }
            });
        } else {
            this.props.createSoNhapTay(data, res => {
                if (!res.error) {
                    const { id, loaiVanBan, donViGui, capVanBan } = res.item;
                    this.setState({ donViGui, loaiVanBan, capVanBan }, () => {
                        this.loaiVanBan?.value(loaiVanBan);
                        this.soCongVan?.value(id);
                        this.donViGui?.value(donViGui);
                        this.capVanBan?.value(capVanBan);
                    });
                }
            });
        }
    }

    onCreateRequest = (data) => {
        this.props.createRequest(data, res => {
            if (res && res.soVanBan) {
                const { loaiVanBan, soVanBan, donVi } = res;
                this.setState({ loaiVanBan, donViGui: donVi, capVanBan: capVanBan.TRUONG.id }, () => {
                    this.loaiVanBan?.value(loaiVanBan);
                    this.soCongVan?.value(soVanBan);
                    this.donViGui?.value(donVi);
                    this.capVanBan?.value(capVanBan.TRUONG.id);
                    if (res.lyDo && !this.trichYeu.value()) {
                        this.trichYeu.value(res.lyDo);
                    }
                });
            }
        });
    }

    onChangeHistorySort = (e) => {
        e.preventDefault();
        const current = this.state.historySortType,
            next = current == 'DESC' ? 'ASC' : 'DESC';
        this.setState({ historySortType: next }, () => this.getHistory());
    }


    renderSoCongVanSelector = (donViGui, capVanBan, loaiVanBan, id) => {
        const permissions = this.getCurrentPermissions();
        return (<FormSelect key={`${donViGui}-${capVanBan}-${loaiVanBan}-${id}`} allowClear className='col-md-12' ref={e => this.soCongVan = e} readOnly={!(this.canSave() || this.canPartialEdit())} data={SelectAdapter_SoDangKy(donViGui, capVanBan, loaiVanBan, id, null)} placeholder='Chọn số văn bản' readOnlyEmptyText='Chưa có số' label={
            (<span onClick={e => e.stopPropagation()}>
                <span style={{ marginRight: '2px' }}>Số văn bản</span>
                {(this.canSave() || this.canPartialEdit()) && permissions.some(item => ['hcthSoVanBan:write', 'donViCongVanDi:edit'].includes(item)) && <>(
                    {(permissions.includes('hcthSoVanBan:write') || (this.state.capVanBan == 'DON_VI') && !permissions.includes('hcthSoVanBan:write')) ?
                        <Link to='#' onClick={() => this.soDangKyModal.show()}>Nhấn vào đây để thêm</Link> :
                        <Link to='#' onClick={() => this.requestModal.show({ id })}>Nhấn vào đây để thêm</Link>})
                </>
                }
            </span>)
        } />);
    }

    getHistory = () => this.props.getHistory(this.state.id, { historySortType: this.state.historySortType })

    getMinimalDisplay = () => {
        const status = this.props.hcthCongVanDi?.item?.status,
            permissions = this.getCurrentPermissions(),
            minimalDisplayStaff = status?.minimalDisplay;

        return !this.isCreator() && Array.isArray(minimalDisplayStaff) && minimalDisplayStaff.some(staff => {
            if (permissions.includes(staff.permission)) return true;
        });
    }

    renderGeneralInfoVanBan = (titleText, capVanBanArr) => {
        const isHcthManager = this.getCurrentPermissions()?.includes('hcthCongVanDi:write');
        return (
            <div key='generalInfoVanBan'>
                <div className='tile'>
                    <h3 className='tile-title'>{titleText}</h3>
                    <div className='tile-body row'>
                        {this.renderSoCongVanSelector(this.state.donViGui, this.state.capVanBan, this.state.loaiVanBan, this.state.id)}
                        <FormDatePicker ref={e => this.ngayGui = e} readOnly={!(this.canSave() || this.canPartialEdit())} label='Ngày gửi' className='col-md-6' type='date-mask' readOnlyEmptyText='Chưa có ngày gửi' />
                        <FormDatePicker ref={e => this.ngayKy = e} readOnly={!(this.canSave() || this.canPartialEdit())} label='Ngày ký' className='col-md-6' type='date-mask' readOnlyEmptyText='Chưa có ngày ký' />
                        {this.state.status && <span className='form-group col-md-12'>Trạng thái: <b style={{ color: this.state.status.info.mau }}>{this.state.status.info.ten}</b></span>}
                    </div>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Cấu hình văn bản</h3>
                    <div className='tile-body row'>
                        <FormCheckbox isSwitch readOnly={this.canReadOnly() || this.state.id} className={'col-md-6'} label='Văn bản giấy' ref={e => this.isPhysical = e} onChange={value => this.setState({ isPhysical: Number(value) })} />
                        <FormCheckbox isSwitch readOnly={this.canReadOnly() || this.state.id} className={'col-md-6'} label='Văn bản chọn đơn vị phát hành' ref={e => this.vanBanChonDonVi = e} onChange={value => this.setState({ vanBanChonDonVi: Number(value) })} />
                        <FormSelect ref={e => this.capVanBan = e} readOnly={this.canReadOnly()} disabled={this.state.id} label='Cấp văn bản' placeholder='Chọn cấp văn bản' className={this.state.vanBanChonDonVi ? 'col-md-4' : 'col-md-6'} data={capVanBanArr} readOnlyEmptyText='Chưa có cấp văn bản' required onChange={value => this.setState({ capVanBan: value?.id || '' })} />
                        <FormSelect style={this.state.vanBanChonDonVi ? {} : { display: 'none' }} ref={e => this.donViSoanThao = e} readOnly={this.canReadOnly()} label='Đơn vị soạn thảo' placeholder='Chọn đơn vị soạn thảo' className='col-md-4' data={isHcthManager ? SelectAdapter_DmDonVi : SelectAdapter_DmDonViFilter(this.getListDonVi())} required readOnlyEmptyText='Chưa có đơn vị soạn thảo' onChange={value => this.setState({ donViSoanThao: value?.id || '' })} disabled={this.state.id} />
                        <FormSelect key={this.state.vanBanChonDonVi} ref={e => this.donViGui = e} readOnly={this.canReadOnly()} label='Đơn vị phát hành' placeholder='Chọn đơn vị phát hành' className={this.state.vanBanChonDonVi ? 'col-md-4' : 'col-md-6'} data={isHcthManager || this.state.vanBanChonDonVi ? SelectAdapter_DmDonVi : SelectAdapter_DmDonViFilter(this.getListDonVi())} required readOnlyEmptyText='Chưa có đơn vị phát hành' onChange={value => this.setState({ donViGui: value?.id || '' })} disabled={this.state.id} />
                        <FormSelect key={`${this.state.capVanBan}-${this.state.donViGui}-${this.state.isPhysical}`} ref={e => this.systemId = e} readOnly={this.canReadOnly()} className='col-md-12' label='Quy trình phát hành' data={SelectAdapter_HcthVanBanDiStatusSystem([this.state.donViGui], this.state.capVanBan, this.state.isPhysical)} disabled={this.state.id} required />
                    </div>
                </div>
                <div className='tile'>
                    <div className='clearfix'>
                        <div className='d-flex justify-content-between'>
                            <h3 className='tile-title'>Thông tin văn bản</h3>
                        </div>
                    </div>
                    <div className='tile-body row'>
                        <FormSelect className='col-md-4' label='Độ khẩn văn bản' placeholder='Chọn độ khẩn văn bản' ref={e => this.doKhanVanBan = e} data={SelectAdapter_DmDoKhanVanBan} readOnly={this.canReadOnly()} readOnlyEmptyText='Văn bản chưa có độ khẩn' />
                        <FormSelect className='col-md-4' allowClear={true} label='Loại văn bản' placeholder='Chọn loại văn bản' ref={e => this.loaiVanBan = e} data={SelectAdapter_DmLoaiVanBan} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có loại văn bản' onChange={value => this.setState({ loaiVanBan: value?.id || '' })} />
                        <FormSelect className='col-md-4' label='Ngôn ngữ' placeholder='Chọn ngôn ngữ' ref={e => this.ngoaiNgu = e} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có ngôn ngữ' data={SelectAdapter_DmNgoaiNguV2} />
                        <FormSelect multiple={true} className='col-md-6' label='Đơn vị nhận' placeholder='Chọn đơn vị nhận' ref={e => this.donViNhan = e} data={SelectAdapter_DmDonVi} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có đơn vị nhận' allowClear />
                        <FormSelect multiple={true} className='col-md-6' label='Nhóm đơn vị nhận' placeholder='Chọn nhóm đơn vị nhận' ref={e => this.nhomDonViNhan = e} data={SelectAdapter_DmNhomDonVi} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có đơn vị nhận' allowClear />
                        <FormCheckbox isSwitch className='col-md-12' label='Văn bản công khai (Văn bản phân phối tới toàn bộ đơn vị)' ref={e => this.vanBanCongKhai = e} readOnly={this.canReadOnly()} />
                        <FormSelect multiple={true} className='col-md-12' label={(<span onClick={(e) => e.stopPropagation()}>
                            <span style={{ marginRight: '2px' }}>Đơn vị nhận bên ngoài</span>
                            {!this.canReadOnly() && <>
                                (
                                <Link to='#' onClick={() => this.donViGuiNhanModal.show(null)}>Nhấn vào đây để thêm</Link>
                                ) </>
                            }
                        </span>)} placeholder='Chọn đơn vị nhận bên ngoài' ref={e => this.donViNhanNgoai = e} data={SelectAdapter_DmDonViGuiCongVan} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có đơn vị nhận' />
                        <FormSelect multiple={true} className='col-md-12' label='Cán bộ nhận' placeholder='Cán bộ nhận' ref={e => this.canBoNhan = e} data={SelectAdapter_FwCanBoWithDonVi} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có cán bộ nhận' />
                        <FormSelect multiple={true} className='col-md-12' label='Bản lưu' placeholder='Chọn bản lưu' ref={e => this.banLuu = e} data={SelectAdapter_DmDonVi} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có bản lưu' />
                        <FormRichTextBox type='text' className='col-md-12' ref={e => this.trichYeu = e} label='Trích yếu' readOnly={this.canReadOnly()} required readOnlyEmptyText='Chưa có trích yếu' />
                        {this.state.id && <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                            {(trangThaiCongVanDi.DA_PHAT_HANH.id == this.state.trangThai) && <>
                                <button type='submit' className='btn btn-success mr-2' onClick={e => { e.preventDefault(); this.taoHoSoModal.show(); }}>
                                    <i className='fa fa-plus'></i>Tạo hồ sơ
                                </button>
                                <button type='submit' className='btn btn-primary mr-2' onClick={e => { e.preventDefault(); this.themVaoHoSoModal.show(); }}>
                                    <i className='fa fa-arrow-up'></i>Thêm vào hồ sơ
                                </button>
                            </>}
                            <button type='submit' className='btn btn-primary mr-2' onClick={e => { e.preventDefault(); this.themVaoNhiemVuModal.show(); }} >
                                <i className='fa fa-arrow-up'></i>Thêm vào nhiệm vụ
                            </button>
                        </div>}
                    </div>
                </div>
                {this.state.id && <NhiemVuSection nhiemVu={this.props.hcthCongVanDi?.item?.nhiemVu} />}
                {this.canReadComment() && <PhanHoi id={this.state.id} trangThai={this.state.trangThai} donViGui={this.state.donViGui} isManager={this.isManager()} />}
                <VanBanDiFileV2 ref={e => this.danhSachVanBan = e} getHistory={this.getHistory} getFile={this.props.getFile} id={this.state.id} status={this.state.trangThai} canEdit={this.canSave} isManager={this.isManager} isCreator={this.isCreator} key='danhSachFile' getMinimalDisplay={this.getMinimalDisplay} />
            </div>
        );
    }

    renderMinimalInfoVanBan = (titleText) => {
        return (
            <div key='minimalInFoVanBan'>
                <div className="tile">
                    <h3 className="tile-title">{titleText}</h3>
                    <div className="tile-body row">
                        <FormRichTextBox type='text' className='col-md-12' ref={e => this.trichYeu = e} label='Trích yếu' readOnly={this.canReadOnly()} required readOnlyEmptyText='Chưa có trích yếu' />
                    </div>
                </div>
                <VanBanDiFileV2 ref={e => this.danhSachVanBan = e} getHistory={this.getHistory} getFile={this.props.getFile} id={this.state.id} status={this.state.trangThai} canEdit={this.canSave} isManager={this.isManager} isCreator={this.isCreator} key='danhSachFile' getMinimalDisplay={this.getMinimalDisplay} />
                <div className="tile">
                    <h3 className="tile-title">Thông tin văn bản</h3>
                    <div className='tile-body row'>
                        <FormSelect className='col-md-6' label='Độ khẩn văn bản' placeholder='Chọn độ khẩn văn bản' ref={e => this.doKhanVanBan = e} data={SelectAdapter_DmDoKhanVanBan} readOnly={this.canReadOnly()} readOnlyEmptyText='Văn bản chưa có độ khẩn' />

                        <FormSelect className='col-md-6' allowClear={true} label='Loại văn bản' placeholder='Chọn loại văn bản' ref={e => this.loaiVanBan = e} data={SelectAdapter_DmLoaiVanBan} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có loại văn bản' onChange={value => this.setState({ loaiVanBan: value?.id || '' })} />
                        <FormSelect multiple={true} className='col-md-6' label='Đơn vị nhận' placeholder='Chọn đơn vị nhận' ref={e => this.donViNhan = e} data={SelectAdapter_DmDonVi} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có đơn vị nhận' />
                        <FormSelect multiple={true} className='col-md-6' label='Nhóm đơn vị nhận' placeholder='Chọn nhóm đơn vị nhận' ref={e => this.nhomDonViNhan = e} data={SelectAdapter_DmNhomDonVi} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có nhóm đơn vị nhận' />
                        <FormSelect multiple={true} className='col-md-12' label={(<span onClick={(e) => e.stopPropagation()}>
                            <span style={{ marginRight: '2px' }}>Đơn vị nhận bên ngoài</span>
                            {!this.canReadOnly() && <>
                                (
                                <Link to='#' onClick={() => this.donViGuiNhanModal.show(null)}>Nhấn vào đây để thêm</Link>
                                ) </>
                            }
                        </span>)} placeholder='Chọn đơn vị nhận bên ngoài' ref={e => this.donViNhanNgoai = e} data={SelectAdapter_DmDonViGuiCongVan} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có đơn vị nhận' />
                        <FormSelect multiple={true} className='col-md-12' label='Cán bộ nhận' placeholder='Cán bộ nhận' ref={e => this.canBoNhan = e} data={SelectAdapter_FwCanBoWithDonVi} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có cán bộ nhận' />
                        <FormCheckbox isSwitch className='col-md-12' label='Văn bản công khai (Văn bản phân phối tới toàn bộ đơn vị)' ref={e => this.vanBanCongKhai = e} readOnly={this.canReadOnly()} />
                    </div>
                </div>
                {this.canReadComment() && <PhanHoi id={this.state.id} trangThai={this.state.trangThai} donViGui={this.state.donViGui} isManager={this.isManager()} />}
            </div>
        );
    }



    render = () => {
        const
            dmDonViGuiCvPermission = this.getUserPermission('dmDonViGuiCv', ['read', 'write', 'delete']),
            currentPermissions = this.getCurrentPermissions(),
            { breadcrumb, backRoute } = this.getSiteSetting();

        const titleText = this.state.id ? `Văn bản đi #${this.state.id}: ${this.state.trichYeu}` : 'Tạo mới';
        const capVanBanArr = Object.values(capVanBan);

        return this.renderPage({
            icon: 'fa fa-caret-square-o-right',
            title: 'Văn bản đi',
            breadcrumb,
            content: (this.props.hcthCongVanDi?.item || !this.state.id) ? (<>
                {this.getMinimalDisplay() ? this.renderMinimalInfoVanBan(titleText) : this.renderGeneralInfoVanBan(titleText, capVanBanArr)}
                {this.state.id && <LichSu onChangeSort={this.onChangeHistorySort} historySortType={this.state.historySortType} />}
                <EditModal ref={e => this.donViGuiNhanModal = e} permissions={dmDonViGuiCvPermission} create={this.onCreateDonViNhanNgoai} />
                <CreateModal ref={e => this.soDangKyModal = e} listDonVi={this.getListDonVi()} isHcthSelector={this.getListDonVi().includes(MA_HCTH) && currentPermissions.includes('hcthSoVanBan:write')} {...this.props} create={this.onCreateSo} inVanBan={true} capVanBan={this.state.capVanBan} canReadOnly={this.canReadOnly()} />
                <TaoHoSoModal ref={e => this.taoHoSoModal = e} create={this.props.createHoSo} />
                <ThemVaoHoSoModal ref={e => this.themVaoHoSoModal = e} add={this.props.updateHoSo} vanBanId={this.state.id} loaiVanBan={loaiLienKet.VAN_BAN_DI.id} />
                <ThemVaoNhiemVuModal ref={e => this.themVaoNhiemVuModal = e} vanBanId={this.state.id} add={this.props.themVaoNhiemVu} loaiVanBan={loaiLienKet.VAN_BAN_DI.id} />
                <SwitchStatusModal ref={e => this.switchStatusModal = e} save={this.save} canSave={this.canSave} />
                <SimpleSwitchModal ref={e => this.simpleSwitchModal = e} save={this.save} status={this.props.hcthCongVanDi?.item?.status} id={this.state.id} getMinimalDisplay={() => this.getMinimalDisplay() || this.isMinimalSwitchStatusModal()} />
                <CreateRequest ref={e => this.requestModal = e} {...this.props} create={this.onCreateRequest} inVanBan={true} />
                <LinkModal ref={e => this.linkModal = e} />
            </>) : loadSpinner(),
            backRoute,
            onSave: (this.canSave() || this.canPartialEdit()) && (() => this.save()),
            buttons: this.getButtons(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi, phanHoi: state.hcth.hcthPhanHoi });
const mapActionsToProps = { readNotification, setStatus, formailtyAprrove, contentAprrove, getFile, createHcthCongVanDi, updateHcthCongVanDi, deleteHcthCongVanDi, getHcthCongVanDiSearchPage, deleteFile, getCongVanDi, createPhanHoi, getHistory, getPhanHoi, createDmDonViGuiCv, createCongVanTrinhKy, deleteCongVanTrinhKy, updateCongVanTrinhKy, createHoSo, updateHoSo, themVaoNhiemVu, ready, createSoTuDong, createSoNhapTay, createRequest };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);
