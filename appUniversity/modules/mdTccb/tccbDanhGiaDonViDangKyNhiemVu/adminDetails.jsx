import React from 'react';
import { connect } from 'react-redux';
import { getDmDonVi, SelectAdapter_DmDonViFilter } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getTccbDonViDangKyNhiemVuByYear, createTccbDonViDangKyNhiemVu, updateTccbDonViDangKyNhiemVu, deleteTccbDonViDangKyNhiemVu } from './redux';
import { AdminPage, renderTable, TableCell, AdminModal, FormRichTextBox, FormEditor, FormSelect } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class EditModal extends AdminModal {
    componentDidMount() {
        this.disabledClickOutside();
        $(document).ready(() => this.onShown(() =>
            this.dangKyKpi.focus()
        ));
    }

    onShow = (item) => {
        this.dangKyKpi.value(item.dangKyKpi || '');
        this.dienGiai.value(item.dienGiai || '');
        this.setState({ item });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            dangKyKpi: this.dangKyKpi.value(),
            dienGiai: this.dienGiai.value(),
        };
        if (changes.dangKyKpi == '') {
            T.notify('Nội dung đăng ký bị trống', 'danger');
            this.dangKyKpi.focus();
        } else {
            if (this.state.item.id) {
                this.props.update(this.state.item.id, changes, this.hide);
            } else {
                this.props.create({
                    ...changes,
                    maKhungDanhGiaDonVi: this.state.item.maKhungDanhGiaDonVi,
                    maDonVi: this.props.maDonVi,
                    nam: Number(this.state.item.nam),
                }, this.hide);
            }
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Thông tin đăng ký',
            size: 'elarge',
            isShowSubmit: !readOnly,
            body: <div className='row'>
                <FormEditor className='col-12 col-sm-12' ref={e => this.dangKyKpi = e} label='Đăng ký KPI' height='400px' readOnly={readOnly} />
                <FormRichTextBox type='text' ref={e => this.dienGiai = e} label='Diễn giải' className='col-12' readOnly={readOnly} />
            </div>
        });
    }
}

class TccbDonViDangKyNhiemVuDetails extends AdminPage {
    state = { listDonViQuanLy: [] };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/danh-gia/don-vi-dang-ky-nhiem-vu/:nam');
            let listDonViQuanLy = this.props.system && this.props.system.user.staff && this.props.system.user.staff.donViQuanLy ? this.props.system.user.staff.donViQuanLy : [];
            if (listDonViQuanLy.length == 0) {
                listDonViQuanLy.push({ maDonVi: this.props.system.user.maDonVi, isManager: true });
            }
            this.nam = Number(route.parse(window.location.pathname)?.nam);
            this.getData(listDonViQuanLy.filter(item => item.isManager).map(item => item.maDonVi));
        });
    }

    getData = (listDonVi, maDonVi = listDonVi[0]) => {
        this.setState({ listDonVi, maDonVi });
        this.props.getTccbDonViDangKyNhiemVuByYear(this.nam, maDonVi, data => {
            this.setState({ items: data.items, danhGiaNam: data.danhGiaNam }, () => {
                this.setData(maDonVi);
            });
        });
    }

    setData = (maDonVi) => {
        this.donVi.value(maDonVi);
    }

    load = (nam, done) => {
        this.props.getTccbDonViDangKyNhiemVuByYear(nam, this.state.maDonVi, (data) => {
            this.setState({ items: data.items, danhGiaNam: data.danhGiaNam });
            done && done();
        });
    }

    create = (item, done) => this.props.createTccbDonViDangKyNhiemVu(item, () => this.load(this.nam, done));

    update = (id, changes, done) => this.props.updateTccbDonViDangKyNhiemVu(id, changes, () => this.load(this.nam, done));

    delete = (e, item) => {
        e.preventDefault();
        if (item.id) {
            T.confirm('Xóa đăng ký', 'Bạn có chắc bạn muốn xóa đăng ký này?', true, isConfirm =>
                isConfirm && this.props.deleteTccbDonViDangKyNhiemVu(item.id, () => this.load(this.nam)));
        } else {
            T.notify('Bạn chưa đăng ký KPI ở mục này', 'danger');
        }
    }

    render() {
        const permission = this.getUserPermission('tccbDonViDangKyNhiemVu');
        const list = this.state?.items || [];
        const danhGiaNam = this.state?.danhGiaNam || null;
        permission.write = permission.write && danhGiaNam && (danhGiaNam.donViBatDauDangKy <= new Date().getTime() && new Date().getTime() <= danhGiaNam.donViKetThucDangKy);
        let table = renderTable({
            emptyTable: 'Không có dữ liệu đăng ký',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Nhiệm vụ</th>
                    <th style={{ width: '60%', textAlign: 'center', whiteSpace: 'nowrap' }}>Đăng ký KPI</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Diễn giải</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <React.Fragment key={index}>
                    <tr>
                        <TableCell style={{ textAlign: 'center' }} colSpan='1' className='text-primary' content={<b>{(index + 1).intToRoman()}</b>} />
                        <TableCell style={{ textAlign: 'left' }} colSpan='4' className='text-primary' content={<b>{item.noiDung}</b>} />
                    </tr>
                    {
                        item.submenus.length > 0 &&
                        item.submenus.map((menu, stt) => (
                            <tr key={index + '_' + stt}>
                                <TableCell style={{ textAlign: 'center' }} content={stt + 1} />
                                <TableCell style={{ textAlign: 'left' }} content={menu.noiDung} />
                                <TableCell style={{ textAlign: 'left' }} content={<p dangerouslySetInnerHTML={{ __html: menu.dangKyKpi }} />} />
                                <TableCell style={{ textAlign: 'left', whiteSpace: 'pre-wrap' }} content={menu.dienGiai} />
                                <TableCell style={{ textAlign: 'center' }} type='buttons' content={menu} permission={permission} onEdit={() => this.modal.show(menu)}
                                    onDelete={(e) => danhGiaNam && (danhGiaNam.donViBatDauDangKy <= new Date().getTime() && new Date().getTime() <= danhGiaNam.donViKetThucDangKy) ? this.delete(e, menu) : T.notify('Hết thời hạn đăng ký', 'danger')}
                                />
                            </tr>
                        ))
                    }
                </React.Fragment>
            )
        });

        return this.renderPage({
            icon: 'fa fa-pencil',
            header: <FormSelect style={{ width: '300px', marginBottom: '0' }} placeholder='Danh sách đơn vị' ref={e => this.donVi = e} onChange={value => this.getData(this.state.listDonVi, value.id)} data={SelectAdapter_DmDonViFilter(this.state.listDonVi)} />,
            title: `Thông tin đăng ký năm: ${this.nam}`,
            breadcrumb: [
                <Link key={0} to='/user'>Thông tin cá nhân</Link>,
                <Link key={1} to='/user/danh-gia/don-vi-dang-ky-nhiem-vu'>Đăng ký nhiệm vụ cho đơn vị</Link>,
                'Thông tin đăng ký'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.create}
                    update={this.update}
                    maDonVi={this.state.maDonVi}
                    readOnly={!permission.write} />
            </>,
            backRoute: '/user/danh-gia/don-vi-dang-ky-nhiem-vu',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbDonViDangKyNhiemVuByYear, createTccbDonViDangKyNhiemVu, updateTccbDonViDangKyNhiemVu, deleteTccbDonViDangKyNhiemVu, getDmDonVi };
export default connect(mapStateToProps, mapActionsToProps)(TccbDonViDangKyNhiemVuDetails);