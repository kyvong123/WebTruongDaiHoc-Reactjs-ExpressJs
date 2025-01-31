import React from 'react';
import BaseCongTac from './BaseCongTac';

export default class PhongHopTicketInfo extends BaseCongTac {
    setData = (phongHopTicket, phongHopItem, diaDiem) => {
        this.setState({ phongHopTicket, phongHopItem, diaDiem }, () => {
            this.phongHop?.value(phongHopTicket?.phongHop);
        });
    }

    renderTrangThai = (ticket) => {
        console.log({ ticket });
        if (ticket?.isDeleted)
            return <div className={'p-1 badge badge-pill badge-danger'}>{'Đã xóa'}</div>;
        return <div className={'p-1 badge badge-pill badge-' + this.trangThaiPhongHopTicketDict[ticket?.trangThai]?.level}>{this.trangThaiPhongHopTicketDict[ticket?.trangThai]?.text}</div>;
    }

    render() {

        const ticket = this.state.phongHopTicket;
        //TODO: Long peek ticket info
        return <>
            <div className='d-flex justify-content-center align-items-center'>Phòng họp: <a href='#'>{` ${this.state.phongHopItem?.ten} (${this.state.phongHopItem?.sucChua} nguời)`} {this.renderTrangThai(ticket)}</a>{this.state.diaDiem ? `, ${this.state.diaDiem} ` : ''}</div>
        </>;
    }
}