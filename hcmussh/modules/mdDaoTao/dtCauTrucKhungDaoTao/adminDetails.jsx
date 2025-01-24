import React from 'react';
import { connect } from 'react-redux';
import { createMultiDtCauTrucKhungDaoTao, createDtCauTrucKhungDaoTao, updateDtCauTrucKhungDaoTao, getDtCauTrucKhungDaoTao } from './redux';
import { Link } from 'react-router-dom';
// import ComponentMTDT from './componentMTDT';
import ComponentCTDT from './componentCTDT';
import { AdminPage, FormSelect, FormTextBox } from 'view/component/AdminPage';
import Loading from 'view/component/Loading';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
class DtCauTrucKhungDaoTaoDetails extends AdminPage {
    state = { isLoading: true }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            const route = T.routeMatcher('/user/dao-tao/cau-truc-khung-dao-tao/:maKhung');
            this.ma = route.parse(window.location.pathname)?.maKhung;
            this.setState({ isLoading: false });
            const query = new URLSearchParams(this.props.location.search);
            const id = query.get('id');
            if (this.ma !== 'new') {
                this.getData(this.ma);
            } else {
                if (id > 0) {
                    this.getData(id, true);
                    return;
                } else this.bacDaoTao?.value('DH');
                [this.chuongTrinhDaoTao].forEach(e => e.setVal({ parents: {}, childs: {} }));
            }
        });
    }

    getData = (maKhung) => {
        this.props.getDtCauTrucKhungDaoTao(maKhung, (ctkdt) => {
            this.bacDaoTao.value('DH');
            const mucCha = T.parse(ctkdt.mucCha, {
                // mucTieuDaoTao: {},
                chuongTrinhDaoTao: {}
            });
            const mucCon = T.parse(ctkdt.mucCon, {
                // mucTieuDaoTao: {},
                chuongTrinhDaoTao: {}
            });
            this.maKhung.value(ctkdt.maKhung);
            this.tenKhung.value(ctkdt.tenKhung);
            // this.mucTieuDaoTao.setVal({ parents: mucCha.mucTieuDaoTao, childs: mucCon.mucTieuDaoTao });
            this.chuongTrinhDaoTao.setVal({ parents: mucCha.chuongTrinhDaoTao, childs: mucCon.chuongTrinhDaoTao });
        });
    }

    validation = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    getValue = () => {
        try {
            const data = {
                bacDaoTao: this.validation(this.bacDaoTao),
                maKhung: this.validation(this.maKhung),
                tenKhung: this.validation(this.tenKhung)
            };
            return data;
        } catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    save = () => {
        const data = this.getValue();

        if (data) {
            // const mucTieuDaoTao = this.mucTieuDaoTao.getValue() || { parents: [], childrens: {} };
            const { parents, children } = this.chuongTrinhDaoTao.getValue() || { parents: [], children: {} };

            //1 mucTieuDaoTao, 2 chuongTrinhDaoTao
            // mucTieuDaoTao.parents.forEach((mtDt) => {
            //     const { id, value } = mtDt;
            //     mucCha.mucTieuDaoTao[id] = value;
            //     mucCon.mucTieuDaoTao[id] = mucTieuDaoTao.childrens[id];
            // });

            let updateDatas = { ...{ mucCha: T.stringify({ chuongTrinhDaoTao: parents }) }, ...{ mucCon: T.stringify({ chuongTrinhDaoTao: children }) } };

            if (this.ma == 'new') {
                updateDatas = { ...updateDatas, ...data };
                this.props.createDtCauTrucKhungDaoTao(updateDatas, (item) => {
                    window.location = `/user/dao-tao/cau-truc-khung-dao-tao/${item.maKhung}`;
                });
            } else {
                T.confirm('Cảnh báo', '<div>Các cấu trúc tín chỉ của khung đào tạo này sẽ được đặt lại!<br/>Bạn có chắc muốn cập nhật khung?</div>', 'warning', true, isConfirm => {
                    if (isConfirm) {
                        this.props.updateDtCauTrucKhungDaoTao(this.ma, { ...updateDatas, ...data }, () => {
                            location.reload();
                        });
                    }
                });
            }
        }
    }
    render() {
        const permission = this.getUserPermission('dtCauTrucKhungDaoTao');
        // const readOnly = !permission.write;

        return this.renderPage({
            icon: 'fa fa-university',
            title: this.ma !== 'new' ? 'Chỉnh sửa cấu trúc khung đào tạo' : 'Tạo mới cấu trúc khung đào tạo',
            subTitle: <span style={{ color: 'red' }}>Lưu ý: Các mục đánh dấu * là bắt buộc</span>,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/cau-truc-khung-dao-tao'>Cấu trúc khung đào tạo</Link>,
                this.ma !== 'new' ? 'Chỉnh sửa' : 'Tạo mới',
            ],
            content: <>
                {this.state.isLoading && <Loading />}
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin chung</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-12' required readOnly={true} />
                            <FormTextBox ref={e => this.maKhung = e} label='Mã khung' disabled={!(this.ma == 'new')} required className='col-md-4' />
                            <FormTextBox ref={e => this.tenKhung = e} label='Tên khung' required className='col-md-8' />
                        </div>
                    </div>
                </div>
                {/* <div className='tile'>
                    <h3 className='tile-title'>Mục tiêu đào tạo</h3>
                    <div className='tile-body'>
                        <ComponentMTDT ref={e => this.mucTieuDaoTao = e} />
                    </div>
                </div> */}
                <div className='tile'>
                    <h3 className='tile-title'>Cấu trúc</h3>
                    <div className='tile-body'>
                        <ComponentCTDT ref={e => this.chuongTrinhDaoTao = e} />
                    </div>
                </div>
            </>,
            backRoute: '/user/dao-tao/cau-truc-khung-dao-tao',
            onSave: permission.write ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtCauTrucKhungDaoTao: state.daoTao.dtCauTrucKhungDaoTao });
const mapActionsToProps = { createMultiDtCauTrucKhungDaoTao, getDtCauTrucKhungDaoTao, createDtCauTrucKhungDaoTao, updateDtCauTrucKhungDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(DtCauTrucKhungDaoTaoDetails);