import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, } from 'view/component/AdminPage';
import { renderTable, TableCell } from 'view/component/AdminPage';
import { updateSdhTsNgoaiNgu, createSdhTsNgoaiNgu, deleteSdhTsNgoaiNgu, getSdhTsNgoaiNgu } from 'modules/mdSauDaiHoc/sdhTsNgoaiNgu/redux';
import { NgoaiNguModal } from 'modules/mdSauDaiHoc/sdhTsNgoaiNgu/NgoaiNguModal';

class DataChungChiNgoaiNgu extends AdminPage {
    componentDidMount() {
        this.getData();
    }
    getData = () => {
        this.props.getSdhTsNgoaiNgu(this.props.idThiSinh, (items) => this.setState({ list: items }));
    }
    onEdit = (item) => {
        this.modalNgoaiNgu.show(item);
    }
    render() {
        const { readOnly, permissionDangKy } = this.props;
        const list = this.state.list || [];
        const tableChungChi = renderTable({
            getDataSource: () => list,
            stickyHead: false,
            header: 'light',
            emptyTable: 'Chưa có chứng chỉ ngoại ngữ được thêm',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '25%' }}>Ngoại ngữ</th>
                    <th style={{ width: '25%' }}>Loại chứng chỉ</th>
                    <th style={{ width: '20%' }}>Ngày cấp</th>
                    <th style={{ width: '15%' }}>Đơn vị cấp</th>
                    <th style={{ width: '15%' }}>Mã chứng chỉ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell content={item.ngonNgu || item.ngoaiNgu} />
                    <TableCell content={item.loaiChungChi} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' content={item.ngayCap} />
                    <TableCell content={item.donViCap} />
                    <TableCell content={item.maChungChi} />
                    <TableCell type='buttons' style={{ zIndex: '1', textAlign: 'center' }} permission={{ write: !readOnly ? true : false }} content={item} onEdit={e => e.preventDefault() || this.onEdit(item)} />
                </tr>
            )
        });
        return <>
            <NgoaiNguModal ref={e => this.modalNgoaiNgu = e} permission={permissionDangKy} readOnly={readOnly} getData={this.getData} create={this.props.createSdhTsNgoaiNgu} update={this.props.updateSdhTsNgoaiNgu} />
            <div className='col-md-12 p-15 mb-5'>
                {tableChungChi}
            </div>
            {!readOnly && list.length == 0 ? <div className='d-flex justify-content-end p-15'>
                <button type='button' className='btn btn-primary rounded-0' data-dismiss='modal' onClick={() => this.modalNgoaiNgu.show({ id: this.props.idThiSinh })}>
                    <i className='fa fa-fw fa-lg fa-plus' />Thêm
                </button>
            </div> : null}
        </>;

    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    updateSdhTsNgoaiNgu, createSdhTsNgoaiNgu, deleteSdhTsNgoaiNgu, getSdhTsNgoaiNgu
};
export default connect(mapStateToProps, mapActionsToProps)(DataChungChiNgoaiNgu);
