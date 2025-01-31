import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, loadSpinner } from 'view/component/AdminPage';
import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { checkCtdtSinhVien, createdDtDanhSachXetTotNghiep } from 'modules/mdDaoTao/dtDanhSachXetTotNghiep/redux';
class CheckModal extends AdminModal {
    state = { mssv: null, isLoading: false, selectedStu: false, data: {} }

    componentDidMount() {
        this.onHidden(() => {
            this.setState({ mssv: null, isLoading: false, selectedStu: false, data: {} });
        });
    }

    onShow = () => {
        this.sinhVien.value('');
        this.setState({ mssv: null });
    };

    checkCtdt = () => {
        let { mssv } = this.state;
        this.props.checkCtdtSinhVien(mssv, (value) => {
            this.setState({ isLoading: false, data: value.data });
        });
    }

    onSave = () => {
        let { data } = this.state,
            idDot = this.props.idDot;
        this.props.createdDtDanhSachXetTotNghiep(idDot, [data.mssv], this.hide);
    }

    render = () => {
        let { isLoading, selectedStu, data } = this.state;
        return this.renderModal({
            title: 'Xét tốt nghiệp sinh viên',
            size: 'large',
            body:
                <>
                    <div className='row'>
                        <FormSelect ref={e => this.sinhVien = e} className='col-md-12' label='Chọn sinh viên' data={SelectAdapter_FwStudent} required
                            onChange={value => this.setState({ mssv: value.id, isLoading: true, selectedStu: true }, () => this.checkCtdt())} />
                    </div>
                    {selectedStu ?
                        <div className='row'>
                            <div className='col-md-12 mt-2'>
                                {isLoading ? loadSpinner() :
                                    data.check ? <h5 style={{ color: 'green', textAlign: 'center' }}>Sinh viên đủ điều kiện xét tốt nghiệp</h5> : <div style={{ textAlign: 'center' }}>
                                        <h5 style={{ color: 'red' }}>Sinh viên không đủ điều kiện xét tốt nghiệp</h5>
                                        <div>{data.ghiChu}</div>
                                        {data.maCtdt ? <div>Chương trình đào tạo của sinh viên: {data.maCtdt}</div> : <></>}
                                    </div>
                                }
                            </div>
                        </div>
                        : <div />}
                </>,
            buttons: data.check && <button type='button' className='btn btn-primary' onClick={e => e.preventDefault() || this.onSave()}>
                <i className='fa fa-fw fa-lg fa-save' />Lưu
            </button>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    checkCtdtSinhVien, createdDtDanhSachXetTotNghiep
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(CheckModal);