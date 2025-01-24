import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, getValue, AdminModal } from 'view/component/AdminPage';
import { TableHead, renderDataTable, FormCheckbox, TableCell, FormTextBox } from 'view/component/AdminPage';
import { getSdhDanhSachDiemThiPage, createSdhTsDiemThiSinhMp } from 'modules/mdSauDaiHoc/sdhTsKetQuaThi/redux';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';
import { getSdhTsProcessingDot } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';
import { SelectAdapter_SdhTsMonThiForDiem } from 'modules/mdSauDaiHoc/sdhMonThiTuyenSinh/redux';
import { SelectAdapter_NganhByDot } from 'modules/mdSauDaiHoc/sdhTsInfoNganh/redux';
class DiemThiModal extends AdminModal {
    state = {};
    onShow = (item) => {
        this.diem.value(item.diem);
        this.nganh.value(item.nganh);
        this.mon.value(item.monThi);
        this.setState({ data: item });
    }
    onSubmit = (e) => {
        e && e.preventDefault();
        this.props.create(this.state.data.id, getValue(this.diem), this.state.data.diem, () => {
            this.diem.value('');
            this.props.getPage(this.hide);
        });
    }
    render = () => {
        const permission = this.props.permission;
        return this.renderModal({
            title: 'Chỉnh sửa điểm thi thí sinh',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' ref={e => this.nganh = e} label='Ngành' className='col-md-6' readOnly required />
                <FormTextBox type='text' ref={e => this.mon = e} label='Môn thi' className='col-md-6' readOnly required />
                <FormTextBox type='number' min={0} max={100} step={true} decimalScale={2} ref={e => this.diem = e} label='Điểm' className='col-md-6' readOnly={!permission.write} required />
            </div>
        });
    }
}
class DanhSachDiemThiPage extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { maPhanHe: '', filter: {}, sortTerm: 'ten_ASC', listChosen: [], checked: false, isKeySearch: false, isFixCol: false, isCoDinh: false };
    componentDidMount() {
        this.isCoDinh.value(this.state.isCoDinh);
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhTsProcessingDot(data => {
                if (data && data.id) {
                    this.setState({ idDot: data.id }, () => {
                        this.getPage();
                    });
                } else {
                    this.props.history.push('/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh');
                }
            });
        });
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        if (typeof pageN == 'function') {
            done = pageN;
            pageN = undefined;
        }
        let filter = { ...this.state.filter, idDot: this.state.idDot ? this.state.idDot : '', sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhDanhSachDiemThiPage(pageN, pageS, pageC, filter, done);
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    render() {
        const sdhTsDiemThi = this.props.sdhTsDiemThi;
        const { pageNumber, pageSize, pageTotal, totalItem, list } = sdhTsDiemThi && sdhTsDiemThi.page ?
            sdhTsDiemThi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        const permission = this.getUserPermission('sdhTsKetQuaThi');
        const isManager = this.getCurrentPermissions('manager').includes('manager:write');
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu điểm thi',
            stickyHead: this.state.isCoDinh || list.length < 8,
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            data: list,
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    {isManager && <>
                        <TableHead keyCol='soBaoDanh' content='Số báo danh' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                        <TableHead keyCol='ho' content='Họ' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}
                            onKeySearch={onKeySearch} onSort={onSort} />
                        <TableHead keyCol='ten' content='Tên' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}
                            onKeySearch={onKeySearch} onSort={onSort} />
                    </>}
                    <TableHead typeSearch='admin-select' data={SelectAdapter_NganhByDot(this.props.idDot)} keyCol='nganh' style={{ width: '50%', textAlign: 'center' }} content='Ngành dự tuyển'
                        onKeySearch={onKeySearch}
                        onSort={onSort}
                    />
                    <TableHead typeSearch='admin-select' data={SelectAdapter_SdhTsMonThiForDiem} keyCol='monThi' content='Môn thi' style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='maPhach' content='Mã phách' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='diem' content='Điểm thi' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>

                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    {isManager && <>
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.soBaoDanh} />
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.ho} />
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.ten} />
                    </>}
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.nganh} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.monThi} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.maPhach} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px', backgroundColor: item.diem == 'A' ? 'red' : '' }} content={item.diem == 'A' ? 'Vắng thi' : item.diem} />
                    <TableCell type='buttons' content={item} permission={permission} style={{ textAlign: 'left' }} >
                        {
                            item.diem != 'A' ? <Tooltip title='Sửa điểm' arrow>
                                <button className='btn btn-info' onClick={(e) => e.preventDefault() || this.diemThiModal.show(item)}>
                                    <i className='fa fa-lg fa-pencil-square-o' />
                                </button>
                            </Tooltip> : ''
                        }

                    </TableCell>
                </tr>
            )
        });
        return <>
            <DiemThiModal ref={e => this.diemThiModal = e} create={this.props.createSdhTsDiemThiSinhMp} permission={permission} getPage={this.getPage} />
            <div className='tile'>
                <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                    <div className='title'>
                        <div style={{ gap: 10, display: 'inline-flex' }}>
                            <FormCheckbox label='Tìm theo cột' onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                            <FormCheckbox label='Cố định bảng' onChange={value => this.setState({ isCoDinh: value })} ref={e => this.isCoDinh = e} style={{ marginBottom: '0' }} />
                            <FormCheckbox label='Sort' onChange={value => this.setState({ isSort: value })} style={{ marginBottom: '0' }} />
                        </div>
                    </div>
                    <div style={{ gap: 10 }} className='btn-group'>
                        <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                            getPage={this.getPage} />
                    </div>
                </div>
                {table}
            </div>
        </>;
    }
}


const mapStateToProps = state => ({ system: state.system, sdhTsDiemThi: state.sdh.sdhTsDiemThi });
const mapActionsToProps = {
    getSdhTsProcessingDot, getSdhDanhSachDiemThiPage, createSdhTsDiemThiSinhMp
};
export default connect(mapStateToProps, mapActionsToProps)(DanhSachDiemThiPage);
