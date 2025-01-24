import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, CirclePageButton, TableCell } from 'view/component/AdminPage';
import { getListNhomTuongDuong } from './redux';
import AddModal from './addModal';

class DetailSection extends AdminPage {

    table = (list) => renderTable({
        getDataSource: () => list,
        header: 'thead-light',
        stickyHead: list?.length > 10,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên nhóm môn</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
        ),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item} />
                <TableCell type='buttons' onEdit={() => this.modal.show({ maNhom: item })} permission={{ write: true }} />
            </tr>
        )
    })

    render() {
        const { listNhom } = this.props.tuongDuong || { listNhom: [] };
        return <div className='tile'>
            <AddModal ref={e => this.modal = e} />
            {this.table(listNhom)}
            <CirclePageButton type='create' tooltip='Thêm nhóm tương đương mới' onClick={() => this.modal.show()} />
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system, tuongDuong: state.daoTao.tuongDuong });
const mapActionsToProps = { getListNhomTuongDuong };
export default connect(mapStateToProps, mapActionsToProps)(DetailSection);