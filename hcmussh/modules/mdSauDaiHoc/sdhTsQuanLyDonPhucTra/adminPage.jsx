import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderDataTable, FormCheckbox, TableHead, FormTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getSdhTsDonPhucTraPage, updateSdhTsDonPhucTra } from './redux';
import { getSdhTsProcessingDot } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';
import { Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';

class QuanLyPhucTraPage extends AdminPage {
    state = { infoDot: {}, listDon: [], listMon: [] };
    defaultSortTerm = 'ten_ASC';
    diemMoi = {};
    componentDidMount() {
        this.props.getSdhTsProcessingDot(data => {
            if (data && data.id) {
                this.setState({ idDot: data.id }, () => {
                    this.getPage();
                });
            } else {
                this.props.history.push('/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh');
            }
        });
    }
    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, idDot: this.state.idDot, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.setState({ filter }, () => this.props.getSdhTsDonPhucTraPage(pageN, pageS, pageC, filter, done));
    }
    update = (item, tinhTrang) => {
        let diemMoi = '';
        if (item.tinhTrang == 4 || item.tinhTrang == 3) {
            return T.notify('Không thể thay đổi trạng thái đơn này', 'info');
        }
        if (tinhTrang == 1 && item.tinhTrang == 3) return T.notify('Vui lòng chuyển trạng thái đơn sang đang xử lý và nhập điểm trước', 'info');
        else if (tinhTrang == 3 && item.tinhTrang != 3) {
            if (!this.diemMoi[item.id].value()) return T.notify('Vui lòng cập nhật điểm trước khi xử lý đơn', 'info');
            else diemMoi = this.diemMoi[item.id].value();
        }
        else if (tinhTrang == 4) {
            if (item.tinhTrang != 1) {
                return T.notify('Chỉ có thể từ chối đơn đang trong tình trạng chờ xử lý', 'info');
            }
        }
        const changes = { ...item, diemMoi, tinhTrang };
        this.props.updateSdhTsDonPhucTra(changes, this.state.filter);
    }
    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    handleTinhTrang = (item, permission) => {
        return (
            <div className='btn-group' role='group'>
                <button id='btnGroupDrop1' type='button' className={'btn dropdown-toggle ' + this.mapperStyle[item.tinhTrang]} style={{ fontWeight: 'normal' }} data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    <Tooltip title={this.selectTinhTrang.find(i => i.id == item.tinhTrang).text} arrow placement='right-end'>
                        <span>
                            {this.mapperTinhTrang[item.tinhTrang]}
                        </span>
                    </Tooltip>
                </button>
                <div className='dropdown-menu' aria-labelledby='btnGroupDrop1' style={{ position: 'absolute' }}>
                    {
                        this.selectTinhTrang.map((_item) => {
                            return (
                                <p style={{ marginBottom: '0', cursor: 'pointer' }} className='dropdown-item' key={_item.id}
                                    onClick={() => permission.write && this.update(item, Number(_item.id))}>
                                    {_item.text}
                                </p>
                            );
                        })
                    }
                </div>
            </div>
        );
    }
    mapperStyle = {
        1: 'btn-primary',
        2: 'btn-warning',
        3: 'btn-success',
        4: 'btn-danger',
    }

    mapperTinhTrang = { 1: 'Chờ xử lý', 2: 'Đang xử lý', 3: 'Đã xử lý', 4: 'Từ chối' };

    selectTinhTrang = [{ id: 1, text: 'Chờ xử lý' }, { id: 2, text: 'Đang xử lý' }, { id: 3, text: 'Đã xử lý' }, { id: 4, text: 'Từ chối' }];

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.sdhTsDonPhucTra && this.props.sdhTsDonPhucTra.page ?
            this.props.sdhTsDonPhucTra.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        let permission = this.getUserPermission('sdhTsQuanLyPhucTra', ['read', 'write', 'delete']);
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu lịch thi',
            stickyHead: this.state.isCoDinh,
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            data: list.sort((a, b) => b.ngayDangKy - a.ngayDangKy),
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead keyCol='sbd' content='Số báo danh' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='hoTen' content='Họ tên' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='tenNganh' content='Ngành dự tuyển' style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='monThi' content='Môn thi' style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='diemCu' content='Điểm cũ' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onSort={onSort} />
                    <TableHead keyCol='diemMoi' content='Điểm mới' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='ngayPhucTra' content='Ngày phúc tra' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onSort={onSort} />
                    <TableHead keyCol='trangThai' content='Trạng thái đơn' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.SBD} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.hoTen} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', minWidth: '120px' }} content={item.tenNganh} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', minWidth: '120px' }} content={item.monThi} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.diemCu} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={
                        item.tinhTrang == 2 ? <FormTextBox ref={e => this.diemMoi[item.id] = e} /> : item.diemMoi
                    } />
                    <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.ngayDangKy} />
                    <TableCell style={{ textAlign: 'center' }} content={this.handleTinhTrang(item, item.VALID ? permission : { ...permission, write: false })} />
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Quản lý đơn phúc tra',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Quản lý đơn phúc tra'
            ],
            content: <>
                <div className='tile'>
                    <h4>Danh sách đơn phúc tra</h4>
                    <div style={{ marginBottom: '10px' }}>
                        Kết quả: {<b>{totalItem}</b>} đơn
                    </div>
                    <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                        <div className='title'>
                            <div style={{ gap: 10, display: 'inline-flex' }}>
                                <FormCheckbox ref={e => this.isKeySearch = e} label='Tìm theo cột' onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                                <FormCheckbox ref={e => this.isCoDinh = e} label='Cố định bảng' onChange={value => this.setState({ isCoDinh: value })} style={{ marginBottom: '0' }} />
                                <FormCheckbox label='Sort' onChange={value => this.setState({ isSort: value })} style={{ marginBottom: '0' }} />
                            </div>
                        </div>
                        <div style={{ gap: 10 }} className='btn-group'>
                            <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem }} getPage={this.getPage} />
                        </div>
                    </div>
                    {table}

                </div>
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
        });

    }
}

const mapStateToProps = state => ({ system: state.system, sdhTsDonPhucTra: state.sdh.sdhTsDonPhucTra });
const mapActionsToProps = {
    getSdhTsDonPhucTraPage, getSdhTsProcessingDot, updateSdhTsDonPhucTra
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(QuanLyPhucTraPage);
