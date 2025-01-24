import React, { Component } from 'react';
import { renderDataTable, TableHead, TableCell, FormTextBox, getValue, FormTabs } from 'view/component/AdminPage';
import { DanhSachDuKien } from './danhSachDuKien';
import { DanhSachTimKiem } from './danhSachTimKiem';
import { Tooltip } from '@mui/material';

export default class KyLuatDanhSachSinhVien extends Component {
    state = { dssvDuKien: [], mssvEdit: null, dssvXoa: [], dssvThem: [], dssvFilter: [], ksFilter: [{}, {}, {}] }

    componentDidMount = () => {
        this.tabs.tabClick(null, 1);
    }

    componentDidMount = () => {
        let { dssvDuKien, dssvFilter } = this.props;
        dssvDuKien.forEach(sinhVien => sinhVien.isDiff = dssvFilter.every(item => item.mssv != sinhVien.mssv));
        this.tabs.tabClick(null, 1);
        this.setState({ dssvDuKien, dssvFilter });
    }

    componentDidUpdate = (prevProps) => {
        let { dssvDuKien, dssvFilter } = this.props;
        if (prevProps.dssvDuKien != dssvDuKien) {
            this.setState({ dssvDuKien });
        }
        if (prevProps.dssvFilter != dssvFilter) {
            this.setState({ dssvFilter });
        }
    }

    tabClick = (index) => this.tabs.tabClick(null, index);

    getData = () => {
        const { dssvThem, dssvXoa, dssvDuKien, dssvFilter } = this.state;
        const dssvCuuXet = dssvDuKien.filter(sv => sv.isCuuXet == true),
            dssvKhongTinhBoSung = dssvDuKien.filter(sv => sv.tinhBoSung == 0);
        const data = {
            dssvThem, dssvXoa, dssvCuuXet: dssvCuuXet.length ? dssvCuuXet : '',
            dssvFilter, dssvKhongTinhBoSung: dssvKhongTinhBoSung.length ? dssvKhongTinhBoSung : ''
        };
        return data;
    }

    onKeySearch = (keyCol, index) => {
        const [key, value] = keyCol.split(':');
        const ksFilter = [...this.state.ksFilter];
        ksFilter[index][key] = value;
        this.setState({ ksFilter });
    }

    filterlist = (list, index) => {
        let res = [...list];
        const filter = this.state.ksFilter[index];
        Object.keys(filter).forEach(key => {
            res = res.filter(item => !filter[key] || item[key.split('_')[1]].includes(filter[key]));
        });
        return res;
    }

    saveGhiChu = (id) => {
        try {
            this.props.ghiChuSvKyLuatDssvDuKien(id, { ghiChuCtsv: getValue(this.ghiChuCtsv) }, (data) => this.onSaveGhiChu(data));
        } catch (error) {
            console.error(error);
            if (error.props) {
                T.notify(error.props.label + ' bị trống!', 'danger');
                error.focus();
            }
        }
    }

    onSaveGhiChu = (data) => {
        this.setState({
            dssvDuKien: this.state.dssvDuKien.map(sv => {
                if (sv.mssv == data.mssv) {
                    sv.ghiChuCtsv = data.ghiChuCtsv || '';
                }
                return sv;
            })
        });
    }

    setBoSungSvDuKien = (item, tinhBoSung) => {
        this.setState({
            dssvDuKien: this.state.dssvDuKien.map(sv => sv.mssv == item.mssv ? { ...sv, tinhBoSung } : sv)
        });
    }

    setCuuXetSvDuKien = (item, isCuuXet) => {
        this.setState({
            dssvDuKien: this.state.dssvDuKien.map(sv => sv.mssv == item.mssv ? { ...sv, isCuuXet } : sv)
        });
    }

    deleteSvDuKien = (item) => {
        this.setState(prevState => ({
            dssvDuKien: prevState.dssvDuKien.filter(sv => sv.mssv != item.mssv),
            dssvXoa: [...prevState.dssvXoa, item],
            dssvThem: [...this.state.dssvThem.filter(sv => sv.mssv != item.mssv)],
        }));
    }

    addSvDuKien = (item) => {
        item.isCuuXet = 0;
        item.tinhBoSung = 1;
        this.setState({
            dssvDuKien: [item, ...this.state.dssvDuKien,],
            dssvThem: [item, ...this.state.dssvThem],
            dssvXoa: [...this.state.dssvXoa.filter(sv => sv.mssv != item.mssv)],
        });
    }

    componentDssvCuuXet = (dssvCuuXet) => {
        const { mssvEdit } = this.state;
        const { id } = this.props;

        // const dssvCuuXet = (dssvDuKien || []).filter(sv => sv.isCuuXet == true);
        return (<div>
            {renderDataTable({
                // getDataSource: () => (dssvCuuXet.length ? dssvCuuXet : []),
                data: this.filterlist(dssvCuuXet.length ? dssvCuuXet : [], 1),
                header: 'thead-light',
                className: 'table-fix-col',
                stickyHead: dssvCuuXet.length > 10,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>STT</th>
                        <TableHead style={{ minWidth: '125px' }} content='MSSV' keyCol='mssv' onKeySearch={(keyCol) => this.onKeySearch(keyCol, 1)} />
                        <TableHead style={{ minWidth: '150px' }} content='Họ tên' keyCol='hoTen' onKeySearch={(keyCol) => this.onKeySearch(keyCol, 1)} />
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa</th>
                        <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐTB</th>
                        <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐTBTL</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Kỷ luật</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kỷ luật bổ sung</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú khoa</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú ctsv</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (<tr key={index} style={{ backgroundColor: (!item.hinhThucKyLuatText || item.ghiChuKhoa) ? '#f7de97' : '' }}>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diemTrungBinh} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diemTrungBinhTichLuy} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hinhThucKyLuatText || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hinhThucKyLuatBoSungText || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChuKhoa || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={
                        mssvEdit == item.mssv ? <FormTextBox className='mb-0' ref={e => this.ghiChuCtsv = e} /> : (item.ghiChuCtsv || '')
                    } />
                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                        {mssvEdit != item.mssv ? <Tooltip title='Thêm ghi chú' arrow>
                            <button className='btn btn-primary' onClick={e => { e.preventDefault(); this.setState({ mssvEdit: item.mssv }, () => this.ghiChuCtsv.value(item.ghiChuCtsv || '')); }}>
                                <i className='fa fa-lg fa-pencil' />
                            </button>
                        </Tooltip> : null}
                        {mssvEdit == item.mssv ? <Tooltip title='Lưu ghi chú' arrow>
                            <button className='btn btn-success' onClick={e => { e.preventDefault(); this.saveGhiChu(item.id); }}>
                                <i className='fa fa-lg fa-check' />
                            </button>
                        </Tooltip> : null}
                        {mssvEdit == item.mssv ? <Tooltip title='Hủy' arrow>
                            <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.setState({ mssvEdit: null }); }}>
                                <i className='fa fa-lg fa-close' />
                            </button>
                        </Tooltip> : null}
                        {mssvEdit != item.mssv && id != null ? <Tooltip title='Hủy cứu xét' arrow>
                            <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.setCuuXetSvDuKien(item, 0); }}>
                                <i className='fa fa-lg fa-flag' />
                            </button>
                        </Tooltip> : null}
                    </TableCell>
                </tr>)
            })}
        </div>);
    }

    render() {
        let { dssvFilter, dssvDuKien } = this.state;
        const { id } = this.props;
        const dssvBiKyLuat = dssvDuKien.filter(sv => sv.isCuuXet == false);
        const dssvCuuXet = dssvDuKien.filter(sv => sv.isCuuXet == true);
        dssvFilter = dssvFilter.filter(svFilter => dssvDuKien.every(svDk => svDk.mssv != svFilter.mssv));
        return <FormTabs
            ref={e => this.tabs = e}
            contentClassName='mt-3'
            // style={{ height: 'calc(100vh - 200px)' }}
            tabs={[
                // { id: 0, title: <>DS kỷ luật được lọc <span className='badge badge-pill badge-secondary'>{dssvBiKyLuat.length}</span></>, component: this.componentDssvDuKien(), disabled: !id },
                { id: 0, title: <>DS kỷ luật được lọc <span className='badge badge-pill badge-secondary'>{dssvBiKyLuat.length}</span></>, component: <DanhSachDuKien dssvBiKyLuat={dssvBiKyLuat} id={id} ghiChuSvKyLuatDssvDuKien={this.props.ghiChuSvKyLuatDssvDuKien} onSaveGhiChu={this.onSaveGhiChu} setBoSungSvDuKien={this.setBoSungSvDuKien} setCuuXetSvDuKien={this.setCuuXetSvDuKien} deleteSvDuKien={this.deleteSvDuKien} />, disabled: !id },
                { id: 2, title: <>DS kỷ luật cứu xét <span className='badge badge-pill badge-secondary'>{dssvCuuXet.length}</span></>, component: this.componentDssvCuuXet(dssvCuuXet), disabled: !id },
                { id: 1, title: <>Kết quả tìm kiếm <span className='badge badge-pill badge-secondary'>{dssvFilter.length}</span></>, component: <DanhSachTimKiem id={id} dssvFilter={dssvFilter} addSvDuKien={this.addSvDuKien} /> },
            ]}
        />;
    }
}
