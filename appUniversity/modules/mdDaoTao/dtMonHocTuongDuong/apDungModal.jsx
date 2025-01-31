import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormCheckbox, FormSelect, getValue } from 'view/component/AdminPage';
import { createApDungNhomTuongDuong } from './redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_KhungDaoTaoFilter } from 'modules/mdDaoTao/dtChuongTrinhDaoTao/redux';

class ApDungModal extends AdminModal {

    state = { listKhoaSinhVienFilter: [], listHeFilter: [], listNhom: [], filter: {} }

    componentDidMount() {
        $(document).ready(() => {
            this.onHidden(this.onHide);
        });

        this.disabledClickOutside();

        SelectAdapter_DtKhoaDaoTao.fetchAll(dataKhoa => {
            const listKhoaSinhVienFilter = dataKhoa.items;
            SelectAdapter_DmSvLoaiHinhDaoTaoFilter.fetchAll(dataHe => {
                const listHeFilter = dataHe;
                this.setState({ listKhoaSinhVienFilter, listHeFilter });
            });
        });
    }

    onHide = () => {
        this.maNhom.value('');
        this.setState({ datas: {}, rows: {}, maNhom: null });
    }

    onShow = (item) => {
        this.setState({ listNhom: this.props.tuongDuong.listNhom }, () => {
            if (item) {
                const { id, ctdtApDung, khoaApDung, maNhom, loaiHinhApDung } = item;
                this.setState({ id, filter: { ...this.state.filter, listKhoaSinhVienFilterFilter: khoaApDung, listHeFilter: loaiHinhApDung } }, () => {
                    this.maNhom.value(maNhom);
                    this.heSv.value(loaiHinhApDung ? loaiHinhApDung.split(',') : []);
                    this.khoaSv.value(khoaApDung ? khoaApDung.split(',') : []);
                    this.ctdt.value(ctdtApDung ? ctdtApDung.split(',') : []);
                });
            }
        });
    }

    onSubmit = () => {
        const maNhom = getValue(this.maNhom),
            khoaApDung = this.khoaSv.value(),
            loaiHinhApDung = this.heSv.value(),
            ctdtApDung = this.ctdt.value();

        T.alert('Đang cập nhật nhóm tương đương áp dụng. Vui lòng chờ trong giây lát!', 'info', false, null, true);
        this.props.createApDungNhomTuongDuong(this.state.id, { maNhom, khoaApDung, loaiHinhApDung, ctdtApDung }, () => {
            T.alert('Cập nhật nhóm tương đương áp dụng thành công', 'success', true, 5000);
        });
    }

    selectAll = (value, field, option) => {
        let { filter } = this.state;
        if (value) {
            const data = this.state[option];
            if (option == 'listHeFilter') {
                field.value(data.map(i => i.id));
            } else field.value(data);
            this.setState({ filter: { ...filter, [option]: field.value().toString() } }, () => this.ctdt.value(''));
        } else {
            field.value('');
        }
    }

    handleChange = (ref, key) => {
        let { filter } = this.state;
        this.setState({ filter: { ...filter, [key]: ref.value().toString() } }, () => this.ctdt.value(''));
    }

    render = () => {
        let { listKhoaSinhVienFilter, listHeFilter, listNhom, filter } = this.state;

        return this.renderModal({
            title: 'Áp dụng nhóm tương đương',
            body: <div className='row'>
                <FormSelect ref={e => this.maNhom = e} className='col-md-12' required label='Nhóm tương đương' data={listNhom} readOnly={this.state.id} />
                <FormSelect ref={e => this.khoaSv = e} className='col-md-12' multiple closeOnSelect={false}
                    label={<>Khóa quản lý &nbsp;<FormCheckbox id='khoasv' style={{ display: 'inline' }} label='Chọn tất cả' onChange={value => this.selectAll(value, this.khoaSv, 'listKhoaSinhVienFilter')} /></>}
                    placeholder='Khóa quản lý'
                    data={listKhoaSinhVienFilter}
                    onChange={() => this.handleChange(this.khoaSv, 'listKhoaSinhVienFilterFilter')}
                />
                <FormSelect ref={e => this.heSv = e} className='col-md-12' multiple closeOnSelect={false}
                    label={<>Hệ quản lý &nbsp;<FormCheckbox id='hequanly' style={{ display: 'inline' }} label='Chọn tất cả' onChange={value => this.selectAll(value, this.heSv, 'listHeFilter')} /></>}
                    placeholder='Hệ quản lý'
                    data={listHeFilter}
                    onChange={() => this.handleChange(this.heSv, 'listHeFilter')}
                />
                <FormSelect ref={e => this.ctdt = e} className='col-md-12' multiple closeOnSelect={false} data={SelectAdapter_KhungDaoTaoFilter(filter)} label='Chương trình đào tạo' />
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tuongDuong: state.daoTao.tuongDuong });
const mapActionsToProps = { createApDungNhomTuongDuong };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ApDungModal);