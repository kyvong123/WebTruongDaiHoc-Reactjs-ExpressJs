import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, getValue } from 'view/component/AdminPage';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
// import { SelectAdapter_DmDonViByMonHoc } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { getGenDtThoiKhoaBieuByConfig } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';


class SectionConfig extends AdminPage {
    state = { dataSelectWeek: [], dataNamBatDau: [] }

    setVal = () => {
        this.props.getScheduleSettings(data => {
            let { namHoc, hocKy } = data.currentSemester,
                year = parseInt(namHoc);
            const listWeeksOfYear = Date.prototype.getListWeeksOfYear(parseInt(namHoc)),
                dataSelectWeek = listWeeksOfYear.map(i => ({ id: i.weekNumber, text: `Tuần ${i.week}: ${T.dateToText(i.weekStart, 'dd/mm/yyyy')} - ${T.dateToText(i.weekEnd, 'dd/mm/yyyy')}` }));
            this.setState({ dataSelectWeek, dataNamBatDau: [year - 1, year, year + 1], namHoc });
            this.namHoc.value(namHoc);
            this.hocKy.value(hocKy);
        });
    }

    handleChangeNamHoc = (value) => {
        const { dataNamBatDau, namHoc, dataSelectWeek } = this.state,
            year = parseInt(value.id);

        this.setState({
            dataNamBatDau: value.id != namHoc ? [year - 1, year, year + 1] : dataNamBatDau,
            dataSelectWeek: value.id != namHoc ? [] : dataSelectWeek,
            namHoc: value.id,
        }, () => {
            this.tuanBatDau.value('');
            this.namBatDau.value('');
        });
    }

    handleChangeNamBatDau = (value) => {
        const listWeek = Date.prototype.getListWeeksOfYear(Number(value.id));

        this.setState({
            listWeeksOfYear: listWeek,
            dataSelectWeek: listWeek.map(i => ({ id: i.weekNumber, text: `Tuần ${i.week}: ${T.dateToText(i.weekStart, 'dd/mm/yyyy')} - ${T.dateToText(i.weekEnd, 'dd/mm/yyyy')}` })),
        }, () => {
            this.tuanBatDau.value('');
        });
    }

    handleSubmitConfig = (e) => {
        e.preventDefault();
        try {
            this.setState({ onSaveConfig: true });
            const { listWeeksOfYear, dataSelectWeek } = this.state;
            let config = {
                loaiHinhDaoTao: getValue(this.loaiHinhDaoTao),
                namHoc: getValue(this.namHoc),
                hocKy: getValue(this.hocKy),
                khoaSinhVien: getValue(this.khoaSinhVien),
                // khoaDangKy: getValue(this.khoaDangKy),
                tuanBatDau: getValue(this.tuanBatDau),
                coSo: getValue(this.coSo)
            };
            this.props.getGenDtThoiKhoaBieuByConfig(config, result => {
                if (result && result.dataCanGen && result.dataCanGen.length) {
                    T.notify(`Tìm thấy ${result.dataCanGen.length} học phần!`, 'success');
                    config.weekStart = listWeeksOfYear.find(i => i.weekNumber == config.tuanBatDau).weekStart;
                    config.listWeeksOfYear = listWeeksOfYear;
                    config.dataSelectWeek = dataSelectWeek;
                    this.props.submitConfig(e, config, result.dataCanGen);
                    this.setState({ onSaveConfig: false });
                } else {
                    T.notify('Không tìm thấy học phần nào theo cấu hình', 'danger');
                    setTimeout(() => this.setState({ onSaveConfig: false }), 250);
                }
            });
        } catch (input) {
            this.setState({ onSaveConfig: false });
            T.notify(`${input.props.label} không được trống!`, 'danger');
            input.focus();
        }
    }

    render() {
        let { onSaveConfig, dataSelectWeek, dataNamBatDau } = this.state;

        return (
            <section id='config'>
                <div className='tile'>
                    <div className='tile-title'>
                        <h4>Bước 1: Cấu hình chung.</h4>
                    </div>
                    <div className='tile-body'>
                        <div className='row'>
                            <FormSelect data={SelectAdapter_SchoolYear} ref={e => this.namHoc = e} className='col-md-3' label='Năm học' required onChange={value => this.handleChangeNamHoc(value)} />
                            <FormSelect ref={e => this.hocKy = e} data={[1, 2, 3]} label='Học kỳ' className='col-md-3' required />
                            <FormSelect ref={e => this.khoaSinhVien = e} data={SelectAdapter_DtKhoaDaoTao} label='Khoá sinh viên' className='col-md-3' required />
                            <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-3' label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} required />
                            <FormSelect ref={e => this.namBatDau = e} data={dataNamBatDau} label='Năm bắt đầu' className='col-md-3' required onChange={value => this.handleChangeNamBatDau(value)} />
                            <FormSelect ref={e => this.tuanBatDau = e} className='col-md-6' label='Tuần bắt đầu' data={dataSelectWeek} required />
                            {/* <FormSelect ref={e => this.khoaDangKy = e} data={SelectAdapter_DmDonViByMonHoc()} label='Đơn vị' className='col-md-4' required /> */}
                            <FormSelect ref={e => this.coSo = e} data={SelectAdapter_DmCoSo} label='Chọn cơ sở học' className='col-md-3' required />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-outline-primary' type='button' onClick={this.handleSubmitConfig} disabled={onSaveConfig}>
                                {onSaveConfig ? 'Loading' : 'Tiếp theo'} <i className={onSaveConfig ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-lg fa-arrow-right'} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = { getScheduleSettings, getGenDtThoiKhoaBieuByConfig };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionConfig);