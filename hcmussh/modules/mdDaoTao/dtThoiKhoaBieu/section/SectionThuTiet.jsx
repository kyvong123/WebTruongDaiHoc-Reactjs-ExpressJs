import { rgbToHex } from '@mui/material';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, renderTable } from 'view/component/AdminPage';
import { dtThoiKhoaBieuGenTime } from '../redux';
class SectionThuTiet extends AdminPage {
    state = { timeConfig: {} }
    setVal = (data) => {
        const { scheduleConfig, dataTiet } = data,
            fullDataTietThu = [];
        let dataThu = scheduleConfig.dataThu.map(item => parseInt(item.ma));
        dataTiet.forEach(tiet => {
            dataThu.forEach(thu => {
                fullDataTietThu.push({ [thu]: tiet });
            });
        });
        this.setState({ fullDataTietThu, scheduleConfig, dataTiet });
    }

    handleSaveTimeConfig = () => {
        let thuTietMo = [], thuTietKhongMo = [], fullDataTiet = [];
        $('td').each(function () {
            if (rgbToHex($(this).css('backgroundColor')) == '#0275d8') {
                thuTietMo.push($(this).attr('id'));
                fullDataTiet.push($(this).attr('id'));
            } else if (rgbToHex($(this).css('backgroundColor')) == '#f0ad4e') {
                thuTietKhongMo.push($(this).attr('id'));
                fullDataTiet.push($(this).attr('id'));
            }
        });
        this.setState({ timeConfig: { thuTietKhongMo, thuTietMo }, fullDataTiet });
    }

    handleRemoveTimeConfig = (index) => {
        let updateTimeConfig = [...this.state.timeConfig].filter((_, i) => i != index);
        this.setState({ timeConfig: updateTimeConfig });
    }

    handleEditTimeConfig = (index) => {
        let timeConfig = this.state.timeConfig[index];
        this.setState({ timeConfigEditId: index }, () => {
            this.editListDonVi.value(timeConfig.listDonVi);
        });
    }

    handleSaveEditTimeConfig = () => {
        let index = this.state.timeConfigEditId;
        let listDonVi = this.editListDonVi.value();
        if (!listDonVi || !listDonVi.length) {
            T.notify('Vui lòng chọn khoa/bộ môn!', 'danger');
        } else {
            let listTenDonVi = this.editListDonVi.data().map(item => item.text);
            let currentTimeConfig = Object.assign({}, this.state.timeConfig[index]);
            currentTimeConfig.listTenDonVi = listTenDonVi;
            currentTimeConfig.listDonVi = listDonVi;

            let curState = this.state.timeConfig;
            curState.splice(index, 1, currentTimeConfig);
            this.setState({ timeConfig: [...curState], timeConfigEditId: null });
        }
    }

    handleChooseFaculty = (value) => {
        if (value) this.listDonVi.focus();
    }

    editChooseFacultyElement = () => {
        return (<div>
            <FormSelect ref={e => this.editListDonVi = e} label='Chỉnh sửa khoa/bộ môn' data={SelectAdapter_DmDonViFaculty_V2} multiple />
            <div style={{ textAlign: 'right' }}>
                <button className='btn btn-success' type='button' onClick={this.handleSaveEditTimeConfig}>
                    <i className='fa fa-lg fa-save' /> Lưu
                </button>
            </div>
        </div>);
    }

    handleGenTime = (e) => {
        e.preventDefault();
        this.setState({ isWait: true });
        this.props.handleGenThuTiet({
            timeConfig: this.state.timeConfig,
            fullDataTiet: this.state.fullDataTiet
        }, () => {
            this.setState({ isWait: false });
        });
    }

    render() {
        const { timeConfig, isWait, scheduleConfig } = this.state,
            { dataThu = [] } = scheduleConfig || {},
            { thuTietKhongMo = [] } = timeConfig,
            dataKhongMo = thuTietKhongMo.map(item => ({ thu: item.split('_')[0], tiet: item.split('_')[1] })).groupBy('thu');

        return <section id='configTime'>
            <div className='tile'>
                <div className='tile-title'>
                    <h4>Bước 3: Phân bổ thứ, tiết học cho các đơn vị.</h4>
                    <div style={{ fontSize: '0.8rem' }}>
                        <i>- Ghi chú: Vui lòng chọn các tiết không xếp thời khoá biểu của khoa/bộ môn. Sau đó bấm <b>Lưu</b> để sang bước tiếp theo.</i><br />
                        <i>Nếu không chọn tiết nào hoặc khoa/bộ môn nào, hệ thống sẽ mặc định là tất cả.</i>
                    </div>
                </div>
                <div className='tile-body'>
                    <div className='row'>
                        {Object.keys(timeConfig).length ? <button className='btn btn-outline-primary' type='button' style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={this.handleGenTime} disabled={isWait}>
                            Xếp thứ, tiết <i className={isWait ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-lg fa-arrow-right'} />
                        </button> : ''}
                        {this.state.fullDataTietThu &&
                            <div className='form-group col-md-6'>
                                <label>Chọn các tiết <b>không xếp thời khoá biểu</b> </label>
                                {renderTable({
                                    getDataSource: () => this.state.fullDataTietThu,
                                    header: '',
                                    renderHead: () => <tr>{
                                        dataThu.map(item => parseInt(item.ma)).map(thu => <th key={thu} style={{ width: '100px', textAlign: 'center' }}>{thu == 8 ? 'Chủ nhật' : `Thứ ${thu}`}</th>)
                                    }</tr>,
                                    renderRow: this.state.dataTiet.map(tiet => <tr key={tiet} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        {dataThu.map(item => parseInt(item.ma)).map(thu => <td key={thu} id={`${thu}_${tiet}`} style={{ textAlign: 'center', backgroundColor: '#0275d8', color: '#fff' }}
                                            onMouseDown={e => {
                                                this.setState({ isChoose: true });
                                                $(`#${e.target.id}`).css('backgroundColor', (_, cur) => {
                                                    if (rgbToHex(cur) == '#0275d8') {
                                                        return '#f0ad4e';
                                                    } else {
                                                        return '#0275d8';
                                                    }
                                                });
                                            }} onMouseUp={() => {
                                                this.setState({ isChoose: false });
                                            }} onMouseOver={e => {
                                                if (this.state.isChoose) {
                                                    $(`#${e.target.id}`).css('backgroundColor', (_, cur) => rgbToHex(cur) == '#0275d8' ? '#f0ad4e' : '#0275d8');
                                                }
                                            }} >Tiết {tiet}</td>)}
                                    </tr>)
                                })}
                            </div>}
                        {this.state.fullDataTietThu && <div className='col-md-6'>
                            <div style={{ display: Object.keys(timeConfig).length ? '' : 'none' }}><b>Sinh tự động trên toàn bộ thứ, tiết</b></div>
                            <div style={{ display: thuTietKhongMo.length ? '' : 'none' }}>{Object.keys(dataKhongMo).map(key => <b key={key}>
                                - Trừ {(key == 8) ? 'Chủ nhật' : 'Thứ ' + key}, Tiết {dataKhongMo[key].map(item => item.tiet).join(', ')}.<br />
                            </b>)} < br /></div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-outline-success' type='button' onClick={this.handleSaveTimeConfig}>
                                    <i className='fa fa-lg fa-save' /> Lưu
                                </button>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        </section>;
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = {
    dtThoiKhoaBieuGenTime
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionThuTiet);