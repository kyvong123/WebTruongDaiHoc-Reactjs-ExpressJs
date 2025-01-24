import { SelectAdapter_DmDonVi, SelectAdapter_DmDonViFilter } from 'modules/mdDanhMuc/dmDonVi/redux';
import { EditModal } from 'modules/mdDanhMuc/dmDonViGuiCv/adminPage';
import { CreateModal } from '../hcthSoDangKy/adminPage';
import { CreateRequest } from 'modules/mdHanhChinhTongHop/hcthSoDangKy/components/createRequest';
import { createRequest } from 'modules/mdHanhChinhTongHop/hcthSoDangKy/redux/request';
import { createSoNhapTay, createSoTuDong, SelectAdapter_SoDangKy } from '../hcthSoDangKy/redux/soDangKy';
import { createDmDonViGuiCv, SelectAdapter_DmDonViGuiCongVan } from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import { SelectAdapter_DmLoaiVanBan } from 'modules/mdDanhMuc/dmLoaiVanBan/redux/dmLoaiVanBan';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormDatePicker, FormRichTextBox, FormSelect, loadSpinner } from 'view/component/AdminPage';
import { createCongVanTrinhKy, deleteCongVanTrinhKy, updateCongVanTrinhKy } from '../hcthCongVanTrinhKy/redux';
import { TaoHoSoModal, ThemVaoHoSoModal } from '../hcthHoSo/component';
import { createHoSo, updateHoSo } from '../hcthHoSo/redux';
import { themVaoNhiemVu } from '../hcthNhiemVu/redux';
import { VanBanDiFileV2, LichSu } from './components/index';
import { contentAprrove, createHcthCongVanDi, createPhanHoi, deleteFile, deleteHcthCongVanDi, formailtyAprrove, getCongVanDi, getFile, getHcthCongVanDiSearchPage, getHistory, getPhanHoi, ready, updateHcthCongVanDi, readyPaper, paperContentApprove } from './redux/vanBanDi';

import { SelectAdapter_DmNgoaiNguV2 } from 'modules/mdDanhMuc/dmNgoaiNgu/redux';

const { capVanBan, vanBanDi, MA_HCTH, TIENG_VIET, loaiLienKet } = require('../constant.js');
const trangThaiCongVanDi = vanBanDi.trangThai;

const getTrangThaiColor = (trangThai) => {
    return vanBanDi.trangThai[trangThai]?.color || 'blue';
};

const getTrangThaiText = (trangThai) => {
    return vanBanDi.trangThai[trangThai]?.text;
};

class UserConvertPage extends AdminPage {
    state = {
        id: null,
        isLoading: true,
        historySortType: 'DESC',
    };

    componentDidMount() {
        const hcthMenu = window.location.pathname.startsWith('/user/hcth');
        T.ready(hcthMenu ? '/user/hcth' : '/user', () => {
            const params = T.routeMatcher(hcthMenu ? '/user/hcth/van-ban-di/convert/:id' : '/user/van-ban-di/convert/:id').parse(window.location.pathname),
                user = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '', staff: {}, lastName: '', firstName: '', maDonVi: '' };
            this.setState({
                id: params.id === 'new' ? null : params.id,
                isLoading: params.id === 'new' ? false : true,
                user,
                donViGui: this.getListDonVi()[0] || '',
                capVanBan: capVanBan.TRUONG.id
            }, () => this.getData());
        });
    }

    isManager = () => {
        const permissions = this.getCurrentPermissions(), donViQuanLy = this.getDonViQuanLy(), donVi = this.getDonVi();
        return permissions.includes('donViCongVanDi:manage') && [...donViQuanLy, donVi].includes(this.state.donViGui);
    }

    isCreator = () => {
        const shcc = this.props.system.user.shcc;
        return this.state.nguoiTao == shcc;
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

    onReady = () => {
        T.confirm('Hoàn thiện văn bản', 'Các thay đổi đối với văn bản sẽ được lưu và trạng thái văn bản sẽ được cập nhật. Bạn hãy kiểm tra lại các trường dữ liệu trước khi cập nhật văn bản!', 'warning', true, isConfirm =>
            isConfirm && this.save(() => {
                this.props.readyPaper(this.state.id, () => window.location.reload());
            }));
    }

    onContentAprrove = () => {
        T.confirm('Kiểm tra văn bản', 'Văn bản sẽ được duyệt!', 'warning', true, isConfirm =>
            isConfirm && this.props.paperContentApprove(this.state.id, () => window.location.reload())
        );
    }

    getButtons = () => {
        const buttons = [];
        if (!this.state.id) return buttons;
        if ([trangThaiCongVanDi.NHAP.id].includes(this.state.trangThai)) {
            if (this.isManager() || this.isCreator()) {
                buttons.push({ className: 'btn-success', icon: 'fa-check', tooltip: 'Hoàn thiện', onClick: e => e.preventDefault() || this.onReady() });
            }
        }
        if ([trangThaiCongVanDi.CHO_DUYET.id].includes(this.state.trangThai)) {
            if (this.getCurrentPermissions().includes('hcthCongVanDi:manage'))
                buttons.push({ className: 'btn-success', icon: 'fa-check-square-o', tooltip: 'Phê duyệt', onClick: e => e.preventDefault() || this.onContentAprrove() });

        }
        return buttons;
    }


    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth')) {
            return {
                readyUrl: '/user/hcth',
                routeMatcherUrl: '/user/hcth/van-ban-di/convert/:id',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    <Link key={1} to='/user/hcth/van-ban-di'>Danh sách văn bản đi</Link>,
                    this.state.id ? 'Cập nhật' : 'Tạo mới'
                ],
                backRoute: '/user/hcth/van-ban-di'
            };
        } else {
            return {
                readyUrl: '/user',
                routeMatcherUrl: '/user/van-ban-di/convert/:id',
                breadcrumb: [
                    <Link key={0} to='/user/van-phong-dien-tu'>...</Link>,
                    <Link key={1} to='/user/van-ban-di'>Danh sách văn bản đi</Link>,
                    this.state.id ? 'Văn bản' : 'Tạo mới'
                ],
                backRoute: '/user/van-ban-di'
            };
        }
    }

    getData = () => {
        if (this.state.id) {
            const context = { historySortType: this.state.historySortType };
            this.setState({ isLoading: false });
            this.props.getCongVanDi(Number(this.state.id), context, (item) => this.setData(item));
        } else this.setData();
    }

    setData = (data = null) => {
        if (!data) {
            this.danhSachVanBan.setFiles([]);
            this.banLuu.value(MA_HCTH);
            this.ngoaiNgu.value(TIENG_VIET);
            this.donViGui?.value(this.getListDonVi()[0] || '');
            this.capVanBan?.value(capVanBan.TRUONG.id);
        } else {
            let { trichYeu, nguoiTao = '', ngayGui, ngayKy, donViGui, donViNhan, canBoNhan, donViNhanNgoai, trangThai, capVanBan, loaiVanBan, history = [], soDi, laySoTuDong = true, soCongVan = '', ngoaiNgu, banLuu, soDangKy, files = [], isPhysical, nguoiKy } = data ? data :
                { id: '', trichYeu: '', ngayGui: '', ngayKy: '', donViGui: '', donViNhan: '', canBoNhan: '', donViNhanNgoai: '', trangThai: '', loaiVanBan: '', capVanBan: 'TRUONG', soDi: '', ngoaiNgu: '10', banLuu: '29', soDangKy: '', nguoiKy: '' };

            this.setState({ soDi, nguoiTao, trangThai, donViGui, donViNhan, capVanBan, history, laySoTuDong, soCongVan, loaiVanBan, isPhysical, nguoiKy }, () => {
                this.danhSachVanBan.setFiles(files);
                this.trichYeu.value(trichYeu);
                this.ngayGui.value(ngayGui);
                this.ngayKy.value(ngayKy);
                this.donViGui.value(donViGui);

                this.banLuu.value(banLuu);

                this.loaiVanBan.value(loaiVanBan);
                this.capVanBan.value(capVanBan);
                this.trangThai?.value(trangThai || '');
                this.soCongVan?.value(soDangKy);
                this.donViNhan.value(donViNhan);

                this.donViNhanNgoai.value(donViNhanNgoai ? donViNhanNgoai : '');

                this.canBoNhan.value(canBoNhan ? canBoNhan : '');
                this.nguoiKy.value(nguoiKy);

                this.ngoaiNgu.value(ngoaiNgu);
            });
        }
    }

    getValidatedData = () => {
        const changes = {
            trichYeu: this.trichYeu.value(),
            ngayGui: Number(this.ngayGui.value()),
            ngayKy: Number(this.ngayKy.value()),
            capVanBan: this.capVanBan.value(),
            donViGui: this.donViGui.value(),
            donViNhan: this.donViNhan.value(),
            canBoNhan: this.canBoNhan.value(),
            nguoiKy: this.nguoiKy.value(),
            donViNhanNgoai: this.donViNhanNgoai.value(),
            loaiVanBan: this.loaiVanBan.value() ? this.loaiVanBan.value().toString() : '',
            soCongVan: this.soCongVan.value(),
            trangThai: this.state.trangThai,
            banLuu: this.banLuu.value(),
            ngoaiNgu: this.ngoaiNgu.value(),
            files: this.danhSachVanBan.getFiles()
        };

        if (!changes.donViGui) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.donViGui.focus();
        } else if (!changes.capVanBan) {
            T.notify('Cấp văn bản bị trống', 'danger');
            this.capVanBan.focus();
        } else if (!changes.trichYeu) {
            T.notify('Trích yếu bị trống', 'danger');
            this.trichYeu.focus();
        } else if (!changes.soCongVan) {
            T.notify('Số văn bản trống', 'danger');
            this.soCongVan?.focus();
        } else if (!changes.banLuu.includes('29')) {
            T.notify('Bản lưu phải có phòng HCTH', 'danger');
            changes.banLuu.push('29');
            this.banLuu.value(changes.banLuu);
        }
        else return changes;
        return null;
    }

    save = (done) => {
        const changes = this.getValidatedData();
        const { backRoute } = this.getSiteSetting();
        if (changes) {
            if (!this.state.trangThai) changes.trangThai = trangThaiCongVanDi.NHAP.id;
            if (this.state.id) {
                this.props.updateHcthCongVanDi(this.state.id, changes, () => (done && done()) || this.getData());
            } else {
                changes.ngayTao = new Date().getTime(),
                    changes.isPhysical = 1,
                    changes.laySoTuDong = 0;
                this.props.createHcthCongVanDi(changes, () => this.props.history.push(backRoute));
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

    canReadOnly = () => {
        if (!this.state.id) return false;
        if ([trangThaiCongVanDi.NHAP.id].includes(this.state.trangThai))
            return !(this.isManager() || this.isCreator());
        return true;
    }

    onChangeHistorySort = (e) => {
        e.preventDefault();
        const current = this.state.historySortType,
            next = current == 'DESC' ? 'ASC' : 'DESC';
        this.setState({ historySortType: next }, () => this.props.getHistory(this.state.id, { historySortType: this.state.historySortType }));
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
                });
            }
        });
    }

    renderSoCongVanSelector = (donViGui, capVanBan, loaiVanBan, id) => {
        const permissions = this.getCurrentPermissions();
        return (<FormSelect key={`${donViGui}-${capVanBan}-${loaiVanBan}-${id}`} className='col-md-12' ref={e => this.soCongVan = e} readOnly={this.canReadOnly() || this.state.laySoTuDong} data={SelectAdapter_SoDangKy(donViGui, capVanBan, loaiVanBan, id, null)} placeholder='Chọn số đăng ký' required={!this.state.laySoTuDong} readOnlyEmptyText='Chưa có số' allowClear={true} label={
            (<span onClick={e => e.stopPropagation()}>
                <span style={{ marginRight: '2px' }}>Số văn bản</span>
                {!this.canReadOnly() && permissions.some(item => ['hcthSoVanBan:write', 'donViCongVanDi:edit'].includes(item)) && <>(
                    {this.getListDonVi().includes(MA_HCTH) && permissions.includes('hcthSoVanBan:write') ?
                        <Link to='#' onClick={() => this.soDangKyModal.show()}>Nhấn vào đây để thêm</Link> :
                        <Link to='#' onClick={() => this.requestModal.show()}>Nhấn vào đây để thêm</Link>})
                </>
                }
            </span>)
        } />);
    }

    render = () => {
        const isNew = !this.state.id,
            dmDonViGuiCvPermission = this.getUserPermission('dmDonViGuiCv', ['read', 'write', 'delete']),
            currentPermissions = this.getCurrentPermissions(),
            { breadcrumb, backRoute } = this.getSiteSetting();

        const titleText = !isNew ? 'Văn bản đi' : 'Tạo mới';

        const capVanBanArr = Object.values(capVanBan);

        return this.renderPage({
            icon: 'fa fa-caret-square-o-right',
            title: 'Văn bản đi',
            breadcrumb,
            content: this.state.isLoading ? loadSpinner() : (<>
                <div className='tile'>
                    <div className='clearfix'>
                        <div className='d-flex justify-content-between'>
                            <h3 className='tile-title'>{titleText}</h3>
                        </div>
                    </div>

                    <div className='tile-body row'>
                        {this.renderSoCongVanSelector(this.state.donViGui, this.state.capVanBan, this.state.loaiVanBan, this.state.id)}

                        <FormDatePicker ref={e => this.ngayGui = e} readOnly={this.canReadOnly()} label='Ngày gửi' className='col-md-6' type='date-mask' readOnlyEmptyText='Chưa có ngày gửi' />
                        <FormDatePicker ref={e => this.ngayKy = e} readOnly={this.canReadOnly()} label='Ngày ký' className='col-md-6' type='date-mask' readOnlyEmptyText='Chưa có ngày ký' />
                        {this.state.id && <span className='form-group col-md-12'>Trạng thái: <b style={{ color: this.state.trangThai ? getTrangThaiColor(this.state.trangThai) : 'blue' }}>{getTrangThaiText(this.state.trangThai)}</b></span>}

                        <FormSelect ref={e => this.donViGui = e} readOnly={this.canReadOnly()} label='Đơn vị gửi' placeholder='Chọn đơn vị gửi' className='col-md-12' data={this.getListDonVi().includes(MA_HCTH) && currentPermissions.includes('hcthSoVanBan:write') ? SelectAdapter_DmDonVi : SelectAdapter_DmDonViFilter(this.getListDonVi())} required readOnlyEmptyText='Chưa có đơn vị gửi' onChange={value => this.setState({ donViGui: value?.id || '' })} />

                        <FormSelect ref={e => this.capVanBan = e} readOnly={this.canReadOnly()} disabled={true} label='Cấp văn bản' placeholder='Chọn cấp văn bản' className='col-md-6' data={capVanBanArr} readOnlyEmptyText='Chưa có loại văn bản' required onChange={value => this.setState({ capVanBan: value?.id || '' })} />

                        <FormSelect className='col-md-6' allowClear={true} label='Loại văn bản' placeholder='Chọn loại văn bản' ref={e => this.loaiVanBan = e} data={SelectAdapter_DmLoaiVanBan} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có loại văn bản' onChange={value => this.setState({ loaiVanBan: value?.id || '' })} />

                        <FormSelect multiple={true} className='col-md-12' label='Đơn vị nhận' placeholder='Chọn đơn vị nhận' ref={e => this.donViNhan = e} data={SelectAdapter_DmDonVi} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có đơn vị nhận' />
                        <FormSelect multiple={true} className='col-md-12' label={(<span onClick={(e) => e.stopPropagation()}>
                            <span style={{ marginRight: '2px' }}>Đơn vị nhận bên ngoài</span>
                            {!this.canReadOnly() && <>
                                (
                                <Link to='#' onClick={() => this.donViGuiNhanModal.show(null)}>Nhấn vào đây để thêm</Link>
                                ) </>
                            }
                        </span>)} placeholder='Chọn đơn vị nhận bên ngoài' ref={e => this.donViNhanNgoai = e} data={SelectAdapter_DmDonViGuiCongVan} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có đơn vị nhận' />
                        <FormSelect multiple={true} className='col-md-12' label='Cán bộ nhận' placeholder='Chọn cán bộ nhận' ref={e => this.canBoNhan = e} data={SelectAdapter_FwCanBo} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có cán bộ nhận' />
                        <FormSelect className='col-md-12' allowClear={true} label='Cán bộ ký' placeholder='Chọn cán bộ ký' ref={e => this.nguoiKy = e} data={SelectAdapter_FwCanBo} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có cán bộ ký' />
                        <FormSelect multiple={true} className='col-md-12' label='Bản lưu' placeholder='Chọn bản lưu' ref={e => this.banLuu = e} data={SelectAdapter_DmDonVi} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có bản lưu' />
                        <FormSelect className='col-md-12' label='Ngôn ngữ' placeholder='Chọn ngôn ngữ' ref={e => this.ngoaiNgu = e} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có ngôn ngữ' data={SelectAdapter_DmNgoaiNguV2} />
                        <FormRichTextBox type='text' className='col-md-12' ref={e => this.trichYeu = e} label='Trích yếu' readOnly={this.canReadOnly()} required readOnlyEmptyText='Chưa có trích yếu' />
                        {this.state.id && <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                            {(trangThaiCongVanDi.DA_PHAT_HANH.id == this.state.trangThai) && <>
                                <button type='submit' className='btn btn-success mr-2' onClick={e => { e.preventDefault(); this.taoHoSoModal.show(); }}>
                                    <i className='fa fa-plus'></i>Tạo hồ sơ
                                </button>
                                <button type='submit' className='btn btn-primary mr-2' onClick={e => { e.preventDefault(); this.themVaoHoSoModal.show(); }}>
                                    <i className='fa fa-arrow-up'></i>Thêm vào hồ sơ
                                </button>
                            </>
                            }
                        </div>}
                    </div>
                </div>
                <VanBanDiFileV2 ref={e => this.danhSachVanBan = e} getFile={this.props.getFile} id={this.state.id} isPhysical={true} status={this.state.trangThai} />

                {this.state.id && <LichSu onChangeSort={this.onChangeHistorySort} historySortType={this.state.historySortType} />}

                <EditModal ref={e => this.donViGuiNhanModal = e} permissions={dmDonViGuiCvPermission} create={this.onCreateDonViNhanNgoai} />
                <CreateModal ref={e => this.soDangKyModal = e} listDonVi={this.getListDonVi()} isHcthSelector={this.getListDonVi().includes(MA_HCTH) && currentPermissions.includes('hcthSoVanBan:write')} {...this.props} create={this.onCreateSo} inVanBanGiay={true} capVanBan={this.state.capVanBan} canReadOnly={this.canReadOnly()} />
                <CreateRequest ref={e => this.requestModal = e} {...this.props} create={this.onCreateRequest} inVanBan={true} />
                <TaoHoSoModal ref={e => this.taoHoSoModal = e} create={this.props.createHoSo} />
                <ThemVaoHoSoModal ref={e => this.themVaoHoSoModal = e} add={this.props.updateHoSo} vanBanId={this.state.id} loaiVanBan={loaiLienKet.VAN_BAN_DI.id} />
            </>),
            backRoute,
            onSave: !this.canReadOnly() && this.save,
            buttons: this.getButtons(),
        });
    }

}

const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi });
const mapActionsToProps = { formailtyAprrove, contentAprrove, getFile, createHcthCongVanDi, updateHcthCongVanDi, deleteHcthCongVanDi, getHcthCongVanDiSearchPage, deleteFile, getCongVanDi, createPhanHoi, getHistory, getPhanHoi, createDmDonViGuiCv, createCongVanTrinhKy, deleteCongVanTrinhKy, updateCongVanTrinhKy, createHoSo, updateHoSo, themVaoNhiemVu, ready, readyPaper, createSoTuDong, createSoNhapTay, createRequest, paperContentApprove };
export default connect(mapStateToProps, mapActionsToProps)(UserConvertPage);