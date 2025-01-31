import React from 'react';
import BaseCongTac from './BaseCongTac';
import * as HoverCard from '@radix-ui/react-hover-card';

const { trangThaiCongTacItemDict, trangThaiCongTacTicketDict, trangThaiLichCongTacDict } = require('../tools')({});

export default class StatusComponent extends BaseCongTac {
    objectType = {
        congTacItem: trangThaiCongTacItemDict,
        congTacTicket: trangThaiCongTacTicketDict,
        lichCongTac: trangThaiLichCongTacDict,
    }

    getCurrentStatus = () => {
        try {
            const { objectType } = this.props;
            return this.objectType[objectType][this.props.trangThai];
        } catch {
            return {};
        }
    }

    onSubmit = (nextState) => {
        const { objectType, id } = this.props;
        const url = '/api/hcth/cong-tac/global-status';
        T.confirm('Xác nhận', `Bạn sẽ thay đổi trạng thái từ ${this.getCurrentStatus().text} thành ${nextState.text}`, true,
            i => i && T.post(url, { objectType, id, trangThai: nextState.id }, (res) => {
                if (res.error) {
                    console.error('POST:', url, res.error);
                    T.notify('Cập nhật lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                } else {
                    this.props.reload ? this.props.reload() : window.location.reload();
                }
            }, () => {
                T.notify('Cập nhật lỗi.', 'danger');
            }));
    }
    render() {
        const children = this.props.children;
        if (!this.props.canEdit) {
            return children;
        }
        try {
            return <HoverCard.Root openDelay={300}>
                <HoverCard.Trigger asChild>
                    {children}
                </HoverCard.Trigger>
                <HoverCard.Portal>
                    <HoverCard.Content sideOffset={5}>
                        <div className='row pr-3' style={{ minWidth: '200px', zIndex: 5000, maxWidth: '80vw' }}>
                            <div className='card list-group text-dark w-100'>
                                {Object.values(this.objectType[this.props.objectType]).map(trangThaiObject => (<div key={trangThaiObject.id}>
                                    <div className={'list-group-item list-group-item-action text-' + trangThaiObject.level} onClick={(e) => {
                                        e.preventDefault();
                                        trangThaiObject.id != this.props.trangThai && this.onSubmit(trangThaiObject);
                                    }}>
                                        {trangThaiObject.id == this.props.trangThai && <i className='fa fa-lg fa-hand-o-right' />} {trangThaiObject.text}
                                    </div>
                                </div>))}
                            </div>
                        </div>
                        <HoverCard.Arrow />
                    </HoverCard.Content>
                </HoverCard.Portal>
            </HoverCard.Root>;
        } catch (e) {
            console.error(e);
            return <></>;
        }

    }
}