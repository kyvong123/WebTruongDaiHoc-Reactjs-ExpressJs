import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import { getForm, saveForm } from './redux';
import ComponentCaNhan from './components/componentCaNhan';
import ComponentHocVan from './components/componentHocVan';
import ComponentCongTac from './components/componentCongTac';
import ComponentKhenThuong from './components/componentKhenThuong';
import ComponentGiaCanh from './components/componentGiaCanh';

export class KhaiBaoDataVnu extends AdminPage {
    componentDidMount() {
        T.ready('/user', () => {
            this.props.getForm(data => this.fillData(data));
        });
    }

    fillData = (data) => {
        this.componentCaNhan.fillData(data);
        this.componentHocVan.fillData(data);
        this.componentCongTac.fillData(data);
        this.componentKhenThuong.fillData(data);
        this.componentGiaCanh.fillData(data);
    }

    saveData = () => {
        try {
            const data = {
                ...this.componentCaNhan.getValue(),
                ...this.componentHocVan.getValue(),
                ...this.componentCongTac.getValue(),
                ...this.componentKhenThuong.getValue(),
                ...this.componentGiaCanh.getValue(),
            };

            this.props.saveForm(data, () => {
                T.notify('Lưu dữ liệu thành công', 'success');
            });
        }
        catch (error) { return; }
    }

    render() {
        let buttons = [];
        buttons.push({ className: 'btn-warning', icon: 'fa-save', tooltip: 'Lưu', onClick: e => e.preventDefault() || this.saveData() });

        return this.renderPage({
            title: 'KHAI BÁO HỒ SƠ NHÂN SỰ VNU-HCM',
            icon: 'fa fa-id-card-o',
            breadcrumb: [],
            content: <>
                <FormTabs contentClassName='tile-body' ref={e => this.tab = e} tabs={[
                    { title: <>Cá nhân</>, component: <ComponentCaNhan ref={e => this.componentCaNhan = e} /> },
                    { title: <>Học vấn</>, component: <ComponentHocVan ref={e => this.componentHocVan = e} /> },
                    { title: <>Công tác</>, component: <ComponentCongTac ref={e => this.componentCongTac = e} /> },
                    { title: <>Khen thưởng - Kỷ luật</>, component: <ComponentKhenThuong ref={e => this.componentKhenThuong = e} /> },
                    { title: <>Gia cảnh</>, component: <ComponentGiaCanh ref={e => this.componentGiaCanh = e} /> },
                ]} />
            </>,
            buttons
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getForm, saveForm };
export default connect(mapStateToProps, mapActionsToProps)(KhaiBaoDataVnu);
