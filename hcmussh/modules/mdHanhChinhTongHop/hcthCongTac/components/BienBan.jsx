import React from 'react';
import { connect } from 'react-redux';
import { TableCell, renderTable } from 'view/component/AdminPage';
import { createBienBan } from '../redux/congTac';
import BienBanModal from './BienBanModal';
import moment from 'moment';
import BaseCongTac from './BaseCongTac';


class BienBan extends BaseCongTac {

    createBienBan = () => {
        this.props.createBienBan(this.props.id, { noiDungHtml: '' }, (item) => {
            this.bienBanModal.show(item);
        });
    }

    render() {
        const data = this.getItem()?.bienBan;
        const table = renderTable({
            getDataSource: () => data,
            loadingClassName: 'd-flex justify-content-center align-items-center',
            loadingOverlay: false,
            renderHead: () => {
                return <tr >
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Ngày tạo</th>
                    <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Người tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>;
            },
            renderRow: (item, index) => {
                return <tr key={item.id}>
                    <TableCell content={index + 1} />
                    <TableCell contentStyle={{ whiteSpace: 'nowrap' }} content={<div className='d-flex flex-column'>
                        <span>{moment(new Date(item.thoiGian)).format('DD/MM/YYYY, HH:mm')}</span>
                        {item.capNhat && <span><span className='text-primary'>Cập nhật lúc: </span>{moment(new Date(item.capNhat)).format('DD/MM/YYYY, HH:mm')}</span>}
                    </div>} />
                    <TableCell content={`${item.nguoiTao}: ${item.tenCanBo}`} />
                    <TableCell type='buttons' permission={{ write: this.getShcc() == item.nguoiTao, delete: false }} onEdit={() => this.bienBanModal.show(item)} onDelete={(e) => e.preventDefault()} />
                </tr>;
            }
        });
        return <div className='tile-body row'>
            {this.isConcludable() && <div className='col-md-12 d-flex justify-content-end align-items-center'>
                <button className='btn btn-success' onClick={(e) => e.preventDefault() || this.createBienBan()}><i className='fa fa-lg fa-plus' /> Tạo mới</button>
            </div>}
            <BienBanModal ref={e => this.bienBanModal = e} />
            <div className='col-md-12'>
                {table}
            </div>
        </div>;
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = { createBienBan };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(BienBan);
