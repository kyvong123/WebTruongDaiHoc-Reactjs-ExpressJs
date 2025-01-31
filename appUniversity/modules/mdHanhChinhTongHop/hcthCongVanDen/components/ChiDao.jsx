import * as HoverCard from '@radix-ui/react-hover-card';
import React from 'react';
import { FormRichTextBox } from 'view/component/AdminPage';
import { Img } from 'view/component/HomePage';
const { action, trangThaiSwitcher } = require('../../constant.js');
import './styles.scss';

export class ActionHovers extends React.Component {
    state = { open: false }

    render() {
        const available = !this.props.userLog?.some(i => i.chiDaoId == this.props.item.id);
        return <HoverCard.Root open={this.state.open}>
            <HoverCard.Trigger asChild>
                <div onClick={() => this.setState({ open: !this.state.open })}>
                    {this.props.children}
                </div>
            </HoverCard.Trigger>
            <HoverCard.Portal>
                <HoverCard.Content sideOffset={5}>
                    <div className='row pr-3' style={{ minWidth: '300px', zIndex: 5000, maxWidth: '80vw', maxHeight: '50vh', overflowY: 'auto' }}>
                        <div className='col-md-12 list-group text-dark' style={{}}>
                            <div className='list-group-item list-group-item-action d-flex align-items-center justify-content-between' style={{ border: '1px solid blue' }} onClick={() => available && this.props.followChiDao(this.props.item)}>
                                <span>Tiếp nhận chỉ đạo</span>
                                {!available && <span><i className='fa text-success fa-check-circle-o' /></span>}
                            </div>
                        </div>
                    </div>
                    <HoverCard.Arrow />
                </HoverCard.Content>
            </HoverCard.Portal>
        </HoverCard.Root >;
    }
}
class MemberHover extends React.Component {
    state = { open: false }

    render() {
        return <HoverCard.Root open={this.state.open}>
            <HoverCard.Trigger asChild>
                <div onClick={() => this.setState({ open: !this.state.open })}>
                    {this.props.children}
                </div>
            </HoverCard.Trigger>
            <HoverCard.Portal>
                <HoverCard.Content sideOffset={5}>
                    <div className='row pr-3' style={{ minWidth: '300px', zIndex: 5000, maxWidth: '80vw', maxHeight: '50vh', overflowY: 'auto' }}>
                        <div className='col-md-12 list-group text-dark' style={{}}>
                            {this.props.thanhPhan?.map((i) => <div key={i.shcc} className='list-group-item list-group-item-action d-flex align-items-center' style={{ border: '1px solid blue' }}>
                                <div className='d-flex flex-column' style={{ flex: 1 }}>
                                    <h5 className='text-bold'>{`${i.ho} ${i.ten}`.trim().normalizedName()}</h5>
                                    <small>{i.tenDonVi}</small>
                                </div>
                                {i.shcc == this.props.shcc && <span className={'p-1 badge badge-pill badge-primary px-3 py-1'} >Bạn</span>}
                            </div>)}
                        </div>
                    </div>
                    <HoverCard.Arrow />
                </HoverCard.Content>
            </HoverCard.Portal>
        </HoverCard.Root >;
    }
}

export class ChiDao extends React.Component {
    state = {};
    followChiDao = (item) => {
        T.confirm('Tiếp nhận chỉ đạo', `Bạn có chắc bạn muốn tiếp nhận chỉ ${item.chiDao} đạo này?`, true, isConfirm => {
            if (isConfirm) {
                T.put('/api/hcth/van-ban-den/follow', {
                    data: {
                        chiDaoId: item.id,
                        congVanDenId: this.props.id
                    }
                }, () => {
                    T.notify('Tiếp nhận chỉ đạo thành công!', 'success');
                    this.props.getFollowLog();
                });
            }
        });
    }
    renderChiDao = ({
        follow = [], userLog = [],
        renderAvatar = () => null, renderName = () => null, renderContent = () => null, renderTime = () => null, getDataSource = () => null, loadingText = 'Đang tải ...',
        emptyComment = 'Chưa có phản hồi', getItemStyle = () => { }
    }) => {
        const list = getDataSource();
        if (list == null) {
            return (
                <div className='d-flex justify-content-center align-item-center' style={{ minHeight: '120px' }}>
                    <div className='m-loader mr-4'>
                        <svg className='m-circular' viewBox='25 25 50 50'>
                            <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                        </svg>
                    </div>
                    <h3 className='l-text'>{loadingText}</h3>
                </div>);
        } else if (list.length) {
            const
                contentStyle = {
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    backgroundColor: '#E3E3E3',
                    padding: '10px 10px 10px 10px',
                    borderRadius: '5px'
                },
                flexRow = {
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '15px'
                };
            const data = [];
            let currentFollowIndex = -1;

            const renderFollow = (item) => {
                const renderList = [];
                while (follow[currentFollowIndex + 1] && (!item || follow[currentFollowIndex + 1].createdAt < item.thoiGian) && data.length != 0) {
                    renderList.push(follow[currentFollowIndex + 1]);
                    currentFollowIndex += 1;
                }

                return renderList.length ? <div key={'follow_item_' + item?.id} className='w-100 d-flex justify-content-end align-items-center' style={{ marginTop: '5px' }}>
                    <MemberHover thanhPhan={renderList} shcc={this.props.shcc}>
                        <div className='d-flex flex-row'>
                            {renderList.slice(0, 2).map(item => {
                                return <div key={item.id} style={{
                                    borderRadius: '50%',
                                    width: '20px', height: '20px',
                                    border: '1px solid white',
                                    color: 'white',
                                    ...(item.image ? { backgroundImage: `url(${item.image})` } : { background: ['#c1121f', '#023047', '#023047'][item.id % 3] }),
                                    textAlign: 'center',
                                    verticalAlign: 'center'
                                }}>
                                    {item.image ? '' : item.ten[0]}
                                </div>;
                            })}
                            {renderList.length > 3 ? <div key={'extra'} style={{
                                borderRadius: '50%',
                                color: 'white',
                                border: '1px solid white',
                                background: '#e0e1dd',
                                width: '20px', height: '20px',
                            }}>
                                {'+' + (renderList.length - 2)}
                            </div> : null}
                        </div>
                    </MemberHover>
                </div> : null;
            };
            list.forEach((item, index) => {
                const available = userLog?.some(i => i.chiDaoId == item.id);
                data.push(renderFollow(item));
                data.push(<div key={`item_${index}`} style={{ ...flexRow, marginTop: '15px' }}>
                    <div>{renderAvatar(item)}</div>
                    <div style={{ ...contentStyle }}>
                        <div style={{ borderBottom: '1px solid #000000 ', paddingLeft: '5px', ...flexRow }}>
                            <b style={{ flex: 1, whiteSpace: 'nowrap' }}>{renderName(item)}</b>
                            <span style={{ whiteSpace: 'nowrap' }}><div className='d-flex align-items-center' style={{ gap: '15px' }}>
                                <span >{renderTime(item)}</span>
                                <div className='my-1' style={{ top: '-5px', left: '-20px' }}>
                                    <div style={{ height: '20px', width: '20px', textAlign: 'center', cursor: 'pointer' }}>
                                        <i className={`fa fa-lg ${available ? 'fa-check text-success' : 'fa-eye text-primary'}`} onClick={() => !available && this.followChiDao(item)} />
                                    </div>
                                </div>
                                <i className='fa fa-lg fa-comment' style={{ cursor: 'pointer' }} onClick={e => e && e.preventDefault() || this.setState({ selectedChiDao: item })} />
                                {this.state.selectedChiDao?.id == item.id && <i className='fa fa-lg fa-times-circle-o text-danger' style={{ cursor: 'pointer' }} onClick={e => e && e.preventDefault() || this.setState({ selectedChiDao: null })} />}
                            </div></span>
                        </div>
                        <div style={{ paddingTop: '5px' }}>{renderContent(item)}</div>
                    </div>
                </div>);
                item.listPhanHoi.forEach((ph, index) => data.push(<div key={`phan_hoi_${index}_${ph.id}`} style={{ ...flexRow, marginTop: '15px', marginLeft: '50px' }}>
                    <div>{renderAvatar(ph)}</div>
                    <div style={{ ...contentStyle, ...getItemStyle(ph) }}>
                        <div style={{ borderBottom: '1px solid #000000 ', paddingLeft: '5px', ...flexRow }}>
                            <b style={{ flex: 1, whiteSpace: 'nowrap' }}>{renderName(ph)}</b>
                            <span style={{ whiteSpace: 'nowrap' }}><div className='d-flex align-items-center' style={{ gap: '15px' }}>
                                <span >{renderTime(ph)}</span>
                            </div></span>
                        </div>
                        <div style={{ paddingTop: '5px' }}>{renderContent(ph)}</div>
                    </div>
                </div>));
            });
            data.push(renderFollow());
            data.reverse();
            return (
                <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '0px', marginBottom: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }} className='mx-2'>
                    {data}
                </div>
            );
        } else
            return <b>{emptyComment}</b>;
    };

    onReturn = (e, status) => {
        e.preventDefault();
        const chiDao = this.chiDao.value();
        if (!chiDao) {
            T.notify('Vui lòng nhập lý do thêm lý do trả văn bản vào ô Thêm chỉ đạo', 'danger');
            this.chiDao.focus();
        }
        else
            T.confirm('Trả lại văn bản', 'Bạn có chắc bạn muốn trả lại văn bản này?', true,
                isConfirm => isConfirm &&
                    this.props.createChiDao({
                        // canBo: this.state.shcc,
                        chiDao: chiDao,
                        thoiGian: Date.now(),
                        congVan: this.props.id,
                        action: action.RETURN,
                    }, () => this.props.getChiDao(this.props.id, () => this.props.onChangeStatus(status))
                    )
            );
    }

    onPublish = (e) => {
        e.preventDefault();
        const chiDao = this.chiDao.value();

        T.confirm('Phân phối văn bản', 'Bạn có chắc bạn muốn phân phối văn bản này?', true,
            isConfirm => {
                if (isConfirm) {
                    if (chiDao)
                        this.props.createChiDao({
                            chiDao: chiDao,
                            thoiGian: Date.now(),
                            congVan: this.props.id,
                        }, () => this.props.getChiDao(this.props.id, () => this.props.onChangeStatus(trangThaiSwitcher.DA_PHAN_PHOI.id))
                        );
                    else
                        this.props.onChangeStatus(trangThaiSwitcher.DA_PHAN_PHOI.id);
                }
            }
        );
    }

    onAprrove = (e) => {
        e.preventDefault();
        const chiDao = this.chiDao.value();
        if (!chiDao) {
            T.notify('Vui lòng nhập chỉ đạo', 'danger');
            this.chiDao.focus();
        }
        else
            T.confirm('Duyệt văn bản', 'Bạn có chắc bạn muốn duyệt văn bản này?', true,
                isConfirm => isConfirm && this.props.duyetCongVan(this.props.id, chiDao, this.props.getData)
            );
    }


    onCreateChiDao = (e) => {
        e.preventDefault();
        if (this.chiDao.value()) {
            const newChiDao = {
                chiDao: this.chiDao.value(),
                thoiGian: Date.now(),
                congVan: this.props.id
            };
            if (this.props.id) {
                this.props.createChiDao(newChiDao, () => this.props.getData());
            }
        }
    }

    canChiDao = () => {
        const permissions = this.props.getCurrentPermissions();
        return permissions.includes('president:login') || permissions.includes('hcth:manage') || this.props.quyenChiDao?.includes(this.props.shcc)
            || (this.props.getCurrentPermissions()?.includes('hcthCongVanDen:manage'));
    };

    canPublish = () => {
        return this.props.id && this.props.getUserPermission('hcthCongVanDen', ['manage']).manage && this.props.trangThai == trangThaiSwitcher.CHO_PHAN_PHOI.id;
    }

    canApprove = () => {
        const quyenChiDao = this.props.hcthCongVanDen?.item?.quyenChiDao || '';
        return this.props.id && (this.props.getUserPermission('president', ['login']).login || quyenChiDao.split(',').includes(this.props.shcc)) && this.props.trangThai == trangThaiSwitcher.CHO_DUYET.id;
    }

    onFollow = (e, trangThai = trangThaiSwitcher.THEO_DOI_TIEN_DO.id) => {
        e.preventDefault();
        const chiDao = this.chiDao.value();
        let title = 'Theo dõi văn bản', message = 'Văn bản sẽ chuyển theo dõi';
        T.confirm(title, message, true,
            isConfirm => {
                if (isConfirm) {
                    if (chiDao)
                        this.props.createChiDao({
                            chiDao: chiDao,
                            thoiGian: new Date().getTime(),
                            congVan: this.props.id,
                        }, () => this.props.getChiDao(this.props.id, () => this.props.onChangeStatus(trangThai))
                        );
                    else
                        this.props.onChangeStatus(trangThai);
                }
            }
        );
    }

    onCreatePhanHoi = (e) => {
        e.preventDefault();
        if (this.chiDao.value()) {
            const newPhanHoi = {
                noiDung: this.chiDao.value(),
                key: this.state.selectedChiDao.id,
                loai: 'CHI_DAO',
            };
            this.props.createPhanHoiChiDao(newPhanHoi, () => this.props.getData());
        }
    }

    render = () => {
        const buttons = [],
            { selectedChiDao } = this.state;

        if (this.canPublish()) {
            if (this.props.theoDoiTienDo) {
                buttons.push(
                    <button key='publish-decline' type='submit' className='btn btn-danger' onClick={(e) => this.onReturn(e, trangThaiSwitcher.TRA_LAI_HCTH.id)}>
                        <i className='fa fa-undo' /> Trả lại
                    </button>,
                    <button key='publish-accept' type='submit' className='btn btn-success' onClick={(e) => this.onFollow(e, trangThaiSwitcher.THEO_DOI_TIEN_DO.id)}>
                        <i className='fa fa-paper-plane' /> Theo dõi
                    </button>
                );
            } else
                buttons.push(
                    <button key='publish-decline' type='submit' className='btn btn-danger' onClick={(e) => this.onReturn(e, trangThaiSwitcher.TRA_LAI_HCTH.id)}>
                        <i className='fa fa-undo' /> Trả lại
                    </button>,
                    <button key='publish-accept' type='submit' className='btn btn-success' onClick={this.onPublish}>
                        <i className='fa fa-paper-plane' /> Phân phối
                    </button>
                );
        }
        else if (this.canApprove()) {
            buttons.push(
                <button key='approve-decline' type='submit' className='btn btn-danger' onClick={(e) => this.onReturn(e, trangThaiSwitcher.TRA_LAI_BGH.id)}>
                    <i className='fa fa-undo' /> Trả lại
                </button>,
                <button key='approve-accept' type='submit' className='btn btn-success' onClick={this.onAprrove}>
                    <i className='fa fa-check' /> Duyệt
                </button>
            );
        } else {
            buttons.push(
                <button key='chiDao-add' type='submit' className='btn btn-primary' onClick={(e) => selectedChiDao ? this.onCreatePhanHoi(e) : this.onCreateChiDao(e)}>
                    <i className='fa fa-lg fa-plus' /> Thêm
                </button>
            );
        }

        const canChiDao = this.canChiDao();

        return (
            <div className='tile'>
                <div className='form-group'>
                    <h3 className='tile-title' style={{ flex: 1 }}>Chỉ đạo</h3>

                    <div className='tile-body row'>
                        <div className='col-md-12'>
                            {
                                this.renderChiDao({
                                    userLog: this.props.hcthCongVanDen?.item?.userLog || [],
                                    follow: this.props.hcthCongVanDen?.item?.followLog || [],
                                    getDataSource: () => this.props.getItem()?.danhSachChiDao || [],
                                    emptyComment: 'Chưa có chỉ đạo',
                                    renderAvatar: (item) => <Img src={item.image || '/img/avatar.png'} style={{ width: '48px', height: '48px', paddingTop: '5px', borderRadius: '50%' }} />,
                                    renderName: (item) => <>{item.chucVu ? item.chucVu + ' -' : ''} <span style={{ color: 'blue' }}>{item.ho?.normalizedName()} {item.ten?.normalizedName()}</span></>,
                                    renderTime: (item) => T.dateToText(item.thoiGian, 'dd/mm/yyyy HH:MM'),
                                    renderContent: (item) => item.chiDao || item.noiDung,
                                    getItemStyle: (item) => (item.action == action.RETURN ? { backgroundColor: '#f4abab' } : {}),
                                })
                            }
                        </div>
                        {
                            canChiDao && (<>
                                <FormRichTextBox type='text' className='col-md-12' ref={e => this.chiDao = e} label={selectedChiDao ? `Thêm phản hồi - ${selectedChiDao.ho} ${selectedChiDao.ten}` : 'Thêm chỉ đạo'} readOnly={this.props.readOnly && !canChiDao} />
                                <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '10px' }}>
                                    {buttons}
                                </div>
                            </>)
                        }
                    </div>
                </div>
            </div>

        );
    }

}


