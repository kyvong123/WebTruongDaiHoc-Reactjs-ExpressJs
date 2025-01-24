import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import { getDtNganhDaoTaoAll, dtNganhHeDaoTaoGetByFilter, dtNganhHeDaoTaoCreate, dtNganhHeDaoTaoCreateAll } from 'modules/mdDaoTao/dtNganhDaoTao/redux';


class NganhHeModal extends AdminModal {

    componentDidMount() {
        this.props.getDtNganhDaoTaoAll(data => {
            this.setState({ dataNganh: data });
        });
    }

    onShow = (item) => {
        this.props.dtNganhHeDaoTaoGetByFilter(item.ma, items => this.setState({ item, dataNganhHe: items }));
    }

    handleCheck = (maNganh) => {
        const { item } = this.state;
        this.props.dtNganhHeDaoTaoCreate(item.ma, maNganh, () => {
            this.props.dtNganhHeDaoTaoGetByFilter(item.ma, items => this.setState({ dataNganhHe: items }));
        });
    }

    handleClick = (e) => {
        e && e.preventDefault();
        const { dataNganh, item } = this.state;
        this.props.dtNganhHeDaoTaoCreateAll(item.ma, dataNganh.map(i => i.maNganh), () => {
            this.props.dtNganhHeDaoTaoGetByFilter(item.ma, items => this.setState({ dataNganhHe: items }));
        });
    }

    table = (list) => renderDataTable({
        data: list, stickyHead: list && list.length > 15,
        divStyle: { 'height': '75vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: 'auto' }}>Chọn</th>
                <TableHead style={{ width: 'auto' }} content='Mã' />
                <TableHead style={{ width: '100%' }} content='Tên' />
            </tr>),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} permission={{ write: ' true' }} content={this.state.dataNganhHe?.find(i => i.nganhDaoTao == item.maNganh)} onChanged={() => this.handleCheck(item.maNganh)} />
                <TableCell content={item.maNganh} />
                <TableCell content={item.tenNganh} />
            </tr>
        )
    })

    render = () => {
        const { dataNganh, item } = this.state;
        return this.renderModal({
            title: `Quản lý ngành hệ ${item?.ten}`,
            body: <div>
                {this.table(dataNganh)}
            </div>,
            postButtons: <button type='button' className='btn btn-success' onClick={this.handleClick}>
                <i className='fa fa-fw fa-lg fa-check' /> Cập nhật tất cả
            </button>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDtNganhDaoTaoAll, dtNganhHeDaoTaoGetByFilter, dtNganhHeDaoTaoCreate, dtNganhHeDaoTaoCreateAll };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(NganhHeModal);