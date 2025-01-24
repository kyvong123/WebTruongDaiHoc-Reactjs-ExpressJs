import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormSelect, getValue, renderTable, TableCell } from 'view/component/AdminPage';
import { getTccbLopCommonPage, getTccbLopData, updateTccbLopData, createTccbDtLopBanCanSu, updateTccbDtLopBanCanSu, deleteTccbDtLopBanCanSu } from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmCanBoLop } from 'modules/mdCongTacSinhVien/svDmCanBoLop/redux';
import { SelectAdapter_FwStudentFilter } from 'modules/mdCongTacSinhVien/fwStudents/redux';

const STATUS_MAPPER = {
    1: 'Còn học',
    2: 'Nghỉ học tạm thời',
    3: 'Buộc thôi học',
    4: 'Thôi học',
    6: 'Tốt nghiệp',
    7: 'Chuyển trường',
    9: 'Kỷ luật',
};

class BanCanSuModal extends AdminModal {
    state = { id: null, doiTuong: null, maLop: null }
    onShow = (item, maLop) => {
        if (item) {
            this.setState({ doiTuong: item.maChucVu == 'CN' ? 'CB' : 'SV', maLop, id: item.id }, () => {
                this.userId.value(item.userId || '');
                this.maChucVu.value(item.maChucVu || '');
                this.doiTuong.value(item.maChucVu == 'CN' ? 'CB' : 'SV');
            });
        } else {
            this.setState({ maLop, doiTuong: null, id: null });
            this.userId.value(null);
            this.maChucVu.value(null);
            this.doiTuong.value(null);
        }
    }

    onSubmit = () => {
        const changes = {
            userId: getValue(this.userId),
            maChucVu: getValue(this.maChucVu),
            maLop: this.state.maLop,
        };
        T.confirm('Cập nhật chức vụ', 'Bạn có chắc muốn gán đối tượng này với chức vụ', confirm => confirm && (
            this.state.id ? this.props.update(this.state.id, changes, () => this.hide()) : this.props.create(changes, () => this.hide())
        ));
    }

    changeStudent = (value) => {
        if (!this.props.dsLop.some(item => item.mssv == value.id)) {
            T.notify('Sinh viên không thuộc về lớp này! Vui lòng chọn sinh viên khác.', 'danger');
            this.userId.value(null);
        }
    }

    render = () => {
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật dữ liệu ban cán sự' : 'Thêm mới ban cán sự',
            body: (
                <div className='row'>
                    <FormSelect className='col-md-12' label='Đối tượng' ref={e => this.doiTuong = e} data={[{ id: 'CB', text: 'Cán bộ' }, { id: 'SV', text: 'Sinh viên' }]} onChange={value => this.setState({ doiTuong: value.id }, () => { this.userId.value(null); this.maChucVu.value(null); })} readOnly={this.state.id != null ? true : ''} required />
                    <FormSelect className='col-md-12' label={this.state.doiTuong == 'CB' ? 'Cán bộ' : 'Sinh viên'} ref={e => this.userId = e} data={this.state.doiTuong == 'CB' ? SelectAdapter_FwCanBo : SelectAdapter_FwStudentFilter({ lopFilter: this.props.maLop })} onChange={this.state.doiTuong == 'CB' ? null : this.changeStudent} required />
                    <FormSelect className='col-md-12' label='Chức vụ' ref={e => this.maChucVu = e} data={SelectAdapter_DmCanBoLop(this.state.doiTuong)} required />
                </div>
            ),
        });
    };
}

class DetailPage extends AdminPage {
    state = { dataLop: null, dsSinhVien: [], dsTuDong: [], dsBanCanSu: [] }
    componentDidMount() {
        T.ready('/user/tccb', () => {
            let route = T.routeMatcher('/user/tccb/lop/detail/:maLop'),
                maLop = route.parse(window.location.pathname).maLop;
            this.props.getTccbLopData(maLop, (data) => {
                this.setState({ maLop, dataLop: data, dsSinhVien: data.dsSinhVien.map(sv => ({ ...sv, isCheck: false })), dsTuDong: data.dsTuDong.map(sv => ({ ...sv, isCheck: false })), dsBanCanSu: data.dsBanCanSu });
            });
        });
    }

    render() {
        const permission = this.getUserPermission('tccbLop', ['manage']);
        const { currentDataLop } = this.props.tccbLop && this.props.tccbLop.currentDataLop ? this.props.tccbLop : { currentDataLop: { dsSinhVien: [], dsTuDong: [] } };
        const { dsSinhVien, dsTuDong, dataLop, maLop } = this.state;
        const { dsBanCanSu } = currentDataLop;
        const tableDsHienTai = renderTable({
            emptyTable: 'Không có dữ liệu',
            stickyHead: true,
            header: 'thead-light',
            getDataSource: () => currentDataLop ? dsSinhVien : [],
            renderHead: () => <tr>
                <th style={{ width: 'auto' }}>STT</th>
                <th style={{ width: '20%' }}>MSSV</th>
                <th style={{ width: '50%' }}>Họ tên</th>
                <th style={{ width: '30%' }}>Tình trạng</th>
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell content={item.mssv} />
                <TableCell content={item.ho + ' ' + item.ten} />
                <TableCell content={STATUS_MAPPER[item.tinhTrang.toString()]} />
            </tr>
        });
        const tableDsTuDong = renderTable({
            emptyTable: 'Không có dữ liệu',
            stickyHead: true,
            header: 'thead-light',
            getDataSource: () => currentDataLop ? dsTuDong : [],
            renderHead: () => <tr>
                <th style={{ width: 'auto' }}>STT</th>
                <th style={{ width: '20%' }}>MSSV</th>
                <th style={{ width: '50%' }}>Họ tên</th>
                <th style={{ width: '30%' }}>Tình trạng</th>
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell content={item.mssv} />
                <TableCell content={item.ho + ' ' + item.ten} />
                <TableCell content={STATUS_MAPPER[item.tinhTrang.toString()]} />
            </tr>
        });

        const tableDsCanBoLop = renderTable({
            emptyTable: 'Không có dữ liệu',
            stickyHead: false,
            header: 'thead-light',
            getDataSource: () => currentDataLop ? dsBanCanSu : [],
            renderHead: () => <tr>
                <th style={{ width: 'auto' }}>STT</th>
                <th style={{ width: '50%' }}>Họ tên</th>
                <th style={{ width: '50%' }}>Chức vụ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell content={`${item.userId}: ${item.hoTen}`} />
                <TableCell content={item.tenChucVu} />
                <TableCell permission={permission} type='buttons'>
                    {permission.manage && <>
                        <Tooltip title='Thêm' arrow>
                            <button className='btn btn-primary' onClick={e => { e.preventDefault(); this.banCanSuModal.show(item, currentDataLop.maLop); }}>
                                <i className='fa fa-lg fa-edit' />
                            </button>
                        </Tooltip>
                        <Tooltip title='Hủy' arrow>
                            <button className='btn btn-danger' onClick={e => {
                                e.preventDefault();
                                T.confirm('Xóa ban cán sự', 'Bạn có chắc muốn xóa ban cán sự này?', isConfirm => isConfirm && this.props.deleteTccbDtLopBanCanSu(item.id, item.userId, currentDataLop.maLop, item.maChucVu));
                            }}>
                                <i className='fa fa-lg fa-ban' />
                            </button>
                        </Tooltip>
                    </>}
                </TableCell>
            </tr>
        });
        return this.renderPage({
            subTitle: 'Danh sách sinh viên',
            title: 'Lớp sinh viên',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>
                    Công tác sinh viên
                </Link>,
                'Chi tiết lớp sinh viên',
            ],
            content: <>
                <div className='tile'>
                    <p className='tile-title'>Thông tin lớp sinh viên</p>
                    <div className='row'>
                        {dataLop && (
                            <>
                                <div className='col-md-4'>
                                    <span >Mã lớp: </span>
                                    <b >{dataLop.maLop || ''}</b><br /><br />
                                </div>
                                <div className='col-md-4'>
                                    <span >Mã ngành: </span>
                                    <b >{dataLop.maNganh || ''}</b><br /><br />
                                </div>
                                <div className='col-md-4'>
                                    <span >Mã chuyên ngành: </span>
                                    <b >{dataLop.maChuyenNganh || ''}</b><br /><br />
                                </div>
                                <div className='col-md-4'>
                                    <span >Niên khóa: </span>
                                    <b >{dataLop.nienKhoa || ''}</b><br /><br />
                                </div>
                                <div className='col-md-4'>
                                    <span >Năm học bắt đầu: </span>
                                    <b >{dataLop.namHocBatDau || ''}</b><br /><br />
                                </div>
                                <div className='col-md-4'>
                                    <span >Chương trình đào tạo: </span>
                                    <b >{dataLop.maCtdt || ''}</b><br /><br />
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className='tile'>
                    <div className='d-flex align-items-center justify-content-between'>
                        <p className='tile-title'>Thông tin ban cán sự</p>
                        <button className='btn btn-primary text-white' onClick={e => {
                            e.preventDefault();
                            this.banCanSuModal.show(null, currentDataLop.maLop);
                        }}>Thêm ban cán sự mới</button>
                    </div>
                    {tableDsCanBoLop}
                </div>
                <div className='tile'>
                    <div className='row'>
                        <div className='col-md-6'>
                            <div className='d-flex align-items-center justify-content-between'>
                                <p className='tile-title'>Danh sách sinh viên hiện tại</p>
                                {/* <button className='btn btn-success text-white' onClick={(e) => e.preventDefault() || this.importModal.show()}>Tải lên DSSV</button> */}
                            </div>
                            {tableDsHienTai}
                        </div>
                        <div className='col-md-6'>
                            <div className='d-flex align-items-center justify-content-between'>
                                <p className='tile-title border-1 d-block'>Danh sách tự động (sinh viên chưa có lớp)</p>
                            </div>
                            {tableDsTuDong}
                        </div>
                    </div>
                </div>
                <BanCanSuModal ref={e => this.banCanSuModal = e} maLop={maLop} create={this.props.createTccbDtLopBanCanSu} update={this.props.updateTccbDtLopBanCanSu} dsLop={dsSinhVien} dsBanCanSu={dsBanCanSu} />
            </>,
            backRoute: '/user/tccb/lop',
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, tccbLop: state.tccb.tccbLop });
const mapActionsToProps = {
    getTccbLopCommonPage, getTccbLopData, updateTccbLopData, createTccbDtLopBanCanSu, updateTccbDtLopBanCanSu, deleteTccbDtLopBanCanSu
};
export default connect(mapStateToProps, mapActionsToProps)(DetailPage);