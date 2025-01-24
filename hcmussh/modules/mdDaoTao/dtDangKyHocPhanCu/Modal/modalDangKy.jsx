import React from 'react';
import { connect } from 'react-redux';
import { TableCell, AdminModal, FormCheckbox, renderDataTable, FormSelect } from 'view/component/AdminPage';
import { createDataHocPhanCu } from 'modules/mdDaoTao/dtDangKyHocPhanCu/redux';
class ModalDangKy extends AdminModal {
    state = { filter: {}, sinhVien: {}, listHocPhan: [] };
    maLoaiDKy = {}
    loaiMonHoc = {}
    mapperLoaiDangKy = {
        'KH': <span><i className='fa fa-lg fa-sign-in' /> Theo kế hoạch</span>,
        'NKH': <span><i className='fa fa-lg fa-sign-out' /> Ngoài kế hoạch</span>,
        'NCTDT': <span><i className='fa fa-lg fa-info-circle' /> Ngoài CTĐT</span>,
        'CT': <span><i className='fa fa-lg fa-chevron-circle-right' /> Cải thiện</span>,
        'HL': <span><i className='fa fa-lg fa-repeat' /> Học lại</span>,
        'HV': <span><i className='fa fa-lg fa-chevron-circle-up' /> Học vượt</span>,
    }
    loaiDangKy = [
        { id: 'KH', text: 'Theo kế hoạch' },
        { id: 'NKH', text: 'Ngoài kế hoạch' },
        { id: 'NCTDT', text: 'Ngoài CTĐT' },
        { id: 'CT', text: 'Cải thiện' },
        { id: 'HL', text: 'Học lại' },
        { id: 'HV', text: 'Học vượt' }
    ]

    componentDidMount() {
        this.disabledClickOutside();
    }

    onShow = () => {
        let { sinhVien, listHocPhan, filter } = this.props;
        listHocPhan.forEach(e => e.tinhPhi = true);
        this.setState({ sinhVien, listHocPhan, filter }, () => {
            listHocPhan.forEach(e => this.maLoaiDKy[e.maHocPhan].value(''));
        });
    }

    renderKetQua = (list) => renderDataTable({
        data: list,
        emptyTable: 'Không có học phần được đăng ký',
        header: 'thead-light',
        stickyHead: list.length > 12 ? true : false,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã học phần</th>
                <th style={{ width: '60%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên học phần</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap', }}>Loại đăng ký</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Tính phí
                    <FormCheckbox ref={e => this.checkTPAll = e}
                        onChange={value => {
                            let { listHocPhan } = this.state;
                            listHocPhan.forEach(e => {
                                if (value) {
                                    if (e.isChon) e.tinhPhi = value;
                                } else e.tinhPhi = value;
                            });
                            this.setState({ listHocPhan });
                        }} />
                </th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Chọn
                    <FormCheckbox ref={e => this.checkAll = e}
                        onChange={value => {
                            let { listHocPhan } = this.state;
                            listHocPhan.forEach(e => e.isChon = value);
                            this.setState({ listHocPhan });
                        }} />
                </th>
            </tr>
        ),
        renderRow: (item, index) => {
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell style={{ textAlign: 'center' }} content={<FormSelect style={{ marginBottom: '0' }} ref={e => this.maLoaiDKy[item.maHocPhan] = e} data={this.loaiDangKy} placeholder='Mã lại đăng ký' />} />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.tinhPhi} permission={{ write: true }}
                        onChanged={() => {
                            list = list.map(e => {
                                if (e.maHocPhan == item.maHocPhan) item.tinhPhi = !item.tinhPhi;
                                return e;
                            });
                            this.setState({ listHocPhan: list }, () => this.checkTPAll.value(!(list.filter(e => e.tinhPhi).length < list.length)));
                        }} />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isChon} permission={{ write: true }}
                        onChanged={() => {
                            list = list.map(e => {
                                if (e.maHocPhan == item.maHocPhan) e.isChon = !e.isChon;
                                return e;
                            });
                            this.setState({ listHocPhan: list }, () => this.checkAll.value(!(list.filter(e => e.isChon).length < list.length)));
                        }} />
                </tr>
            );
        },
    });

    onSubmit = e => {
        e && e.preventDefault();
        let { sinhVien, listHocPhan } = this.state;
        listHocPhan = listHocPhan.filter(e => e.isChon == true);
        if (listHocPhan.length) {
            listHocPhan.forEach(e => e.maLoaiDky = this.maLoaiDKy[e.maHocPhan].value());
            T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
            this.props.createDataHocPhanCu(sinhVien.mssv, listHocPhan, () => {
                this.props.onChangeSinhVien();
                this.hide();
                T.alert('Đăng ký thành công', 'success', false, 1000);
            });
        } else T.notify('Hãy chọn học phần để đăng ký!', 'danger');
    }

    render = () => {
        let { sinhVien, listHocPhan, filter } = this.state;
        return this.renderModal({
            title: `Đăng ký học phần sinh viên ${sinhVien?.mssv}, Năm học: ${filter?.namHoc} _ Học kỳ: ${filter?.hocKy}`,
            size: 'elarge',
            body: (
                <div>
                    {this.renderKetQua(listHocPhan)}
                </div>
            ),
        });
    };
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createDataHocPhanCu };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ModalDangKy);