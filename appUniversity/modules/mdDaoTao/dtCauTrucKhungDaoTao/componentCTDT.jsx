import { Tooltip } from '@mui/material';
import { getDmMonHoc } from 'modules/mdDaoTao/dmMonHoc/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_DmKhoiKienThucAll } from '../dmKhoiKienThuc/redux';
import { deleteDtCauTrucKhungDaoTao } from './redux';

export class ComponentCTDT extends AdminPage {
    state = { parents: {}, children: {} };

    setVal = (items = {}) => {
        const parents = items?.parents || {};
        const children = items?.childs || {};
        let data = [];
        Object.keys(parents).forEach(key => {
            if (children[key] && children[key].length) {
                parents[key].children = children[key];
            }
            data.push(parents[key]);
        });
        if (!data.length) data.push({});
        this.setState({ data });
    }

    updatePriorities = (level, index, mode, parentIndex) => {
        if (level) {
            let curData = this.state.data[parentIndex],
                list = curData.children;
            if (mode == 'up') {
                if (list[index - 1] && list[index]) {
                    [list[index - 1], list[index]] = [list[index], list[index - 1]];
                    curData.children = list;
                    this.state.data.splice(parentIndex, 1, curData);
                    this.setState({ data: [...this.state.data] });
                }
            } else if (mode == 'down') {
                if (list[index + 1] && list[index]) {
                    [list[index], list[index + 1]] = [list[index + 1], list[index]];
                    curData.children = list;
                    this.state.data.splice(parentIndex, 1, curData);
                    this.setState({ data: [...this.state.data] });
                }
            }
        } else {
            let data = this.state.data;
            if (mode == 'up' && data[index - 1] && data[index]) {
                [data[index - 1], data[index]] = [data[index], data[index - 1]];
            } else if (mode == 'down' && data[index + 1] && data[index]) {
                [data[index], data[index + 1]] = [data[index + 1], data[index]];
            }
            this.setState({ data });

        }

    }

    delete = (level, index, parentIndex) => {
        T.confirm('Cảnh báo', level ? 'Bạn muốn xoá khối con này?' : 'Bạn muốn xoá khối cha này và các khối con kèm theo?', 'warning', true, isConfirm => {
            if (isConfirm) {
                if (level) {
                    this.state.data[parentIndex].children?.splice(index, 1);
                } else {
                    this.state.data.splice(index, 1);
                }
                this.setState({ data: [...this.state.data] });
            }
        });

    }

    renderMenu = (index, item, level, hasCreate, hasUpdate, hasDelete, parentIndex) => {
        return (
            <li key={`${level}${index}`} data-id={item.id}>
                <div style={{ display: 'inline-flex' }}>
                    {level == 0 ?
                        <div style={{ display: 'inline-flex', gap: 30, justifyContent: 'center' }}>{(index + 1).intToRoman()}. <FormSelect value={item.id || ''} data={SelectAdapter_DmKhoiKienThucAll()} style={{ width: 'auto', minWidth: '300px' }} onChange={value => {
                            this.state.data.splice(index, 1, { ... this.state.data[index], id: value.id, text: value.text });
                            this.setState({ data: [...this.state.data] });
                        }} />
                        </div> :
                        <div style={{ display: 'inline-flex', gap: 30 }}>{index + 1}. <FormSelect value={item.value?.id || ''} data={SelectAdapter_DmKhoiKienThucAll(this.state.data[parentIndex].id || '')} style={{ width: 'auto', minWidth: '300px' }} onChange={value => {
                            let currentItem = this.state.data[parentIndex];
                            currentItem.children.splice(index, 1, { id: item.id, value: { id: value.id, text: value.text } });
                            this.setState({ data: [...this.state.data] });
                        }} />
                        </div>
                    }
                    &nbsp;
                    <div className='buttons btn-group btn-group-sm'>
                        {hasUpdate && index ? <Tooltip title='Chuyển lên' arrow>
                            <button className='btn btn-primary' onClick={() => this.updatePriorities(level, index, 'up', parentIndex)}>
                                <i className='fa fa-lg fa-arrow-up' />
                            </button>
                        </Tooltip> : null}
                        {hasUpdate && <Tooltip title='Chuyển xuống' arrow>
                            <button className='btn btn-info' onClick={() => this.updatePriorities(level, index, 'down', parentIndex)}>
                                <i className='fa fa-lg fa-arrow-down' />
                            </button>
                        </Tooltip>}
                        {hasCreate && level == 0 &&
                            <Tooltip title='Tạo khối cha' arrow>
                                <button className='btn btn-primary' onClick={() => {
                                    this.state.data.splice(index + 1, 0, {});
                                    this.setState({ data: [...this.state.data] });
                                }}>
                                    <i className='fa fa-lg fa-plus' />
                                </button>
                            </Tooltip>
                        }
                        {hasCreate && level == 0 &&
                            <Tooltip title='Tạo khối con' arrow>
                                <button className='btn btn-warning' onClick={() => {
                                    let parent = this.state.data[index],
                                        children = parent.children;
                                    if (children && children.length) {
                                        children.push({ id: children.length + 1 });
                                    }
                                    parent.children = children || [{ id: 0 }];
                                    this.state.data.splice(index, 1, parent);
                                    this.setState({ data: [...this.state.data] });
                                }}>
                                    <i className='fa fa-lg fa-plus' />
                                </button>
                            </Tooltip>
                        }
                        {hasDelete && <Tooltip title='Xoá' arrow>
                            <button className='btn btn-danger' onClick={() => this.delete(level, index, parentIndex)}>
                                <i className='fa fa-lg fa-trash' />
                            </button>
                        </Tooltip>}
                    </div>
                </div>

                {level == 0 && item.children ? (
                    <ul className='menuList' style={{ listStyle: 'none' }}>
                        {item.children.map((child, cindex) => this.renderMenu(cindex, child, 1, hasCreate, hasUpdate, hasDelete, index))}
                    </ul>
                ) : null}
            </li>);
    };

    getValue = () => {
        let children = {};
        this.state.data.forEach((item, index) => {
            if (item.children && item.children.length && item.children.every(child => child.value != null)) {
                children[index] = item.children;
            }
        });
        this.state.data.forEach(item => delete item.children);
        let parents = Object.assign({}, this.state.data);

        return { parents, children };
    }

    render() {
        const { data } = this.state;
        const permission = this.getUserPermission('dtCauTrucKhungDaoTao'),
            hasCreate = permission.write,
            hasUpdate = permission.write,
            hasDelete = permission.delete;
        return (
            <>
                {
                    (data || []).map((item, pIdx) => {
                        return (<ul key={pIdx} id='menuMain' className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0, listStyle: 'none' }}>
                            {this.renderMenu(pIdx, item, 0, hasCreate, hasUpdate, hasDelete)}
                        </ul>);
                    })
                }
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtCauTrucKhungDaoTao: state.daoTao.dtCauTrucKhungDaoTao });
const mapActionsToProps = { getDmMonHoc, deleteDtCauTrucKhungDaoTao };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentCTDT);