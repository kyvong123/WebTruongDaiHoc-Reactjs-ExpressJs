import React from 'react';
import { connect } from 'react-redux';
import { get, updateNhomItemOrdinal } from './redux/dmNhomLoaiVanBan';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class GroupLoai extends AdminPage {
    state = { filter: {} }
    componentDidMount() {
        T.ready('/user/category', () => {
            const params = T.routeMatcher('/user/category/loai-van-ban/nhom/:ma').parse(window.location.pathname);
            this.setState({ ma: params.ma }, () => {
                this.getItem();
            });
        });
    }

    getItem = () => {
        this.setState({ nhom: null }, () => {
            this.props.get(this.state.ma, this.handleItem);
        });
    }

    handleItem = (nhom) => {
        nhom.phanNhom = nhom.items.reduce((phanNhom, loaiVanBan) => {
            if (!phanNhom[loaiVanBan.nhomOrdinal]) {
                phanNhom[loaiVanBan.nhomOrdinal] = [loaiVanBan];
            } else phanNhom[loaiVanBan.nhomOrdinal].push(loaiVanBan);
            return phanNhom;
        }, {});
        this.setState({ nhom });
    }

    updateOrdinal = (item, mode) => {
        this.props.updateNhomItemOrdinal({ maNhom: item.maNhom, maLoaiVanBan: item.maLoaiVanBan }, mode, this.getItem);
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-cogs',
            title: 'Nhóm loại văn bản',
            breadcrumb: [
                <Link key={0} to='/user/category/loai-van-ban/nhom'>Nhóm loại văn bản</Link>,
                'Nhóm loại văn bản'
            ],
            content: !this.state.nhom ?
                <div className='tile'>
                    <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '120px' }}>
                        <div className='m-loader mr-4'>
                            <svg className='m-circular' viewBox='25 25 50 50'>
                                <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                            </svg>
                        </div>
                        <h3 className='l-text'>Đang tải dữ liệu phân nhóm</h3>
                    </div>
                </div>
                : <div>
                    {Object.entries(this.state.nhom.phanNhom).map(([ordinal, phanNhom], index) => {
                        return <div className="tile" key={ordinal}>
                            <h4 className="tile-header my-2">Phân nhóm {index + 1}</h4>
                            <div className="tile-body row m-2">
                                <table className="col-md-12 table">
                                    <tbody>
                                        {phanNhom.map(item => <tr key={item.maLoaiVanBan}>
                                            <td style={{ wdith: '100%' }}>{item.tenLoaiVanBan}</td>
                                            <td style={{ wdith: 'auto', gap: 10 }} className='d-flex justify-content-end'>
                                                {index != (this.state.nhom.phanNhom.length - 1) && <Tooltip arrow title='Chuyển phân nhóm (xuống)'><i className='fa fa-lg fa-arrow-down text-success' onClick={() => {
                                                    this.updateOrdinal(item, 'increase');
                                                }} /></Tooltip>}
                                                {index != 0 && <Tooltip arrow title='Chuyển phân nhóm (lên)'><i className='fa fa-lg fa-arrow-up text-success' onClick={() => {
                                                    this.updateOrdinal(item, 'decrease');
                                                }} /></Tooltip>}
                                            </td>
                                        </tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>;
                    })}
                </div>,
            backRoute: '/user/category/loai-van-ban/nhom',
            // onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNhomLoaiVanBan: state.danhMuc.dmNhomLoaiVanBan });
const mapActionsToProps = { get, updateNhomItemOrdinal };
export default connect(mapStateToProps, mapActionsToProps)(GroupLoai);
