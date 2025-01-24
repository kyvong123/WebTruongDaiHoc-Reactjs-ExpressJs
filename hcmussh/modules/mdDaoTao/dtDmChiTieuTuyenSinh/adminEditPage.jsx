import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormTextBox } from 'view/component/AdminPage';
import { getNamTuyenSinh, updateSoLuong } from './redux';

class ChiTieuTuyenSinhEdit extends AdminPage {
    state = { filter: {}, expanded: [] }
    componentDidMount() {
        T.ready('/user/daoTao', () => {
            const params = T.routeMatcher('/user/dao-tao/tuyen-sinh/chi-tieu/:namTuyenSinh/:dot').parse(window.location.pathname);
            this.setState({ namTuyenSinh: params.namTuyenSinh, dot: params.dot }, () => {
                this.props.getNamTuyenSinh(this.state.namTuyenSinh, this.state.dot);
            });
        });
    }

    save = (loaiHinhDaoTao, nganh) => {
        const value = this.state.editValue;
        if (value == null || value == 0) {
            T.notify('Giá trị không hợp lệ', 'danger');
            return this[this.state.editing]?.focus();
        }
        this.props.updateSoLuong(this.state.namTuyenSinh, this.state.dot, { loaiHinhDaoTao, nganh, soLuong: value }, null, () => {
            if (this.state.editing == `${loaiHinhDaoTao}_${nganh}`) {
                this.setState({ editing: null });
            }
        });
    }

    onToggleLoaiHinhDaoTao = (item) => {
        if (this.state.expanded.includes(item.ma)) {
            this.setState({ expanded: this.state.expanded.filter(i => i != item.ma) });
        } else {
            this.setState({ expanded: [...this.state.expanded, item.ma] });
        }
    }

    render() {
        const items = this.props.dtDmChiTieuTuyenSinh && this.props.dtDmChiTieuTuyenSinh.data;
        let table = renderTable({
            getDataSource: () => items?.sort(), stickyHead: true,
            loadingClassName: 'd-flex justify-content-center align-items-center',
            header: 'thead-light',
            loadingOverlay: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>STT</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Hệ</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Ngành</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Số lượng</th>
                </tr>
            ),
            renderRow: (item, index) => {
                const isShow = this.state.expanded.includes(item.ma);
                return <React.Fragment key={index}>
                    <tr key={index} onClick={() => this.onToggleLoaiHinhDaoTao(item)}>
                        <TableCell content={index + 1} rowSpan={isShow ? item.nganh.length + 1 : 1} />
                        <TableCell content={`${item.ten} (${item.nganh.reduce((total, cur) => total + cur.soLuong, 0)})`} rowSpan={isShow ? item.nganh.length + 1 : 1} />
                        <TableCell type='link' style={{ textAlign: 'center' }} onClick={() => { }} content={isShow ? 'Thu gọn' : 'Mở rộng'} colSpan={2} />
                    </tr>
                    {
                        item.nganh.map((nganh) => (
                            <tr key={nganh.maNganh} style={isShow ? {} : { display: 'none' }}>
                                <TableCell content={nganh.tenNganh} />
                                <TableCell style={{ textAlign: 'center' }} content={this.state.editing == `${item.ma}_${nganh.maNganh}` ? <FormTextBox ref={e => this[`${item.ma}_${nganh.maNganh}`] = e} type='number' onBlur={() => this.save(item.ma, nganh.maNganh)} onChange={value => this.setState({ editValue: value })} /> : nganh.soLuong} onClick={() => {
                                    setTimeout(() => this.setState({ editing: `${item.ma}_${nganh.maNganh}` }, () => {
                                        this[`${item.ma}_${nganh.maNganh}`]?.value(nganh.soLuong);
                                        if (nganh.soLuong)
                                            this[`${item.ma}_${nganh.maNganh}`]?.focus();
                                    }), 300);
                                }} />
                            </tr>
                        ))
                    }
                </React.Fragment>;
            }
        });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Chỉ tiêu tuyển sinh',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/tuyen-sinh/tieu-chi'>Danh sách chỉ tiêu</Link>,
                'Chỉ tiêu tuyển sinh'
            ],
            content: <>
                <div className='tile'>
                    <div className='tile-body row'>
                        <div className='col-md-12'>
                            {table}
                        </div>
                    </div>
                </div>
            </>,
            backRoute: '/user/dao-tao/tuyen-sinh',
            onSave: this.state.editing && (() => { })
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDmChiTieuTuyenSinh: state.daoTao.dtDmChiTieuTuyenSinh });
const mapActionsToProps = { getNamTuyenSinh, updateSoLuong };
export default connect(mapStateToProps, mapActionsToProps)(ChiTieuTuyenSinhEdit);
