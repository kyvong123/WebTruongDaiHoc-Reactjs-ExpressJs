import { SelectAdapter_DmChucVuV2 } from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { EditModal } from 'modules/mdDanhMuc/dmDonViGuiCv/adminPage';
import { createDmDonViGuiCv, SelectAdapter_DmDonViGuiCongVan } from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import { getStaffPage, SelectAdapter_FwCanBoWithDonVi } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormCheckbox, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, renderComment, renderTimeline } from 'view/component/AdminPage';
import { getFollowLog, readNotification, duyetCongVan, createChiDao, createHcthCongVanDen, createPhanHoi, deleteFile, getChiDao, getCongVanDen, getHistory, getPhanHoi, updateHcthCongVanDen, updateStatus, updateQuyenChiDao } from './redux';
import { ThemVaoNhiemVuModal } from '../hcthNhiemVu/components/component';
import { themVaoNhiemVu } from '../hcthNhiemVu/redux';
import { SelectAdapter_DmNgoaiNguV2 } from 'modules/mdDanhMuc/dmNgoaiNgu/redux';
import { createHoSo, updateHoSo } from '../hcthHoSo/redux';
import { TaoHoSoModal, ThemVaoHoSoModal } from '../hcthHoSo/component';
import FileList from './components/FileList';
const { action, MA_BAN_GIAM_HIEU, MA_CHUC_VU_HIEU_TRUONG, trangThaiSwitcher, loaiLienKet } = require('../constant.js');
import { withRouter } from 'react-router';
import { Img } from 'view/component/HomePage';
import { SelectAdapter_DmDoKhanVanBan } from 'modules/mdDanhMuc/dmDoKhanVanBan/redux';
import StatusUpdate from './components/StatusUpdate';
import NhiemVuSection from '../hcthNhiemVu/components/nhiemVuSection';
import { PhanHoi } from './components/PhanHoi';
import { ChiDao } from './components/ChiDao';

export const getTrangThaiText = (value) => {
    for (const key in trangThaiSwitcher)
        if (trangThaiSwitcher[key].id === value)
            return trangThaiSwitcher[key].text;
    return '';
};

const actionToText = (value) => {
    switch (value) {
        case action.CREATE:
            return 'tạo';
        case action.VIEW:
            return 'xem';
        case action.UPDATE:
            return 'cập nhật';
        case action.RETURN:
            return 'trả lại';
        case action.APPROVE:
            return 'duyệt';
        case action.PUBLISH:
            return 'phân phối';
        case action.UPDATE_STATUS:
            return 'cập nhật trạng thái';
        default:
            return '';
    }
};

const actionColor = (value) => {
    switch (value) {
        case action.CREATE:
        case action.PUBLISH:
        case action.APPROVE:
        case action.VIEW:
            return '#00a65a';
        case action.RETURN:
            return 'red';
        default:
            return 'blue';
    }
};

class StaffEditPage extends AdminPage {

    quyenChiDaoRef = {};

    state = {
        id: null,
        isLoading: true,
        listFile: [],
        newChiDao: [],
        chiDao: [],
        phanHoi: [],
        user: {},
        shcc: null,
        chucVu: null,
        historySortType: 'DESC'
    }

    onDomReady = () => {
        const { routeMatcherUrl } = this.getSiteSetting();
        const params = T.routeMatcher(routeMatcherUrl).parse(window.location.pathname),
            user = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '', staff: {}, lastName: '', firstName: '' },
            { shcc, staff, image } = user;
        this.setState({

            id: params.id === 'new' ? null : params.id,
            isLoading: params.id === 'new' ? false : true,
            // needConduct: !params.id === 'new',
            shcc,
            image,
            chucVu: null,
            user
        }, () => {
            this.getData(() => this.props.getFollowLog(this.state.id));
            if (this.state.id) {
                setTimeout(() => this.props.readNotification(this.state.id), 2000);
            }
        });
        // fetch chuc vu
        if (staff && staff.listChucVu?.length > 0)
            SelectAdapter_DmChucVuV2.fetchOne(staff.listChucVu[0].maChucVu, (item) => this.setState({ chucVu: item.text }));
    }

    componentDidMount() {
        const { readyUrl } = this.getSiteSetting();
        T.ready(readyUrl, this.onDomReady);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location.pathname != this.props.location.pathname) {
            this.onDomReady();
        }
    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth'))
            return {
                readyUrl: '/user/hcth',
                routeMatcherUrl: '/user/hcth/van-ban-den/:id',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    <Link key={1} to='/user/hcth/van-ban-den'>Danh sách văn bản đến</Link>,
                    this.state.id ? 'Cập nhật' : 'Tạo mới'
                ],
                backRoute: '/user/hcth/van-ban-den'
            };
        else
            return {
                routeMatcherUrl: '/user/van-ban-den/:id',
                readyUrl: '/user/van-phong-dien-tu',
                breadcrumb: [
                    // <Link key={0} to='/user/'>Trang cá nhân</Link>,
                    <Link key={0} to='/user/van-phong-dien-tu'>...</Link>,
                    <Link key={1} to='/user/van-ban-den'>Danh sách văn bản đến</Link>,
                    this.state.id ? 'Cập nhật' : 'Tạo mới'
                ],
                backRoute: '/user/van-ban-den'
            };
    }

    renderHistory = (history, userShcc) => renderTimeline({
        getDataSource: () => history,
        handleItem: (item) => ({
            className: item.hanhDong == action.RETURN ? 'danger' : '',
            component: <>
                <span className='time'>{T.dateToText(item.thoiGian, 'dd/mm/yyyy HH:MM')}</span>
                <p><b style={{ color: 'blue' }}>{item.shcc !== userShcc ? (item.ho?.normalizedName() || '') + ' ' + (item.ten?.normalizedName() || '') : 'Bạn'}</b> đã <b style={{ color: actionColor(item.hanhDong) }}>{actionToText(item.hanhDong)}</b> văn bản này.</p>
            </>
        })
    })

    canChiDao = () => {
        const permissions = this.getCurrentPermissions();
        return permissions.includes('president:login') || permissions.includes('hcth:manage') || this.state.quyenChiDao?.includes(this.state.shcc)
            || (this.getCurrentPermissions()?.includes('hcthCongVanDen:manage'));
    };

    renderChiDao = (readOnly) => {
        const buttons = [];
        if (this.canPublish()) {
            if (this.state.theoDoiTienDo) {
                buttons.push(
                    <button key='publish-decline' type='submit' className='btn btn-danger' onClick={(e) => this.onReturn(e, trangThaiSwitcher.TRA_LAI_HCTH.id)}>
                        <i className='fa fa-undo' /> Trả lại
                    </button>,
                    <button key='publish-accept' type='submit' className='btn btn-success' onClick={(e) => this.onFollow(e, trangThaiSwitcher.THEO_DOI_TIEN_DO.id)}>
                        <i className='fa fa-paper-plane' /> Theo dõi
                    </button>
                );
            } else
                buttons.push(
                    <button key='publish-decline' type='submit' className='btn btn-danger' onClick={(e) => this.onReturn(e, trangThaiSwitcher.TRA_LAI_HCTH.id)}>
                        <i className='fa fa-undo' /> Trả lại
                    </button>,
                    <button key='publish-accept' type='submit' className='btn btn-success' onClick={this.onPublish}>
                        <i className='fa fa-paper-plane' /> Phân phối
                    </button>
                );
        }
        else if (this.canApprove()) {
            buttons.push(
                <button key='approve-decline' type='submit' className='btn btn-danger' onClick={(e) => this.onReturn(e, trangThaiSwitcher.TRA_LAI_BGH.id)}>
                    <i className='fa fa-undo' /> Trả lại
                </button>,
                <button key='approve-accept' type='submit' className='btn btn-success' onClick={this.onAprrove}>
                    <i className='fa fa-check' /> Duyệt
                </button>
            );
        } else {
            buttons.push(
                <button key='chiDao-add' type='submit' className='btn btn-primary' onClick={this.onCreateChiDao}>
                    <i className='fa fa-lg fa-plus' /> Thêm
                </button>
            );
        }

        const canChiDao = this.canChiDao();

        return (
            <div className='tile'>
                <div className='form-group'>
                    <h3 className='tile-title' style={{ flex: 1 }}>Chỉ đạo</h3>

                    <div className='tile-body row'>
                        <div className='col-md-12'>
                            {
                                renderComment({
                                    getDataSource: () => this.getItem()?.danhSachChiDao || [],
                                    emptyComment: 'Chưa có chỉ đạo',
                                    renderAvatar: (item) => <Img src={item.image || '/img/avatar.png'} style={{ width: '48px', height: '48px', paddingTop: '5px', borderRadius: '50%' }} />,
                                    renderName: (item) => <>{item.chucVu ? item.chucVu + ' -' : ''} <span style={{ color: 'blue' }}>{item.ho?.normalizedName()} {item.ten?.normalizedName()}</span></>,
                                    renderTime: (item) => T.dateToText(item.thoiGian, 'dd/mm/yyyy HH:MM'),
                                    renderContent: (item) => item.chiDao,
                                    getItemStyle: (item) => (item.action == action.RETURN ? { backgroundColor: '#f4abab' } : {}),
                                })
                            }
                        </div>
                        {
                            canChiDao && (<>
                                <FormRichTextBox type='text' className='col-md-12' ref={e => this.chiDao = e} label='Thêm chỉ đạo' readOnly={readOnly && !canChiDao} />
                                <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '10px' }}>
                                    {buttons}
                                </div>
                            </>)
                        }
                    </div>
                </div>
            </div>

        );
    }

    renderQuyenChiDao = (list, permission, isRector, readOnly) => {
        let banGiamHieu = this.state.banGiamHieu ? this.state.banGiamHieu.sort(this.sortByChucVuChinh) : [];
        if (isRector) banGiamHieu = banGiamHieu.filter(item => item.maChucVuChinh !== MA_CHUC_VU_HIEU_TRUONG);
        return banGiamHieu.map((item, index) => {
            if (permission.write && !readOnly)
                return <FormCheckbox
                    key={index} isSwitch ref={e => this.quyenChiDaoRef[item.shcc] = e} onChange={(value) => this.changeQuyenChiDao(item.shcc, value)} label={
                        list.includes(item.shcc) ?
                            <><b>{item.chucVuChinh}</b> - <b style={{ color: 'blue' }}>{item.ho?.normalizedName()} {item.ten?.normalizedName()}</b></> :
                            `${item.chucVuChinh} - ${item.ho ? item.ho.normalizedName() + ' ' : ''}${item.ten?.normalizedName()}`} className='col-md-3 form-group' />;
            else if ((readOnly) && list.includes(item.shcc)) {
                return <span key={index} className='col-md-3 form-group'><b>{item.chucVuChinh}</b> - <b style={{ color: 'blue' }}>{item.ho?.normalizedName()} {item.ten?.normalizedName()}</b></span>;
            }
            else return null;
        });
    }

    setQuyenChiDao = () => {
        const { banGiamHieu } = this.state;
        if (banGiamHieu && banGiamHieu.length > 0) {
            banGiamHieu.map((item) => {
                this.quyenChiDaoRef[item.shcc]?.value(this.state.quyenChiDao?.includes(item.shcc));
            });
        }
    }

    getData = (done) => {
        if (this.state.id) {
            const queryParams = new URLSearchParams(window.location.search);
            const nhiemVu = queryParams.get('nhiemVu');
            const context = { historySortType: this.state.historySortType };
            if (nhiemVu) context.nhiemVu = nhiemVu;
            this.props.getCongVanDen(Number(this.state.id), context, (item) => this.setState({ isLoading: false }, () => {
                this.setData(item);
                done && done();
            }));
        } else this.setData();
    }

    getFollowLog = () => {
        this.props.getFollowLog(this.state.id);
    }

    setData = (data = null) => {

        let { ngayCongVan, ngayNhan, ngayHetHan, soCongVan, donViGui, donViNhan, canBoNhan, trichYeu, listFile = [], quyenChiDao, danhSachChiDao = [], trangThai = 0, history = [], soDen = '', ngoaiNgu, doKhanVanBan = 'THUONG', donViChuTri = '', vanBanCongKhai = 0, theoDoiTienDo = 0 } = data ? data :
            { ngayCongVan: '', ngayNhan: '', ngayHetHan: '', soCongVan: '', donViGui: '', donViNhan: '', canBoNhan: '', trichYeu: '', quyenChiDao: '', ngoaiNgu: '10' };

        if (donViNhan) {
            donViNhan = donViNhan.split(',');
        }
        if (canBoNhan) {
            canBoNhan = canBoNhan.split(',');
        }
        quyenChiDao = quyenChiDao && quyenChiDao !== '' ? quyenChiDao.split(',') : [];

        const permissions = this.props.system?.user?.permissions;

        this.ngayCongVan.value(ngayCongVan || '');
        this.ngayNhan.value(ngayNhan || '');
        this.ngayHetHan.value(ngayHetHan || '');
        this.soCongVan.value(soCongVan ? soCongVan : '');
        this.donViGui.value(donViGui || '');
        this.donViNhan.value(donViNhan ? donViNhan : '');
        this.canBoNhan.value(canBoNhan ? canBoNhan : '');
        this.trichYeu.value(trichYeu || '');
        this.soDen.value(soDen || '');
        this.chiDao?.value('');
        this.ngoaiNgu?.value(ngoaiNgu ? ngoaiNgu : '');
        this.donViChuTri?.value(donViChuTri);
        this.doKhanVanBan?.value(doKhanVanBan);
        this.vanBanCongKhai?.value(vanBanCongKhai);
        this.theoDoiTienDo?.value(theoDoiTienDo);

        this.setState({ chiDao: danhSachChiDao, trangThai, history, theoDoiTienDo, vanBanCongKhai }, () => {
            this.fileList.setListFile(listFile);
            this.fileList.setFormData('hcthCongVanDenFile:' + (this.state.id ? this.state.id : 'new'));
            //fetch list banGiamHieu to render quyen chi dao
            this.props.getStaffPage(1, 100, '', { listDonVi: MA_BAN_GIAM_HIEU }, (page) => {
                const banGiamHieu = page.list;
                const president = banGiamHieu.find(item => item.maChucVuChinh === MA_CHUC_VU_HIEU_TRUONG);
                const needConduct = !this.state.id
                    || (this.state.id && ((!permissions.includes('president:login') && quyenChiDao.length != 0) || (permissions.includes('president:login') && quyenChiDao.filter(item => president && item !== president.shcc).length !== 0)));

                const quyenChiDaoState = this.state.id && !needConduct ? [president.shcc] : quyenChiDao;
                this.needConduct.value(needConduct);

                this.setState({ banGiamHieu, needConduct, quyenChiDao: this.state.id ? quyenChiDaoState : [president.shcc] }, () => this.setQuyenChiDao());
            });
        });
    }


    changeQuyenChiDao = (shcc, value) => {
        const permissions = this.props.system?.user?.permissions || [];
        let newQuyenChiDao = [...(this.state.quyenChiDao || [])];
        if (value) {
            newQuyenChiDao.push(shcc);
        } else {
            newQuyenChiDao = newQuyenChiDao.filter((item) => item !== shcc);
        }
        if (!permissions.includes('president:login') && newQuyenChiDao.length === 0) {
            this.quyenChiDaoRef[shcc].value(!value);
            T.notify('Chọn ít nhất 1 cán bộ chỉ đạo đối với văn bản cần chỉ đạo!', 'danger');
        } else {
            this.setState({ quyenChiDao: newQuyenChiDao }, () => this.state.id && permissions.includes('president:login') && this.props.updateQuyenChiDao(this.state.id, shcc, value, (res) => {
                if (permissions.includes('president:login') && newQuyenChiDao.length === 1) {
                    this.setState({
                        needConduct: false
                    }, () => {
                        this.needConduct.value(this.state.needConduct);
                    });
                }
                T.notify(`${value ? 'Thêm' : 'Xoá'} cán bộ chỉ đạo ${res.error ? 'lỗi' : ' thành công'}`, `${res.error ? 'danger' : 'success'}`);
            }));
        }
    }



    validatedData = () => {
        const changes = {
            soDen: this.soDen.value(),
            ngayCongVan: Number(this.ngayCongVan.value()),
            ngayNhan: Number(this.ngayNhan.value()),
            ngayHetHan: Number(this.ngayHetHan.value()),
            soCongVan: this.soCongVan.value(),
            donViGui: this.donViGui.value(),
            donViNhan: Array.from(new Set(this.donViNhan.value() || [])),
            canBoNhan: Array.from(new Set(this.canBoNhan.value() || [])).toString() || null,
            quyenChiDao: Array.from(new Set(this.state.quyenChiDao || [])).toString() || '',
            trichYeu: this.trichYeu.value(),
            chiDao: this.state.newChiDao,
            fileList: this.fileList.getListFile() || [],
            trangThai: this.state.trangThai,
            ngoaiNgu: this.ngoaiNgu.value(),
            donViChuTri: this.donViChuTri.value(),
            doKhanVanBan: this.doKhanVanBan.value(),
            theoDoiTienDo: Number(this.theoDoiTienDo.value()) || 0,
            vanBanCongKhai: Number(this.vanBanCongKhai.value()) || 0,
        };

        if (!this.state.needConduct)
            changes.quyenChiDao = '';

        if (!changes.ngayCongVan) {
            T.notify('Ngày văn bản bị trống', 'danger');
            this.ngayCongVan.focus();
        } else if (!changes.ngayNhan) {
            T.notify('Ngày nhận văn bản bị trống', 'danger');
            this.ngayNhan.focus();
        } else if (!changes.donViGui || (Array.isArray(changes.donViGui) && changes.donViGui.length === 0)) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.donViGui.focus();
        } else if (!changes.trichYeu) {
            T.notify('Trích yếu văn bản bị trống', 'danger');
            this.trichYeu.focus();
        } else if (changes.ngayNhan < changes.ngayCongVan) {
            T.notify('Ngày nhận văn bản trước ngày văn bản', 'danger');
            this.ngayNhan.focus();
        } else if (changes.ngayHetHan && changes.ngayHetHan < changes.ngayCongVan) {
            T.notify('Ngày văn bản hết hạn trước ngày văn bản', 'danger');
            this.ngayNhan.focus();
        }
        else if (this.state.needConduct && !changes.quyenChiDao) {
            T.notify('Chọn ít nhất 1 cán bộ chỉ đạo đối với văn bản cần chỉ đạo!', 'danger');
        }
        else return changes;
        return null;
    }

    save = () => {
        const changes = this.validatedData();
        if (changes) {
            if (this.state.id) {
                this.props.updateHcthCongVanDen(this.state.id, changes, this.getData);
            } else {
                this.props.createHcthCongVanDen(changes, () => this.props.history.push('/user/hcth/van-ban-den'));
            }
        }
    }

    onCreateDonviGui = (data, done) => {
        this.props.createDmDonViGuiCv(data, ({ error, item }) => {
            if (!error) {
                const { id } = item;
                this.donViGui?.value(id);
                done && done({ error, item });
            }
            this.modal.hide();
        });
    }

    onCreateChiDao = (e) => {
        e.preventDefault();
        if (this.chiDao.value()) {
            const { shcc } = this.state;
            const newChiDao = {
                canBo: shcc,
                chiDao: this.chiDao.value(),
                thoiGian: new Date().getTime(),
                congVan: this.state.id
            };
            if (this.state.id) {
                this.props.createChiDao(newChiDao, () => this.getData());
            } else
                this.setState({
                    'newChiDao': [...this.state.newChiDao, newChiDao],
                    chiDao: [...this.state.chiDao, {
                        ...newChiDao,
                        chucVu: this.state.chucVu,
                        ho: this.state.user.lastName,
                        ten: this.state.user.firstName,
                        image: this.state.image
                    }]
                }, () => this.chiDao?.value(''));
        }
    }

    unSaveMessage = 'Các thay đổi của bạn chưa được lưu. '

    onFinish = (e) => {
        e.preventDefault();
        const { quyenChiDao: quyenChiDaoBefore } = this.getItem() || {};

        const data = this.validatedData();
        if (data) {
            let newTrangThai;
            if (data.quyenChiDao.length == 0) {
                newTrangThai = trangThaiSwitcher.CHO_PHAN_PHOI.id;
            } else {
                if ([trangThaiSwitcher.MOI.id, trangThaiSwitcher.TRA_LAI_BGH.id].includes(this.state.trangThai))
                    newTrangThai = trangThaiSwitcher.CHO_DUYET.id;
                else if (!quyenChiDaoBefore)
                    newTrangThai = trangThaiSwitcher.CHO_DUYET.id;
                else
                    newTrangThai = trangThaiSwitcher.CHO_PHAN_PHOI.id;
            }
            T.confirm('Hoàn thiện văn bản', 'Bạn có chắc bạn đã hoàn thiện văn bản này văn bản này?', true,
                isConfirm => isConfirm && this.setState({ trangThai: newTrangThai }, () => this.save()));
        }
    }

    onReturn = (e, status) => {
        e.preventDefault();
        const chiDao = this.chiDao.value();
        if (!chiDao) {
            T.notify('Vui lòng nhập lý do thêm lý do trả văn bản vào ô Thêm chỉ đạo', 'danger');
            this.chiDao.focus();
        }
        else
            T.confirm('Trả lại văn bản', 'Bạn có chắc bạn muốn trả lại văn bản này?', true,
                isConfirm => isConfirm &&
                    this.props.createChiDao({
                        canBo: this.state.shcc,
                        chiDao: chiDao,
                        thoiGian: new Date().getTime(),
                        congVan: this.state.id,
                        action: action.RETURN,
                    }, () => this.props.getChiDao(this.state.id, () => this.onChangeStatus(status))
                    )
            );
    }

    onAprrove = (e) => {
        e.preventDefault();
        const chiDao = this.chiDao.value();
        if (!chiDao) {
            T.notify('Vui lòng nhập chỉ đạo', 'danger');
            this.chiDao.focus();
        }
        else
            T.confirm('Duyệt văn bản', 'Bạn có chắc bạn muốn duyệt văn bản này?', true,
                isConfirm => isConfirm && this.props.duyetCongVan(this.state.id, chiDao, this.getData)
            );
    }

    onFollow = (e, trangThai = trangThaiSwitcher.THEO_DOI_TIEN_DO.id) => {
        e.preventDefault();
        const chiDao = this.chiDao.value();
        let title = 'Theo dõi văn bản', message = 'Văn bản sẽ chuyển theo dõi';
        T.confirm(title, message, true,
            isConfirm => {
                if (isConfirm) {
                    if (chiDao)
                        this.props.createChiDao({
                            canBo: this.state.shcc,
                            chiDao: chiDao,
                            thoiGian: new Date().getTime(),
                            congVan: this.state.id,
                        }, () => this.props.getChiDao(this.state.id, () => this.onChangeStatus(trangThai))
                        );
                    else
                        this.onChangeStatus(trangThai);
                }
            }
        );
    }

    onPublish = (e, trangThai = trangThaiSwitcher.DA_PHAN_PHOI.id) => {
        e.preventDefault();
        const chiDao = this.chiDao.value();
        let title, message;
        if (this.state.trangThai == trangThaiSwitcher.THEO_DOI_TIEN_DO.id) {
            title = 'Hoàn tất theo dõi';
            message = 'Văn bản sẽ kết thúc theo dõi và hoàn tất!';
        } else {
            title = 'Phân phối văn bản';
            message = 'ạn có chắc bạn muốn phân phối văn bản này?';
        }

        T.confirm(title, message, true,
            isConfirm => {
                if (isConfirm) {
                    if (chiDao)
                        this.props.createChiDao({
                            canBo: this.state.shcc,
                            chiDao: chiDao,
                            thoiGian: new Date().getTime(),
                            congVan: this.state.id,
                        }, () => this.props.getChiDao(this.state.id, () => this.onChangeStatus(trangThai))
                        );
                    else
                        this.onChangeStatus(trangThai);
                }
            }
        );
    }

    onChangeStatus = (status, done) => {
        this.props.updateStatus({ id: this.state.id, trangThai: status }, () => this.setState({ trangThai: status }, () => this.props.getHistory(this.state.id, { historySortType: this.state.historySortType }, () => done && done())));
    }

    sortByChucVuChinh = (a, b) => a.maChucVuChinh == MA_CHUC_VU_HIEU_TRUONG ? -1 : b.maChucVuChinh == MA_CHUC_VU_HIEU_TRUONG ? 1 : 0;

    getItem = () => this.props.hcthCongVanDen && this.props.hcthCongVanDen.item ? this.props.hcthCongVanDen.item : null;

    getUserDonViQuanLy = () => this.props.system?.user?.staff?.donViQuanLy || [];

    isRelated = () => {
        const currentPermission = this.getCurrentPermissions();
        let { donViNhan, canBoNhan } = this.getItem() || {};
        let maDonViNhan = donViNhan?.split(',') || [];
        let maCanBoNhan = canBoNhan?.split(',') || [];
        let maDonViCanBo = this.props.system?.user?.staff?.maDonVi;
        return (
            currentPermission.includes('president:login') ||
            (currentPermission.includes('hcth:login') && currentPermission.includes('hcthCongVanDen:write')) ||
            (currentPermission.includes('donViCongVanDen:read') && maDonViNhan.includes(maDonViCanBo)) ||
            this.getUserDonViQuanLy().find(item => maDonViNhan.includes(item.maDonVi)) ||
            maCanBoNhan.includes(this.state.shcc)
        );
    }

    onCreatePhanHoi = (e) => {
        e.preventDefault();
        const value = this.phanHoi.value();
        if (value) {
            this.props.createPhanHoi({
                key: this.state.id,
                canBoGui: this.state.shcc,
                noiDung: value,
                ngayTao: new Date().getTime(),
            }, () => this.getData());
        }
    }

    canPublish = () => {
        return this.state.id && this.getUserPermission('hcthCongVanDen', ['manage']).manage && this.state.trangThai == trangThaiSwitcher.CHO_PHAN_PHOI.id;
    }

    canApprove = () => {
        const quyenChiDao = this.props.hcthCongVanDen?.item?.quyenChiDao || '';
        return this.state.id && (this.getUserPermission('president', ['login']).login || quyenChiDao.split(',').includes(this.state.shcc)) && this.state.trangThai == trangThaiSwitcher.CHO_DUYET.id;
    }

    canFinish = () => {
        const hcthCongVanDenPermission = this.getUserPermission('hcthCongVanDen', ['read', 'write', 'delete']);
        return this.state.id && hcthCongVanDenPermission.write && [trangThaiSwitcher.MOI.id, trangThaiSwitcher.TRA_LAI_BGH.id, trangThaiSwitcher.TRA_LAI_HCTH.id].includes(this.state.trangThai);
    }

    onChangeNeedConduct = (value) => {
        const permissions = this.props.system?.user?.permissions || [];
        this.setState({ needConduct: value }, () => {
            if (this.state.id && permissions.includes('president:login')) {
                if (value) {
                    this.props.getStaffPage(1, 100, '', { listDonVi: MA_BAN_GIAM_HIEU }, (page) => {
                        const rectors = page.list.filter(item => item.maChucVuChinh !== MA_CHUC_VU_HIEU_TRUONG).map(item => item.shcc);
                        const oldQuyenChiDao = this.state.quyenChiDao;
                        oldQuyenChiDao.push(rectors[0]);
                        this.setState({ quyenChiDao: [...oldQuyenChiDao] }, () => {
                            this.setQuyenChiDao();
                            this.props.updateQuyenChiDao(this.state.id, rectors[0], true, (res) => {
                                if (res.error) T.notify('Uỷ quyền chỉ đạo lỗi', 'danger');
                                else T.notify('Uỷ quyền chỉ đạo thành công. Bạn có thể thay đổi cán bộ chỉ đạo.', 'success');

                            });
                        });
                    });
                } else {
                    let quyenChiDao = [...this.state.quyenChiDao];
                    const president = this.state.banGiamHieu.find(item => item.maChucVuChinh === MA_CHUC_VU_HIEU_TRUONG);
                    if (permissions.includes('president:login')) quyenChiDao = president ? quyenChiDao.filter(item => item !== president.shcc) : [];
                    this.props.updateQuyenChiDao(this.state.id, quyenChiDao.join(','), false, (res) => {
                        if (res.error) T.notify('Xoá uỷ quyền chỉ đạo lỗi', 'danger');
                        else {
                            T.notify('Xoá uỷ quyền chỉ đạo thành công', 'success');
                            this.getData();
                        }
                    });
                }
            } else {
                this.setQuyenChiDao();
            }
        });
    }

    onChangeHistorySort = (e) => {
        e.preventDefault();
        const current = this.state.historySortType,
            next = current == 'DESC' ? 'ASC' : 'DESC';
        this.setState({ historySortType: next }, () => this.props.getHistory(this.state.id, { historySortType: this.state.historySortType }));
    }

    onReady = (e) => {
        e.preventDefault();
        T.confirm('Cập nhật trạng thái văn bản', 'văn bản sẻ được chuyển lên chờ phân phối! Hãy đảm bảo các trường thông tin đã được nhập đúng', true, isConfirm => {
            if (isConfirm) this.onChangeStatus(trangThaiSwitcher.CHO_PHAN_PHOI.id);
        });
    }

    onRetrieve = (e) => {
        e.preventDefault();
        T.confirm('Thu hồi văn bản', 'Văn bản sẽ được thu hồi!', true, isConfirm => {
            if (isConfirm) this.onChangeStatus(trangThaiSwitcher.THU_HOI.id);
        });
    }

    render() {
        const permission = this.getUserPermission('hcthCongVanDen', ['read', 'write', 'delete', 'manage']),
            dmDonViGuiCvPermission = this.getUserPermission('dmDonViGuiCv', ['read', 'write', 'delete']),
            readOnly = !permission.write || [trangThaiSwitcher.CHO_DUYET.id, trangThaiSwitcher.CHO_PHAN_PHOI.id, trangThaiSwitcher.DA_PHAN_PHOI.id, trangThaiSwitcher.THU_HOI.id, trangThaiSwitcher.THEO_DOI_TIEN_DO.id].includes(this.state.trangThai),
            presidentPermission = this.getUserPermission('president', ['login']),
            readChiDao = !presidentPermission.login && (!permission.write || [trangThaiSwitcher.CHO_DUYET.id, trangThaiSwitcher.CHO_PHAN_PHOI.id, trangThaiSwitcher.DA_PHAN_PHOI.id, trangThaiSwitcher.TRA_LAI_BGH.id].includes(this.state.trangThai)),
            hcthStaffPermission = this.getUserPermission('hcth', ['login', 'manage']),
            criticalStatus = [trangThaiSwitcher.TRA_LAI_BGH.id, trangThaiSwitcher.TRA_LAI_HCTH.id],
            item = this.state.id ? this.getItem() : {},
            { breadcrumb, backRoute } = this.getSiteSetting(),
            currentPermissions = this.getCurrentPermissions();

        const loading = (
            <div className='overlay tile' style={{ minHeight: '120px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className='m-loader mr-4'>
                    <svg className='m-circular' viewBox='25 25 50 50'>
                        <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                    </svg>
                </div>
                <h4 className='l-text'>Đang tải...</h4>
            </div>);

        const permissionDenied = (
            <div className='tile'>
                <h4>Bạn không có quyền đọc văn bản này!</h4>
            </div>);

        const quyenChiDao = this.renderQuyenChiDao(this.state.quyenChiDao || [], { write: hcthStaffPermission.login || presidentPermission.login }, presidentPermission.login, readChiDao);

        const buttons = [];
        this.canFinish() && hcthStaffPermission.login && buttons.push({ className: 'btn-success', icon: 'fa-check', onClick: this.onFinish });
        this.state.trangThai == trangThaiSwitcher.DA_DUYET.id && hcthStaffPermission.login && buttons.push({ className: 'btn-success', icon: 'fa-envelope', onClick: this.onReady });

        this.state.trangThai == trangThaiSwitcher.DA_PHAN_PHOI.id && permission.manage && buttons.push({ className: 'btn-warning', icon: 'fa-undo', tooltip: 'Thu hồi', onClick: this.onRetrieve });

        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Văn bản đến',
            breadcrumb,
            content: this.state.isLoading ? loading : item.error && item.error == 401 ? permissionDenied : (<>
                <div className='tile'>
                    <h3 className='tile-title'>{!this.state.id ? 'Tạo mới văn bản đến' : 'Thông tin văn bản'}</h3>
                    <div className='tile-body row'>
                        <FormTextBox type='text' className='col-md-2' ref={e => this.soDen = e} label='Số đến' readOnlyEmptyText='Chưa có' readOnly={readOnly} />
                        <FormTextBox type='text' className='col-md-2' ref={e => this.soCongVan = e} label='Mã số VB' readOnlyEmptyText='Chưa có' readOnly={readOnly} />
                        <FormSelect className='col-md-8' ref={e => this.donViGui = e} label={(<span onClick={(e) => e.stopPropagation()}>
                            Đơn vị gửi văn bản
                            {!readOnly && <>
                                (
                                <Link to='#' onClick={() => this.modal.show(null)}>Nhấn vào đây để thêm</Link>
                                ) </>
                            }
                        </span>)} data={SelectAdapter_DmDonViGuiCongVan} placeholder='Đơn vị gửi văn bản' readOnly={readOnly} required />
                        <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayCongVan = e} label='Ngày VB' readOnlyEmptyText='Chưa có ngày văn bản' readOnly={readOnly} required />
                        <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayNhan = e} label='Ngày nhận' readOnlyEmptyText='Chưa có ngày nhận' readOnly={readOnly} required />
                        <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayHetHan = e} readOnlyEmptyText='Chưa có ngày hết hạn' label='Ngày hết hạn' readOnly={readOnly} />
                        <FormRichTextBox type='text' className='col-md-12' ref={e => this.trichYeu = e} label='Trích yếu' readOnly={readOnly} required />
                        {this.state.id && <span className='form-group col-md-2' style={{ gap: 10 }}>Tình trạng: <b style={{ color: criticalStatus.includes(this.state.trangThai) ? 'red' : 'blue' }}>{getTrangThaiText(this.state.trangThai)}</b>{permission.manage && <a onClick={(e) => e.preventDefault() || this.updateStatusModal.show({ id: this.state.id, trangThai: this.state.trangThai })} style={{ color: 'blue' }}><i className='fa fa-lg fa-pencil-square-o' /></a>}</span>}
                        <FormCheckbox isSwitch className={this.state.id ? 'col-md-3' : 'col-md-6'} label='Văn bản công khai' ref={e => this.vanBanCongKhai = e} readOnly={readOnly} />
                        <FormCheckbox isSwitch className={this.state.id ? 'col-md-7' : 'col-md-6'} label='Văn bản theo dõi tiến độ' ref={e => this.theoDoiTienDo = e} readOnly={readOnly} />
                        <FormSelect className='col-md-6' ref={e => this.donViChuTri = e} label='Đơn vị chủ trì' data={SelectAdapter_DmDonVi} readOnly={readOnly} readOnlyEmptyText='Chưa có đơn vị chủ trì' allowClear />
                        <FormSelect multiple={true} className='col-md-6' ref={e => this.donViNhan = e} label='Đơn vị phối hợp' data={SelectAdapter_DmDonVi} readOnly={readOnly} readOnlyEmptyText='Chưa có đơn vị xử lý' />
                        <FormSelect multiple={true} className='col-md-4' ref={e => this.canBoNhan = e} label='Cán bộ xử lý văn bản' data={SelectAdapter_FwCanBoWithDonVi} readOnly={readOnly} readOnlyEmptyText='Chưa có cán bộ xử lý' />
                        <FormSelect className='col-md-4' label='Độ khẩn văn bản' placeholder='Chọn độ khẩn văn bản' ref={e => this.doKhanVanBan = e} data={SelectAdapter_DmDoKhanVanBan} readOnly={readOnly} readOnlyEmptyText='Văn bản chưa có độ khẩn' />
                        <FormSelect className='col-md-4' label='Ngôn ngữ' placeholder='Chọn ngôn ngữ' ref={e => this.ngoaiNgu = e} readOnly={readOnly} readOnlyEmptyText='Chưa có ngôn ngữ' data={SelectAdapter_DmNgoaiNguV2} />

                        <FormCheckbox readOnly={readChiDao} isSwitch ref={e => this.needConduct = e} onChange={this.onChangeNeedConduct} label={presidentPermission.login ? 'Uỷ quyền chỉ đạo' : 'Văn bản cần chỉ đạo'} className='col-md-12' style={{ paddingTop: '5px' }} />
                        {this.state.needConduct && (<>
                            {/* <span className='col-md-12 form-group'>Cán bộ chỉ đạo :</span> */}
                            {quyenChiDao}
                        </>)}
                        {this.state.id && (this.state.trangThai != trangThaiSwitcher.THU_HOI.id) && <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                            {this.state.trangThai == trangThaiSwitcher.DA_PHAN_PHOI.id && <>
                                <button type='submit' className='btn btn-success mr-2' onClick={e => { e.preventDefault(); this.taoHoSoModal.show(); }}>
                                    <i className='fa fa-plus'></i>Tạo hồ sơ
                                </button>
                                <button type='submit' className='btn btn-primary mr-2' onClick={e => { e.preventDefault(); this.themVaoHoSoModal.show(); }}>
                                    <i className='fa fa-arrow-up'></i>Thêm vào hồ sơ
                                </button>
                            </>}
                            {currentPermissions?.find(i => ['manager:write', 'htch:manage', 'rectors:login'].includes(i)) && <button type='submit' className='btn btn-primary mr-2' onClick={e => { e.preventDefault(); this.themVaoNhiemVuModal.show(); }} >
                                <i className='fa fa-arrow-up'></i>Thêm vào nhiệm vụ
                            </button>}
                        </div>}

                    </div>
                </div>
                {this.state.id && <NhiemVuSection nhiemVu={item?.nhiemVu} />}
                {/* {this.state.id && this.renderChiDao(readOnly)} */}
                {this.state.id && <ChiDao getFollowLog={this.getFollowLog} theoDoiTienDo={this.props.theoDoiTienDo} quyenChiDao={this.state.quyenChiDao} getItem={this.getItem} shcc={this.props.system?.user?.shcc} trangThai={this.state.trangThai} id={this.state.id} readOnly={readOnly} onChangeStatus={this.onChangeStatus} hcthCongVanDen={this.props.hcthCongVanDen} createChiDao={this.props.createChiDao} getChiDao={this.props.getChiDao} getData={this.getData} duyetCongVan={this.props.duyetCongVan} getCurrentPermissions={this.getCurrentPermissions} getUserPermission={this.getUserPermission} />}
                {this.state.id && <PhanHoi {...{ ...this.props, getFollowLog: this.getFollowLog }} canPhanHoi={this.isRelated()} congVan={this.state.id} />}

                <FileList id={this.state.id} permission={permission} readOnly={readOnly} ref={e => this.fileList = e} />

                {this.state.id && (<div className='tile'>
                    <h3 className='tile-title'><i className={`btn fa fa-sort-amount-${this.state.historySortType == 'DESC' ? 'desc' : 'asc'}`} onClick={this.onChangeHistorySort} /> Lịch sử</h3>
                    {this.renderHistory(this.props.hcthCongVanDen?.item?.history, this.props.system?.user?.staff?.shcc)}
                </div>)}
                <EditModal ref={e => this.modal = e}
                    permissions={dmDonViGuiCvPermission}
                    create={this.onCreateDonviGui}
                />
                <ThemVaoNhiemVuModal ref={e => this.themVaoNhiemVuModal = e} vanBanId={this.state.id} add={this.props.themVaoNhiemVu} loaiVanBan={loaiLienKet.VAN_BAN_DEN.id} />
                <TaoHoSoModal ref={e => this.taoHoSoModal = e} create={this.props.createHoSo} />
                <ThemVaoHoSoModal ref={e => this.themVaoHoSoModal = e} add={this.props.updateHoSo} vanBanId={this.state.id} loaiVanBan={loaiLienKet.VAN_BAN_DEN.id} />
                <StatusUpdate ref={e => this.updateStatusModal = e} />
            </>),
            backRoute,
            onSave: !readOnly && (!this.state.id || hcthStaffPermission.login) ? this.save : null,
            buttons,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongVanDen: state.hcth.hcthCongVanDen });
const mapActionsToProps = { getFollowLog, readNotification, duyetCongVan, createHcthCongVanDen, updateHcthCongVanDen, getCongVanDen, deleteFile, createDmDonViGuiCv, getStaffPage, createChiDao, createPhanHoi, updateStatus, getPhanHoi, getHistory, getChiDao, updateQuyenChiDao, themVaoNhiemVu, createHoSo, updateHoSo };
export default connect(mapStateToProps, mapActionsToProps, false, { forwardRef: false })(withRouter(StaffEditPage));
