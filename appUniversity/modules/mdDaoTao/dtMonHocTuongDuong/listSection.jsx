import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, CirclePageButton, renderTable, TableCell } from 'view/component/AdminPage';
import { getApDungNhomTuongDuong } from './redux';
import ApDungModal from './apDungModal';

class ListSection extends AdminPage {

    table = (list) => renderTable({
        getDataSource: () => list,
        header: 'thead-light',
        stickyHead: list?.length > 10,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Tên nhóm môn</th>
                <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Khóa áp dụng</th>
                <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Loại hình áp dụng</th>
                <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Chương trình đào tạo áp dụng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
        ),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maNhom} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.khoaApDung} contentStyle={{ width: 'calc(100vh/3)', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinhApDung} contentStyle={{ width: 'calc(100vh/3)', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ctdtApDung} contentStyle={{ width: 'calc(100vh/3)', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                <TableCell type='buttons' onEdit={() => this.modal.show(item)} permission={{ write: true }} />
            </tr>
        )
    })

    render() {
        const { nhomApDung } = this.props.tuongDuong || { nhomApDung: [] };
        return <div className='tile'>
            <ApDungModal ref={e => this.modal = e} />
            {this.table(nhomApDung)}
            <CirclePageButton type='create' tooltip='Áp dụng nhóm tương đương' onClick={() => this.modal.show()} />
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system, tuongDuong: state.daoTao.tuongDuong });
const mapActionsToProps = { getApDungNhomTuongDuong };
export default connect(mapStateToProps, mapActionsToProps)(ListSection);