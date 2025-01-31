import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormSelect, TableCell, TableHead, renderDataTable } from 'view/component/AdminPage';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { dtAssignRoleNhapDiemGetData, createDtAssignRoleNhapDiem, createDtAssignRoleNhapDiemDefault, deleteDtAssignRoleNhapDiem } from './redux';
import { SelectAdapter_DtFwCanBoWithDonVi } from 'modules/mdDaoTao/dtAssignRole/redux';
import { SelectAdapter_DmDonViByMonHoc, SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { Tooltip } from '@mui/material';
import Pagination from 'view/component/Pagination';


class AddGiangVienModal extends AdminModal {
    state = { listData: [], listCanBo: [], filter: { isNhapDiem: 1 } }

    componentDidMount() {
        this.onHidden(() => {
            this.setState({ listData: [], listCanBo: [], filter: { isNhapDiem: 1 } });
            this.canBo.value('');
            this.donVi.value('');
        });
        this.disabledClickOutside();
    }

    onShow = (item) => {
        let listData = [];
        const { dataAssignRole } = this.props;
        if (Array.isArray(item)) {
            listData = dataAssignRole.filter((_, index) => item.includes(index));
        } else {
            listData.push(item);
        }
        this.setState({ listData });
    }

    onSubmit = () => {
        const { listData, listCanBo } = this.state;
        T.confirm('Phân quyền nhập điểm', 'Bạn chắc chắn muốn phân quyền nhập điểm cho các cán bộ không!', 'warning', 'true', isConfirm => {
            if (isConfirm) {
                T.alert('Đang thực thi phân quyền. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.createDtAssignRoleNhapDiem({ listData, listCanBo }, () => {
                    this.props.handleSave(() => {
                        T.alert('Phân quyền nhập điểm thành công', 'success', false, 1000);
                        this.hide();
                    });
                });
            }
        });
    }

    renderListChosen = (data) => renderDataTable({
        data,
        divStyle: { height: '50vh' },
        stickyHead: data && data.length > 10,
        renderHead: () => {
            return <tr>
                <TableHead content='#' style={{ width: 'auto', verticalAlign: 'middle' }} />
                <TableHead content='Mã học phần' style={{ width: '30%', verticalAlign: 'middle' }} />
                <TableHead content='Tên học phần' style={{ width: '40%', verticalAlign: 'middle' }} />
                <TableHead content='Ca thi' style={{ width: '30%', verticalAlign: 'middle' }} />
            </tr>;
        },
        renderRow: (item, index) => {
            return <tr key={`${item.maHocPhan}}_${index}`}>
                <TableCell content={index + 1} />
                <TableCell content={item.maHocPhan} />
                <TableCell content={JSON.parse(item.tenMonHoc)?.vi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.idExam ? <>
                    {`Ca thi: ${item.caThi}`}<br />
                    {`Phòng: ${item.phong}`}<br />
                    {`Ngày: ${T.dateToText(parseInt(item.batDau))}`}
                </> : ''} />
            </tr>;
        }
    });

    renderListCanBo = (data) => renderDataTable({
        data,
        divStyle: { height: '50vh' },
        stickyHead: data && data.length > 10,
        renderHead: () => {
            return <tr>
                <TableHead content='#' style={{ width: 'auto', verticalAlign: 'middle' }} />
                <TableHead content='SHCC' style={{ width: '20%', verticalAlign: 'middle' }} />
                <TableHead content='Tên cán bộ' style={{ width: '40%', verticalAlign: 'middle' }} />
                <TableHead content='Email' style={{ width: '40%', verticalAlign: 'middle' }} />
                <TableHead content='Thao tác' style={{ width: 'auto', verticalAlign: 'middle' }} />
            </tr>;
        },
        renderRow: (item, index) => {
            const { listCanBo } = this.state;
            return <tr key={`listCanBo${index}`}>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.shcc} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.email} />
                <TableCell content={item} type='buttons' permission={{ delete: true }} onDelete={() => this.setState({ listCanBo: listCanBo.filter(i => i.shcc != item.shcc) })} />
            </tr>;
        }
    });

    render = () => {
        const { listData, filter, listCanBo } = this.state;

        return this.renderModal({
            title: 'Phân quyền cán bộ nhập điểm',
            size: 'elarge',
            isShowSubmit: listData.length && listCanBo.length,
            body: <div className='row'>
                <FormSelect className='col-md-6' ref={e => this.donVi = e} data={SelectAdapter_DmDonViByMonHoc(true)} label='Đơn vị' allowClear onChange={value => this.setState({ filter: value ? { ...filter, listDonVi: [value.id].toString() } : { isNhapDiem: 1 } }, () => this.canBo.value(''))} />
                <FormSelect className='col-md-6' ref={e => this.canBo = e} data={SelectAdapter_DtFwCanBoWithDonVi(filter)} label='Cán bộ' onChange={value => {
                    const { shcc, email, ho, ten } = value.data;
                    this.setState({ listCanBo: !listCanBo.length || listCanBo.find(i => i.shcc != shcc) ? [...listCanBo, { shcc, hoTen: ho + ' ' + ten, email }] : listCanBo });
                }} />
                <div className='col-md-6'>
                    <h3>Danh sách học phần chọn</h3>
                    {this.renderListChosen(listData)}
                </div>
                <div className='col-md-6'>
                    <h3>Danh sách người chấm điểm</h3>
                    {this.renderListCanBo(listCanBo)}
                </div>
            </div>
        });
    }
}

class AssignRolePage extends AdminPage {
    state = { dataAssignRole: [], listChosen: [] }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.showAdvanceSearch();
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester,
                    { maDonVi } = this.props.system.user;
                this.namFilter.value(namHoc);
                this.hocKyFilter.value(hocKy);
                this.khoaSinhVienFilter.value(parseInt(namHoc));
                this.loaiHinhDaoTaoFilter.value('CQ');
                this.khoaDangKyFilter.value(maDonVi || '');
                this.kyThiFilter.value('QT');
                this.setState({
                    filter: { ...this.state.filter, namHoc, hocKy, khoaSinhVien: parseInt(namHoc), loaiHinhDaoTao: 'CQ', kyThi: 'QT', searchTerm: '', khoaDangKy: maDonVi }
                }, () => {
                    T.alert('Đang lấy dữ liệu!', 'warning', false, null, true);
                    this.getData(1, 25, () => T.alert('Lấy dữ liệu thành công', 'success', false, 1000));
                });
            });
        });
    }

    getData = (pageN, pageS, done) => {
        const { filter } = this.state;

        this.props.dtAssignRoleNhapDiemGetData(pageN, pageS, filter, data => {
            this.setState({ dataAssignRole: data.filter(i => i.thanhPhan && (filter.kyThi == 'QT' ? i.thanhPhan != 'CK' : i.thanhPhan == 'CK')), listChosen: [] }, () => done && typeof done === 'function' && done());
        });
    }

    handleChange = (value, key, pageNumber, pageSize) => {
        this.setState({ filter: { ...this.state.filter, [key]: value } }, () => {
            this.getData(pageNumber, pageSize);
        });
    }

    renderGiangVien = (item) => {
        const roleNhapDiem = item.roleNhapDiem.filter(i => i.idExam ? (i.idExam == item.idExam) : (i.kyThi == item.thanhPhan)),
            listTenGv = roleNhapDiem.length ? roleNhapDiem.map(role => role.tenGiangVien) : [];

        return (listTenGv.length ? listTenGv.map((i, idx) => <div key={idx}>{i}</div>) : '');
    }

    handleKeySearch = (data) => {
        const { filter } = this.state,
            [key, value] = data.split(':');

        this.setState({ filter: { ...filter, [key]: value } }, () => {
            this.getData();
        });
    }

    handleInitDefault = () => {
        const { namHoc, hocKy, loaiHinhDaoTao, khoaSinhVien, khoaDangKy } = this.state.filter;
        T.confirm('Gán mặc định giảng viên', 'Thao tác này sẽ cập nhật lại mặc định giảng viên nhập điểm và xóa các điểm đã được nhập bởi các giảng viên hiện tại. Bạn có chắc chắn muốn thực hiện không!', 'warning', 'true', isConfirm => {
            if (isConfirm) {
                this.props.createDtAssignRoleNhapDiemDefault({ namHoc, hocKy, loaiHinhDaoTao, khoaSinhVien, khoaDangKy });
            }
        });
    }

    handleDelete = (list) => {
        T.confirm('Xóa giảng viên', 'Thao tác này sẽ xóa giảng viên nhập điểm. Bạn có chắc chắn muốn thực hiện không!', 'warning', 'true', isConfirm => {
            if (isConfirm) {
                if (!list.length) return T.alert('Không có danh sách giảng viên nhập điểm cần xóa!', 'warning', true, 5000);
                T.alert('Đang xoá giảng viên nhập điểm. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.deleteDtAssignRoleNhapDiem(list, () => this.getData(null, null, () => T.alert('Xóa giảng viên nhập điểm thành công', 'success', false, 1000)));
            }
        });
    }

    table = (dataAssignRole) => renderDataTable({
        emptyTable: 'Không có thời khóa biểu!',
        stickyHead: dataAssignRole?.length > 10,
        header: 'thead-light',
        loadingStyle: { backgroundColor: 'white' },
        divStyle: { height: '60vh' },
        data: dataAssignRole,
        renderHead: () => {
            const user = this.props.system.user, { isPhongDaoTao } = user,
                { listChosen, dataAssignRole } = this.state;
            return <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <TableHead content={
                    <span className='animated-checkbox d-flex flex-column'>
                        <label>Chọn</label>
                        <label style={{ marginBottom: '0' }}>
                            <input type='checkbox' ref={e => this.checkAll = e} checked={listChosen.length == dataAssignRole.length} onChange={e => this.setState({ listChosen: e.target.checked ? dataAssignRole.map((_, index) => index) : [] })} />
                            <s className='label-text' />
                        </label>
                    </span>
                } style={{ textAlign: 'center' }} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: '40%', whiteSpace: 'nowrap' }} content='Tên học phần' keyCol='tenHocPhan' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Số lượng sinh viên' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Điểm thành phần' />
                <TableHead style={{ width: '20%', whiteSpace: 'nowrap' }} content='Ca thi' />
                <TableHead style={{ width: '40%', whiteSpace: 'nowrap' }} content='Giảng viên nhập điểm' />
                <th style={{ whiteSpace: 'nowrap', width: 'auto', display: Number(isPhongDaoTao) ? '' : 'none' }}>Giảng viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Người thao tác</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian thao tác</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>;
        },
        renderRow: (item, index) => {
            const user = this.props.system.user, { isPhongDaoTao } = user,
                { listChosen, filter } = this.state,
                roleNhapDiem = item.roleNhapDiem.filter(i => i.idExam ? (i.idExam == item.idExam) : (i.kyThi == item.thanhPhan)),
                icon = roleNhapDiem.length ? 'fa fa-lg fa-check-circle' : 'fa fa-lg fa-file-o',
                text = roleNhapDiem.length ? 'Đã xác nhận' : 'Chưa xác nhận',
                color = roleNhapDiem.length ? 'green' : 'red',
                listTenGv = item.tenGiangVien ? item.tenGiangVien.split(',') : [],
                tpDiem = item.tpDiem.filter(tp => filter.kyThi == 'QT' ? tp.thanhPhan != 'CK' : tp.thanhPhan == 'CK').sort((a, b) => a.priority - b.priority);

            return <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={listChosen.includes(index)} permission={{ write: !!item.thanhPhan }} onChanged={value => this.setState({ listChosen: value ? [...listChosen, index] : listChosen.filter(i => i != index) })} />
                <TableCell content={item.maHocPhan} />
                <TableCell content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.countStudent} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{tpDiem.map(i => <div key={`${index}${i.thanhPhan}`}><b>{i.tenThanhPhan}</b>: {i.phanTram}%</div>)}</>} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.idExam ? <>
                    {`Ca thi: ${item.caThi}`}<br />
                    {`Phòng: ${item.phong}`}<br />
                    {`Ngày: ${T.dateToText(parseInt(item.batDau))}`}
                </> : ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={this.renderGiangVien(item)} />
                <TableCell style={{ whiteSpace: 'nowrap', display: Number(isPhongDaoTao) ? '' : 'none' }} content={(listTenGv.length ? listTenGv.map((i, idx) => <div key={idx}>{i}</div>) : '')} />
                <TableCell style={{ whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={roleNhapDiem.length ? roleNhapDiem[0].userMod : ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={roleNhapDiem.length ? T.dateToText(parseInt(roleNhapDiem[0].timeMod)) : ''} />
                <TableCell type='buttons' permission={{ write: !!item.thanhPhan }} >
                    {<Tooltip title={'Phân công người nhập điểm'} arrow>
                        <button className='btn btn-success' onClick={(e) => e && e.preventDefault() || this.modal.show(item)}>
                            <i className='fa fa-lg fa-user-plus' />
                        </button>
                    </Tooltip>}
                    {<Tooltip title={'Xóa người nhập điểm'} arrow>
                        <button style={{ display: roleNhapDiem.length ? '' : 'none' }} className='btn btn-danger' onClick={(e) => e && e.preventDefault() || this.handleDelete(item.roleNhapDiem.map(i => i.idAssign))}>
                            <i className='fa fa-lg fa-trash' />
                        </button>
                    </Tooltip>}
                </TableCell>
            </tr>;
        }
    });

    render() {
        const adapterKyThi = [{ id: 'QT', text: 'Quá trình' }, { id: 'CK', text: 'Cuối kỳ' }],
            { dataAssignRole, listChosen } = this.state,
            { pageNumber, pageSize, pageTotal, totalItem } = dataAssignRole && dataAssignRole[0] ? dataAssignRole[0] : { pageNumber: 1, pageSize: 25, pageTotal: 0, totalItem: 0 };

        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Phân quyền nhập điểm',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={0} to='/user/dao-tao/grade-manage'>Điểm</Link>,
                'Phân quyền nhập điểm'
            ],
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.namFilter = e} data={SelectAdapter_SchoolYear} className='col-md-2' label='Năm học' onChange={value => this.handleChange(value.id, 'namHoc', pageNumber, pageSize)} />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-2' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={value => this.handleChange(value?.id, 'hocKy', pageNumber, pageSize)} />
                <FormSelect ref={e => this.khoaSinhVienFilter = e} className='col-md-2' label='Khoá' data={SelectAdapter_DtKhoaDaoTao} allowClear onChange={value => this.handleChange(value?.id, 'khoaSinhVien', pageNumber, pageSize)} />
                <FormSelect ref={e => this.loaiHinhDaoTaoFilter = e} className='col-md-2' label='Loại hình đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} allowClear onChange={value => this.handleChange(value?.id, 'loaiHinhDaoTao', pageNumber, pageSize)} />
                <FormSelect ref={e => this.khoaDangKyFilter = e} className='col-md-2' label='Đơn vị tổ chức' data={SelectAdapter_DtDmDonVi()} allowClear onChange={value => this.handleChange(value?.id, 'khoaDangKy', pageNumber, pageSize)} />
                <FormSelect ref={e => this.kyThiFilter = e} className='col-md-2' label='Loại điểm' data={adapterKyThi} onChange={value => this.handleChange(value.id, 'kyThi', pageNumber, pageSize)} />
            </div>,
            content: <>
                <div className='tile'>
                    <div style={{ margin: '5px 0' }}>
                        <Pagination style={{ marginLeft: '', position: 'initial' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                            getPage={this.getData} pageRange={5} />
                    </div>
                    {this.table(dataAssignRole)}
                </div>
                <AddGiangVienModal ref={e => this.modal = e} dataAssignRole={dataAssignRole} user={this.props.system.user} createDtAssignRoleNhapDiem={this.props.createDtAssignRoleNhapDiem} handleSave={(done) => {
                    this.getData(pageNumber, pageSize, done);
                }} />
            </>,
            backRoute: '/user/dao-tao/grade-manage',
            buttons: [
                this.props.system.user.isPhongDaoTao && { icon: 'fa-cogs', tooltip: 'Gán mặc định', className: 'btn btn-warning', onClick: e => e && e.preventDefault() || this.handleInitDefault() },
                { icon: 'fa-user-plus', tooltip: 'Gán người nhập điểm', className: 'btn btn-info', onClick: e => e && e.preventDefault() || this.modal.show(listChosen) },
                { icon: 'fa-trash', tooltip: 'Xóa người nhập điểm', className: 'btn btn-danger', onClick: e => e && e.preventDefault() || this.handleDelete(dataAssignRole.filter((_, index) => listChosen.includes(index)).flatMap(i => i.roleNhapDiem.map(role => role.idAssign))) },
                { icon: 'fa-download', tooltip: 'Xuất dữ liệu', className: 'btn btn-success', onClick: e => e && e.preventDefault() || T.get('/api/dt/assign-role-nhap-diem/export', { filter: T.stringify(this.state.filter) }) },
                { icon: 'fa-upload', tooltip: 'Import tỷ lệ điểm', className: 'btn btn-primary', onClick: e => e && e.preventDefault() || window.open('/user/dao-tao/grade-manage/import-ty-le', '_blank') }
            ],
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getScheduleSettings, dtAssignRoleNhapDiemGetData, createDtAssignRoleNhapDiem, createDtAssignRoleNhapDiemDefault, deleteDtAssignRoleNhapDiem };
export default connect(mapStateToProps, mapActionsToProps)(AssignRolePage);