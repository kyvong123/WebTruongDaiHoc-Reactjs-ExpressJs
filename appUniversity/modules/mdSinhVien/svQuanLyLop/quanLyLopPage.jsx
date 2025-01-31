// import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormSelect, getValue, renderTable, TableCell } from 'view/component/AdminPage';
import { getSvLtQuanLyLopData } from './redux';
import { SelectAdapter_FwStudentFilter } from 'modules/mdCongTacSinhVien/fwStudents/redux';
// import { SelectAdapter_FwStudent } from '../fwStudents/redux';

const STATUS_MAPPER = {
    1: 'Còn học',
    2: 'Nghỉ học tạm thời',
    3: 'Buộc thôi học',
    4: 'Thôi học',
    6: 'Tốt nghiệp',
    7: 'Chuyển trường',
    9: 'Kỷ luật',
};

// const POSITION_MAPPER = {
//     'CN': 'Giáo viên chủ nhiệm',
//     'LT': 'Lớp trưởng'
// };

class BanCanSuModal extends AdminModal {
    state = { doiTuong: null, maLop: null }
    onShow = (item, maLop) => {
        if (item) {
            this.setState({ doiTuong: item.maChucVu == 'CN' ? 'CB' : 'SV', maLop }, () => {
                this.userId.value(item.userId || '');
                this.maChucVu.value(item.maChucVu || '');
            });
        }
    }

    onSubmit = () => {
        const changes = {
            userId: getValue(this.doiTuong),
            maChucVu: getValue(this.maChucVu),
            maLop: this.state.maLop,
        };
        T.confirm('Cập nhật chức vụ', 'Bạn có chắc muốn gán đối tượng này với chức vụ', confirm => confirm && (
            this.state.id ? this.props.update(this.state.id, changes) : this.props.create(changes)
        ));
    }

    render = () => {
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật dữ liệu ban cán sự' : 'Thêm mới ban cán sự',
            body: (
                <div className='row'>
                    <FormSelect className='col-md-12' label='Sinh viên' ref={e => this.userId = e} data={SelectAdapter_FwStudentFilter({ lopFilter: this.state.maLop })} />
                    <FormSelect className='col-md-12' label='Chức vụ' ref={e => this.maChucVu = e} data={[{ id: 'LT', text: 'Lớp trưởng' }, { id: 'LP', text: 'Lớp phó' }]} />
                </div>
            ),
        });
    };
}

class DetailPage extends AdminPage {
    state = { dataLop: null, dsSinhVien: [], dsTuDong: [], dsBanCanSu: [] }
    componentDidMount() {
        T.ready('/user/lop-truong/quan-ly-lop', () => {
            this.props.getSvLtQuanLyLopData((data) => {
                this.setState({ dataLop: data, dsSinhVien: data.dsSinhVien.map(sv => ({ ...sv, isCheck: false })), dsTuDong: data.dsTuDong.map(sv => ({ ...sv, isCheck: false })), dsBanCanSu: data.dsBanCanSu });
            });
        });
    }

    deleteStudent = (mssv) => {
        T.confirm('Xóa sinh viên khỏi lớp này', 'Bạn có chắc bạn muốn xóa sinh viên này?', true, isConfirm => {
            if (isConfirm) {
                const { dsSinhVien } = this.state;
                const itemDelete = dsSinhVien.find(item => item.mssv == mssv);
                const dsNew = this.state.dsSinhVien.filter(sv => sv.mssv !== mssv);
                const dsTuDongNew = this.state.dsTuDong;
                dsTuDongNew.push(itemDelete);
                this.setState({ dsSinhVien: dsNew, dsTuDong: dsTuDongNew });
            }
        });
    }

    addStudent = (mssv) => {
        T.confirm('Thêm sinh viên vào lớp này', 'Bạn có chắc muốn thêm sinh viên này?', true, isConfirm => {
            if (isConfirm) {
                const { dsTuDong } = this.state;
                const addItem = dsTuDong.find(item => item.mssv == mssv);
                const dsTuDongNew = this.state.dsTuDong.filter(sv => sv.mssv !== mssv);
                const dsNew = this.state.dsSinhVien;
                dsNew.push(addItem);
                this.setState({ dsSinhVien: dsNew, dsTuDong: dsTuDongNew });
            }
        });
    }

    saveChange = () => {
        const { dataLop, dsSinhVien, dsTuDong } = this.state;
        const changes = {
            maLop: dataLop.maLop,
            dsSinhVien,
            dsTuDong
        };
        T.confirm('Lưu thay đổi', 'Bạn có chắc muốn lưu thay đổi với lớp này?', true, isConfirm => {
            if (isConfirm) {
                this.props.updateCtsvLopData(dataLop.maLop, changes, () => {
                    this.props.getCtsvLopData(dataLop.maLop, (data) => {
                        this.setState({
                            dataLop: data, dsSinhVien: data.dsSinhVien.map(
                                sv => ({ ...sv, isCheck: false })
                            ), dsTuDong: data.dsTuDong.map(
                                sv => ({ ...sv, isCheck: false })
                            )
                        });
                    });
                });
            }
        });
    }

    handleDsTuDongCheck = (mssv, value) => {
        const selected = this.state.dsTuDong;
        if (value) {
            selected.map(item => {
                if (item.mssv == mssv) {
                    item.isCheck = true;
                }
                return item;
            });
        } else {
            selected.map(item => {
                if (item.mssv == mssv) {
                    item.isCheck = false;
                }
                return item;
            });
        }
        this.setState({ dsTuDong: selected });
    }

    addDSMultiple = () => {
        const { dsSinhVien, dsTuDong } = this.state;
        const addItem = dsTuDong.filter(sv => sv.isCheck == true).map(sv => ({ ...sv, isCheck: false }));
        this.setState({ dsSinhVien: dsSinhVien.concat(addItem), dsTuDong: dsTuDong.filter(sv => sv.isCheck == false) });
    }

    addDsImport = (list) => {
        let { dsSinhVien, dsTuDong } = this.state;
        const newItems = list.filter(newSv => !dsSinhVien.some(sv => newSv.mssv == sv.mssv));
        dsTuDong = dsTuDong.filter(sv => !list.some(newSv => newSv.mssv == sv.mssv));
        this.setState({ dsSinhVien: [...dsSinhVien, ...newItems], dsTuDong });
    }

    render() {
        const { currentDataLop } = this.props.svLtQuanLyLop && this.props.svLtQuanLyLop.currentDataLop ? this.props.svLtQuanLyLop : { currentDataLop: { dsSinhVien: [], dsTuDong: [] } };
        const { dsSinhVien, dsBanCanSu } = this.state;
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
                {/* <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th> */}
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell content={item.mssv} />
                <TableCell content={item.ho + ' ' + item.ten} />
                <TableCell content={STATUS_MAPPER[item.tinhTrang.toString()]} />
                {/* <TableCell permission={permission} type='buttons'>
                    <Tooltip title='Xóa' arrow>
                        <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.deleteStudent(item.mssv); }}>
                            <i className='fa fa-lg fa-ban' />
                        </button>
                    </Tooltip>
                </TableCell> */}
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
                {/* <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th> */}
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell content={`${item.userId}: ${item.hoTen}`} />
                <TableCell content={item.tenChucVu} />
                {/* <TableCell permission={permission} type='buttons'>
                    {item.maChucVu != 'CN' && <Tooltip title='Thêm' arrow>
                        <button className='btn btn-primary' onClick={e => { e.preventDefault(); this.banCanSuModal.show(item, currentDataLop.maLop); }}>
                            <i className='fa fa-lg fa-edit' />
                        </button>
                    </Tooltip>}
                </TableCell> */}
            </tr>
        });
        return this.renderPage({
            subTitle: 'Danh sách sinh viên',
            title: 'Lớp sinh viên',
            breadcrumb: [
                <Link key={0} to='/user'>
                    Trang cá nhân
                </Link>,
                'Lớp chủ nhiệm',
            ],
            content: <>
                <div className='tile'>
                    <p className='tile-title'>Thông tin lớp sinh viên</p>
                    <div className='row'>
                        {currentDataLop && (
                            <>
                                <div className='col-md-4'>
                                    <span >Mã lớp: </span>
                                    <b >{currentDataLop.maLop || ''}</b><br /><br />
                                </div>
                                <div className='col-md-4'>
                                    <span >Mã ngành: </span>
                                    <b >{currentDataLop.maNganh || ''}</b><br /><br />
                                </div>
                                <div className='col-md-4'>
                                    <span >Mã chuyên ngành: </span>
                                    <b >{currentDataLop.maChuyenNganh || ''}</b><br /><br />
                                </div>
                                <div className='col-md-4'>
                                    <span >Niên khóa: </span>
                                    <b >{currentDataLop.nienKhoa || ''}</b><br /><br />
                                </div>
                                <div className='col-md-4'>
                                    <span >Năm học bắt đầu: </span>
                                    <b >{currentDataLop.namHocBatDau || ''}</b><br /><br />
                                </div>
                                <div className='col-md-4'>
                                    <span >Chương trình đào tạo: </span>
                                    <b >{currentDataLop.maCtdt || ''}</b><br /><br />
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className='tile'>
                    <div className='d-flex align-items-center justify-content-between'>
                        <p className='tile-title'>Thông tin ban cán sự</p>
                        {/* <button className='btn btn-primary text-white' onClick={e => {
                            e.preventDefault();
                            this.banCanSuModal.show(null, currentDataLop.maLop);
                        }}>Thêm ban cán sự mới</button> */}
                    </div>
                    {tableDsCanBoLop}
                </div>
                <div className='tile'>
                    <div className='row'>
                        <div className='col-md-12'>
                            <p className='tile-title'>Danh sách sinh viên hiện tại</p>
                            {tableDsHienTai}
                        </div>
                    </div>
                </div>
                {/* <ImportSinhVienModal ref={e => this.importModal = e} update={this.addDsImport} /> */}
                <BanCanSuModal ref={e => this.banCanSuModal = e} maLop={this.state.maLop} />
            </>,
            backRoute: '/user',
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, svLtQuanLyLop: state.student.svLtQuanLyLop });
const mapActionsToProps = {
    getSvLtQuanLyLopData
};
export default connect(mapStateToProps, mapActionsToProps)(DetailPage);