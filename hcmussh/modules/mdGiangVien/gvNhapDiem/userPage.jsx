import React from 'react';
import { AdminPage, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { getRoleNhapDiem } from './redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';


class UserPage extends AdminPage {
    state = { dataHocPhan: [] }

    componentDidMount() {
        T.ready('/user/affair/nhap-diem', () => {
            this.showAdvanceSearch();
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester;
                this.namFilter.value(namHoc);
                this.hocKyFilter.value(hocKy);
                this.setState({
                    filter: { ...this.state.filter, namHoc, hocKy }
                }, () => {
                    this.getData();
                });
            });
        });
    }

    getData = () => {
        const { filter } = this.state;
        T.alert('Đang lấy dữ liệu!', 'warning', false, null, true);
        this.props.getRoleNhapDiem(this.state.filter, data => {
            this.setState({ dataHocPhan: data.filter(i => !filter.kyThi || (filter.kyThi == 'QT' ? i.kyThi != 'CK' : i.kyThi == 'CK')) }, () => T.alert('Lấy dữ liệu thành công', 'success', false, 1000));
        });
    }

    handleChange = (value, key) => {
        this.setState({ filter: { ...this.state.filter, [key]: value } }, () => {
            this.getData();
        });
    }

    table = (data) => renderTable({
        emptyTable: 'Không có thời khóa biểu!',
        stickyHead: data?.length > 10,
        header: 'thead-light',
        loadingStyle: { backgroundColor: 'white' },
        divStyle: { height: '70vh' },
        getDataSource: () => data,
        renderHead: () => (<tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mã học phần</th>
            <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Tên học phần</th>
            <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Loại điểm</th>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Ca thi</th>
        </tr>),
        renderRow: (item, index) => {
            return <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell type='link' content={item.maHocPhan} url={`${window.location.origin}/user/affair/nhap-diem/edit/${item.id}`} />
                <TableCell content={T.parse(item.tenMonHoc, { vi: '' }).vi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.kyThi == 'CK' ? item.tenKyThi : 'Quá trình'} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.idExam ? <>
                    {`Ca thi: ${item.caThi}`}<br />
                    {`Phòng: ${item.phong}`}<br />
                    {`Ngày: ${T.dateToText(parseInt(item.batDau))}`}
                </> : ''} />
            </tr>;
        }
    });

    render() {
        const adapterKyThi = [{ id: 'QT', text: 'Quá trình' }, { id: 'CK', text: 'Cuối kỳ' }];

        return this.renderPage({
            title: 'Nhập điểm học phần',
            icon: 'fa fa-pencil-square',
            breadcrumb: ['Nhập điểm học phần'],
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.namFilter = e} data={SelectAdapter_SchoolYear} className='col-md-3' label='Năm học' onChange={value => this.handleChange(value.id, 'namHoc')} />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-3' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={value => this.handleChange(value?.id, 'hocKy')} />
                <FormSelect ref={e => this.loaiHinhDaoTaoFilter = e} className='col-md-3' label='Hình thức đào tạo' data={SelectAdapter_LoaiHinhDaoTaoFilter('dtDiemSinhVien:manage')} onChange={value => this.handleChange(value?.id, 'loaiHinhDaoTao')} />
                <FormSelect ref={e => this.kyThiFilter = e} className='col-md-3' label='Loại điểm' data={adapterKyThi} onChange={value => this.handleChange(value?.id, 'kyThi')} allowClear />
            </div>,
            content: <div className='tile'>
                {this.table(this.state.dataHocPhan)}
            </div>
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getRoleNhapDiem, getScheduleSettings };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);