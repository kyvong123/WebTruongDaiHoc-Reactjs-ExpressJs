import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, renderDataTable, TableCell, FormCheckbox, FormSelect, loadSpinner } from 'view/component/AdminPage';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';
import { checkLopSinhVien, createdDtDanhSachXetTotNghiep } from 'modules/mdDaoTao/dtDanhSachXetTotNghiep/redux';
class CheckListModal extends AdminModal {
    state = { lop: null, isLoading: false, selectedLop: false, listData: [], isSave: false }

    componentDidMount() {
        this.onHidden(() => {
            this.setState({ lop: null, isLoading: false, selectedLop: false, listData: [], isSave: false });
        });
    }

    onShow = () => {
        this.lop.value('');
        this.setState({ lop: null });
    };

    checkCtdt = () => {
        let { lop } = this.state;
        this.props.checkLopSinhVien(lop, (value) => {
            this.setState({ isLoading: false, listData: value.listData });
        });
    }

    onSave = (done) => {
        let { listData } = this.state,
            idDot = this.props.idDot;
        listData = listData.filter(e => e.isCheck == true);
        if (listData.length) {
            T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
            listData = listData.map(e => e.mssv);
            this.setState({ isSave: true }, () => {
                this.props.createdDtDanhSachXetTotNghiep(idDot, listData, () => {
                    T.alert('Lưu sinh viên thành công', 'success', false, 1000);
                    this.hide(done);
                });
            });
        } else T.notify('Chưa chọn sinh viên!', 'danger');

    }

    changeCheckAll = (value) => {
        if (value == false) {
            this.state.listData
                .forEach(e => {
                    e.isCheck = value;
                });
            this.setState({ data: this.state.listData });
        } else {
            this.state.listData
                .forEach(e => {
                    if (e.check == true) {
                        e.isCheck = value;
                    }
                });
            this.setState({ data: this.state.listData });
        }
    }

    renderKetQua = (list) => renderDataTable({
        data: list,
        emptyTable: 'Không có sinh viên trong lớp',
        header: 'thead-light',
        stickyHead: list.length > 9 ? true : false,
        divStyle: { height: '55vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Chọn
                    <FormCheckbox ref={e => this.checkAll = e} onChange={value => this.changeCheckAll(value)} />
                </th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>MSSV</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Họ và tên</th>
                <th style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ghi chú</th>
            </tr>
        ),
        renderRow: (item, index) => {
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isCheck} permission={{ write: true }}
                        onChanged={() => {
                            if (item.check == true) {
                                this.state.listData
                                    .filter(e => e.mssv == item.mssv)
                                    .forEach(e => {
                                        e.isCheck = !e.isCheck;
                                    });
                                this.setState({ data: this.state.listData });
                            } else T.notify('Sinh viên không đủ điều kiện xét tốt nghiệp!', 'danger');
                        }}
                    />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                </tr>
            );
        },
    });


    render = () => {
        let { isLoading, selectedLop, listData, isSave } = this.state;
        return this.renderModal({
            title: 'Xét tốt nghiệp lớp sinh viên',
            size: 'elarge',
            body:
                <>
                    <div className='row'>
                        <FormSelect ref={e => this.lop = e} className='col-md-12' label='Chọn lớp sinh viên' data={SelectAdapter_DtLopFilter()} required disabled={!isLoading && !isSave ? false : true}
                            onChange={value => this.setState({ lop: value.id, isLoading: true, selectedLop: true }, () => this.checkCtdt())} />
                    </div>
                    {selectedLop ?
                        <div className='row'>
                            <div className='col-md-12 mt-2'>
                                {isLoading ? loadSpinner() :
                                    this.renderKetQua(listData)
                                }
                            </div>
                        </div>
                        : <div />}
                </>,
            buttons: selectedLop && !isLoading && <button type='button' className='btn btn-primary' onClick={e => e.preventDefault() || this.onSave()}>
                <i className='fa fa-fw fa-lg fa-save' />Lưu
            </button>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    checkLopSinhVien, createdDtDanhSachXetTotNghiep
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(CheckListModal);