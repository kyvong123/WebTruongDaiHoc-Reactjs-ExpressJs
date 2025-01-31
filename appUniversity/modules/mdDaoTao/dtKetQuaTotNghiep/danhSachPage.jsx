import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderDataTable, TableCell, CirclePageButton } from 'view/component/AdminPage';
import { getDtKetQuaTotNghiepPage, deleteKetQuaTotNghiep } from './redux';
import Pagination from 'view/component/Pagination';


class userPage extends AdminPage {
    state = { filter: {} }

    getPage = (pageN, pageS) => {
        this.props.getDtKetQuaTotNghiepPage(pageN, pageS, { ...this.state.filter, ...this.props.filter });
    }

    handleDelete = (item) => {
        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn xóa kết quả tốt nghiệp này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.deleteKetQuaTotNghiep(item.id, () => {
                    this.getPage();
                    T.notify('Xóa kết quả tốt nghiệp thành công!', 'success');
                });
            }
        });
    }

    handleDownload = () => {
        if (!this.props.filter.idDot) return T.notify('Vui lòng chọn đợt xét tốt nghiệp!', 'danger');
        T.handleDownload(`/api/dt/ket-qua-tot-nghiep/export?filter=${T.stringify({ ...this.state.filter, ...this.props.filter })}`);
    }

    tableList = (list) => renderDataTable({
        data: list,
        emptyTable: 'Hiện chưa có dữ liệu nào!',
        header: 'thead-light',
        stickyHead: list?.length > 15,
        divStyle: { height: '65vh' },
        renderHead: () => (<tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>THAO TÁC</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>HỌ VÀ TÊN</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>GIỚI TÍNH</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>NGÀY SINH</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>NƠI SINH</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>NGÀNH ĐÀO TẠO</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>CHUYÊN NGÀNH ĐÀO TẠO</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>CHƯƠNG TRÌNH HỌC</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>HÌNH THỨC ĐÀO TẠO</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>ĐIỂM TRUNG BÌNH TÍCH LŨY</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>XẾP LOẠI TỐT NGHIỆP</th>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>KẾT QUẢ</th>
            <th style={{ width: '70%', whiteSpace: 'nowrap' }}>LƯU Ý</th>
        </tr>),
        renderRow: (item, index) => {
            return (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons' permission={{ delete: true }} content={item} onDelete={() => this.handleDelete(item)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.gioiTinh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngaySinh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.noiSinh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nganhDaoTao} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.chuyenNganh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hinhThuc} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diem} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.xepLoai} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ketQua} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.luuY} />
                </tr>
            );
        }
    });

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.kqTotNghiep?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };

        return <div>
            {list && this.tableList(list)}
            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                getPage={this.getPage} pageRange={6} />
            <CirclePageButton type='export' onClick={e => e && e.preventDefault() || this.handleDownload()} />
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system, kqTotNghiep: state.daoTao.kqTotNghiep });
const mapActionsToProps = { getDtKetQuaTotNghiepPage, deleteKetQuaTotNghiep };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(userPage);
