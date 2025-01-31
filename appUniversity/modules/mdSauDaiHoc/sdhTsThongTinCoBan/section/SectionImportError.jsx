import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import xlsx from 'xlsx';


class SectionImportError extends AdminPage {
    state = { datas: [] }

    setValue = (datas) => {
        this.setState({ datas });
    }

    downloadErrorExcel = () => {
        xlsx.writeFile(xlsx.utils.table_to_book(document.querySelector('.table.errorTable')), 'Danh sách import lỗi.xlsx');
    }

    table = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Hiện chưa có dữ liệu nào!',
        header: 'thead-light',
        className: 'errorTable table-fix-col',
        stickyHead: list.length > 15,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngoại ngữ</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>C.Ngành dự thi</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Họ tên</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Giới tính</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Nơi sinh</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Trường TN</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm TN</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngành TN</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Xếp loại TN</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Điểm TB</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Hệ đào tạo</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ths. Chuyên ngành</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>GV. Hướng dẫn</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên đề tài</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Nghề nghiệp</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>CQ công tác</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày công tác</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Đ.C liên lạc</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Email</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>ĐT cơ quan</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>ĐT nhà</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>ĐT di động</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>ĐT ưu tiên</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Loại chứng chỉ</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tổng điểm</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Đơn vị cấp</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày cấp</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Điểm nghe</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Điểm nói</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Điểm đọc</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Điểm cấu trúc</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>MSCC</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ghi chú</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>BS. Kiến thức</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>ĐT. Dự thi</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Đề án 911</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Bài báo</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Người nhập</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Lỗi</th>

            </tr>
        ),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngoaiNgu} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.gioiTinh} />
                <TableCell content={item.ngaySinh ? T.dateToText(item.ngaySinh, 'dd/mm/yyyy') : ''} />
                <TableCell content={item.noiSinh} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.truongTn} />
                <TableCell content={item.namTn} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nganhTn} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.xepLoaiTn} />
                <TableCell content={item.diemTB} />
                <TableCell content={item.heDaoTao} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nganhTnThs} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.cbhd} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenDeTai} />
                <TableCell content={item.ngheNghiep} />
                <TableCell content={item.donVi} />
                <TableCell content={item.ngayCongTac} />
                <TableCell content={item.diaChiLienLac} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.email} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dtCq} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dtNha} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dienThoai} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.doiTuongUuTien} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiChungChi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.diemChungChi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.donViCap} />
                <TableCell content={item.ngayCap ? T.dateToText(item.ngayCap, 'dd/mm/yyyy') : ''} />
                <TableCell content={item.diemNghe} />
                <TableCell content={item.diemNoi} />
                <TableCell content={item.diemDoc} />
                <TableCell content={item.diemCauTruc} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maChungChi} />
                <TableCell content={item.ghiChu} />
                <TableCell content={item.btkt} />
                <TableCell content={item.dtDuThi} />
                <TableCell content={item.deAn} />
                <TableCell content={item.tenBaiBao} />
                <TableCell content={item.nguoiNhap} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChuErr} />
            </tr>
        )
    });

    render() {
        return (
            <div>
                <div>
                    {this.table(this.props.data || [])}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionImportError);