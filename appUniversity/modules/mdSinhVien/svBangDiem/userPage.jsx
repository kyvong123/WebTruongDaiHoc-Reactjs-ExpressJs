import React from 'react';
import { connect } from 'react-redux';
import { FormSelect } from 'view/component/AdminPage';
import { getDiem, getInfo } from './redux';
import { SelectAdapter_HocKy } from '../svThoiKhoaBieu/redux';
import ScanDiemModal from './ScanDiemModal';
import BangDiemBase from './BangDiemBase';

class UserPage extends BangDiemBase {
    state = { listTKB: [] }
    colorMain = '#0139a6';
    componentDidMount() {
        T.ready('/user/bang-diem', () => {
            getInfo(data => this.setState({
                studentInfo: data.studentInfo,
                namHoc: data.items.namHoc,
                hocKy: data.items.hocKy,
                diemRotMon: Number(data.diemRotMon.rotMon),
                monKhongTinhTB: data.monKhongTinhTB,
            }, () => {
                const { namHoc, hocKy } = data.items;
                getDiem({ hocKy, namHoc }, data => {
                    this.tongQuan(namHoc, hocKy, data.dataDiem);
                    this.setState({ ...data, listDiem: data.dataDiem });
                });
                this.initData();
                this.genDataNamHoc();
            }));
        });
    }

    render() {
        return this.renderPage({
            title: 'Bảng điểm',
            icon: 'fa fa-tasks',
            breadcrumb: ['Bảng điểm'],
            content: <div>
                <div className='tile'>
                    <ScanDiemModal ref={e => this.scanDiemModal = e} />
                    {this.renderTongQuan()}
                </div>
                <div className='tile'>
                    <div className='tile-body row'>
                        <FormSelect ref={e => this.namHocFilter = e} className='col-md-6' label='Năm học' data={this.state.namHoc} onChange={this.handleChange} allowClear />
                        <FormSelect ref={e => this.hocKyFilter = e} className='col-md-6' label='Học kỳ' data={SelectAdapter_HocKy} onChange={this.handleChange} allowClear />
                    </div>
                </div>

                {this.renderBangDiem()}
            </div>
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(UserPage);