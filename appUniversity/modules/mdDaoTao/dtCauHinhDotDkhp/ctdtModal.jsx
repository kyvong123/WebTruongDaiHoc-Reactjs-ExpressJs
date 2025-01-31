import React from 'react';
import { getDtLopCtdt, getDtChuongTrinhDaoTao } from 'modules/mdDaoTao/dtLop/redux';
import { renderDataTable, TableCell, AdminModal } from 'view/component/AdminPage';
import { connect } from 'react-redux';

class CtdtModal extends AdminModal {
    state = { ctdt: null, dsCtdt: [] }

    componentDidMount() {
        this.onHidden(this.onHide);
    }

    onShow = (item) => {
        let filterCtdt = { maCtdt: item };
        this.props.getDtChuongTrinhDaoTao(item, value => {
            this.setState({ ctdt: value });
        });
        this.props.getDtLopCtdt(filterCtdt, dsCtdt => {
            this.setState({ dsCtdt });
        });
    }

    onHide = () => {
        this.setState({ ctdt: null, dsCtdt: [] });
    }

    render = () => {
        let { ctdt, dsCtdt } = this.state;
        let table = renderDataTable({
            data: dsCtdt,
            header: 'thead-light',
            emptyTable: 'Chương trình đào tạo bị rỗng',
            stickyHead: dsCtdt?.length > 12,
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }}>#</th>
                        <th rowSpan='2' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Mã môn học</th>
                        <th rowSpan='2' style={{ width: '70%', textAlign: 'center', verticalAlign: 'middle' }}>Tên môn học</th>
                        <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'center' }}>Tín chỉ</th>
                        <th rowSpan='1' colSpan='3' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }}>Số tiết</th>
                        <th rowSpan='2' style={{ width: '10%', whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'center' }}>Học kỳ dự kiến</th>
                        <th rowSpan='2' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Năm học dự kiến</th>
                    </tr>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>LH</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>TH</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Tổng</th>
                    </tr>
                </>
            ),
            renderRow: (item, index) => (
                <tr key={index} style={{ backgroundColor: 'white' }}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.maMonHoc} />
                    <TableCell style={{ textAlign: 'left' }} content={T.parse(item.tenMonHoc)?.vi} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soTinChi} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tietLH} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tietTH} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongTiet} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hocKyDuKien} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namHocDuKien} />
                </tr>
            ),
        });
        return this.renderModal({
            title: `Danh sách môn học trong chương trình đào tạo: ${ctdt?.maCtdt}`,
            size: 'elarge',
            body: <>
                {table}
            </>,
            postButtons: <>
                {ctdt ? <button type='button' className='btn btn-light'>
                    <a href={`/user/dao-tao/chuong-trinh-dao-tao/${ctdt.id}`} target='_blank' rel='noreferrer' >
                        Đi đến CTDT <i className='fa fa-lg fa-angle-right' />
                    </a>
                </button> : <div />}

            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDtLopCtdt, getDtChuongTrinhDaoTao };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(CtdtModal);
