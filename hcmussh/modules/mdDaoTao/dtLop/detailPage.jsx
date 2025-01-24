import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormCheckbox, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DangKyHocPhanStudent } from '../dtDangKyHocPhan/redux';
import ImportSvModal from './importSvModal';
import { getDtLopCommonPage, getDtLopData, updateDtLopData } from './redux';

const STATUS_MAPPER = {
    1: 'Còn học',
    2: 'Nghỉ học tạm thời',
    3: 'Buộc thôi học',
    4: 'Thôi học',
    6: 'Tốt nghiệp',
    7: 'Chuyển trường',
    9: 'Kỷ luật',
};

class DetailPage extends AdminPage {
    state = { dataLop: null, dsSinhVien: [], dsTuDong: [] }
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            let route = T.routeMatcher('/user/dao-tao/lop/detail/:maLop'),
                maLop = route.parse(window.location.pathname).maLop;
            this.props.getDtLopData(maLop, (data) => {
                this.setState({ dataLop: data, dsSinhVien: data.dsSinhVien.map(sv => ({ ...sv, isCheck: false })), dsTuDong: data.dsTuDong.map(sv => ({ ...sv, isCheck: false })) });
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
                this.props.updateDtLopData(dataLop.maLop, changes, () => {
                    this.props.getDtLopData(dataLop.maLop, (data) => {
                        this.setState({
                            dsSinhVien: data.dsSinhVien.map(
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

    addDsImport = (list) => {
        let { dsSinhVien, dsTuDong } = this.state;
        const newItems = list.filter(newSv => !dsSinhVien.some(sv => newSv.mssv == sv.mssv));
        dsTuDong = dsTuDong.filter(sv => !list.some(newSv => newSv.mssv == sv.mssv));
        this.setState({ dsSinhVien: [...dsSinhVien, ...newItems], dsTuDong });
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

    addSingleStudent = () => {
        const data = this.addSelectStudent.data(),
            { lop, tinhTrang } = data.item;
        const parts = data.text.split(':')[1].slice(1).split(' ');
        if (!this.state.dsSinhVien.some(item => item.mssv == data.id)) {
            T.confirm(lop ? 'Chuyển lớp sinh viên' : 'Thêm sinh viên vô lớp', lop ? ` Chuyển sinh viên từ lớp ${lop} đến lớp ${this.state.dataLop.maLop}` : 'Bạn có chắc muốn thêm sinh viên vô lớp ?', isConfirm => isConfirm && (
                this.setState({
                    dsSinhVien: [...this.state.dsSinhVien, {
                        mssv: data.id,
                        ten: parts.pop(),
                        ho: parts.join(' '),
                        tinhTrang
                    }]
                })
            ));
        } else {
            T.notify('Sinh viên đã có trong lớp này!', 'danger');
        }
    }

    render() {
        const permission = this.getUserPermission('dtLop');
        const { currentDataLop } = this.props.dtLop && this.props.dtLop.currentDataLop ? this.props.dtLop : { currentDataLop: { dsSinhVien: [], dsTuDong: [] } };
        const { dsSinhVien, dsTuDong, dataLop } = this.state;
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
                <TableCell content={STATUS_MAPPER[item.tinhTrang.toString()]} />
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
                <TableCell content={STATUS_MAPPER[item.tinhTrang.toString()]} />
                <TableCell permission={permission} type='buttons'>
                    <Tooltip title='Thêm' arrow>
                        <button className='btn btn-primary' onClick={e => { e.preventDefault(); this.addStudent(item.mssv); }}>
                            <i className='fa fa-lg fa-plus' />
                        </button>
                    </Tooltip>
                </TableCell>
            </tr>
        });
        return this.renderPage({
            subTitle: 'Danh sách sinh viên',
            title: 'Lớp sinh viên',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>
                    Đào tạo
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
                    <FormSelect className='mt-3' label='Chọn sinh viên để thêm vô lớp' placeholder='Chọn sinh viên' ref={e => this.addSelectStudent = e} data={SelectAdapter_DangKyHocPhanStudent} />
                    <button className='btn btn-success text-white' onClick={e => {
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
                <ImportSvModal ref={e => this.importModal = e} update={this.addDsImport} />
            </>,
            backRoute: '/user/dao-tao/lop',
            buttons: [
                {
                    icon: 'fa-save', className: 'btn-success', onClick: this.saveChange, tooltip: 'Lưu thay đổi'
                },
            ]
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, dtLop: state.daoTao.dtLop });
const mapActionsToProps = {
    getDtLopCommonPage, getDtLopData, updateDtLopData
};
export default connect(mapStateToProps, mapActionsToProps)(DetailPage);