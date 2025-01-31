import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, TableHead, renderDataTable } from 'view/component/AdminPage';
import { getDtDiemPage } from 'modules/mdDaoTao/dtDiem/redux';
import Pagination from 'view/component/Pagination';


class NhapDiemHocPhanSection extends AdminPage {
    state = { filter: { onlyHasNumbers: 1 } }

    setValue = ({ namHoc, hocKy }) => {
        this.setState({ filter: { ...this.state.filter, namFilter: namHoc, hocKyFilter: hocKy } }, () => {
            this.getPage(undefined, undefined, '');
        });
    }

    getPage = (pN, pS, pC) => {
        this.props.getDtDiemPage(pN, pS, pC, this.state.filter);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        let [key, value] = data.split(':');
        if (key == 'ks_ngayKetThucNhap') {
            value = new Date(parseInt(value)).setHours(23, 59, 59, 999);
        }
        this.setState({ filter: { ...this.state.filter, [key]: value } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, sortKey: sortTerm.split('_')[0], sortMode: sortTerm.split('_')[1] } }, () => this.getPage(pageNumber, pageSize, pageCondition));
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtDiem?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, pageCondition: '', list: null };
        const onKeySearch = this.handleKeySearch,
            onSort = this.onSort;

        const table = renderDataTable({
            data: list,
            stickyHead: list && list.length > 15,
            divStyle: { height: '69vh' },
            style: { fontSize: '0.8rem' },
            header: 'thead-light',
            renderHead: () => {
                let rowSpan = list && list.length ? 2 : 1,
                    firstItem = list && list.length && list[0].configDefault ? T.parse(list[0].configDefault) : {},
                    configDefault = Object.keys(firstItem),
                    configThi = Object.keys(firstItem).filter(key => firstItem[key].isThi),
                    colSpan = configDefault.length || 1;
                return (<><tr>
                    <TableHead rowSpan={rowSpan} content='#' />
                    <TableHead rowSpan={rowSpan} content='Mã học phần' keyCol='maHocPhan' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead rowSpan={rowSpan} content='Tên môn học' style={{ width: '100%' }} keyCol='tenMonHoc' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead rowSpan={rowSpan} content={'Ngày bắt đầu nhập'} style={{ width: 'auto', textAlign: 'center' }} keyCol='ngayBatDauNhap' onKeySearch={onKeySearch} onSort={onSort} typeSearch='date' />
                    <TableHead rowSpan={rowSpan} content={'Ngày kết thúc nhập'} style={{ width: 'auto', textAlign: 'center' }} keyCol='ngayKetThucNhap' onKeySearch={onKeySearch} onSort={onSort} typeSearch='date' />
                    <TableHead rowSpan={rowSpan} content='Lớp' style={{ minWidth: '100px' }} keyCol='lop' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead rowSpan={rowSpan} content='Sĩ số' style={{ minWidth: '50px' }} keyCol='siSo' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead rowSpan={rowSpan} content='Giảng viên' style={{ width: 'auto' }} keyCol='giangVien' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead style={{ minWidth: '50px', textAlign: 'center' }} rowSpan={list && list.length ? 1 : 2} colSpan={configThi.length} content={'Hình thức thi'} />
                    <TableHead style={{ minWidth: '50px', textAlign: 'center' }} rowSpan={list && list.length ? 1 : 2} colSpan={configThi.length} content={'Ngày thi'} />
                    <TableHead style={{ minWidth: '50px', textAlign: 'center' }} rowSpan={list && list.length ? 1 : 2} colSpan={colSpan} content={'Điểm thành phần (%)'} />
                </tr>
                    {list && list.length ? <tr>
                        {configThi.map(key => <th style={{ textAlign: 'center' }} key={'HinhThuc' + key}>{key}</th>)}
                        {configThi.map(key => <th style={{ textAlign: 'center' }} key={'THI' + key}>{key}</th>)}
                        {configDefault.sort((a, b) => a.phanTram - b.phanTram ? -1 : 0).map(key => <th style={{ textAlign: 'center' }} key={'TP' + key}>{key}</th>)}
                    </tr> : null}
                </>);
            },
            renderRow: (item, index) => {
                let headConfig = list[0].configDefault ? Object.keys(T.parse(list[0].configDefault)).sort((a, b) => a.phanTram - b.phanTram ? -1 : 0) : ['GK', 'CK'], dataDiem = [], tpDiem = item.tpHocPhan || item.tpMonHoc,
                    defaultConfig = item.configDefault ? T.parse(item.configDefault) : {
                        'GK': { isThi: true, default: 50, loaiLamTron: '0.5' },
                        'CK': { isThi: true, default: 50, loaiLamTron: '0.5' }
                    },
                    dataThi = T.parse(item.thi) || {},
                    configThi = Object.keys(defaultConfig).filter(key => defaultConfig[key].isThi),
                    hinhThucThi = T.parse(item.hinhThucThi) || {};
                if (tpDiem) {
                    tpDiem = T.parse(tpDiem);
                    dataDiem = Object.keys(tpDiem).map(key => ({ loaiDiem: key, phanTram: tpDiem[key], loaiLamTron: defaultConfig[key]?.loaiLamTron || '0.5' })).sort((a, b) => a.phanTram - b.phanTram ? -1 : 0);
                } else {
                    tpDiem = defaultConfig;
                    dataDiem = Object.keys(tpDiem).map(key => ({ loaiDiem: key, phanTram: defaultConfig[key]?.default || 50, loaiLamTron: defaultConfig[key]?.loaiLamTron || '0.5' })).sort((a, b) => a.phanTram - b.phanTram ? -1 : 0);
                }
                return <tr key={index}>
                    <TableCell content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell content={item.maHocPhan} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} url={`${window.location.origin}/user/dao-tao/grade-manage/nhap-diem/${item.maHocPhan}`} type='link' />
                    <TableCell content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy HH:MM:ss' content={item.thoiGianBatDauNhap} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy HH:MM:ss' content={item.thoiGianKetThucNhap} />
                    <TableCell style={{ whiteSpace: 'pre-wrap', textAlign: 'center' }} content={item.maLop} />
                    <TableCell content={item.siSo || 0} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.giangVien && item.giangVien.length ? item.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                    {configThi.map((i, j) => <React.Fragment key={item.maHocPhan + i + j} >
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hinhThucThi[i] || ''} />
                    </React.Fragment>)}
                    {configThi.map((i, j) => <React.Fragment key={item.maHocPhan + i + j} >
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={dataThi[i]?.batDau || ''} />
                    </React.Fragment>)}
                    {headConfig.map((i, j) => <React.Fragment key={item.maHocPhan + i + j} >
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={dataDiem.find(tp => tp.loaiDiem == i)?.phanTram || 0} />
                    </React.Fragment>)}
                </tr>;
            }
        });

        return <>
            <div style={{ margin: '10px auto' }} className='btn-group'>
                <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} pageRange={5} />
            </div>
            {table}
        </>;
    }
}
const mapStateToProps = state => ({ system: state.system, dtDiem: state.daoTao.dtDiem });
const mapActionsToProps = { getDtDiemPage };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(NhapDiemHocPhanSection);