import React from 'react';
import { connect } from 'react-redux';
import { FormSelect } from 'view/component/AdminPage';
import { getDiem, getInfo } from 'modules/mdDaoTao/dtMoPhongDangKy/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import ScanDiemModal from 'modules/mdSinhVien/svBangDiem/ScanDiemModal';
import BangDiemBase from 'modules/mdSinhVien/svBangDiem/BangDiemBase';

export class BangDiemSection extends BangDiemBase {
    colorMain = '#0139a6';
    setValue = (mssv, isShowDiem) => {
        getInfo(mssv, data => this.setState({
            studentInfo: data.studentInfo,
            namHoc: data.items.namHoc,
            hocKy: data.items.hocKy,
            diemRotMon: Number(data.diemRotMon.rotMon),
            monKhongTinhTB: data.monKhongTinhTB,
        }, () => {
            const { namHoc, hocKy } = data.items;
            getDiem(mssv, { hocKy, namHoc, isShowDiem }, data => {
                this.tongQuan(namHoc, hocKy, data.dataDiem);
                this.setState({ ...data, listDiem: data.dataDiem });
            });
            this.initData();
        }));
    }

    render() {

        return (
            <>
                <ScanDiemModal ref={e => this.scanDiemModal = e} />
                <div className='tile'>
                    {this.renderTongQuan()}
                </div>
                <div className='tile'>
                    <div className='tile-body row'>
                        <FormSelect ref={e => this.namHocFilter = e} className='col-md-6' label='Năm học' data={SelectAdapter_SchoolYear} onChange={this.handleChange} allowClear />
                        <FormSelect ref={e => this.hocKyFilter = e} className='col-md-6' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={this.handleChange} allowClear />
                    </div>
                </div>

                {this.renderBangDiem()}
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(BangDiemSection);
