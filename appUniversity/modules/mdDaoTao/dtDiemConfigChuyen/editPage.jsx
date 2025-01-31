import React from 'react';
import { connect } from 'react-redux';
import { getDtDiemChuyenAll } from './redux';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import AddModal from './addModal';


class EditDiemChuyenPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            const route = T.routeMatcher('/user/dao-tao/grade-manage/thang-diem/:khoaSV');
            let khoaSV = route.parse(window.location.pathname)?.khoaSV;
            this.setState({ khoaSV }, () => {
                this.props.getDtDiemChuyenAll({ khoaSinhVien: khoaSV });
            });
        });
    }

    render() {
        let { items: listData, listHeDiem, listXepLoai } = this.props.diemChuyen ? this.props.diemChuyen : { items: [], listHeDiem: [], listXepLoai: [] };
        let width = 50 / (listHeDiem.length + 1);

        let listThangDiem = [];
        listData.map(item => {
            if (!listThangDiem.find(i => i.min == item.min && i.max == item.max)) {
                listThangDiem.push({ min: item.min, max: item.max });
            }
        });

        let table = renderTable({
            getDataSource: () => listThangDiem,
            header: 'thead-light',
            stickyHead: listThangDiem.length > 20,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thang điểm 10</th>
                    {listHeDiem.map((item, index) => (<th key={index} style={{ width: `${width}%`, whiteSpace: 'nowrap' }}>{item.ten}</th>))}
                    <th style={{ width: `${width}%`, whiteSpace: 'nowrap' }}>Xếp loại</th>
                </tr>
            ),
            renderRow: (item, index) => {
                let xepLoai = listXepLoai.find(i => i.min == item.min && i.max == item.max);
                return (<tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`Từ ${item.min} đến dưới ${item.max}`} />
                    {listHeDiem.map((he, idx) => {
                        let heDiem = listData.find(i => i.loaiHe == he.id && i.min == item.min && i.max == item.max);
                        return <TableCell style={{ whiteSpace: 'nowrap' }} key={idx} content={heDiem.giaTri} />;
                    })}
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={xepLoai.ten} />
                </tr>);
            }
        });

        return this.renderPage({
            icon: 'fa fa-leaf',
            title: `Thang điểm áp dụng cho khóa ${this.state.khoaSV}`,
            content: <div className='tile'>
                <AddModal ref={e => this.modal = e} listHeDiem={listHeDiem} />
                <div className='col-md-12'>
                    {table}
                </div>
            </div>,
            backRoute: '/user/dao-tao/grade-manage/thang-diem',
            onCreate: e => e && e.preventDefault() || this.modal.show({ khoaSV: this.state.khoaSV })
        });
    }
}

const mapStateToProps = state => ({ system: state.system, diemChuyen: state.daoTao.diemChuyen });
const mapActionsToProps = { getDtDiemChuyenAll };
export default connect(mapStateToProps, mapActionsToProps)(EditDiemChuyenPage);