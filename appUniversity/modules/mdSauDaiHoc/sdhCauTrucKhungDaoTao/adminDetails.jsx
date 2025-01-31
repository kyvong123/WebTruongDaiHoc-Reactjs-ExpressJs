import React from 'react';
import { connect } from 'react-redux';
import { createMultiSdhCauTrucKhungDaoTao, createSdhCauTrucKhungDaoTao, updateSdhCauTrucKhungDaoTao, getSdhCauTrucKhungDaoTao } from './redux';
import { Link } from 'react-router-dom';
import ComponentCTDT from './componentCTDT';
import { AdminPage, FormTextBox } from 'view/component/AdminPage';
import Loading from 'view/component/Loading';
class SdhCauTrucKhungDaoTaoDetails extends AdminPage {
    state = { isLoading: true, ma: '' }

    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            const route = T.routeMatcher('/user/sau-dai-hoc/cau-truc-khung-dao-tao/:ma');
            this.ma = route.parse(window.location.pathname)?.ma;
            this.setState({ isLoading: false });
            const query = new URLSearchParams(this.props.location.search);
            const id = query.get('id');
            if (this.ma !== 'new') {
                this.setState({ ma: this.ma });
                this.getData(this.ma);
            } else {
                if (id > 0) {
                    this.getData(id, true);
                    return;
                }
                [
                    // this.mucTieuDaoTao,
                    this.chuongTrinhDaoTao].forEach(e => e.setVal({ parents: {}, childs: {} }));
            }
        });

    }

    getData = (id, isClone = false) => {
        this.props.getSdhCauTrucKhungDaoTao(id, (ctkdt) => {
            let { tenKhung, maKhung } = ctkdt;
            this.maKhung.value(isClone ? '' : maKhung);
            this.tenKhung.value(isClone ? '' : tenKhung);
            const mucCha = T.parse(ctkdt.mucCha, {
                // mucTieuDaoTao: {},
                chuongTrinhDaoTao: {}
            });
            const mucCon = T.parse(ctkdt.mucCon, {
                // mucTieuDaoTao: {},
                chuongTrinhDaoTao: {}
            });
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
                maKhung: this.validation(this.maKhung),
                tenKhung: this.validation(this.tenKhung),
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
            const chuongTrinhDaoTao = this.chuongTrinhDaoTao.getValue() || { parents: [], childrens: {} };

            const mucCha = {
                // mucTieuDaoTao: {},
                chuongTrinhDaoTao: {}
            };
            const mucCon = {
                // mucTieuDaoTao: {},
                chuongTrinhDaoTao: {}
            };

            chuongTrinhDaoTao.parents.forEach((ctDt) => {
                const { id, value } = ctDt;
                mucCha.chuongTrinhDaoTao[id] = value;
                mucCon.chuongTrinhDaoTao[id] = chuongTrinhDaoTao.childrens[id];
            });

            let updateDatas = { ...{ mucCha: T.stringify(mucCha) }, ...{ mucCon: T.stringify(mucCon) } };
            // const deleteDatas = { items: deleteItems };
            if (this.ma == 'new') {
                updateDatas = { ...updateDatas, ...data };
                this.props.createSdhCauTrucKhungDaoTao(updateDatas, (item) => {
                    window.location = `/user/sau-dai-hoc/cau-truc-khung-dao-tao/${item.id}`;
                });
            } else {
                this.props.updateSdhCauTrucKhungDaoTao(this.ma, { ...updateDatas, ...data }, () => {
                    // location.reload();
                });
            }
        }
    }
    render() {
        const permission = this.getUserPermission('sdhCauTrucKhungDaoTao');
        const readOnly = !permission.write;

        return this.renderPage({
            icon: 'fa fa-university',
            title: this.ma !== 'new' ? 'Chỉnh sửa cấu trúc khung đào tạo' : 'Tạo mới cấu trúc khung đào tạo',
            subTitle: <span style={{ color: 'red' }}>Lưu ý: Các mục đánh dấu * là bắt buộc</span>,
            breadcrumb: [
                <Link key={1} to='/user/sau-dai-hoc/cau-truc-khung-dao-tao'>Cấu trúc khung đào tạo</Link>,
                this.ma !== 'new' ? 'Chỉnh sửa cấu trúc khung' : 'Tạo mới cấu trúc khung',
            ],
            content: <>
                {this.state.isLoading && <Loading />}
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin chung</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <FormTextBox type='text' ref={e => this.maKhung = e} style={{ marginTop: this.state.ma ? '35px' : '' }} label='Mã cấu trúc khung' className='col-md-4' required readOnly={this.state.ma ? true : readOnly} />
                            <FormTextBox type='text' ref={e => this.tenKhung = e} label='Tên cấu trúc khung' className='col-md-8' required readOnly={readOnly} />
                        </div>
                    </div>
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Chương trình đào tạo</h3>
                    <div className='tile-body'>
                        <ComponentCTDT ref={e => this.chuongTrinhDaoTao = e} />
                    </div>
                </div>
            </>,
            backRoute: '/user/sau-dai-hoc/cau-truc-khung-dao-tao',
            onSave: permission.write ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhCauTrucKhungDaoTao: state.sdh.sdhCauTrucKhungDaoTao });
const mapActionsToProps = { createMultiSdhCauTrucKhungDaoTao, getSdhCauTrucKhungDaoTao, createSdhCauTrucKhungDaoTao, updateSdhCauTrucKhungDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(SdhCauTrucKhungDaoTaoDetails);