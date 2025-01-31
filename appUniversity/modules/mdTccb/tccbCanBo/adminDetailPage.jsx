import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    getStaffEdit, createStaff, updateStaff, downloadWord
} from './redux';
import { getDmQuanHeGiaDinhAll } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import ComponentCaNhan from './componentCaNhan';
import { AdminPage, CirclePageButton, FormTabs } from 'view/component/AdminPage';
import ComponentQuanHe from './componentQuanHe';
import ComponentTTCongTac from './componentTTCongTac';
import ComponentTrinhDo from './componentTrinhDo';
import ComponentCuTru from './componentCuTru';
import ComponentHopDong from './componentHopDong';
import ComponentChucVu from './componentChucVu';
import ComponentNghiViec from './componentNghiViec';
import Loading from 'view/component/Loading';
class CanBoPage extends AdminPage {
    shcc = null
    state = { item: null, create: false, load: true, lastModified: null }
    componentDidMount() {
        T.hideSearchBox();
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/staff/:shcc'),
                shcc = route.parse(window.location.pathname).shcc;
            this.shcc = shcc && shcc != 'new' ? shcc : null;
            if (this.shcc) {
                this.setState({
                    shcc: this.shcc
                });
                this.props.getStaffEdit(this.shcc, data => {
                    if (data.error || !data.item) {
                        T.notify('Lấy thông tin cán bộ bị lỗi!', 'danger');
                    }
                    else {
                        this.setState({ lastModified: data.item.lastModified, staff: data.item });
                        this.setUp(data.item);
                    }
                });
            } else {
                this.setState({
                    create: true,
                    load: false
                });
            }
        });
    }

    downloadWord = (e, type) => {
        e.preventDefault();
        this.shcc && this.props.downloadWord(this.shcc, type, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), this.shcc + '_' + type + '.docx');
        });
    }

    setUp = (item) => {
        this.componentCaNhan?.value(item);
        this.componentTTCongTac?.value(item);
        this.componentTrinhDo?.value(item);
        this.componentCuTru?.value(item);
        this.setState({ load: false, phai: item.phai });
    }

    save = () => {
        const caNhanData = this.componentCaNhan.getAndValidate();
        const congTacData = this.componentTTCongTac?.getAndValidate() || {};
        const trinhDoData = this.componentTrinhDo?.getAndValidate() || {};
        const cuTruData = this.componentCuTru.getAndValidate() || {};
        if (this.shcc) {
            caNhanData && congTacData && trinhDoData && cuTruData && this.props.updateStaff(this.shcc, { ...caNhanData, ...congTacData, ...trinhDoData, ...cuTruData });
        } else {
            caNhanData && congTacData && trinhDoData && cuTruData && this.props.createStaff({ ...caNhanData, ...congTacData, ...trinhDoData, ...cuTruData }, () => this.props.history.push('/user/tccb/staff'));
        }
    }

    render() {
        const permission = this.getUserPermission('staff');
        return this.renderPage({
            icon: 'fa fa-address-card-o',
            title: 'Hồ sơ cá nhân',
            subTitle: <span>Chỉnh sửa lần cuối lúc <span style={{ color: 'blue' }}>{this.state.lastModified ? T.dateToText(this.state.lastModified) : ''}</span></span>,
            breadcrumb: [
                <Link key={0} to='/user/staff'>Cán bộ</Link>,
                'Hồ sơ cá nhân',
            ],
            content: <>
                {this.state.load && <Loading />}
                <FormTabs
                    tabs={[
                        { title: 'Lý lịch cá nhân', component: <ComponentCaNhan ref={e => this.componentCaNhan = e} readOnly={!permission.write} shcc={this.state.shcc} /> },
                        { title: 'Thông tin cư trú', component: <ComponentCuTru ref={e => this.componentCuTru = e} readOnly={!permission.write} /> },
                        { title: 'Quan hệ gia đình', component: !this.state.create && <ComponentQuanHe ref={e => this.componentQuanHe = e} shcc={this.state.shcc} phai={this.state.phai} permission={permission} /> },
                        { title: 'Công tác', component: !this.state.create && <ComponentTTCongTac ref={e => this.componentTTCongTac = e} shcc={this.state.shcc} permission={permission} /> },
                        { title: 'Trình độ', component: !this.state.create && <ComponentTrinhDo ref={e => this.componentTrinhDo = e} shcc={this.state.shcc} permission={permission} canEdit={true} /> },
                        { title: 'Hợp đồng', component: !this.state.create && <ComponentHopDong ref={e => this.componentHopDong = e} shcc={this.state.shcc} permission={permission} /> },
                        {
                            title: 'Chức vụ', component: !this.state.create && <ComponentChucVu ref={e => this.componentChucVu = e} shcc={this.state.shcc} permission={permission}
                                danhSachChucVu={this.props.staff?.dataStaff?.chucVuChinhQuyen.concat(this.props.staff?.dataStaff?.chucVuDoanThe) || []} chucVuHienTai={this.props.staff?.dataStaff?.chucVuHienTai} />
                        },
                        {
                            title: 'Nghỉ việc', component: !this.state.create && <ComponentNghiViec ref={e => this.componentNghiViec = e} shcc={this.state.shcc} permission={permission}
                                danhSachNghiViec={this.props.staff?.dataStaff?.qtNghiViec || []} nghiViecHienTai={this.props.staff?.dataStaff?.qtNghiViecHienTai} />
                        }
                    ]}
                />
                {permission.write && <CirclePageButton type='custom' tooltip='Tải về lý lịch viên chức (2019)' customIcon='fa-file-word-o' customClassName='btn-warning' style={{ marginRight: '125px' }} onClick={e => this.downloadWord(e, 'vc')} />}
                {permission.write && <CirclePageButton type='custom' tooltip='Tải về lý lịch công chức (2008)' customIcon='fa-file-word-o' customClassName='btn-primary' style={{ marginRight: '65px' }} onClick={e => this.downloadWord(e, 'cc')} />}
                {permission.write && <CirclePageButton type='custom' tooltip='Lưu thay đổi' customIcon='fa-save' customClassName='btn-success' style={{ marginRight: '5px' }} onClick={this.save} />}
            </>,
            backRoute: '/user/tccb/staff',
        });
    }

}

const mapStateToProps = state => ({ system: state.system, staff: state.tccb.staff });
const mapActionsToProps = {
    getStaffEdit, updateStaff, createStaff, getDmQuanHeGiaDinhAll, downloadWord
};
export default connect(mapStateToProps, mapActionsToProps)(CanBoPage);