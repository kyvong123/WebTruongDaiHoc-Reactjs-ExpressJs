import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, } from 'view/component/AdminPage';
import { FormTextBox, getValue } from 'view/component/AdminPage';
import { getSdhDanhSachDiemThiPage, getSdhTsThiSinhMp, createSdhTsDiemThiSinhMp } from 'modules/mdSauDaiHoc/sdhTsKetQuaThi/redux';
class NhapDiemThiSinhGV extends AdminPage {
    find = () => this.props.getSdhTsThiSinhMp(getValue(this.maTui), getValue(this.maPhach), item => this.setState({ data: item }, () => this.diem.value(item.diem ? item.diem : '')));
    render() {
        return <>
            <div className='tile'>
                <div className='tile-title-w-btn'>
                    <div className='form-group' style={{ margin: '2' }}>
                        <div className='row'>
                            <FormTextBox ref={e => this.maTui = e} className='col-md-6' label='Mã túi' />
                            <FormTextBox ref={e => this.maPhach = e} className='col-md-6' label='Mã phách' />
                        </div>
                    </div>
                    <div className='btn-group' style={{ margin: '2' }} >
                        <button className='btn btn-success' type='button' onClick={() => this.find()}>
                            <i class="bi bi-search"></i>Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>
            {this.state.data &&
                <div className='tile'>
                    <div className='tile-title-w-btn'>
                        <div className='title' style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className='form-group' style={{ margin: '2' }}>
                                <FormTextBox type='number' min={0} max={100} step={true} decimalScale={2} ref={e => this.diem = e} className='col-md-6' label='Điểm thi' />
                            </div>
                            <div className='btn-group' style={{ margin: '2' }}>
                                <button type='submit' className='btn btn-primary' onClick={() => this.props.createSdhTsDiemThiSinhMp(this.state.data.id, getValue(this.diem))}>
                                    <i className='fa fa-fw fa-lg fa-save' /> Lưu
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            }
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getSdhDanhSachDiemThiPage, getSdhTsThiSinhMp, createSdhTsDiemThiSinhMp
};
export default connect(mapStateToProps, mapActionsToProps)(NhapDiemThiSinhGV);
