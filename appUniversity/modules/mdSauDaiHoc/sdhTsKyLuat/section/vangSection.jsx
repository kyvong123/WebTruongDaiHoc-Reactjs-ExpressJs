import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableHead, renderDataTable, FormCheckbox, TableCell } from 'view/component/AdminPage';
import { getSdhDanhSachKyLuatPage, updateSdhTsKyLuat } from 'modules/mdSauDaiHoc/sdhTsKyLuat/redux';
import { SelectAdapter_SdhTsMonThi } from 'modules/mdSauDaiHoc/sdhMonThiTuyenSinh/redux';

import Pagination from 'view/component/Pagination';

class vangSection extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { filter: {}, sortTerm: 'ten_ASC', isKeySearch: false };
    componentDidMount() {
        this.getPage();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.idDot != this.props.idDot)
            this.setState({ idDot: this.props.idDot }, () => {
                this.getPage();
            });
    }
    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }
    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, vang: 1, kyLuat: 0, idDot: this.props.idDot ? this.props.idDot : '', sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhDanhSachKyLuatPage(pageN, pageS, pageC, filter, done);
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    defaultSkill = [{ id: 'Listening', text: 'Listening' }, { id: 'Speaking', text: 'Speaking' }, { id: 'Reading', text: 'Reading' }, { id: 'Writing', text: 'Writing' }]


    render() {
        const sdhTsKyLuat = this.props.sdhTsKyLuat ? this.props.sdhTsKyLuat : {};
        const { pageNumber, pageSize, pageTotal, totalItem, list } = sdhTsKyLuat && sdhTsKyLuat.pageVang ?
            sdhTsKyLuat.pageVang : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        const permission = this.getUserPermission('sdhTsKyLuat');
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu kỷ luật',
            stickyHead: true,
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            data: list,
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead keyCol='soBaoDanh' content='Số báo danh' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='vang' content='Vắng' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='ho' content='Họ' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='ten' content='Tên' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='ngayThi' typeSearch='date' content='Ngày thi' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />

                    <TableHead keyCol='phongThi' content='Phòng thi' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead typeSearch='admin-select' keyCol='monThi' data={SelectAdapter_SdhTsMonThi} content='Môn thi' style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead typeSearch='admin-select' keyCol='kyNang' data={this.defaultSkill} content='Kỹ năng' style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.sbd} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={
                        <FormCheckbox key={'vang' + item.id} style={{ textAlign: 'center' }} permission={permission} onChange={
                            value => this.props.updateSdhTsKyLuat(item.id, { type: 'vang', value: value ? '1' : '0' })
                        } value={item.vang == '1' ? true : false} />
                    } />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ho} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.ngayThi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.phong} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.monThi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.kyNang} />

                </tr>
            )
        });
        return <>
            <div className='tile'>
                <div className='title'>
                    <div style={{ gap: 10, display: 'inline-flex' }}>
                        <FormCheckbox label='Tìm theo cột' onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                        <FormCheckbox label='Sort' onChange={value => this.setState({ isSort: value })} style={{ marginBottom: '0' }} />
                    </div>
                </div>
                <hr></hr>
                <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                    <div style={{ marginBottom: '10px' }}>
                        Kết quả: {<b>{totalItem}</b>} bài thi
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
const mapStateToProps = state => ({ system: state.system, sdhTsKyLuat: state.sdh.sdhTsKyLuat });
const mapActionsToProps = {
    getSdhDanhSachKyLuatPage, updateSdhTsKyLuat
};
export default connect(mapStateToProps, mapActionsToProps)(vangSection);