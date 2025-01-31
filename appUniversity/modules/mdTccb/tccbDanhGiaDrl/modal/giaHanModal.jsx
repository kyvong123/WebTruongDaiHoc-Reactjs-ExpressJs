import React from 'react';
import { connect } from 'react-redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { AdminModal, FormTextBox, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';
import { SelectAdapter_FwStudentFilter } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { Tooltip } from '@mui/material';
import { createDrlGiaHanKhoa, getDrlGiaHanKhoaDssv, updateDrlGiaHanKhoa } from '../redux/danhGiaDrlRedux';

class GiaHanModal extends AdminModal {
    state = { dsSinhVien: [], id: null, thongTinDot: null, tinhTrang: null }
    onShow = (item) => {
        const { id, namHoc, hocKy, thongTinDot, tinhTrang, dsSinhVien = [] } = item ? item : { id: null, thongTinDot: null, namHoc: '', hocKy: '', tenDot: '', thoiGianGiaHan: '', tinhTrang: '' };
        this.setState({ id, thongTinDot, dsSinhVien, tinhTrang });
        dsSinhVien.length == 0 && this.props.getDrlGiaHanKhoaDssv(id, (data) => {
            this.setState({ dsSinhVien: data });
        });
        this.namHoc.value(namHoc || '');
        // this.thoiGianGiaHan.value(thoiGianGiaHan ? new Date(thoiGianGiaHan) : null);
        this.hocKy.value(hocKy || '');
        this.tenDot.value(thongTinDot.ten || '');
    };

    onSubmit = () => {
        const { thongTinDot, dsSinhVien, id } = this.state;
        const changes = {
            idDot: thongTinDot?.id || null,
            maKhoa: this.props.system.user.maDonVi,
            tinhTrang: 'N',
            dsSinhVien
        };
        if (id) {
            T.confirm('Gia hạn', 'Bạn có chắc muốn cập nhật đăng ký gia hạn thời gian đánh giá điểm rèn luyện', isConfirm => {
                if (isConfirm) {
                    this.props.updateDrlGiaHanKhoa(id, changes, () => {
                        this.hide();
                        this.props.onSubmited && this.props.onSubmited();
                    });
                }
            });
        } else {
            T.confirm('Gia hạn', 'Bạn có chắc muốn đăng ký gia hạn thời gian đánh giá điểm rèn luyện', isConfirm => {
                if (isConfirm) {
                    this.props.createDrlGiaHanKhoa(changes, () => {
                        this.hide();
                        this.props.onSubmited && this.props.onSubmited();
                    });
                }
            });
        }
    }

    onChangeStudent = (value) => {
        const user = this.props.system.user;
        const newDsSinhVien = [...this.state.dsSinhVien];
        if (newDsSinhVien.some(sv => sv.mssv == value.id)) {
            T.notify('Sinh viên đã tồn tại trong danh sách', 'danger');
            this.selectStudent.value(null);
        } else {
            if (user.staff.maDonVi != value.maKhoa) {
                T.notify('Sinh viên không thuộc khoa do bạn quản lý', 'danger');
                this.selectStudent.value(null);
            } else {
                newDsSinhVien.push({
                    mssv: value.id,
                    hoTen: value.hoTen,
                    maKhoa: value.maKhoa,
                    tenKhoa: value.tenKhoa,
                    heDaoTao: value.heDaoTao,
                    lop: value.lop,
                    tinhTrang: value.tinhTrang
                });
                this.setState({ dsSinhVien: newDsSinhVien }, () => {
                    this.selectStudent.value(null);
                });
            }
        }
    }

    deleteStudent = (mssv) => {
        let dsSinhVien = [...this.state.dsSinhVien];
        T.confirm('Xóa sinh viên', 'Bạn có chắc muốn xóa sinh viên ra khỏi danh sách ?', isConfirm => {
            if (isConfirm) {
                const index = dsSinhVien.findIndex(sv => sv.mssv == mssv);
                dsSinhVien[index] = { ...dsSinhVien[index], isDelete: 1 }; //Object mới với flag delete để đọc lập với dữ liệu truyền vào props
                // dsSinhVien = dsSinhVien.filter(sv => sv.mssv != mssv);
                this.setState({ dsSinhVien });
            }
        });
    }

    render = () => {
        const user = this.props.system.user;
        let table = renderTable({
            emptyTable: '',
            stickyHead: false,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            className: this.state.quickAction ? 'table-fix-col' : '',
            getDataSource: () => this.state.dsSinhVien.filter(sv => sv.isDelete != 1),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '10%' }}>MSSV</th>
                    <th style={{ width: '40%' }}>Họ và tên</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Lớp</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Hệ đào tạo</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.lop || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.heDaoTao || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tinhTrang || ''} />
                    <TableCell type='buttons' style={{}} content={item}>
                        <Tooltip title={'Loại bỏ'}>
                            <button className='btn btn-danger' type='button' onClick={() => this.deleteStudent(item.mssv)}>
                                <i className='fa fa-lg fa-trash' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });
        return this.renderModal({
            title: this.state.item && this.state.item.id ? 'Chỉnh sửa thông tin gia hạn đánh giá điểm rèn luyện cấp khoa' : 'Đăng ký gia hạn đánh giá điểm rèn luyện cấp khoa',
            size: 'elarge',
            body:
                <>
                    <div className='row'>
                        <FormTextBox ref={e => this.namHoc = e} className='col-md-4' label='Năm học' type='scholastic' required readOnly={true} />
                        <FormSelect ref={e => this.hocKy = e} className='col-md-4' label='Học kỳ' data={SelectAdapter_DtDmHocKy} required readOnly={true} />
                        <FormTextBox ref={e => this.tenDot = e} className='col-md-4' label='Tên đợt' required readOnly={true} />
                        {/* <FormDatePicker ref={e => this.thoiGianGiaHan = e} className='col-md-6' label='Thời gian gia hạn' required /> */}
                        <FormSelect ref={e => this.selectStudent = e} data={SelectAdapter_FwStudentFilter({ khoaFilter: user.staff.maDonVi })} className='col-md-12' label='Đề xuất sinh viên được gia hạn' onChange={value => this.onChangeStudent(value)} />
                    </div>
                    {/* {this.state.dsSinhVien.length && <div>
                        {table}
                    </div>} */}
                    <div>{table}</div>
                </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createDrlGiaHanKhoa, getDrlGiaHanKhoaDssv, updateDrlGiaHanKhoa };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(GiaHanModal);