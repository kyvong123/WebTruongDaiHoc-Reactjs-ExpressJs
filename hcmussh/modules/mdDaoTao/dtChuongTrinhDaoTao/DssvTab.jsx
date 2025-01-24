import React from 'react';
import { AdminPage, AdminModal, renderDataTable, TableCell, TableHead, FormCheckbox, FormSelect, getValue } from 'view/component/AdminPage';
import { SelectAdapter_KhungDaoTaoCtsv, getDtKhungDaoTao, createDtChuongTrinhDaoTaoSv, updateDtChuongTrinhDaoTaoSv, deleteDtChuongTrinhDaoTaoSv } from './redux';
import { SelectAdapter_StudentChuongTrinhDaoTao } from '../dtDangKyHocPhan/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtKhoaDaoTao } from '../dtKhoaDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V3 } from 'modules/mdDanhMuc/dmDonVi/redux';
import ImportModal from './importModal';
import { connect } from 'react-redux';

class AddSinhVienModal extends AdminModal {
    state = { listSinhVien: null };
    listSinhVien = [];

    onShow = () => {
        const route = T.routeMatcher('/user/dao-tao/chuong-trinh-dao-tao/:ma');
        this.ma = route.parse(window.location.pathname)?.ma;
    }
    onHide = () => {
        this.listSinhVien = [];
        this.setState({ listSinhVien: this.listSinhVien });
    }

    onSubmit = () => {
        if (!this.state.listSinhVien) {
            T.notify('Chưa chọn sinh viên', 'warning');
            this.sinhVien.focus();
        } else {
            this.props.createDtChuongTrinhDaoTaoSv(T.stringify(this.state.listSinhVien), this.ma, () => {
                this.props.getDssv();
                this.hide();
            });
        }
    }

    table = (list) => renderDataTable({
        data: list,
        stickyHead: list.length > 12,
        divStyle: { height: '60vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <TableHead style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }} content='MSSV' keyCol='mssv' onKeySearch={this.onKeySearch} />
                <TableHead style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }} content='Họ và tên lót' keyCol='ho' onKeySearch={this.onKeySearch} />
                <TableHead style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }} content='Tên' keyCol='ten' onKeySearch={this.onKeySearch} />
                <TableHead style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }} content='Lớp' keyCol='lop' />
            </tr>
        ),
        renderRow: (item, index) => (
            <tr key={index} >
                <TableCell type='number' content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop || ''} />
            </tr>
        )
    })

    displaySinhVien = (value) => {
        if (this.props.dssv.find(sv => sv.mssv == value.id)) {
            T.notify('Sinh viên đã có trong chương trình đào tạo', 'warning');
        } else if (this.listSinhVien.find(sv => sv.mssv == value.id)) {
            T.notify('Bạn đã chọn sinh viên này rồi!', 'warning');
        } else {
            this.listSinhVien.push(value.item);
            this.setState({ listSinhVien: this.listSinhVien });
        }
        this.sinhVien.value('');
        this.sinhVien.focus();
    }

    handleChangeKhoaSV = (value) => {
        this.setState({ filter: { ...this.state.filter, listKhoaSinhVien: value ? value.id : '' } }, () => this.sinhVien.value(''));
    }

    handleChangeLoaiHinh = (value) => {
        this.setState({ filter: { ...this.state.filter, listLoaiHinhDaoTao: value ? value.id : '' } }, () => this.sinhVien.value(''));
    }

    handleChangeDonVi = (value) => {
        this.setState({ filter: { ...this.state.filter, listFaculty: value ? value.id : '' } }, () => this.sinhVien.value(''));
    }

    render = () => {
        let { filter } = this.state;
        return this.renderModal({
            title: 'Thêm sinh viên',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect ref={e => this.khoaSV = e} className='col-md-4' label='Khoá sinh viên' data={SelectAdapter_DtKhoaDaoTao} onChange={this.handleChangeKhoaSV} allowClear />
                <FormSelect ref={e => this.loaiHinh = e} className='col-md-4' label='Loại hình đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} onChange={this.handleChangeLoaiHinh} allowClear />
                <FormSelect ref={e => this.donVi = e} className='col-md-4' label='Danh sách khoa/ bộ môn' data={SelectAdapter_DmDonViFaculty_V3} onChange={this.handleChangeDonVi} allowClear />
                <FormSelect ref={e => this.sinhVien = e} className='col-md-12' label='Danh sách sinh viên' placeholder='Chọn sinh viên' data={SelectAdapter_StudentChuongTrinhDaoTao(filter)} onChange={this.displaySinhVien} />
                <div className='col-md-12'>
                    {this.state.listSinhVien && this.table(this.state.listSinhVien)}
                </div>
            </div>
        });
    }
}
class ChuyenSinhVienModal extends AdminModal {
    onShow = (item) => {
        this.setState({ listSinhVien: item }, () => {
            this.ctdt.value('');
        });
    }

    onSubmit = () => {
        let ctdt = getValue(this.ctdt);
        this.props.updateDtChuongTrinhDaoTaoSv(T.stringify(this.state.listSinhVien), ctdt, () => {
            this.props.getDssv();
            this.hide();
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Chuyển CTĐT sinh viên',
            size: 'large',
            body: <div className='row'>
                <FormSelect ref={e => this.ctdt = e} className='col-md-12' data={SelectAdapter_KhungDaoTaoCtsv(null, null)} required label='Chương trình đào tạo mới' placeholder='Chọn CTĐT' onChange={() => { }} />
            </div>
        });
    }
}
class DssvTab extends AdminPage {
    state = { dataRender: [] }
    listSinhVien = []

    onKeySearch = (value) => {
        let data = [];
        let [key, search] = value.split(':');
        search = search ? search.trim().toLowerCase() : '';
        if (key == 'ks_mssv') {
            data = this.props.dssv.filter(i => i.mssv.toLowerCase().includes(search));
        } else if (key == 'ks_ho') {
            data = this.props.dssv.filter(i => i.ho.toLowerCase().includes(search));
        } else if (key == 'ks_ten') {
            data = this.props.dssv.filter(i => i.ten.toLowerCase().includes(search));
        }
        this.setState({ dataRender: data, search });
    }

    chonSinhVien = (item, list) => {
        item.isChon = !item.isChon;
        this.countSinhVien(item);
        this.setState({ listSinhVienChon: list, thaoTac: this.listSinhVien.length > 0 }, () => {
            if (!item.isChon) {
                this.checkSVAll.value(false);
            }
        });
    }

    countSinhVien = (item) => {
        let check = false;
        if (item.isChon == true) {
            this.listSinhVien.forEach(itemSV => {
                if (item.mssv == itemSV.mssv) check = true;
            });
            if (check == false) this.listSinhVien.push(item);
        } else if (item.isChon == false) {
            for (let i = 0; i < this.listSinhVien.length; i++) {
                if (item.mssv == this.listSinhVien[i].mssv) this.listSinhVien.splice(i, 1);
            }
        }
    }

    table = (list) => renderDataTable({
        emptyTable: 'Không có dữ liệu sinh viên',
        stickyHead: list.length > 10,
        header: 'thead-light',
        data: list,
        divStyle: { height: '65vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <FormCheckbox ref={e => this.checkSVAll = e} readOnly={!this.getUserPermission('dtChuongTrinhDaoTao', ['write', 'manage']).write}
                        onChange={value => {
                            list.map(item => {
                                item.isChon = value;
                                return item;
                            });
                            list.forEach(item => this.countSinhVien(item));
                            this.setState({ listSinhVienChon: list });
                        }}
                    />
                </th>
                <TableHead style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }} content='MSSV' keyCol='mssv' onKeySearch={this.onKeySearch} />
                <TableHead style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }} content='Họ và tên lót' keyCol='ho' onKeySearch={this.onKeySearch} />
                <TableHead style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }} content='Tên' keyCol='ten' onKeySearch={this.onKeySearch} />
                <TableHead style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }} content='Lớp' keyCol='lop' />
            </tr>
        ),
        renderRow: (item, index) => {
            const permission = this.getUserPermission('dtChuongTrinhDaoTao', ['write', 'manage']);
            const readOnly = !(permission.write || permission.manage);

            return <tr key={index} style={{ backgroundColor: item.isChon ? '#cfe2ff' : null, cursor: 'pointer' }} onClick={() => !readOnly && this.chonSinhVien(item, list)}>
                <TableCell type='number' content={index + 1} />
                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isChon} permission={{ write: !readOnly }}
                    onChanged={() => this.chonSinhVien(item, list)}
                />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop || ''} />
            </tr>;
        }
    });

    delete = () => {
        T.confirm('Cảnh báo', 'Những sinh viên được chọn sẽ bị xoá khỏi lớp hiện tại. Bạn có chắc chắn muốn xoá sinh viên khỏi chương trình đào tạo không?', 'warning', true, (isConfirm) => {
            if (isConfirm) {
                this.props.deleteDtChuongTrinhDaoTaoSv(T.stringify(this.listSinhVien), () => {
                    this.getDssv();
                });
            }
        });
    }

    getDssv = () => {
        this.props.getDtKhungDaoTao(this.props.maKhung, data => {
            this.setState({ dataRender: data.dssv, isUpdate: true, thaoTac: false }, () => {
                this.listSinhVien = [];
            });
        });
    }

    render() {
        let { dataRender, search, isUpdate, thaoTac } = this.state,
            display = thaoTac ? '' : 'none';
        dataRender = (search != null || isUpdate) ? dataRender : this.props.dssv;

        const permission = this.getUserPermission('dtChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage', 'import', 'export']),
            readOnly = !permission.manage;

        return (<>
            <div className='row m-2'>
                <button className='btn btn-warning' type='button' onClick={e => e.preventDefault() || T.handleDownload(`/api/dt/chuong-trinh-dao-tao/download-dssv?maKhung=${this.props.maKhung}`)}>
                    <i className='fa fa-fw fa-lg fa-download' />Xuất danh sách sinh viên
                </button>
                <div style={{ display: readOnly ? 'none' : '' }}>
                    <button className='btn btn-success ml-2' type='button' onClick={e => e.preventDefault() || this.addSvModal.show()}>
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm sinh viên vào CTĐT
                    </button>
                    <button className='btn btn-primary ml-2' type='button' style={{ display }} onClick={(e) => e.preventDefault() || this.chuyenSvModal.show(this.listSinhVien)}>
                        <i className='fa fa-fw fa-lg fa-repeat' /> Chuyển CTĐT
                    </button>
                    <button className='btn btn-danger ml-2' type='button' style={{ display }} onClick={e => e.preventDefault() || this.delete()}>
                        <i className='fa fa-fw fa-lg fa-trash' /> Xoá sinh viên khỏi CTĐT
                    </button>
                    <button style={{ height: 'fit-content' }} className='btn btn-info ml-2' type='button' onClick={() => {
                        this.importModal.show();
                    }}>
                        <i className='fa fa-fw fa-lg fa-upload' /> Import sinh viên
                    </button>
                </div>
            </div>
            {this.table(dataRender)}
            <ImportModal ref={e => this.importModal = e} maKhung={this.props.maKhung} handleSetData={this.getDssv} />
            <AddSinhVienModal ref={e => this.addSvModal = e} getDssv={this.getDssv} dssv={dataRender || this.props.dssv} createDtChuongTrinhDaoTaoSv={this.props.createDtChuongTrinhDaoTaoSv} />
            <ChuyenSinhVienModal ref={e => this.chuyenSvModal = e} getDssv={this.getDssv} updateDtChuongTrinhDaoTaoSv={this.props.updateDtChuongTrinhDaoTaoSv} />
        </>);
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getDtKhungDaoTao, createDtChuongTrinhDaoTaoSv, updateDtChuongTrinhDaoTaoSv, deleteDtChuongTrinhDaoTaoSv
};
export default connect(mapStateToProps, mapActionsToProps)(DssvTab);
