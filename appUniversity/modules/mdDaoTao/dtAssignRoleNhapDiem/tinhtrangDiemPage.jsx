import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, TableCell, TableHead, renderDataTable } from 'view/component/AdminPage';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { getTinhTrangDiemPage } from './redux';
import Pagination from 'view/component/Pagination';

class TinhTrangDiemPage extends AdminPage {
    state = { dataRender: [] }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.showAdvanceSearch();
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester;
                this.namFilter.value(namHoc);
                this.hocKyFilter.value(hocKy);
                this.khoaSinhVienFilter.value(parseInt(namHoc));
                this.loaiHinhDaoTaoFilter.value('CQ');
                this.kyThiFilter.value('QT');
                this.setState({
                    filter: { ...this.state.filter, namHoc, hocKy, khoaSinhVien: parseInt(namHoc), loaiHinhDaoTao: 'CQ', kyThi: 'QT', searchTerm: '' }
                }, () => {
                    T.alert('Đang lấy dữ liệu!', 'warning', false, null, true);
                    this.getData(1, 25, () => T.alert('Lấy dữ liệu thành công', 'success', false, 1000));
                });
            });
        });
    }

    getData = (pageN, pageS, done) => {
        const { filter } = this.state;

        this.props.getTinhTrangDiemPage(pageN, pageS, filter, data => {
            this.setState({ dataRender: data.filter(i => i.thanhPhan && (filter.kyThi == 'QT' ? i.thanhPhan != 'CK' : i.thanhPhan == 'CK') && (!filter.status || filter.status == i.status)), listChosen: [] }, () => done && typeof done === 'function' && done());
        });
    }

    handleChange = (value, key, pageNumber, pageSize) => {
        this.setState({ filter: { ...this.state.filter, [key]: value } }, () => {
            this.getData(pageNumber, pageSize);
        });
    }

    handleKeySearch = (data) => {
        const { filter } = this.state,
            [key, value] = data.split(':');

        this.setState({ filter: { ...filter, [key]: value } }, () => {
            this.getData();
        });
    }

    renderGiangVien = (item) => {
        const roleNhapDiem = item.roleNhapDiem.filter(i => i.idExam ? (i.idExam == item.idExam) : (i.kyThi == item.thanhPhan)),
            listTenGv = roleNhapDiem.length ? roleNhapDiem.map(role => role.tenGiangVien) : [];

        return (listTenGv.length ? listTenGv.map((i, idx) => <div key={idx}>{i}</div>) : '');
    }

    table = (dataAssignRole) => renderDataTable({
        emptyTable: 'Không có thời khóa biểu!',
        stickyHead: dataAssignRole?.length > 10,
        header: 'thead-light',
        loadingStyle: { backgroundColor: 'white' },
        divStyle: { height: '60vh' },
        data: dataAssignRole,
        renderHead: () => {
            return <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: '40%', whiteSpace: 'nowrap' }} content='Tên học phần' keyCol='tenHocPhan' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Điểm thành phần' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Lớp' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Số lượng sinh viên' />
                <TableHead style={{ width: '20%', whiteSpace: 'nowrap' }} content='Ca thi' />
                <TableHead style={{ width: '40%', whiteSpace: 'nowrap' }} content='Giảng viên nhập điểm' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Giảng viên' />
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
            </tr>;
        },
        renderRow: (item, index) => {
            const icon = item.isVerified ? 'fa fa-lg fa-check-circle' : (item.idCode ? 'fa fa-lg fa-pencil' : 'fa fa-lg fa-file'),
                text = item.isVerified ? 'Đã xác nhận' : (item.idCode ? 'Đã nhập điểm' : 'Chưa nhập điểm'),
                color = item.isVerified ? 'green' : (item.idCode ? 'blue' : 'gray'),
                listTenGv = item.tenGiangVien ? item.tenGiangVien.split(',') : [];

            return <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell content={item.maHocPhan} />
                <TableCell content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{item.tpDiem.sort((a, b) => parseInt(b.priority) - parseInt(a.priority)).map(i => <div key={`${index}${i.thanhPhan}`}><b>{i.thanhPhan}</b>: {i.phanTram}%</div>)}</>} />
                <TableCell style={{ whiteSpace: 'pre-wrap', textAlign: 'center' }} content={item.maLop} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.countStudent} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.idExam ? <>
                    {`Ca thi: ${item.caThi}`}<br />
                    {`Phòng: ${item.phong}`}<br />
                    {`Ngày: ${T.dateToText(parseInt(item.batDau))}`}
                </> : ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={this.renderGiangVien(item)} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={(listTenGv.length ? listTenGv.map((i, idx) => <div key={idx}>{i}</div>) : '')} />
                <TableCell style={{ whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
            </tr>;
        }
    });

    render() {
        const adapterKyThi = [{ id: 'QT', text: 'Quá trình' }, { id: 'CK', text: 'Cuối kỳ' }],
            adapterTinhTrang = [{ id: 1, text: 'Chưa nhập điểm' }, { id: 2, text: 'Đã nhập điểm' }, { id: 3, text: 'Đã xác nhận' }],
            { dataRender } = this.state,
            { pageNumber, pageSize, pageTotal, totalItem } = dataRender && dataRender[0] ? dataRender[0] : { pageNumber: 1, pageSize: 25, pageTotal: 0, totalItem: 0 };

        return this.renderPage({
            icon: 'fa fa-stack-overflow',
            title: 'Tình trạng nhập điểm',
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.namFilter = e} data={SelectAdapter_SchoolYear} className='col-md-2' label='Năm học' onChange={value => this.handleChange(value.id, 'namHoc', pageNumber, pageSize)} />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-2' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={value => this.handleChange(value?.id, 'hocKy', pageNumber, pageSize)} />
                <FormSelect ref={e => this.khoaSinhVienFilter = e} className='col-md-2' label='Khoá' data={SelectAdapter_DtKhoaDaoTao} onChange={value => this.handleChange(value?.id, 'khoaSinhVien', pageNumber, pageSize)} />
                <FormSelect ref={e => this.loaiHinhDaoTaoFilter = e} className='col-md-2' label='Loại hình đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} onChange={value => this.handleChange(value?.id, 'loaiHinhDaoTao', pageNumber, pageSize)} />
                <FormSelect ref={e => this.kyThiFilter = e} className='col-md-2' label='Loại điểm' data={adapterKyThi} onChange={value => this.handleChange(value.id, 'kyThi', pageNumber, pageSize)} />
                <FormSelect ref={e => this.status = e} className='col-md-2' label='Tình trạng' data={adapterTinhTrang} onChange={value => this.handleChange(value?.id, 'status')} allowClear />
            </div>,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={0} to='/user/dao-tao/grade-manage'>Điểm</Link>,
                'Tình trạng nhập điểm'
            ],
            content: <>
                <div className='tile'>
                    <div style={{ margin: '5px 0' }}>
                        <Pagination style={{ marginLeft: '', position: 'initial' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                            getPage={this.getData} pageRange={5} />
                    </div>
                    {this.table(dataRender)}
                </div>
            </>,
            backRoute: '/user/dao-tao/grade-manage',
            buttons: [
                { icon: 'fa-download', tooltip: 'Xuất dữ liệu', className: 'btn btn-success', onClick: e => e && e.preventDefault() || T.handleDownload(`/api/dt/tinh-trang-diem/export?filter=${T.stringify(this.state.filter)}`) },
            ],
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTinhTrangDiemPage, getScheduleSettings };
export default connect(mapStateToProps, mapActionsToProps)(TinhTrangDiemPage);