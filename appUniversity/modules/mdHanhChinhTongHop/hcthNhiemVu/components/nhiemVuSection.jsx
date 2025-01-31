import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';


class NhiemVuSection extends AdminPage {
    //TODO: chỉnh sửa cán bộ xử lý và ghi chú
    render() {
        const table = renderTable({
            loadingClassName: 'd-flex justify-content-center align-items-center',
            loadingOverlay: false,
            getDataSource: () => this.props.nhiemVu,
            renderHead: () => <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '40%' }}>Tiêu đề</th>
                <th style={{ width: '60%' }}>Nội dung</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thêm bởi</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
            </tr>,
            renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell type='link' content={item.tieuDe} url={
                        T.debug ? `http://localhost:7012/user/nhiem-vu/${item.id}` :
                            `https://hcmussh.edu.vn/user/nhiem-vu/${item.id}`
                    } />
                    <TableCell content={
                        <div className='d-flex flex-column'>
                            <span>{item.noiDung}</span>
                            {item.ghiChu && <span><span className='text-primary'>Ghi chú :</span>{item.ghiChu}</span>}
                        </div>} />
                    <TableCell content={item.hoVaTen?.normalizedName()} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.trangThai == 'MO' ? <span className='badge badge-pill badge-success' style={{ fontSize: '1em' }}>Đang diễn ra</span> : <span class='badge badge-pill badge-danger'>Đã kết thúc</span>} />
                </tr>;
            }
        });
        return <div className='tile'>
            <h3 className='tile-header'>Danh sách nhiệm vụ liên kết</h3>
            <div className='tile-body'>
                {table}
            </div>
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, false, { forwardRef: true })(NhiemVuSection);
