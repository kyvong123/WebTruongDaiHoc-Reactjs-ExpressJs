import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_DtDmHinhThucThi } from 'modules/mdDaoTao/dtDmHinhThucThi/redux';
import { updateMultiHinhThuc } from 'modules/mdDaoTao/dtDiem/redux';

class UpdateMultiModal extends AdminModal {
    state = { configThi: [] }
    hinhThucThi = {}

    componentDidMount() {
        $(document).ready(() => {
            this.onHidden(() => {
                this.setState({ configThi: [] });
            });
        });
    }

    onShow = () => {
        let { listChosen = [] } = this.props,
            firstItem = listChosen && listChosen.length && listChosen[0].configDefault ? T.parse(listChosen[0].configDefault) : {},
            configThi = Object.keys(firstItem).filter(key => firstItem[key].isThi);
        if (!configThi.length) T.alert('Năm học, học kỳ chưa có cấu hình thành phần điểm', 'error', null, 5000);
        this.setState({ configThi });
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        let { configThi } = this.state, data = {}, dataHocPhan = [];
        configThi.forEach(i => data[i] = this.hinhThucThi[i].value());
        for (let item of this.props.listChosen) {
            let { maHocPhan, maMonHoc } = item, tpDiem = item.tpHocPhan || item.tpMonHoc,
                defaultConfig = item.configDefault ? T.parse(item.configDefault) : {};
            if (tpDiem) {
                tpDiem = T.parse(tpDiem);
            } else {
                tpDiem = {};
                Object.keys(defaultConfig).forEach(tp => tpDiem[tp] = defaultConfig[tp]?.default || 50);
            }
            dataHocPhan.push({ maHocPhan, maMonHoc, tpDiem });
        }
        this.props.updateMultiHinhThuc(data, dataHocPhan, () => {
            this.hide();
            this.props.save();
        });
    };

    render = () => {
        let { configThi } = this.state;
        return this.renderModal({
            title: 'Cập nhật hình thức thi',
            size: 'large',
            body: <div className='row'>
                {
                    configThi.map(i => <>
                        <label style={{ padding: '0 15px' }}>Hình thức thi {i}</label>
                        <FormSelect className='col-md-12' ref={e => this.hinhThucThi[i] = e} data={SelectAdapter_DtDmHinhThucThi} multiple allowClear />
                    </>)
                }
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateMultiHinhThuc };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(UpdateMultiModal);