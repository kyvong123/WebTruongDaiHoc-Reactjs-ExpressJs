import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormCheckbox, TableCell, TableHead, renderTable } from 'view/component/AdminPage';
import { getDtExamSinhVienHoanThi, createDtExamSinhVienHoanThi } from './redux';

export class SvHoanThiModal extends AdminModal {
    state = { listSvHoan: [], listChosen: [] };

    componentDidMount() {
        this.onHidden(() => {
            this.setState({ listChosen: [] });
        });
    }

    onShow = (item) => {
        let filter = {
            maMonHoc: item.maMonHoc, kyThi: item.loaiKyThi, namHoc: item.namHoc, hocKy: item.hocKy
        };
        this.props.getDtExamSinhVienHoanThi(filter, data => {
            this.setState({ listSvHoan: data, item });
        });
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        this.state.listChosen.length ? T.confirm('Xác nhận', `Bạn có chắc muốn thêm ${this.state.listChosen.length} sinh viên hoãn thi vào phòng thi này không`, 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                this.props.createDtExamSinhVienHoanThi({
                    listSv: this.state.listChosen,
                    phongThi: this.state.item
                }, () => {
                    T.alert('Thêm sinh viên thành công', 'success', false, 1000);
                    this.props.getSinhVien(this.state.item.maHocPhan, () => {
                        this.hide();
                        this.setState({ listChosen: [] });
                    });
                });
            }
        }) : null;
    }

    render = () => {
        let table = renderTable({
            getDataSource: () => this.state.listSvHoan,
            emptyTable: 'Không có sinh viên hoãn thi ở học kỳ trước',
            header: 'thead-light',
            stickyHead: this.state.listSvHoan.length > 7,
            divStyle: { height: '54vh' },
            renderHead: () => <tr>
                <TableHead content='#' style={{ width: 'auto' }} />
                <TableHead content={<>
                    Chọn <br />
                    <FormCheckbox ref={e => this.checkAll = e} onChange={value => {
                        let { listChosen, listSvHoan } = this.state;
                        listChosen = value ? [...listSvHoan] : [];
                        this.setState({ listChosen });
                    }} />
                </>} style={{ textAlign: 'center' }} />
                <TableHead content='MSSV' style={{ width: '20%' }} />
                <TableHead content='Họ và tên' style={{ width: '40%' }} />
                <TableHead content='Mã học phần hoãn' style={{ width: '20%' }} />
                <TableHead content='Năm học, học kỳ hoãn' style={{ width: '20%' }} />
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell content={this.state.listChosen.includes(item)} type='checkbox' isCheck permission={this.props.permission}
                    onChanged={value => {
                        let { listChosen } = this.state;
                        if (value) {
                            listChosen.push(item);
                        } else {
                            let svIndex = listChosen.find(sv => sv.mssv == item.mssv);
                            listChosen.splice(svIndex, 1);
                        }
                        this.setState({ listChosen });
                    }} />
                <TableCell content={item.mssv} />
                <TableCell content={item.hoTen || ''} style={{ whiteSpace: 'nowrap' }} />
                <TableCell content={item.maHocPhanHoan} />
                <TableCell content={`${item.namHocHoan}, HK${item.hocKyHoan}`} />
            </tr>
        });

        return this.renderModal({
            title: 'Thêm sinh viên hoãn thi',
            size: 'large',
            body: <div >
                {table}
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDtExamSinhVienHoanThi, createDtExamSinhVienHoanThi };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SvHoanThiModal);