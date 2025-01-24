import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, TableHead, renderDataTable, FormCheckbox, AdminModal } from 'view/component/AdminPage';
import { getUnScheduledList, getRoomForSingleCandidate, createSingleCandidateIntoRoom } from './redux';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_NganhByDot } from 'modules/mdSauDaiHoc/sdhTsInfoNganh/redux';
import { SelectAdapter_SdhLoaiMonThi } from 'modules/mdSauDaiHoc/sdhLoaiMonThi/redux';
import { SelectAdapter_SdhHinhThucTuyenSinh } from 'modules/mdSauDaiHoc/sdhTsHinhThuc/redux';
import { SelectAdapter_PhanHe } from 'modules/mdSauDaiHoc/sdhTsInfoPhanHe/redux';
class ScheduleSingle extends AdminModal {
    componentDidMount() {
    }
    onShow(filter) {
        this.props.getData({ ...filter, idDot: this.props.idDot }, (dataPhong) => this.setState({ dataThiSinh: filter, dataPhong }));
    }
    render = () => {
        const { permission } = this.props;
        const { dataPhong = [], dataThiSinh = {} } = this.state;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu phòng thi phù hợp',
            loadingStyle: { backgroundColor: 'white' },
            stickyHead: false,
            style: { height: '54vh' },
            header: 'thead-light',
            data: dataPhong,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead keyCol='phong' content='Phòng thi' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='coSo' content='Cơ sở' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead typeSearch='admin-select' data={SelectAdapter_NganhByDot(this.props.idDot)} keyCol='nganh' style={{ width: '40%', textAlign: 'center' }} content='Ngành dự tuyển' />
                    <TableHead typeSearch='admin-select' data={SelectAdapter_SdhLoaiMonThi} keyCol='monThi' content='Môn thi' style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='ngayThi' content='Ngày thi' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='thoiLuong' content='Thời lượng' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='maxSize' content='Thí sinh tối đa' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    {/* <TableHead keyCol='dangThucThi' content='Dạng thức thi' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}
                    />
                    <TableHead keyCol='giamThiMot' content='Giám thị' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}
                    /> */}
                    <TableHead keyCol='thaoTac' content='Thao tác' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.tenPhong} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.coSo} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.tenNganh} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.loaiMonThi} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.ngayThi} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.thoiLuong} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={`${item.daSap ? item.daSap : 0} / ${item.maxSize}`} />
                    {/* <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.dangThucThi} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.giamThiMot} /> */}
                    <TableCell type='buttons' permission={permission} content={item}  >
                        {
                            permission.write ? <button className='btn btn-success' style={{ display: !this.state.isComplete ? '' : 'none' }} onClick={() => T.confirm('Thêm thí sinh vào phòng', 'Xác nhận thêm thí sinh vào phòng thi này', true,
                                isConfirm => isConfirm && this.props.createSingle({ idThiSinh: dataThiSinh.id, maMonThi: dataThiSinh.maMonThi, idLichThi: item.id, maHinhThuc: dataThiSinh.hinhThuc }, () => {
                                    T.alert('Thêm thí sinh vào phòng thi thành công!', 'success', false, 1000);
                                    this.props.rerenderParent();
                                    this.hide();
                                }))} disabled={!permission.write}>
                                <i className='fa fa-lg fa-arrow-right' /> Xếp thí sinh
                            </button> : ''
                        }
                    </TableCell>
                </tr>
            )
        });
        return this.renderModal({
            title: 'Danh sách phòng thi thỏa điều kiện',
            size: 'elarge',
            body:
                <div style={{ height: '75vh', overflow: 'auto' }}>
                    <div className='tile'>
                        <h5>Danh sách phòng thi thỏa điều kiện</h5>
                        <div style={{ marginBottom: '10px' }}>
                            Tìm thấy: {<b>{dataPhong.length}</b>} Phòng thi
                        </div>
                        {table}
                        <div className='col-md-12' style={{ textAlign: 'right' }}>
                            <button className='btn btn-primary' type='button' onClick={() => this.props.callBackChangeTabs(0, this.hide())} disabled={!permission.write}>
                                <i className='fa fa-fw fa-lg fa-plus' />Tạo mới
                            </button>
                        </div>
                    </div>
                </div>
        });
    }

}

class UnScheduledList extends AdminPage {
    state = { checked: {}, sortTerm: 'tenNganh_ASC', isKeySearch: false, isFixCol: true, isCoDinh: false, data: {}, listThiSinh: [], isSort: true };

    defaultSortTerm = 'tenNganh_ASC'
    componentDidMount() {
        this.getPage(undefined, undefined, '');
    }
    getPage = (pageN, pageS, pageC) => {
        let filter = { ...this.state.filter, idDot: this.props.idDot, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getUnScheduledList(pageN, pageS, pageC, filter, page => this.setState({ page }));
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }
    rerender = () => {
        this.getPage(undefined, undefined, '');
    }

    render() {
        const permission = this.props.permission;
        const { list = [], pageNumber, pageSize, pageTotal, totalItem } = this.state.page || { list: [], pageNumber: 0, pageSize: 1 };
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        const table = renderDataTable({
            data: list,
            stickyHead: true,
            header: 'thead-light',
            renderHead: () => (<>
                <tr>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='#' />
                    <TableHead keyCol='sbd' style={{ width: 'auto', whiteSpace: 'nowrap' }} content='SBD' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='ten' style={{ width: '30%', whiteSpace: 'nowrap' }} content='Họ tên' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead typeSearch='admin-select' data={SelectAdapter_PhanHe(this.props.idDot)} keyCol='phanHe' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phân hệ' onSort={onSort} onKeySearch={onKeySearch} />
                    <TableHead typeSearch='admin-select' data={SelectAdapter_SdhHinhThucTuyenSinh} keyCol='hinhThuc' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Hình thức' onSort={onSort} onKeySearch={onKeySearch} />
                    <TableHead typeSearch='admin-select' data={SelectAdapter_NganhByDot(this.props.idDot)} keyCol='tenNganh' style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngành dự tuyển' onSort={onSort} onKeySearch={onKeySearch} />
                    <TableHead typeSearch='admin-select' data={SelectAdapter_SdhLoaiMonThi} keyCol='toHop' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổ hợp thi' onKeySearch={onKeySearch} />
                    <TableHead keyCol='monThi' style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Môn thi'
                    // onSort={onSort} onKeySearch={onKeySearch}
                    />
                    <TableHead keyCol='thaoTac' content='Thao tác' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                </tr>
            </>
            ),
            renderRow: (item, index) => {
                const rows = [];
                const arrayMonThi = item.monThi ? T.parse(item.monThi) : [];
                let rowSpan = arrayMonThi.length;
                if (rowSpan) {
                    for (let i = 0; i < rowSpan; i++) {
                        const { monThi, toHop, maToHop, maMonThi } = arrayMonThi[i] || { monThi: '', toHop: '', maToHop: '', maMonThi: '' };
                        if (i == 0) {
                            rows.push(
                                <tr key={rows.length} >
                                    <TableCell className='sticky-col pin-1-col' style={{ textAlign: 'right' }} content={(index + 1)} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.sbd} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.ho} ${item.ten}`} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.phanHe} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hinhThuc} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tenNganh} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={toHop} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={monThi} />
                                    <TableCell type='buttons' permission={permission} content={item}  >
                                        {
                                            permission.write ? <button className='btn btn-success' style={{ display: !this.state.isComplete ? '' : 'none' }} onClick={() => this.scheduleSingle.show({ ...item, maToHop, maMonThi })} disabled={!permission.write}>
                                                <i className='fa fa-lg fa-arrow-right' /> Xếp thí sinh
                                            </button> : ''
                                        }
                                    </TableCell>
                                </tr>);

                        } else {
                            rows.push(<tr key={rows.length} >
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={toHop} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={monThi} />
                                <TableCell type='buttons' permission={permission} content={item}  >
                                    {
                                        permission.write ? <button className='btn btn-success' style={{ display: !this.state.isComplete ? '' : 'none' }} onClick={() => this.scheduleSingle.show({ ...item, maToHop })} disabled={!permission.write}>
                                            <i className='fa fa-lg fa-arrow-right' /> Xếp thí sinh
                                        </button> : ''
                                    }
                                </TableCell>
                            </tr>);
                        }
                    }
                }
                return rows;
            }
        }
        );

        return <div className='tile'>
            <ScheduleSingle ref={e => this.scheduleSingle = e} getData={this.props.getRoomForSingleCandidate} permission={permission} callBackChangeTabs={this.props.callBackChangeTabs} createSingle={this.props.createSingleCandidateIntoRoom} idDot={this.props.idDot} rerenderParent={this.rerender} />
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
        </div >;
    }
}
const mapStateToProps = state => ({ system: state.system, sdhTsLichThiSingle: state.sdh.sdhTsLichThi });
const mapActionsToProps = {
    getUnScheduledList, getRoomForSingleCandidate, createSingleCandidateIntoRoom
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(UnScheduledList);
