import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { updateReportAcceptance, getReport } from '../redux';
import BaoCaoModal from './baoCaoModal';
class BaoCao extends AdminPage {


    updateReportAcceptance = (id, acceptance) => {
        console.log({ id, acceptance });
        this.setState({ updateRow: id }, () => {
            this.props.updateReportAcceptance(id, acceptance, () => {
                this.props.getReport(this.props.hcthNhiemVu?.item?.id);
            }, () => { this.setState({ updateRow: null }); });
        });
    }


    render() {
        const shcc = this.props.system?.user?.shcc;
        let table = renderTable({
            getDataSource: () => this.props.hcthNhiemVu?.item?.baoCao,
            loadingClassName: 'd-flex justify-content-center align-items-center',
            loadingOverlay: false,
            emptyTable: 'Nhiệm vụ chưa có báo cáo',
            style: { maxHeight: '30vh' },
            renderHead: () => <tr>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>STT</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Cán bộ</th>
                <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Nội dung</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Tệp tin đính kèm</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Trạng thái</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Thời gian cập nhật</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => {
                return <tr key={item.id} disabled={this.state.updateRow == item.id}>
                    <TableCell content={index + 1} />
                    <TableCell contentStyle={{ whiteSpace: 'nowrap' }} content={item.hoVaTenCanBo.normalizedName()} />
                    <TableCell contentStyle={{ whiteSpace: 'pre-line' }} content={item.noiDungBaoCao} />
                    <TableCell content={item.attachment ? <a href={`/api/hcth/nhiem-vu/bao-cao/download/${item.id}`} target='_blank' rel='noopener noreferrer'>{item.attachment}</a> : null} />
                    <TableCell contentStyle={{ whiteSpace: 'nowrap' }} content={item.acceptance == 'c' ? 'Đang kiểm tra' : item.acceptance == 'd' ? 'Từ chối' : item.acceptance == 'a' ? 'Chấp nhận' : 'Soạn thảo'} />
                    <TableCell content={T.dateToText(new Date(item.createdAt))} />
                    <TableCell type='buttons'>
                        {item.shcc == shcc && item.acceptance == 't' && <>
                            <Tooltip arrow title='Chỉnh sửa báo cáo'>
                                <button className='btn btn-primary' onClick={(e) => e.preventDefault() || this.baoCaoModal.show(item)}><i className={this.state.updateRow == item.id ? 'fa fa-spin fa-spinner' : 'fa fa-lg fa-pencil-square-o'} />
                                </button></Tooltip>
                            <Tooltip arrow title='Nộp báo cáo'>
                                <button className='btn btn-success' onClick={(e) => e.preventDefault() || this.updateReportAcceptance(item.id, 'c')}><i className={this.state.updateRow == item.id ? 'fa fa-spin fa-spinner' : 'fa fa-lg fa-check'} />
                                </button></Tooltip>
                        </>
                        }
                        {shcc == this.props.hcthNhiemVu?.item?.nguoiTao && item.acceptance == 'c' && <Tooltip arrow title='Duyệt báo cáo'>
                            <button className='btn btn-success' onClick={(e) => e.preventDefault() || this.updateReportAcceptance(item.id, 'a')}><i className={this.state.updateRow == item.id ? 'fa fa-spin fa-spinner' : 'fa fa-lg fa-check'} />
                            </button></Tooltip>}
                        {shcc == this.props.hcthNhiemVu?.item?.nguoiTao && item.acceptance == 'c' && <Tooltip arrow title='Hủy báo cáo'>
                            <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.updateReportAcceptance(item.id, 'd')}><i className={this.state.updateRow == item.id ? 'fa fa-spin fa-spinner' : 'fa fa-lg fa-times'} />
                            </button></Tooltip>}
                    </TableCell>
                </tr>;
            }
        });
        return <div className='tile'>
            <h3 className='tile-header'>Báo cáo</h3>
            <div className='tile-body row'>
                <div className='col-md-12'>
                    {table}
                </div>
            </div>
            <div className='d-flex justify-content-end align-items-center'>
                {this.props.isManager && <button className='btn btn-success' onClick={(e) => e.preventDefault() || this.baoCaoModal.show()}><i className='fa fa-lg fa-plus' />Thêm báo cáo</button>}
            </div>
            <BaoCaoModal ref={e => this.baoCaoModal = e} />
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system, hcthNhiemVu: state.hcth.hcthNhiemVu });
const mapActionsToProps = { updateReportAcceptance, getReport };
export default connect(mapStateToProps, mapActionsToProps, false, { forwardRef: true })(BaoCao);