import React from 'react';
import { connect } from 'react-redux';
import { TableCell, AdminModal, FormCheckbox, renderDataTable, FormTabs, FormRichTextBox } from 'view/component/AdminPage';
class ConfirmDangKy extends AdminModal {
    state = { data: {}, listHP: [], isLoading: 'yes' };

    componentDidMount() {
        this.disabledClickOutside();
    }

    onShow = (list) => {
        this.tabs?.tabClick(null, 0);
        let { items, isDone } = list;
        let { listMess, maHocPhan } = items;
        if (isDone == 3) this.setState({ data: listMess, listHP: maHocPhan, isLoading: 'sv' });
        else this.setState({ data: listMess, listHP: [maHocPhan] });

        if (isDone == 1) this.setState({ isLoading: 'no' });
        this.ghiChu.value('');
    }

    addData = (list) => {
        let { items, isDone } = list;
        let { listMess, maHocPhan } = items;
        let listHP = this.state.listHP;

        this.setState({ data: [...this.state.data, ...listMess] });
        if (!(listHP.includes(maHocPhan))) this.setState({ listHP: [...this.state.listHP, maHocPhan] });

        if (isDone == 1) this.setState({ isLoading: 'no' });
    }

    changeCheckTPAll = (value, maHocPhan) => {
        if (value == false) {
            this.state.data
                .filter(e => maHocPhan ? e.maHocPhan == maHocPhan : {})
                .forEach(e => e.tinhPhi = value);
            this.setState({ data: this.state.data });
        } else {
            this.state.data
                .filter(e => maHocPhan ? e.maHocPhan == maHocPhan : {})
                .forEach(e => {
                    if (e.isCheck == true) e.tinhPhi = value;
                });
            this.setState({ data: this.state.data });
        }
    }

    changeCheckAll = (value, maHocPhan) => {
        if (value == false) {
            this.state.data
                .filter(e => maHocPhan ? e.maHocPhan == maHocPhan : {})
                .forEach(e => {
                    e.isCheck = value;
                    e.tinhPhi = value;
                });
            this.setState({ data: this.state.data });
        } else {
            this.state.data
                .filter(e => maHocPhan ? e.maHocPhan == maHocPhan : {})
                .forEach(e => {
                    if (e.isDangKy == true) {
                        e.isCheck = value;
                        e.tinhPhi = value;
                    }
                });
            this.setState({ data: this.state.data });
        }
    }

    mapperLoaiDangKy = {
        'KH': <span><i className='fa fa-lg fa-sign-in' /> Theo kế hoạch</span>,
        'NKH': <span><i className='fa fa-lg fa-sign-out' /> Ngoài kế hoạch</span>,
        'NCTDT': <span><i className='fa fa-lg fa-info-circle' /> Ngoài CTĐT</span>,
        'CT': <span><i className='fa fa-lg fa-chevron-circle-right' /> Cải thiện</span>,
        'HL': <span><i className='fa fa-lg fa-repeat' /> Học lại</span>,
        'HV': <span><i className='fa fa-lg fa-chevron-circle-up' /> Học vượt</span>,
    }

    renderKetQua = (list, maHocPhan) => renderDataTable({
        data: list,
        emptyTable: 'Không có học phần được đăng ký',
        header: 'thead-light',
        stickyHead: list.length > 8 ? true : false,
        divStyle: { height: '55vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Chọn
                    <FormCheckbox ref={e => this.checkAll = e} onChange={value => this.changeCheckAll(value, maHocPhan)} />
                </th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Tính phí
                    <FormCheckbox ref={e => this.checkAll = e} onChange={value => this.changeCheckTPAll(value, maHocPhan)} />
                </th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã học phần</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên học phần</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>MSSV</th>
                <th style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }}>Họ và Tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Loại đăng ký</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ghi chú</th>
            </tr>
        ),
        renderRow: (item, index) => {
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isCheck} permission={{ write: true }}
                        onChanged={() => {
                            if (item.isDangKy == true) {
                                this.state.data
                                    .filter(e => e.mssv == item.mssv && e.maHocPhan == item.maHocPhan)
                                    .forEach(e => {
                                        if (e.tinhPhi == true && e.isCheck == true) e.tinhPhi = !e.tinhPhi;
                                        e.isCheck = !e.isCheck;
                                    });
                                this.setState({ data: this.state.data });
                            } else T.notify('Học phần này đăng ký thất bại!', 'danger');
                        }}
                    />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.tinhPhi} permission={{ write: true }}
                        onChanged={() => {
                            if (item.isDangKy == true) {
                                if (item.isCheck == true) {
                                    this.state.data
                                        .filter(e => e.mssv == item.mssv && e.maHocPhan == item.maHocPhan)
                                        .forEach(e => e.tinhPhi = !e.tinhPhi);
                                    this.setState({ data: this.state.data });
                                } else T.notify('Bạn chưa chọn học phần này!', 'danger');
                            } else T.notify('Học phần này dự kiến đăng ký thất bại!', 'danger');
                        }}
                    />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLoaiDKy && this.mapperLoaiDangKy[item.maLoaiDKy] ? this.mapperLoaiDangKy[item.maLoaiDKy] : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }}
                        content={
                            item.isDangKy == true ? (
                                <div style={{ color: 'green' }}>
                                    <i className='fa fa-lg fa-check-circle-o' /> Được phép đăng ký
                                </div>
                            ) : (
                                <div style={{ color: 'red' }}>
                                    <i className='fa fa-lg fa-times-circle-o' /> Thất bại
                                </div>
                            )
                        }
                    />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                </tr>
            );
        },
    });

    onSubmit = e => {
        e && e.preventDefault();
        let list = this.state.data.filter(item => item.isCheck == true),
            ghiChu = this.ghiChu.value();

        if (list.length == 0) {
            T.notify('Không tìm thấy học phần có thể đăng ký!', 'danger');
        } else {
            let { namHoc, hocKy, loaiHinhDaoTao, khoaSinhVien } = this.props.filterhp,
                filter = { namHoc, hocKy, loaiHinhDaoTao, khoaSinhVien, ghiChu };

            this.props.create(list, filter, () => {
                this.props.luuThanhCong();
                this.hide();
            });
        }
    }

    tabsHocPhan = (maHocPhan, item) => ({
        title: maHocPhan,
        component: <>
            <div>
                {this.renderKetQua(item, maHocPhan)}
            </div>
        </>
    });

    render = () => {
        let { data, listHP, isLoading } = this.state;
        return this.renderModal({
            title: 'Dự kiến: Kết quả đăng ký học phần',
            size: 'elarge',
            body: (
                <>
                    <div className='row'>
                        <div className='col-md-12'>
                            {isLoading == 'sv' ? this.renderKetQua(data, null) :
                                <FormTabs ref={e => this.tabs = e} tabs={listHP.map(maHocPhan => this.tabsHocPhan(maHocPhan, data?.groupBy('maHocPhan')[maHocPhan] || []))} />
                            }
                        </div>
                        <FormRichTextBox ref={e => this.ghiChu = e} className='col-md-12' label='Ghi chú' />
                    </div>
                </>

            ),
        });
    };
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ConfirmDangKy);