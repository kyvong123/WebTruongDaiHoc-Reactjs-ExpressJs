import React from 'react';
import { renderDataTable, TableCell, TableHead, AdminModal } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { Tooltip } from '@mui/material';

class ListChonModal extends AdminModal {
    state = { listNganhChon: [], listMonHocChon: [], listNganh: [], listMonHoc: [] };

    componentDidMount = () => {
        this.disabledClickOutside();
    }

    onShow = (listNganhChon, listMonHocChon) => {
        this.setState({ listNganhChon, listMonHocChon });
    }

    renderNganhComponent = () => {
        let { listNganhChon } = this.state;

        let table = renderDataTable({
            emptyTable: 'Không tìm thấy ngành',
            data: listNganhChon,
            header: 'thead-light',
            stickyHead: listNganhChon && listNganhChon.length > 12 ? true : false,
            divStyle: { height: '60vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã ngành</th>
                    <TableHead style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên ngành' keyCol='tenNganh' />
                    <TableHead style={{ width: 'auto' }} content='Thao tác' />
                </tr>),
            renderRow: (item) => {
                return (
                    <tr key={item.maNganh} >
                        <TableCell style={{ textAlign: 'center' }} content={item.maNganh} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item}>
                            <Tooltip title='Xóa ngành' arrow>
                                <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.props.xoaNganh(item, this.props.listNganh)}>
                                    <i className='fa fa-lg fa-trash' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr >
                );
            }
        });

        return (<>
            <div className='row justify-content border-right'>
                <h6 className='col-md-12 tile-title'>Danh sách ngành</h6>

                <div className='col-md-12'>
                    {table}
                </div>
            </div>
        </>);
    }

    renderMonHocComponent = () => {
        let { listMonHocChon } = this.state;

        let table = renderDataTable({
            emptyTable: 'Không tìm thấy môn học',
            data: listMonHocChon,
            header: 'thead-light',
            stickyHead: listMonHocChon && listMonHocChon.length > 12 ? true : false,
            divStyle: { height: '60vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã môn học' keyCol='ma' />
                    <TableHead style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='ten' />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng TC</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng tiết</th>
                    <TableHead style={{ width: '60%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khoa/Bộ môn' keyCol='khoa' />
                    <TableHead style={{ width: 'auto' }} content='Thao tác' />
                </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={index} >
                        <TableCell style={{ textAlign: 'right' }} content={index} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ma} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.ten, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongTinChi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongTiet} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.tenKhoa} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item}>
                            <Tooltip title='Xóa môn học' arrow>
                                <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.props.xoaMonHoc(item, this.props.listMonHoc)}>
                                    <i className='fa fa-lg fa-trash' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr >
                );
            }
        });

        return (<>
            <div className='row justify-content border-right'>
                <h6 className='col-md-12 tile-title'>Danh sách môn học</h6>

                <div className='col-md-12'>
                    {table}
                </div>
            </div>
        </>);
    }

    render = () => {
        return this.renderModal({
            title: 'Danh sách môn học và ngành đã chọn',
            size: 'elarge',
            body: <>
                <div className='row'>
                    <div className='col-md-8'>
                        {this.renderMonHocComponent()}
                    </div>
                    <div className='col-md-4'>
                        {this.renderNganhComponent()}
                    </div>
                </div>
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ListChonModal);
