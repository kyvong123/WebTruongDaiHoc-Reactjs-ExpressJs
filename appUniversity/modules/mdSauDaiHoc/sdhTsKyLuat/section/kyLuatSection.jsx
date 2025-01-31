import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableHead, renderDataTable, TableCell, FormTextBox, getValue, FormCheckbox } from 'view/component/AdminPage';
import { getSdhDanhSachKyLuatPage, updateSdhTsKyLuat, SelectAdapter_DmKyLuat } from 'modules/mdSauDaiHoc/sdhTsKyLuat/redux';
import { getAllSdhTsDmKyLuat } from 'modules/mdSauDaiHoc/sdhTsDmKyLuat/redux';

import { SelectAdapter_SdhTsMonThi } from 'modules/mdSauDaiHoc/sdhMonThiTuyenSinh/redux';
import { Tooltip } from '@mui/material';

import Pagination from 'view/component/Pagination';

class kyLuatSection extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { filter: {}, sortTerm: 'ten_ASC', isKeySearch: false, dmKyLuat: [] };
    ghiChu = {};
    kyLuat = {};
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            this.props.getAllSdhTsDmKyLuat(items => this.setState({ dmKyLuat: [{ id: null, text: 'Không' }, ...items.map(item => ({ id: item.ma, text: item.kyLuat }))] }));
        });
    }
    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }
    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, vang: 0, kyLuat: 1, idDot: this.props.idDot ? this.props.idDot : '', sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhDanhSachKyLuatPage(pageN, pageS, pageC, filter, done);
    }
    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    handleKyLuat = (item, permission) => {
        let { dmKyLuat } = this.state;
        return (
            <div className='btn-group' role='group'>
                <button id='btnGroupDrop1' type='button' className={'btn dropdown-toggle btn-secondary'} style={{ fontWeight: 'normal', backgroundColor: item.kyLuat ? '#ebb734' : '' }} data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    <Tooltip title={dmKyLuat.find(i => i.id == item.kyLuat)?.text} arrow placement='right-end'>
                        <span>
                            {item.tenKyLuat || 'Chọn kỷ luật'}
                        </span>
                    </Tooltip>
                </button>
                <div className='dropdown-menu' aria-labelledby='btnGroupDrop1' style={{ position: 'absolute' }}>
                    {
                        dmKyLuat.map((_item) => {
                            return (
                                <p style={{ marginBottom: '0', cursor: 'pointer' }} className='dropdown-item' key={_item.id}
                                    onClick={() => permission.write && this.props.updateSdhTsKyLuat(item.id, { type: 'kyLuat', value: _item.id }, () => {
                                        this.getPage();
                                    })}>
                                    {_item.text}
                                </p>
                            );
                        })
                    }
                </div>
            </div>
        );
    }
    defaultSkill = [{ id: 'Listening', text: 'Listening' }, { id: 'Speaking', text: 'Speaking' }, { id: 'Reading', text: 'Reading' }, { id: 'Writing', text: 'Writing' }]
    render() {
        const sdhTsKyLuat = this.props.sdhTsKyLuat ? this.props.sdhTsKyLuat : {};
        const { pageNumber, pageSize, pageTotal, totalItem, list } = sdhTsKyLuat && sdhTsKyLuat.pageKyLuat ?
            sdhTsKyLuat.pageKyLuat : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
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
                    <TableHead keyCol='sbd' content='Số báo danh' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='kyLuat' typeSearch='admin-select' content='Kỷ luật' data={SelectAdapter_DmKyLuat} style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='ho' content='Họ' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='ten' content='Tên' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='phongThi' content='Phòng thi' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead typeSearch='admin-select' keyCol='monThi' data={SelectAdapter_SdhTsMonThi} content='Môn thi' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead typeSearch='admin-select' keyCol='kyNang' data={this.defaultSkill} content='Kỹ năng' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='ngayThi' typeSearch='date' content='Ngày thi' style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='ghiChu' content='Ghi chú' style={{ width: '60%', textAlign: 'center', whiteSpace: 'nowrap' }} />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.sbd} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={
                        this.handleKyLuat(item, permission)
                    } />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ho} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.phong} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.monThi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.kyNang} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngayThi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={
                        <FormTextBox key={item.id} ref={e => this.ghiChu[item.id] = e} value={item.ghiChu} style={{ textAlign: 'center' }} permission={permission} onKeyDown={e => e.code === 'Enter' && this.props.updateSdhTsKyLuat(item.id, { type: 'ghiChu', value: getValue(this.ghiChu[item.id]) })} />
                    } />

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
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getSdhDanhSachKyLuatPage, updateSdhTsKyLuat, getAllSdhTsDmKyLuat
};
export default connect(mapStateToProps, mapActionsToProps)(kyLuatSection);