import React from 'react';
import { FormRichTextBox } from 'view/component/AdminPage';
import { Img } from 'view/component/HomePage';
import * as HoverCard from '@radix-ui/react-hover-card';
import './styles.scss';

class ActionHovers extends React.Component {
    state = { open: false }

    render() {
        const available = !this.props.userLog?.some(i => i.phanHoiId == this.props.item.id);
        return <HoverCard.Root openDelay={100}>
            <HoverCard.Trigger asChild>
                <div onClick={() => this.setState({ open: !this.state.open })}>
                    {this.props.children}
                </div>
            </HoverCard.Trigger>
            <HoverCard.Portal>
                <HoverCard.Content sideOffset={5}>
                    <div className='row pr-3' style={{ minWidth: '300px', zIndex: 5000, maxWidth: '80vw', maxHeight: '50vh', overflowY: 'auto' }}>
                        <div className='col-md-12 list-group text-dark' style={{}}>
                            <div className='list-group-item list-group-item-action d-flex align-items-center justify-content-between' style={{ border: '1px solid blue' }} onClick={() => available && this.props.followPhanHoi(this.props.item)}>
                                <span>Tiếp nhận phản hồi</span>
                                {!available && <span><i className='fa text-success fa-check-circle-o' /></span>}
                            </div>
                        </div>
                    </div>
                    <HoverCard.Arrow />
                </HoverCard.Content>
            </HoverCard.Portal>
        </HoverCard.Root>;
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

export class PhanHoi extends React.Component {
    followPhanHoi = (item) => {
        T.put('/api/hcth/van-ban-den/follow', {
            data: {
                phanHoiId: item.id,
                congVanDenId: this.props.congVan,
            }
        }, () => {
            this.props.getFollowLog();
        });
    }
    renderPhanHoi = (phanHoi, follow, userLog = []) => {
        const renderComment = ({
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
                    while (follow[currentFollowIndex + 1] && (!item || follow[currentFollowIndex + 1].createdAt < item.ngayTao) && data.length != 0) {
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
                    data.push(renderFollow(item));
                    data.push(<div key={`item_${index}`} style={{ ...flexRow, marginTop: '15px' }}>
                        <div>{renderAvatar(item)}</div>
                        <div style={{ ...contentStyle, ...getItemStyle(item) }}>
                            <div style={{ borderBottom: '1px solid #000000 ', paddingLeft: '5px', ...flexRow }}>
                                <b style={{ flex: 1, whiteSpace: 'nowrap' }}>{renderName(item)}</b>
                                <span style={{ whiteSpace: 'nowrap' }}><div className='d-flex align-items-center' style={{ gap: '5px' }}>
                                    <span className=''>{renderTime(item)}</span>
                                    <div className='my-1' style={{ top: '-5px', left: '-20px' }}>
                                        <div className='' style={{ height: '20px', width: '20px', borderRadius: '50%', border: '1px solid grey', textAlign: 'center' }}>
                                            <ActionHovers item={item} userLog={userLog} followPhanHoi={this.followPhanHoi}>
                                                <i className='fa fa-lg fa-ellipsis-h' />
                                            </ActionHovers>
                                        </div>
                                    </div>
                                </div></span>
                            </div>
                            <div style={{ paddingTop: '5px' }}>{renderContent(item)}</div>
                        </div>
                    </div>);
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
        return renderComment({
            getDataSource: () => phanHoi,
            emptyComment: 'Chưa có phản hồi!',
            renderAvatar: (item) => <Img src={item.image || '/img/avatar.png'} style={{ width: '48px', height: '48px', paddingTop: '5px', borderRadius: '50%' }} />,
            renderName: (item) => <>{item.chucVu ? item.chucVu + ' -' : ''} <span style={{ color: 'blue' }}>{item.ho?.normalizedName()} {item.ten?.normalizedName()}</span></>,
            renderTime: (item) => T.dateToText(item.ngayTao, 'dd/mm/yyyy HH:MM'),
            renderContent: (item) => item.noiDung
        });
    }


    onCreatePhanHoi = (e) => {
        e.preventDefault();
        const shcc = this.props?.system?.user?.shcc;
        const value = this.phanHoi.value();
        if (value) {
            this.props.createPhanHoi({
                key: this.props.congVan,
                canBoGui: shcc,
                noiDung: value,
                ngayTao: new Date().getTime(),
            }, () => this.props.getPhanHoi(this.props.congVan, () => this.phanHoi.value('')));
        }
    }


    render() {
        const phanHoi = this.props.hcthCongVanDen?.item?.phanHoi || [];
        const followLog = this.props.hcthCongVanDen?.item?.followLog || [];
        const userLog = this.props.hcthCongVanDen?.item?.userLog || [];
        return (
            <div className='tile'>
                <div className='form-group'>
                    <h3 className='tile-title' style={{ flex: 1 }}>Phản hồi</h3>
                    <div className='tile-body row'>
                        <div className='col-md-12'>
                            {
                                this.renderPhanHoi(phanHoi, followLog, userLog)
                            }
                        </div>
                        {
                            this.props.canPhanHoi && (<>
                                <FormRichTextBox type='text' className='col-md-12' ref={e => this.phanHoi = e} label='Thêm phản hồi' />
                                <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button type='submit' className='btn btn-primary' onClick={this.onCreatePhanHoi}>
                                        <i className='fa fa-paper-plane' /> Gửi
                                    </button>
                                </div>
                            </>)
                        }
                    </div>
                </div>
            </div>
        );
    }
}


