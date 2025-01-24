import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable, FormTabs, FormSelect } from 'view/component/AdminPage';
import { getThongTinThangDiem, createThangDiemKhoaSV } from './redux';
import { Link } from 'react-router-dom';
import AddModal from './addModal';
import { Tooltip } from '@mui/material';

class DtDiemChuyenPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getThongTinThangDiem();
        });
    }

    chooseThangDiem = (item) => {
        let { namTuyenSinh } = this.state, { items } = this.props.diemChuyen || { items: [] },
            thangDiem = Object.keys(items.groupBy('maThangDiem'));

        return namTuyenSinh == item.namTuyenSinh ? <FormSelect ref={e => this.maThangDiem = e} data={thangDiem} value={item.maThangDiem} /> : item.maThangDiem;
    }

    handleSave = (item) => {
        let maThangDiem = this.maThangDiem.value();
        if (!maThangDiem) {
            T.notify('Vui lòng chọn thang điểm!', 'danger');
            return;
        }
        this.props.createThangDiemKhoaSV(item.namTuyenSinh, maThangDiem, () => {
            this.setState({ namTuyenSinh: null });
        });
    }

    table = (list) => renderTable({
        getDataSource: () => list,
        header: 'thead-light',
        stickyHead: list.length > 10,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Khóa sinh viên</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Mã thang điểm</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
        ),
        renderRow: (item, index) => {
            let { namTuyenSinh } = this.state, edit = namTuyenSinh == item.namTuyenSinh;
            return (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namTuyenSinh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={this.chooseThangDiem(item)} />
                    <TableCell type='buttons' onEdit={() => {
                        if (edit) {
                            this.handleSave(item);
                        } else this.setState({ namTuyenSinh: item.namTuyenSinh });
                    }} permission={{ write: true }} >
                        {edit && <Tooltip title='Hủy chỉnh sửa' arrow>
                            <button className='btn btn-secondary' onClick={(e) => e && e.preventDefault() || this.setState({ namTuyenSinh: null })}>
                                <i className={'fa fa-lg fa-ban'} />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr>
            );
        }
    })

    thangDiem = (list) => renderTable({
        getDataSource: () => list,
        header: 'thead-light',
        stickyHead: list.length > 10,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Mã thang điểm</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
        ),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item} />
                <TableCell type='buttons' onEdit={() => this.modal.show({ maThangDiem: item })} permission={{ write: true }} />
            </tr>
        )
    })

    render() {
        let { items, listKhoaSinhVien, listHeDiem } = this.props.diemChuyen || { items: [], listKhoaSinhVien: [], listHeDiem: [] },
            thangDiem = Object.keys(items.groupBy('maThangDiem'));

        return this.renderPage({
            icon: 'fa fa-leaf',
            title: 'Thang điểm - xếp loại',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Điểm</Link>,
                'Thang điểm - xếp loại'
            ],
            content: <>
                <AddModal ref={e => this.modal = e} listHeDiem={listHeDiem} dataThangDiem={items} />
                <FormTabs tabs={[
                    {
                        title: 'Danh sách thang điểm',
                        component: <div className='tile'>
                            {this.thangDiem(thangDiem)}
                        </div>
                    },
                    {
                        title: 'Danh sách khóa sinh viên',
                        component: <>
                            <div className='tile'>
                                {this.table(listKhoaSinhVien)}
                            </div>
                        </>
                    }
                ]} />
            </>,
            backRoute: '/user/dao-tao/grade-manage',
            onCreate: e => e && e.preventDefault() || this.modal.show()
        });
    }
}

const mapStateToProps = state => ({ system: state.system, diemChuyen: state.daoTao.diemChuyen });
const mapActionsToProps = { getThongTinThangDiem, createThangDiemKhoaSV };
export default connect(mapStateToProps, mapActionsToProps)(DtDiemChuyenPage);