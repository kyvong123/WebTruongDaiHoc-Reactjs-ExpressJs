import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { getSdhQuanLyDeTaiAdmin, updateQuanLyDeTai, createSdhQuanLyDeTai } from './redux';
import { SelectAdapter_FwSvSdh } from '../fwSinhVienSdh/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_sdhTinhTrangDeTai } from '../sdhDmTinhTrangDeTai/redux';

class ComponentDetaiPage extends AdminPage {
    state = { data: {}, lastModified: null, image: '', mssv: '', khoa: '', readOnly: true, item: null, gvhd: null, sinhVien: null }

    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            let route = T.routeMatcher('/user/sau-dai-hoc/quan-ly-de-tai/item/:ma'),
                ma = route.parse(window.location.pathname).ma;
            if (ma != 'new') {
                this.setState({ ma }, () => this.getData(ma));
            } else {
                this.setState({ itemInit: [], itemChange: [], readOnly: false });
                this.mssv.value('');
                this.tenDeTai.value('');
                this.nam.value('');
                this.tinhTrang.value('');
                this.shccGvhd.value([]);
            }
        });
    }

    getData = (ma) => {
        this.props.getSdhQuanLyDeTaiAdmin(ma, data => {
            this.setState({ itemInit: data, itemChange: data });
            this.mssv.value(data.mssv ? data.mssv : '');
            this.tenDeTai.value(data.tenDeTai ? data.tenDeTai : '');
            this.nam.value(data.nam ? data.nam : '');
            this.tinhTrang.value(data.tinhTrang ? data.tinhTrang : '');
            this.shccGvhd.value(data.listShcc ? data.listShcc.map(ele => ele.trim()) : []);
        });
    }

    save = () => {
        const data = {
            hocVien: this.state.itemChange.mssv,
            tenDeTai: this.tenDeTai.value(),
            nam: this.nam.value(),
            tinhTrang: this.tinhTrang.value(),
            giaoVienHd: this.state.itemChange.shccGvhd ? JSON.stringify(this.state.itemChange.shccGvhd) : JSON.stringify(this.shccGvhd.value()),
        };
        if (this.state.ma) {
            this.props.updateQuanLyDeTai(this.state.ma, data, (res) => {
                if (res.error) {
                    this.reset();
                } else {
                    this.getData(res.item.ma);
                    this.setState({ readOnly: true });
                }
            });
        } else {
            this.props.createSdhQuanLyDeTai(data, (res) => {
                if (res.error) {
                    this.reset();
                } else {
                    this.getData(res.item.ma);
                    this.setState({ readOnly: true });
                }
            });
        }

    };
    reset = () => {
        this.mssv.value(this.state.itemInit.mssv);
        this.tenDeTai.value(this.state.itemInit.tenDeTai);
        this.nam.value(this.state.itemInit.nam);
        this.tinhTrang.value(this.state.itemInit.tinhTrang);
        this.shccGvhd.value(this.state.itemInit.gvhd.map(ele => ele.shcc.trim()));
        this.setState({ readOnly: true });
    }

    render() {
        let permission = this.getUserPermission('sdhDmQuanLyDeTai', ['read', 'write', 'delete']),
            readOnly = permission.write && this.state.readOnly;
        return this.renderPage({
            icon: 'fa fa-user-circle-o',
            title: 'Đề tài',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/quan-ly-de-tai'>Quản lý đề tài</Link>,
                'Thông tin đề tài'
            ],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin đề tài</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <FormSelect ref={e => this.mssv = e} label='Sinh viên' className='form-group col-md-12' data={SelectAdapter_FwSvSdh} readOnly={readOnly}
                                onChange={value => {
                                    let currentSv = Object.assign({}, this.state.itemChange);
                                    this.setState({ itemChange: { ...currentSv, mssv: value.id } });
                                }}
                            />
                            <FormTextBox ref={e => this.tenDeTai = e} label='Tên đề tài' className='form-group col-md-12' readOnly={readOnly} />
                            <FormTextBox ref={e => this.nam = e} label='Năm' className='form-group col-md-6' readOnly={readOnly} />
                            <FormSelect ref={e => this.tinhTrang = e} label='Tình trạng' className='form-group col-md-6' readOnly={readOnly} data={SelectAdapter_sdhTinhTrangDeTai}
                                onChange={value => {
                                    let currentTinhTrang = Object.assign({}, this.state.itemChange);
                                    this.setState({ itemChange: { ...currentTinhTrang, tinhTrang: value.id } });
                                }}
                            />
                            <FormSelect multiple ref={e => this.shccGvhd = e} label='Giảng viên hướng dẫn' className='form-group col-md-12' readOnly={readOnly} data={SelectAdapter_FwCanBo}
                                onChange={value => {
                                    let currentGvhd = Object.assign({}, this.state.itemChange),
                                        currentListGvhd = currentGvhd.listShcc ? currentGvhd.listShcc.map(ele => ele.trim()) : [];
                                    if (value.selected) {
                                        currentListGvhd.push(value.id);
                                    } else currentListGvhd = currentListGvhd.filter(item => item != value.id);
                                    this.setState({ itemChange: { ...currentGvhd, shccGvhd: currentListGvhd } });
                                }}
                            />

                        </div>
                    </div>
                </div>
            </>,
            backRoute: '/user/sau-dai-hoc/quan-ly-de-tai',
            onSave: permission.write && !readOnly ? () => this.save() : null,
            buttons: [
                readOnly && { icon: 'fa fa-lg fa-edit', tooltip: 'Edit', className: 'btn btn-primary', onClick: () => this.setState({ readOnly: false }) },
                !readOnly && { icon: 'fa fa-refresh', tooltip: 'Reset', onClick: this.reset, className: 'btn btn-warning', },
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhDmQuanLyDeTai: state.sdh.sdhDmQuanLyDeTai });
const mapActionsToProps = {
    getSdhQuanLyDeTaiAdmin, updateQuanLyDeTai, createSdhQuanLyDeTai
};
export default connect(mapStateToProps, mapActionsToProps)(ComponentDetaiPage);