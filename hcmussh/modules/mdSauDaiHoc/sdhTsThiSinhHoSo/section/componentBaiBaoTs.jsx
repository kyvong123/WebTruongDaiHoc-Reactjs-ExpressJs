import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, } from 'view/component/AdminPage';
import { renderTable, TableCell } from 'view/component/AdminPage';
import { BaiBaoTSModal } from 'modules/mdSauDaiHoc/sdhTsBaiBao/BaiBaoModal';
import { updateSdhTsBaiBao, createSdhTsBaiBao, deleteSdhTsBaiBao, getSdhTsBaiBao } from 'modules/mdSauDaiHoc/sdhTsBaiBao/redux';

class DataBaiBaoTs extends AdminPage {
    componentDidMount() {
        this.getData();
    }
    getData = () => {
        this.props.getSdhTsBaiBao(this.props.idThiSinh, (items) => this.setState({ list: items }));
    }
    render() {
        const { readOnly, idThiSinh } = this.props;
        const tableBaiBao = renderTable({
            getDataSource: () => this.state.list || [],
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
                    <TableCell style={{ textAlign: 'left' }} content={item.tenBaiBao} />
                    <TableCell style={{ textAlign: 'left' }} content={item.tenTapChi} />
                    <TableCell style={{ textAlign: 'left' }} content={item.chiSo} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'left' }} content={item.ngayDang} />
                    <TableCell style={{ textAlign: 'left' }} content={item.diem} />
                    <TableCell type='buttons' style={{ zIndex: '1', textAlign: 'center' }} permission={{ write: !readOnly, delete: !readOnly }} content={item}
                        onEdit={e => e.preventDefault() || this.modalBaiBaoTs.show(item)}
                        onDelete={e => e.preventDefault() || T.confirm('Xóa bài báo', 'Bạn có chắc chắn xóa bài báo?', true, isConfirm => isConfirm && this.props.deleteSdhTsBaiBao(item.idBaiBao, () => this.getData()))} />
                </tr>
            )
        });
        return <>
            <BaiBaoTSModal ref={e => this.modalBaiBaoTs = e} readOnly={readOnly} getData={this.getData} create={this.props.createSdhTsBaiBao} update={this.props.updateSdhTsBaiBao} />
            <div className='col-md-12 p-15 mb-5'>
                {tableBaiBao}
            </div>
            {!this.props.readOnly ? <div className='d-flex justify-content-end p-15'>
                <button type='button' className='btn btn-primary rounded-0' data-dismiss='modal' onClick={() => this.modalBaiBaoTs.show({ id: idThiSinh })}>
                    <i className='fa fa-fw fa-lg fa-plus' />Thêm
                </button>
            </div> : null}
        </>;

    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    updateSdhTsBaiBao, createSdhTsBaiBao, deleteSdhTsBaiBao, getSdhTsBaiBao
};
export default connect(mapStateToProps, mapActionsToProps)(DataBaiBaoTs);
