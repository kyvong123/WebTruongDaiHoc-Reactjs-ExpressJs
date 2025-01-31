import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, } from 'view/component/AdminPage';
import { renderTable, TableCell } from 'view/component/AdminPage';
import { BaiBaoModal } from 'modules/mdSauDaiHoc/sdhTsCongTrinhCbhd/BaiBaoModal';
import { updateSdhTsCongTrinhCbhd, createSdhTsCongTrinhCbhd, deleteSdhTsCongTrinhCbhd, getSdhTsBaiBaoCbhd } from 'modules/mdSauDaiHoc/sdhTsCongTrinhCbhd/redux';

class DataBaiBaoCbhd extends AdminPage {
    state = { tempBaiBao: [] };
    componentDidMount() {
        this.getData();
    }
    getData = () => {
        this.props.getSdhTsBaiBaoCbhd(this.props.idCbhd, (items) => this.setState({ list: items }));
    }
    getDataBaiBao = () => {
        return this.state.list;
    }

    render() {
        const { readOnly, idCbhd } = this.props;
        const list = this.state.list || [];
        const tableBaiBao = renderTable({
            getDataSource: () => list,
            stickyHead: false,
            header: 'light',
            emptyTable: 'Chưa có bài báo được thêm',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '20%' }}>Tên bài báo</th>
                    <th style={{ width: '20%' }}>Tên tạp chí</th>
                    <th style={{ width: '20%' }}>Chỉ số</th>
                    <th style={{ width: '20%' }}>Thời gian đăng</th>
                    <th style={{ width: '20%' }}>Điểm bài báo</th>
                    <th style={{ width: 'auto' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'left' }} content={item.ten} />
                    <TableCell style={{ textAlign: 'left' }} content={item.tenTapChi} />
                    <TableCell style={{ textAlign: 'left' }} content={item.chiSo} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'left' }} content={item.ngayDang} />
                    <TableCell style={{ textAlign: 'left' }} content={item.diem} />
                    <TableCell type='buttons' style={{ zIndex: '1', textAlign: 'center' }} permission={{ write: !readOnly, delete: !readOnly && list.length > 1 }} content={item}
                        onEdit={e => e.preventDefault() || this.modalBaiBao.show(item)}
                        onDelete={e => e.preventDefault() || T.confirm('Xóa bài báo', 'Bạn có chắc chắn xóa bài báo?', true, isConfirm => isConfirm && this.props.deleteSdhTsCongTrinhCbhd(item.id, () => this.getData()))} />
                </tr>
            )
        });
        return <>
            <BaiBaoModal ref={e => this.modalBaiBao = e} readOnly={readOnly} getData={this.getData} create={this.props.createSdhTsCongTrinhCbhd} update={this.props.updateSdhTsCongTrinhCbhd} />
            <div className='col-md-12 p-15 mb-5'>
                {tableBaiBao}
            </div>
            {!this.props.readOnly ? <div className='col-md-12 d-flex justify-content-end p-15'>
                <button type='button' className='btn btn-primary rounded-0' data-dismiss='modal' onClick={() => this.modalBaiBao.show({ idCbhd })}>
                    <i className='fa fa-fw fa-lg fa-plus' />Thêm
                </button>
            </div> : null}
        </>;

    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    updateSdhTsCongTrinhCbhd, createSdhTsCongTrinhCbhd, deleteSdhTsCongTrinhCbhd, getSdhTsBaiBaoCbhd
};
export default connect(mapStateToProps, mapActionsToProps)(DataBaiBaoCbhd);
