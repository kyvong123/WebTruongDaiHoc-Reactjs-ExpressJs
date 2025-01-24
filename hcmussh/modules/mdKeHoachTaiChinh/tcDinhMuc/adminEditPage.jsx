import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { getDinhMuc, deleteDinhMucDetail, getDinhMucHocPhiKhac } from './redux';
import DinhMucDetail from './components/dinhMucDetail';
import DinhMucHocPhiKhac from './components/DinhMucHocPhiKhac';
class TcDinhMucDetailPage extends AdminPage {
    state = {}
    componentDidMount() {
        T.ready('/user/finance', () => {
            const params = T.routeMatcher('/user/finance/dinh-muc/:namHoc/:hocKy/:namTuyenSinh').parse(window.location.pathname);
            this.setState({ namHoc: params.namHoc, hocKy: params.hocKy, namTuyenSinh: params.namTuyenSinh }, () => {
                this.getData();
            });
        });
    }

    getData = (done) => {
        this.props.getDinhMuc(this.state.namHoc, this.state.hocKy, this.state.namTuyenSinh, done);
    }

    onAdd = (e, item = {}) => {
        e.preventDefault();
        this.detailModal.show({ ...item, namHoc: this.state.namHoc, hocKy: this.state.hocKy, namTuyenSinh: this.state.namTuyenSinh });
    }

    deleteDinhMucDetail = (item) => {
        T.confirm('Xóa định mức học phí', 'Xác nhận xóa định mức học phí', true, (confirm) => {
            confirm && this.props.deleteDinhMucDetail(item.id, () => {
                this.getData();
            });
        });
    }

    renderDinhMuc = (dinhMuc, permission) => {
        return dinhMuc.bac.map(bac => {
            return <div className='tile' key={bac.maBac}>
                <h3 className='tile-header'>{bac.tenBac}</h3>
                <div className='tile-body row'>
                    <div className='col-md-12'>
                        {renderTable({
                            getDataSource: () => bac.details,
                            renderHead: () => <tr>
                                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>STT</th>
                                <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Hệ đào tạo</th>
                                <th style={{ whiteSpace: 'nowrap', width: '30%' }}>Nhóm</th>
                                <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Ngành</th>
                                <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Loại Học Phần</th>
                                <th style={{ whiteSpace: 'nowrap', width: '10%' }}>Số tiền (VNĐ)</th>
                                <th style={{ whiteSpace: 'nowrap', width: '10%' }}>Học phí học kỳ (VNĐ)</th>
                                <th style={{ whiteSpace: 'nowrap', width: '10%' }}>Giới hạn thu (VNĐ)</th>
                                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Thao tác</th>
                            </tr>,
                            renderRow: (item, index) => {
                                return <tr key={item.id}>
                                    <TableCell style={{ textAlign: 'center' }} type='number' content={index + 1} />
                                    <TableCell content={item.tenHe} />
                                    <TableCell content={item.tenNhom} />
                                    <TableCell content={item.tenNganh} />
                                    <TableCell content={item.loaiHocPhan} />
                                    <TableCell type='number' content={item.soTien} />
                                    <TableCell type='number' content={item.thuHocPhiHocKy ? (item.hocPhiHocKy || 0) : null} />
                                    <TableCell type='number' content={item.gioiHan} />
                                    <TableCell type='buttons' onEdit={() => this.detailModal.show({ ...item, namHoc: this.state.namHoc, hocKy: this.state.hocKy, namTuyenSinh: this.state.namTuyenSinh })} onDelete={() => this.deleteDinhMucDetail(item)} permission={permission}>
                                    </TableCell>
                                </tr>;
                            }
                        })}
                    </div>
                    <div className='col-md-12 d-flex justify-content-end'>
                        <button className='btn btn-success' onClick={e => this.onAdd(e, { bac: bac.maBac })}>
                            <i className='fa fa-lg fa-plus' />
                            Thêm định phí
                        </button>
                    </div>
                </div>
            </div>;
        });
    }

    render() {
        const permission = this.getUserPermission('tcDinhMuc', ['read', 'write', 'delete']);
        let buttons = [];
        buttons.push({ className: 'btn-warning', icon: 'fa-cog', onClick: e => e.preventDefault() || this.hocPhiKhac.show({ namHoc: this.state.namHoc, hocKy: this.state.hocKy }) });
        const item = this.props.dinhMuc?.item || null;
        return this.renderPage({
            title: 'Định mức học phí' + (this.state.namHoc ? ` năm học ${this.state.namHoc}-${parseInt(this.state.namHoc) + 1} - HK${this.state.hocKy} - Khóa ${this.state.namTuyenSinh}` : ''),
            icon: 'cogs',
            content: <div>
                {item && this.renderDinhMuc(item, permission)}
                <DinhMucDetail ref={e => this.detailModal = e} getData={this.getData} permission={permission} />
                <DinhMucHocPhiKhac ref={e => this.hocPhiKhac = e} getDinhMuc={this.props.getDinhMucHocPhiKhac} permission={permission} />
            </div>,
            buttons
        });
    }
}


const mapStateToProps = state => ({ system: state.system, dinhMuc: state.finance.tcDinhMuc });
const mapActionsToProps = { getDinhMuc, deleteDinhMucDetail, getDinhMucHocPhiKhac };
export default connect(mapStateToProps, mapActionsToProps)(TcDinhMucDetailPage);
