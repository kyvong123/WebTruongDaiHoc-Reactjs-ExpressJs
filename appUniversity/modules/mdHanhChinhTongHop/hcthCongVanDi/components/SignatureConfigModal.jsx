import { Tooltip } from '@mui/material';
import { SelectAdapter_HcthSignType } from 'modules/mdHanhChinhTongHop/hcthVanBanDiStatusSystem/redux/hcthSignType';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { AdminModal, FormSelect } from 'view/component/AdminPage';
const { font } = require('../../constant');
import { updateConfig } from '../redux/vanBanDi';


const fontSizeArray = () => {
    const start = 8;
    const array = [];
    for (let i = 0; i < 40; i++) {
        array.push(start + i * 0.5);
    }
    return array;
};


export default class SignatureConfigModal extends AdminModal {

    state = {
        signTypeList: [],
        configList: [],
        isLoading: false
    }

    allRef = {}

    onShow = (item) => {
        this.clearForm();
        this.signType.value('');

        this.setState({ ...item }, () => {
            const signTypeList = this.props.signTypeList.filter(item => !item.phuLuc).map(({ ma, ten, width, height, isImage, isText }) => ({
                signType: ma,
                ten,
                width, height,
                isImage, isText
            }));
            const defaultConfig = this.state.config.map(cf => {
                const signType = signTypeList.find(item => item.signType === cf.signType);
                return {
                    ...cf,
                    ten: signType.ten,
                    width: signType.width,
                    height: signType.height,
                    isImage: signType.isImage,
                    isText: signType.isText
                };
            });

            this.setState({
                signTypeList,
                configList: defaultConfig
            }, () => {
                if (this.state.config.length > 0) this.setConfig();
            });
        });
    }

    clearForm = () => {
        Object.keys(this.allRef).forEach(key => {
            try {
                this.allRef[key]?.value('');
            } catch {
                return;
            }
        });
    }

    setConfig = () => {
        this.state.configList.map(item => {
            this.allRef[`${item.signType}_SIGNER`]?.value(item.shcc || '');
            if (item.isText) {
                this.allRef.fontName?.value(item.fontName || '');
                this.allRef.fontSize?.value(item.fontSize || '');
            }
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        if (!this.state.phuLuc) {
            return this.onMainSubmit(() => {
                this.props.getFile(this.state.vanBanDi, (files) => {
                    this.setState({ isLoading: false }, () => {
                        this.props.setFiles(files);
                        this.hide();
                    });
                });
            });
        }
    }

    onMainSubmit = (done) => {
        try {
            if (this.state.configList.length === 0) {
                T.notify('Vui lòng thêm loại chữ ký', 'danger');
            } else {
                T.confirm('Xác nhận', 'Bạn có chắc chắn muốn lưu cấu hình chữ ký này không ?', isConfirm => {
                    if (isConfirm) {
                        this.setState({ isLoading: true });
                        const configs = this.state.configList.map(item => {
                            let newObj = { ...item };
                            if (item.isImage) {
                                newObj.shcc = this.allRef[`${item.signType}_SIGNER`].value();
                            } else if (item.isText) {
                                newObj.fontName = this.allRef.fontName.value();
                                newObj.fontSize = this.allRef.fontSize.value();
                            }
                            delete newObj.ten;
                            return newObj;
                        });
                        updateConfig(this.state.id, configs, done)();
                    }
                });
            }
        } catch (error) {
            this.setState({ isLoading: false });
            return;
        }
    }

    onChangePosition = (data, signType) => {
        const config = [...this.state.configList];
        let current = config.find(item => item.signType == signType);
        const index = config.indexOf(current);
        current = { ...current, ...data };
        config.splice(index, 1, current);
        this.setState({ configList: config });
    }

    onAddSignTypeConfig = (e) => {
        e.preventDefault();
        const addSignType = this.signType.value();
        const signTypeDetail = this.state.signTypeList.find(item => item.signType === addSignType);
        if (!addSignType) {
            T.notify('Vui lòng chọn loại chữ ký', 'danger');
            this.signType.focus();
            return;
        }

        if (this.state.configList.some(item => item.signType === addSignType)) {
            T.notify('Loại chữ ký đã tồn tại.', 'danger');
            this.signType.focus();
            return;
        }

        if (!signTypeDetail) {
            T.notify('Loại ký không hợp lệ.', 'danger');
            return;
        }

        const configDetail = this.state.signTypeList.find(item => item.signType === addSignType);
        const oldConfigs = this.state.configList;
        oldConfigs.push(configDetail);
        this.setState({
            configList: [...oldConfigs]
        });

        this.signType.value('');
    }

    onRemoveSignConfig = (e, signType) => {
        e.preventDefault();
        T.confirm('Xác nhận', 'Bạn có chắc chắn muốn xoá loại ký này không ?', isConfirm => {
            if (isConfirm) {
                let oldConfigs = [...this.state.configList];
                const deleteIndex = oldConfigs.findIndex(item => item.signType === signType);
                oldConfigs.splice(deleteIndex, 1);
                this.setState({
                    configList: [...oldConfigs]
                });
            }
        });
    }

    renderMainForm = () => {
        return <>
            <div className='col-md-12 d-flex justify-content-start' style={{ paddingLeft: 30 }}>
                <p>Chọn loại chữ ký</p>
            </div>
            <div className='col-md-12 d-flex justify-content-center'>
                <FormSelect className='col-md-10 w-100' ref={e => this.signType = e} data={SelectAdapter_HcthSignType} placeholder='Loại chữ ký' allowClear />
                <button type='button' className='btn btn-primary col-md-2 form-group' onClick={this.onAddSignTypeConfig}>
                    <i className='fa fa-plus'></i>Thêm
                </button>
            </div>
            <ol style={{ width: '100%' }}>
                {
                    this.state.configList.map((item, index) => {
                        if (item.isImage) {
                            const { height = 50, width = 50, ten } = item;
                            const { xCoordinate, yCoordinate, pageNumber } = this.state.configList.find(config => config.signType === item.signType) || {};
                            return <React.Fragment key={index}>
                                <li className='col-md-12 font-weight-bold mb-2'>{ten}</li>
                                <div className='col-md-12 d-flex align-items-center justify-content-center' style={{ gap: 10, marginBottom: 15 }}>
                                    <FormSelect ref={e => this.allRef[`${item.signType}_SIGNER`] = e} className='d-flex align-items-center justify-content-center' allowClear placeholder='Cán bộ ký' data={SelectAdapter_FwCanBo} style={{ flex: 1, margin: 'auto' }} />
                                    <div className='col-md-2 d-flex align-items-center justify-content-end' style={{ gap: 10 }}>
                                        <Tooltip title='Vị trí chữ ký' arrow>
                                            <button className='btn btn-secondary' onClick={(e) => e.preventDefault() || this.props.pdfModal.show({
                                                id: this.state.id, xCoordinate, yCoordinate, height, width, pageNumber: pageNumber || 1, isSoVanBan: false, shcc: this.allRef[`${item.signType}_SIGNER`].value(),
                                                submit: (data) => this.onChangePosition(data, item.signType)
                                            })}>
                                                <i className='fa fa-lg fa-crosshairs' />
                                            </button>
                                        </Tooltip>
                                        {
                                            !item.id &&
                                            <Tooltip title='Xoá' arrow>
                                                <button className='btn btn-danger' onClick={(e) => this.onRemoveSignConfig(e, item.signType)}>
                                                    <i className='fa fa-lg fa-trash' />
                                                </button>
                                            </Tooltip>
                                        }
                                    </div>
                                </div>
                            </React.Fragment>;
                        } else if (item.isText) {
                            let { height = 50, width = 50, ten } = item;
                            const { xCoordinate, yCoordinate, pageNumber } = this.state.configList?.find(config => config.signType == item.signType) || {};
                            return <React.Fragment key={index}>
                                <li className='col-md-12 font-weight-bold mb-2'>{ten}</li>
                                <div className='col-md-12 d-flex align-items-center justify-content-center' style={{ gap: 10, marginBottom: 15 }}>
                                    <FormSelect ref={e => this.allRef.fontName = e} placeholder='Kiểu font' data={Object.values(font).reverse()} style={{ flex: 1, margin: 'auto' }} />
                                    <FormSelect ref={e => this.allRef.fontSize = e} placeholder='Kích thuớc font' data={fontSizeArray()} type='number' style={{ flex: 1, margin: 'auto' }} />
                                    <div className='col-md-2 d-flex align-items-center justify-content-end' style={{ gap: 10 }}>
                                        <Tooltip title='Vị trí chữ ký' arrow>
                                            <button className='btn btn-secondary' onClick={(e) => {
                                                e.preventDefault();
                                                const fontSize = parseInt(this.allRef.fontSize?.value());
                                                this.props.pdfModal.show({
                                                    id: this.state.id, xCoordinate, yCoordinate, height: fontSize ? fontSize + 10 : height, width, pageNumber: pageNumber || 1, fontSize, isSoVanBan: true,
                                                    soVanBan: this.state.soVanBan,
                                                    vanBanDiId: this.state.vanBanDi,
                                                    submit: (data) => this.onChangePosition(data, item.signType)
                                                });
                                            }}>
                                                <i className='fa fa-lg fa-crosshairs' />
                                            </button>
                                        </Tooltip>
                                        {
                                            !item.id &&
                                            <Tooltip title='Xoá' arrow>
                                                <button className='btn btn-danger' onClick={(e) => this.onRemoveSignConfig(e, item.signType)}>
                                                    <i className='fa fa-lg fa-trash' />
                                                </button>
                                            </Tooltip>
                                        }
                                    </div>
                                </div>
                            </React.Fragment>;
                        } else {
                            const { height = 50, width = 50, ten } = item;
                            const { xCoordinate, yCoordinate, pageNumber } = this.state.configList?.find(config => config.signType == item.signType) || {};

                            return <React.Fragment key={index}>
                                <li className='col-md-12 font-weight-bold'><div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 15 }}>
                                    <span>{ten}</span>
                                    <div className='col-md-2 d-flex align-items-center justify-content-end' style={{ gap: 10 }}>
                                        <Tooltip title='Vị trí chữ ký' arrow>
                                            <button className='btn btn-secondary' onClick={(e) => e.preventDefault() || this.props.pdfModal.show({ id: this.state.id, xCoordinate, yCoordinate, height, width, pageNumber: pageNumber || 1, isSoVanBan: false, submit: (data) => this.onChangePosition(data, item.signType) })}>
                                                <i className='fa fa-lg fa-crosshairs' />
                                            </button>
                                        </Tooltip>
                                        {
                                            !item.id &&
                                            <Tooltip title='Xoá' arrow>
                                                <button className='btn btn-danger' onClick={(e) => this.onRemoveSignConfig(e, item.signType)}>
                                                    <i className='fa fa-lg fa-trash' />
                                                </button>
                                            </Tooltip>
                                        }
                                    </div>

                                </div></li>
                            </React.Fragment>;
                        }
                    })
                }
            </ol>
        </>;
    }

    renderPhuLucForm = () => {

    }

    render = () => {
        return this.renderModal({
            isShowSubmit: false,
            title: 'Cấu hình chữ ký',
            size: 'large',
            isLoading: this.state.isLoading,
            postButtons: <>
                <button className='btn btn-success' onClick={this.onSubmit} disabled={this.state.isLoading}>
                    <i className={this.state.isLoading ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-fw fa-lg fa-check'} /> Lưu
                </button>
            </>,
            body: <div className='row' onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }}>
                {/* {this.renderConfig()} */}
                {/* {(this.state.editing || this.state.creating) && this.renderForm()} */}
                {this.state.phuLuc ? this.renderPhuLucForm() : this.renderMainForm()}
                {/* <div className='col-md-12 d-flex justify-content-end'>


                    <button className='btn btn-success' onClick={(e) => { e.preventDefault(); this.setState({ config: [...this.state.config, {}] }) }}><i className='fa fa-lg fa-plus' />Thêm thông tin chữ ký</button>
                </div> */}
            </div>
        });
    }
}

// const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi, phanHoi: state.hcth.hcthPhanHoi });
// const mapActionsToProps = {
//     updateConfig
// };
// export default connect(mapStateToProps, mapActionsToProps)(SignatureConfigModal);