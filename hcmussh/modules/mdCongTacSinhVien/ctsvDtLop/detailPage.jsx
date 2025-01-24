import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormCheckbox, FormSelect, getValue, renderTable, TableCell } from 'view/component/AdminPage';
import { getCtsvLopCommonPage, getCtsvLopData, updateCtsvLopData, createCtsvDtLopBanCanSu, updateCtsvDtLopBanCanSu, deleteCtsvDtLopBanCanSu } from './redux';
import ImportSinhVienModal from './importSvModal';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_FwStudentFilter, SelectAdapter_FwStudentsManageForm } from '../fwStudents/redux';
import { SelectAdapter_DmCanBoLop } from 'modules/mdCongTacSinhVien/svDmCanBoLop/redux';

// const STATUS_MAPPER = {
//     1: 'Còn học',
//     2: 'Nghỉ học tạm thời',
//     3: 'Buộc thôi học',
//     4: 'Thôi học',
//     6: 'Tốt nghiệp',
//     7: 'Chuyển trường',
//     9: 'Kỷ luật',
// };

// const POSITION_MAPPER = {
//     'CN': 'Giáo viên chủ nhiệm',
//     'LT': 'Lớp trưởng',
//     'LP': 'Lớp phó'
// };

class BanCanSuModal extends AdminModal {
    state = { id: null, doiTuong: null, maLop: null }
    onShow = (item, maLop) => {
        if (item) {
            this.setState({ doiTuong: item.doiTuong, maLop, id: item.id }, () => {
                this.userId.value(item.userId || '');
                this.maChucVu.value(item.maChucVu || '');
                this.doiTuong.value(item.doiTuong);
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
        // const dataChucVu = [
        //     { id: 'CN', text: 'Giáo viên chủ nhiệm' },
        //     { id: 'LT', text: 'Lớp trưởng' },
        //     { id: 'LP', text: 'Lớp phó' },
        //     { id: 'BT', text: 'Bí thư (Đoàn)' },
        //     { id: 'PBT', text: 'Phó bí thư (Đoàn)' },
        //     { id: 'UVBCH', text: 'Ủy viên BCH (Đoàn)' },
        //     { id: 'CHT', text: 'Chi hội trưởng (Hội sinh viên)' },
        //     { id: 'CHP', text: 'Chi hội phó (Hội sinh viên)' },
        //     { id: 'UVBCH-HSV', text: 'Ủy viên BCH (Hội sinh viên)' },
        // ];
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
        T.ready('/user/ctsv', () => {
            let route = T.routeMatcher('/user/ctsv/lop/detail/:maLop'),
                maLop = route.parse(window.location.pathname).maLop;
            this.props.getCtsvLopData(maLop, (data) => {
                this.setState({ maLop, dataLop: data, dsSinhVien: data.dsSinhVien.map(sv => ({ ...sv, isCheck: false })), dsTuDong: data.dsTuDong.map(sv => ({ ...sv, isCheck: false })), dsBanCanSu: data.dsBanCanSu });
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

    addSingleStudent = () => {
        const data = this.addSelectStudent.data();
        const parts = data.text.split(':')[1].slice(1).split(' ');
        if (!this.state.dsSinhVien.some(item => item.mssv == data.id)) {
            T.confirm(data.lop ? 'Chuyển lớp sinh viên' : 'Thêm sinh viên vô lớp', data.lop ? ` Chuyển sinh viên từ lớp ${data.lop} đến lớp ${this.state.dataLop.maLop}` : 'Bạn có chắc muốn thêm sinh viên vô lớp ?', isConfirm => isConfirm && (
                this.setState({
                    dsSinhVien: [...this.state.dsSinhVien, {
                        mssv: data.id,
                        ten: parts.pop(),
                        ho: parts.join(' '),
                        tinhTrang: data.tinhTrangHienTai
                    }]
                })
            ));

        } else {
            T.notify('Sinh viên đã có trong lớp này!', 'danger');
        }
    }

    render() {
        const permission = this.getUserPermission('ctsvLop');
        const { currentDataLop } = this.props.ctsvLop && this.props.ctsvLop.currentDataLop ? this.props.ctsvLop : { currentDataLop: { dsSinhVien: [], dsTuDong: [] } };
        const { dsSinhVien, dsTuDong, dataLop } = this.state;
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
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell content={item.mssv} />
                <TableCell content={item.ho + ' ' + item.ten} />
                {/* <TableCell content={STATUS_MAPPER[item.tinhTrang.toString()]} /> */}
                <TableCell content={item.tenTinhTrang} />
                <TableCell permission={permission} type='buttons'>
                    <Tooltip title='Xóa' arrow>
                        <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.deleteStudent(item.mssv); }}>
                            <i className='fa fa-lg fa-ban' />
                        </button>
                    </Tooltip>
                </TableCell>
            </tr>
        });
        const tableDsTuDong = renderTable({
            emptyTable: 'Không có dữ liệu',
            stickyHead: true,
            header: 'thead-light',
            getDataSource: () => currentDataLop ? dsTuDong : [],
            renderHead: () => <tr>
                <th style={{ width: 'auto' }}>STT</th>
                <th><FormCheckbox ref={e => this.selectAll = e} onChange={value => {
                    if (value) {
                        this.setState({ dsTuDong: this.state.dsTuDong.map(item => ({ ...item, isCheck: true })) });
                    } else {
                        this.setState({ dsTuDong: this.state.dsTuDong.map(item => ({ ...item, isCheck: false })) });
                    }
                }} style={{ marginBottom: '0' }} /></th>
                <th style={{ width: '20%' }}>MSSV</th>
                <th style={{ width: '50%' }}>Họ tên</th>
                <th style={{ width: '30%' }}>Tình trạng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell type='checkbox' isCheck content={item.isCheck} onChanged={(value) => this.handleDsTuDongCheck(item.mssv, value)} permission={{ write: true }} />
                <TableCell content={item.mssv} />
                <TableCell content={item.ho + ' ' + item.ten} />
                {/* <TableCell content={STATUS_MAPPER[item.tinhTrang.toString()]} /> */}
                <TableCell content={item.tenTinhTrang} />
                <TableCell permission={permission} type='buttons'>
                    <Tooltip title='Thêm' arrow>
                        <button className='btn btn-primary' onClick={e => { e.preventDefault(); this.addStudent(item.mssv); }}>
                            <i className='fa fa-lg fa-plus' />
                        </button>
                    </Tooltip>
                </TableCell>
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
                    <Tooltip title='Thêm' arrow>
                        <button className='btn btn-primary' onClick={e => { e.preventDefault(); this.banCanSuModal.show(item, currentDataLop.maLop); }}>
                            <i className='fa fa-lg fa-edit' />
                        </button>
                    </Tooltip>
                    <Tooltip title='Hủy' arrow>
                        <button className='btn btn-danger' onClick={e => {
                            e.preventDefault();
                            T.confirm('Xóa ban cán sự', 'Bạn có chắc muốn xóa ban cán sự này?', isConfirm => isConfirm && this.props.deleteCtsvDtLopBanCanSu(item.id, item.userId, currentDataLop.maLop, item.maChucVu));
                        }}>
                            <i className='fa fa-lg fa-ban' />
                        </button>
                    </Tooltip>
                </TableCell>
            </tr>
        });
        return this.renderPage({
            subTitle: 'Danh sách sinh viên',
            title: 'Lớp sinh viên',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>
                    Công tác sinh viên
                </Link>,
                <Link key={1} to='/user/ctsv/lop'>
                    Năm học và Hệ
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
                    <FormSelect label='Chọn sinh viên để thêm vô lớp' className='mt-3' placeholder='Chọn sinh viên' ref={e => this.addSelectStudent = e} data={SelectAdapter_FwStudentsManageForm} />
                    <button className='btn btn-success text-white mr-2' onClick={e => {
                        e.preventDefault();
                        this.addSingleStudent();
                    }}>Thêm vào lớp</button>
                </div>
                <div className='tile'>
                    <div className='row'>
                        <div className='col-md-6'>
                            <div className='d-flex align-items-center justify-content-between'>
                                <p className='tile-title'>Danh sách sinh viên hiện tại</p>
                                <button className='btn btn-success text-white' onClick={(e) => e.preventDefault() || this.importModal.show()}>Tải lên DSSV</button>
                            </div>
                            {tableDsHienTai}
                        </div>
                        <div className='col-md-6'>
                            <div className='d-flex align-items-center justify-content-between'>
                                <p className='tile-title border-1 d-block'>Danh sách tự động (sinh viên chưa có lớp)</p>
                                <button className='btn btn-success text-white' onClick={e => {
                                    e.preventDefault();
                                    T.confirm('Thêm sinh viên', 'Bạn có chắc muốn thêm sinh viên được chọn vào lớp?', confirmed => confirmed && this.addDSMultiple());
                                }}>Thêm vào lớp</button>
                            </div>
                            {tableDsTuDong}
                        </div>
                    </div>
                </div>
                <ImportSinhVienModal ref={e => this.importModal = e} update={this.addDsImport} />
                <BanCanSuModal ref={e => this.banCanSuModal = e} maLop={this.state.maLop} create={this.props.createCtsvDtLopBanCanSu} update={this.props.updateCtsvDtLopBanCanSu} dsLop={dsSinhVien} />
            </>,
            backRoute: `/user/ctsv/lop/item?khoa=${currentDataLop.khoaSinhVien}&heDaoTao=${currentDataLop.heDaoTao}`,
            buttons: [
                {
                    icon: 'fa-save', className: 'btn-success', onClick: this.saveChange, tooltip: 'Lưu thay đổi'
                },
            ]
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, ctsvLop: state.ctsv.ctsvLop });
const mapActionsToProps = {
    getCtsvLopCommonPage, getCtsvLopData, updateCtsvLopData, createCtsvDtLopBanCanSu, updateCtsvDtLopBanCanSu, deleteCtsvDtLopBanCanSu
};
export default connect(mapStateToProps, mapActionsToProps)(DetailPage);