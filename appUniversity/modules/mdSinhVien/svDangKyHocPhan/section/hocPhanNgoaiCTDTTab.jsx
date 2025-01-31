import React from 'react';
import { FormTextBox } from 'view/component/AdminPage';
import {
    createDangKyHocPhan, deleteDangKyHocPhan, updateDangKyHocPhan, handleSearchNgoaiCtdt,
} from 'modules/mdDangKyMonHoc/dkHocPhan/redux';
import HocPhanModal from '../hocPhanModal';
import { connect } from 'react-redux';
import HocPhanSection from './hocPhanSection';


class HocPhanNgoaiCTDTTab extends HocPhanSection {

    handleSearch = (e) => {
        if (e.keyCode === 13 || e.type == 'click') {
            let searchTerm = this.searchHP.value().trim();
            if (searchTerm && searchTerm.length < 5) {
                T.notify('Vui lòng nhập hơn 5 ký tự!', 'danger');
            } else {
                let searchTerm = this.searchHP.value().trim();
                this.props.handleSearchNgoaiCtdt(searchTerm, () => {
                    this.setState({ searchTerm });
                });
            }
        }
    }

    chonMonHoc = (item) => {
        let [isTD, mon] = this.checkTuongDuong(item);
        if (isTD) {
            T.notify(`Bạn đã học môn tương đương: ${mon.join(', ')}`, 'warning');
        }
        this.nctdtModal.show({ ...item, ngoaiCtdt: true, loaiMonHoc: 1 });
    }

    render() {
        let dataState = this.props.hocPhan || {},
            { itemsNCTDT } = dataState;

        let { caiThienHK, caiThienMax, caiThienMin } = this.props.cauHinhDiem;

        let table = this.renderSection(itemsNCTDT, { caiThienHK, caiThienMax, caiThienMin });

        return (<div className='tile'>
            <HocPhanModal ref={e => this.nctdtModal = e} loading={this.props.loading} cauHinh={this.props.cauHinh} cauHinhDiem={this.props.cauHinhDiem} cauHinhTKB={this.props.cauHinhTKB} configDispatch={this.props.configDispatch} />
            <div className='input-group align-items-end' style={{ flexWrap: 'inherit' }}>
                <FormTextBox ref={e => this.searchHP = e} label={<span>Tìm kiếm<small> (Vui lòng nhập nhiều hơn 5 ký tự!)</small></span>} onKeyDown={e => this.handleSearch(e)} style={{ marginBottom: '0', width: 'inherit' }} placeholder='Theo mã/tên môn học' />
                <div className='input-group-append'>
                    <button className='btn btn-outline-primary' type='button' onClick={this.handleSearch} >
                        <i className='fa fa-lg fa-search' />
                    </button>
                </div>
            </div>
            <div className='tile-body mt-3'>
                {table}
            </div>
        </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, hocPhan: state.student.hocPhan });
const mapActionsToProps = { createDangKyHocPhan, deleteDangKyHocPhan, updateDangKyHocPhan, handleSearchNgoaiCtdt };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(HocPhanNgoaiCTDTTab);
