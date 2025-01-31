import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable, FormSelect, getValue, FormTabs } from 'view/component/AdminPage';
import { getLichThi } from './redux';
import { SelectAdapter_HocKy } from '../svThoiKhoaBieu/redux';

class UserPage extends AdminPage {
    state = { dataLichThiFull: [], curLichThi: [] }

    componentDidMount() {
        T.ready('/user/lich-thi', () => {
            getLichThi({}, data => {
                let { namHoc, hocKy } = data.semester,
                    items = Object.keys(data.items || []).length ? data.items : [];
                this.setState({
                    dataLichThiFull: items,
                    curLichThi: items.filter(i => i.namHoc == namHoc && i.hocKy == hocKy),
                    namHoc, hocKy,
                }, () => {
                    this.genDataNamHoc(data.semester);
                });
            });
        });
    }

    genDataNamHoc = (curSemester) => {
        try {
            let nam = parseInt(this.props.system.user.data.khoaSV);
            const currYear = new Date().getFullYear();
            this.setState({ dataNamHoc: Array.from({ length: currYear - nam + 1 }, (_, i) => `${nam + i} - ${nam + i + 1}`) }, () => {
                this.namHocFilter.value([curSemester.namHoc]);
                this.hocKyFilter.value(curSemester.hocKy);
            });
        } catch (error) {
            T.notify('Không tìm thấy khoá của sinh viên', 'danger');
            console.error(error);
        }

    }

    handleChangeSemester = () => {
        let namHoc = getValue(this.namHocFilter), hocKy = getValue(this.hocKyFilter);
        let curLichThi = this.state.dataLichThiFull.filter(item =>
            item.namHoc == namHoc && item.hocKy == hocKy
        );
        this.setState({ curLichThi, namHoc, hocKy });
    }

    render() {
        let { namHoc, hocKy, curLichThi } = this.state;
        curLichThi = curLichThi.filter(item => item.thoiGianCongBo && item.thoiGianCongBo < Date.now());
        const mapperDinhChi = {
            'HT': { color: '#f7de97', ten: 'Hoãn thi' },
            'CT': { color: '#ffcccb', ten: 'Cấm thi' }
        };

        let table = (list) => renderTable({
            getDataSource: () => list,
            emptyTable: (namHoc && hocKy) ? `Hiện chưa có lịch thi cho HK${hocKy}, năm học ${namHoc}` : '',
            header: 'thead-light',
            stickyHead: list.length > 10,
            renderHead: () => (<tr>
                <th style={{ widht: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mã học phần</th>
                <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Phòng</th>
                <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Ngày thi</th>
                <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Giờ thi</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
            </tr>),
            renderRow: (item, index) => {
                let batDau = T.convertDate(item.batDau, 'DD/MM/YYYY HH:mm').split(' ');
                // let ketThuc = T.convertDate(item.ketThuc, 'DD/MM/YYYY HH:mm').split(' ');

                return <tr key={index} style={{ backgroundColor: item.loaiDinhChi ? mapperDinhChi[item.loaiDinhChi].color : '#ffffff' }}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.maHocPhan} />
                    <TableCell content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={batDau[0]} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={batDau[1]} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiDinhChi ? `${mapperDinhChi[item.loaiDinhChi].ten} - Lý do: ${item.ghiChu}` : ''} />
                </tr>;
            }
        });

        let tabs = [];
        let dataGroupBy = curLichThi.groupBy('tenKyThi');
        for (let data in dataGroupBy) {
            tabs.push({
                title: `Lịch thi ${data.toLowerCase()}`,
                component: <>{table(dataGroupBy[data])}</>
            });
        }

        return this.renderPage({
            title: 'Lịch thi',
            icon: 'fa fa-calendar-check-o',
            breadcrumb: ['Lịch thi'],
            content: <div className='tile row'>
                <FormSelect ref={e => this.namHocFilter = e} className='col-md-6' label='Năm học' data={this.state.dataNamHoc || []} onChange={this.handleChangeSemester} />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-6' label='Học kỳ' data={SelectAdapter_HocKy} onChange={this.handleChangeSemester} />
                <div className='col-md-12' >
                    {curLichThi.length ? <div>
                        <div style={{ color: 'red', marginBottom: '1rem' }}>
                            Vui lòng có mặt tại phòng thi 15 phút trước khi thi. Đảm bảo mang theo đầy đủ giấy tờ tuỳ thân.
                        </div>
                        <FormTabs tabs={tabs} />
                    </div>
                        : <h5>Hiện chưa có lịch thi cho HK{hocKy}, năm học {namHoc}</h5>}
                </div>
            </div>
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getLichThi };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);