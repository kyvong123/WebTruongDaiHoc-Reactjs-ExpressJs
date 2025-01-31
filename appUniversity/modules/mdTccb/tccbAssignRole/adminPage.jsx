import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { getAllTccbAssignRole, createTccbAssignRole, deleteTccbAssignRole } from './redux';
import CreateModal from './modal/createModal';
// import { Tooltip } from '@mui/material';

class TccbPhanQuyenAdminPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/tccb', () => {
            this.props.getAllTccbAssignRole();
        });
    }

    deleteAssignRole = (item) => {
        T.confirm('Xóa quyền', `Bạn muốn xóa quyền ${item.tenRole} của cán bộ ${item.hoVaTen}?`, true, isConfirm => {
            if (isConfirm) {
                this.props.deleteTccbAssignRole(item);
                T.notify(`Xóa phân quyền cho cán bộ ${item.hoVaTen} thành công`, 'success');
            }
        });
    }

    renderListCanBo = (role) => {
        let table = renderTable({
            emptyTable: 'Không có dữ liệu phân quyền',
            style: { maxHeight: '40vh', overflowY: 'auto' },
            stickyHead: false,
            getDataSource: () => this.props.tccbPhanQuyen?.item?.find(item => item.role == role)?.listAssignRole || [],
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian cập nhật</th>
                <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>MSCB</th>
                <th style={{ width: '70%', textAlign: 'center', whiteSpace: 'nowrap' }}>Họ và tên</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian bắt đầu</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian kết thúc</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => (
                <tr key={`${role}-${index}`}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={parseInt(item.timeModified)} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.mscb} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.hoVaTen || ''} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={parseInt(item.ngayBatDau)} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={parseInt(item.ngayKetThuc)} />
                    <TableCell style={{ textAlign: 'right' }} type='buttons' content={item} permission={{ write: true, delete: true }}
                        onDelete={(e) => e.preventDefault() || this.deleteAssignRole(item)}>
                    </TableCell>
                </tr>
            )
        });

        return <>
            <tr key={role}>
                <td colSpan={3}><div >{table}</div></td>
            </tr>
        </>;
    };

    renderRow = () => {
        const components = [];
        const listRole = this.props.tccbPhanQuyen?.item || [];

        if (listRole && listRole.length) {
            listRole.forEach((item, index) => {
                components.push(
                    <tr key={index} onClick={() => this.setState({ expand: this.state.expand == item.role ? null : item.role })}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.tenRole} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.listAssignRole.length} />
                    </tr>
                );

                if (this.state.expand == item.role) {
                    components.push(this.renderListCanBo(item.role));
                }
            });
        }
        return components;
    };

    render() {
        let table = renderTable({
            emptyTable: 'Không có dữ liệu phân quyền',
            // stickyHead: true,
            header: 'thead-light',
            getDataSource: () => this.props.tccbPhanQuyen?.item || [],
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '80%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên quyền</th>
                <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Số cán bộ được phân quyền</th>
            </tr>),
            renderRow: this.renderRow()
        });

        return this.renderPage({
            icon: 'fa fa-briefcase',
            title: 'Phân quyền cán bộ',
            breadcrumb: [
                'Phân quyền'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <CreateModal ref={e => this.modal = e} assignRole={this.props.createTccbAssignRole} />
            </>,
            onCreate: e => e.preventDefault() || this.modal.show()
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbPhanQuyen: state.tccb.tccbPhanQuyen });
const mapActionsToProps = { getAllTccbAssignRole, createTccbAssignRole, deleteTccbAssignRole };
export default connect(mapStateToProps, mapActionsToProps)(TccbPhanQuyenAdminPage);