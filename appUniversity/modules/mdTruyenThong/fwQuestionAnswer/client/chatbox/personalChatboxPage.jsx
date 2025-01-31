import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { AdminPage, FormRichTextBoxV2 } from 'view/component/AdminPage';
import { getFwPersonalChatboxPage } from 'modules/mdTruyenThong/fwQuestionAnswer/redux/chatbox/personal_Chat_Box_Redux';
import { createFwQuestionAnswerMessage, getFwQuestionAnswerMessagePage } from 'modules/mdTruyenThong/fwQuestionAnswer/redux/chatbox/chatDetailRedux';
import './personalChatboxPage.scss';

class PersonalChatboxPage extends AdminPage {
    state = {
        chatboxMap: {},
        chatboxListPageNumber: 1,
        chatboxListPageSize: 10,
        chatboxListPageTotal: 100,
        chatboxListTotalItem: 0,
        chatboxListHasMore: true,
        filter: {},

        openingChatboxId: null,
        chatboxMessagesFirstFetch: true,
        currentChatBoxMessages: [],
        chatboxMessagePageNumber: 1,
        chatboxMessagePageSize: 5,
        chatboxMessagePageTotal: 100,
        chatboxMessageTotalItem: 0,
        chatboxMessageHasMore: true,
    };

    componentDidMount() {
        T.ready('/user/tt/lien-he', () => {
            T.onSearch = (searchText) => this.getChatboxListPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            T.socket.on('fwQaRefreshHopThuDen', () => { this.getChatboxListPage(this.state.chatboxListPageNumber, this.state.chatboxListPageSize, '', () => this.setState()); });
            T.socket.on('fwQaRefreshPhuTrach', () => { this.getChatboxListPage(this.state.chatboxListPageNumber, this.state.chatboxListPageSize, '', () => this.setState()); });
            T.socket.on('fwChatboxRefresh', (data) => {
                if (data.maChatBox == this.state.openingChatboxId) {
                    this.getChatboxMessagesPage(1, 2000, this.state.openingChatboxId, (data) => {
                        this.setState({
                            currentChatBoxMessages: data.listMessage,
                            chatboxMessagesFirstFetch: true,
                            chatboxMessagePageNumber: 1,
                            chatboxMessagePageSize: 50,
                            chatboxMessagePageTotal: 100,
                            chatboxMessageTotalItem: 0,
                            chatboxMessageHasMore: true,
                        });
                    });
                }
            });
        });
        this.getChatboxListPage(this.state.chatboxListPageNumber, this.state.chatboxListPageSize, '', (data) => {
            let { totalItem, pageSize, pageTotal, pageNumber, list } = data;
            let incomingChatboxMap = {};
            list.forEach(item => {
                incomingChatboxMap[item.id] = item;
            });
            this.setState({ chatboxListFirstFetch: false, chatboxListHasMore: true, chatboxListTotalItem: totalItem, chatboxListPageSize: pageSize, chatboxListPageNumber: pageNumber, chatboxListPageTotal: pageTotal, chatboxMap: { ...this.state.chatboxMap, ...incomingChatboxMap }, });
        });
    }

    componentWillUnmount() {
        T.socket.off('fwQaRefreshHopThuDen');
        T.socket.off('fwQaRefreshPhuTrach');
        T.socket.off('fwChatboxRefresh');
    }

    getChatboxListPage = (pageN, pageS, pageC, done) => {
        this.props.getFwPersonalChatboxPage(pageN, pageS, pageC, this.state.filter, done);
    }

    getChatboxMessagesPage = (pageN, pageS, chatBoxId, done) => {
        this.props.getFwQuestionAnswerMessagePage(pageN, pageS, chatBoxId, done);
    }

    render = () => {
        const user = this.props.system.user;

        return this.renderPage({
            icon: 'fa fa fa-graduation-cap',
            title: 'Hộp thư cá nhân',
            breadcrumb: [
                < Link key={0} to='/user/tt/chatbox' > Chatbox</Link >,
                'Hộp thư cá nhân'
            ],
            content: <div className="" style={{ backgroundColor: '#ffffff' }}>
                <div className='tile-title' style={{ maxWidth: 1800 }}>
                    <div className="chatbox-page-container row px-0 mx-0">
                        {this.renderChatBoxList()}
                        {this.renderChatBoxDetail(user)}
                    </div>
                </div>
            </div>,
        });
    };

    renderChatBoxList = () => {
        return <div id='collapseChatBoxList' className='collapse show col-12 col-lg-4 border-right px-0'>
            <div className="chatbox-list" id="scrollableDiv" style={{ overflow: 'scroll' }}>
                <InfiniteScroll
                    dataLength={Object.values(this.state.chatboxMap).length}
                    next={this.onChatboxListScrollChange}
                    hasMore={this.state.chatboxListHasMore}
                    loader={<p className='text-muted display-6' style={{ textAlign: 'center' }}>Loading dữ liệu...</p>} scrollableTarget="scrollableDiv"
                    endMessage={<p style={{ textAlign: 'center' }}><b>Đã hiển thị toàn bộ hộp thư của bạn</b></p>}
                >
                    {Object.values(this.state.chatboxMap).sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt > 0 ? 1 : -1).map(chatboxItem => (
                        this.generateChatboxCard(chatboxItem)
                    ))}
                </InfiniteScroll>
            </div>
        </div>;
    };

    generateChatboxCard = (chatboxItem) => {
        const chatboxBadgeClass = {
            'Q&A': 'badge-primary',
            'BLACKBOX': 'badge-dark',
            'TRANSPARENT_BLACKBOX': 'badge-dark',
            'GROUP_UY_QUYEN': 'badge-danger',
        };

        const chatboxBadgeDisplayText = {
            'Q&A': 'Q&A',
            'BLACKBOX': 'Blackbox ẩn danh',
            'TRANSPARENT_BLACKBOX': 'Blackbox',
            'GROUP_UY_QUYEN': 'E-Office ủy quyền',
        };

        return <div onClick={() => {
            if (this.state.openingChatboxId !== chatboxItem.id) {
                this.setState({
                    openingChatboxId: chatboxItem.id,
                    chatboxMessagesFirstFetch: true,
                    currentChatBoxMessages: this.state.chatboxMap[chatboxItem.id].messages,
                    chatboxMessagePageNumber: 1,
                    chatboxMessagePageSize: 50,
                    chatboxMessagePageTotal: 100,
                    chatboxMessageTotalItem: 0,
                    chatboxMessageHasMore: true,
                }, () => {
                    if (window.innerWidth <= 992) {
                        this.toggleChatboxListButton.click();
                    }
                });
            } else {
                this.setState({
                    openingChatboxId: null,
                    chatboxMessagesFirstFetch: true,
                    currentChatBoxMessages: [],
                    chatboxMessagePageNumber: 1,
                    chatboxMessagePageSize: 50,
                    chatboxMessagePageTotal: 100,
                    chatboxMessageTotalItem: 0,
                    chatboxMessageHasMore: true,
                }, () => {
                    if (window.innerWidth <= 992) {
                        this.toggleChatboxListButton.click();
                    }
                });
            }
        }} key={chatboxItem.id} className="border-bottom p-2 mx-2" style={{
            backgroundColor: (this.state.openingChatboxId !== chatboxItem.id) ? '#FFFFFF' : '#E6F3FB',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
                background: '#E6F3FB',
            },
            cursor: 'pointer',
        }}>
            <div className="row mx-0 px-0" style={{ alignItems: 'center' }}>
                <div className="mx-2" style={{ borderRadius: '50%', width: '50px', height: '50px' }} >
                    <img className="rounded-circle" src={'/img/hcmussh.png'} alt="avatar" style={{ borderRadius: '50%', width: '50px', height: '50px', objectFit: 'cover', border: '1px solid lightgrey' }} />
                </div>
                <div className="" style={{ flex: 1 }}>
                    <div>
                        <strong>{chatboxItem.noiDung ? `${chatboxItem.noiDung}` : `${chatboxItem.memberList.map(member => `${member.ho} ${member.ten}`).join(', ')}`}</strong>
                    </div>
                    <div className={`badge ${chatboxBadgeClass[chatboxItem.chatBoxType]}`}>
                        <i>{chatboxBadgeDisplayText[chatboxItem.chatBoxType]}</i>
                    </div>
                    <div>
                        {chatboxItem.lastMessage && Object.keys(chatboxItem.lastMessage).length > 0 ? (`${chatboxItem.chatBoxType == 'BLACKBOX' ? 'Ẩn danh' : chatboxItem.lastMessage.ten}: ${chatboxItem.lastMessage.noiDung}`) : 'Chưa có tin nhắn!'}
                    </div>
                </div>
                <div className="text-right" style={{ whiteSpace: 'nowrap' }}>
                    <small>{chatboxItem.lastMessage ? T.dateToText(new Date(parseInt(chatboxItem.lastMessage.createdAt)), 'HH:MM, dd/mm') : ''}</small>
                </div>
            </div>
        </div>;
    }


    renderChatBoxDetail = (user) => {
        return <div className="chatbox-detail position-relative col-12 col-lg-8 px-0" >
            <a className="d-block d-lg-none btn btn-primary" ref={e => this.toggleChatboxListButton = e} style={{ height: '40px', color: 'white', fontSize: '1.1rem' }} data-toggle="collapse" data-target="#collapseChatBoxList" role="button" aria-expanded="false" aria-controls="collapseChatBoxList">
                <i className='fa fa-arrow-left'></i> Quay lại
            </a>
            <div className="tile-body d-flex flex-column" style={{ overflow: 'hidden', height: 'calc(100vh - 150px)' }}>
                {this.renderChatBoxMessages(user)}
                {this.renderChatBoxForm()}
            </div>
        </div>;
    }

    renderChatBoxMessages = (user) => {
        // currentChatBoxMessages
        return <div className="col-12" style={{ overflowY: 'scroll', flex: 1 }}>
            <br />
            {
                this.state.openingChatboxId ? this.state.currentChatBoxMessages.map((item, index) => {
                    return <div className='' key={index}>
                        {user.email == item.email ? this.userMessageRender(item) : this.othersMessageRender(item)}
                    </div>;
                }) : <div className='d-flex justify-content-center align-items-center' style={{ height: 500, width: '100%' }}>Chọn một hộp thư để xem tin nhắn</div >
            }
            {/* {
                this.state.openingChatboxId ? Object.values(this.state.chatboxMap).filter(item => item.id == this.state.openingChatboxId)[0].messages && Object.values(this.state.chatboxMap).filter(item => item.id == this.state.openingChatboxId)[0].messages.map((item, index) => {
                    return <div className='' key={index}>
                        {user.email == item.email ? this.userMessageRender(item) : this.othersMessageRender(item)}
                    </div>;
                }) : <div className='d-flex justify-content-center align-items-center' style={{ height: 500, width: '100%' }}>Chọn một hộp thư để xem tin nhắn</div >
            } */}
            {/* {
                this.state.chatboxMessagesFirstFetch ? (this.state.openingChatboxId ? Object.values(this.state.chatboxMap).filter(item => item.id == this.state.openingChatboxId)[0].messages && Object.values(this.state.chatboxMap).filter(item => item.id == this.state.openingChatboxId)[0].messages.map((item, index) => {
                    return <div className='' key={index}>
                        {user.email == item.email ? this.userMessageRender(item) : this.othersMessageRender(item)}
                    </div>;
                }) : <div className='d-flex justify-content-center align-items-center' style={{ height: 500, width: '100%' }}>Chọn một hộp thư để xem tin nhắn</div >)
                    : (<InfiniteScroll
                        inverse={true}
                        dataLength={this.state.currentChatBoxMessages.length}
                        next={this.onChatboxMessagesScrollChange}
                        hasMore={this.state.chatboxMessageHasMore}
                        loader={<p className='text-muted display-6' style={{ textAlign: 'center' }}>Loading tin nhắn...</p>} scrollableTarget="scrollableDiv"
                        endMessage={<p style={{ textAlign: 'center' }}><b>Đã hiển thị toàn bộ tin nhắn</b></p>}
                    >
                        {this.state.currentChatBoxMessages.map((messageItem, index) => <div className='' key={index}>
                            {user.email == messageItem.email ? this.userMessageRender(messageItem) : this.othersMessageRender(messageItem)}
                        </div>)}
                    </InfiniteScroll>)
            } */}
            <br />
        </div>;
    }

    renderChatBoxForm = () => {
        if (this.state.openingChatboxId) {
            const fwQaItem = Object.values(this.state.chatboxMap).filter(item => item.id == this.state.openingChatboxId)[0];
            return <>
                {fwQaItem && fwQaItem.isActive == 1 && <div className='d-flex flex-wrap px-1' style={{ height: '60px', overflow: 'hidden' }}>
                    <FormRichTextBoxV2 maxLen={1600} rows={2} ref={e => this.tinNhan = e} type='text' className='px-2' style={{ flex: 1, position: 'relative' }} placeholder='Bạn đang nghĩ gì...?' />
                    <button type='button' className='btn btn-primary' style={{ height: 50, width: 50, borderRadius: '50%' }} onClick={e => e && e.preventDefault() || this.sendMessage(fwQaItem)}>
                        <i className='fa fa-fw fa-lg fa-paper-plane' />
                    </button>
                </div>}
            </>;
        }
        return <div></div>;
    }

    userMessageRender = (item) => {
        return (<div className='col-12 rows d-flex justify-content-end my-2 ' style={{ flex: 1 }}>
            <div className='rows justify-content-end align-items-space-between' style={{ maxWidth: 400, borderRadius: 10, fontSize: '1.0rem', whiteSpace: 'pre-wrap', color: 'white', backgroundColor: '#0a7cff' }}>
                <div className="mx-2 my-1">{item.noiDung}</div>
                <div className="mx-2 my-1 text-left" style={{ fontSize: '0.8rem' }}>{T.dateToText(new Date(parseInt(item.createdAt)), 'HH:MM, dd/mm')}</div>
            </div>
        </div>);
    };

    othersMessageRender = (item) => {
        return (<div className='col-12 rows d-flex justify-content-lg-start my-2 ' style={{ maxWidth: '400px', flex: 1 }}>
            <div className="mx-2" style={{ borderRadius: '50%', width: '50px', height: '50px' }}>
                <img className="rounded-circle" src={item.image ?? '/img/avatar.png'} alt="avatar" style={{ borderRadius: '50%', width: '50px', height: '50px', objectFit: 'cover', border: '1px solid lightgrey' }} />
            </div>
            <div className='rows justify-content-start' style={{ borderRadius: 10, fontSize: '1.0rem', whiteSpace: 'pre-wrap', color: '#050505', backgroundColor: '#f0f0f0' }}>
                {this.state.chatboxMap[this.state.openingChatboxId].chatBoxType != 'BLACKBOX' && <div className="mx-2 my-1 text-left" style={{ fontSize: '0.8rem' }}>{`${item.ho} ${item.ten}`}</div>}
                <div className="mx-2 my-1">{item.noiDung}</div>
                <div className="mx-2 my-1 text-left" style={{ fontSize: '0.8rem' }}>{T.dateToText(new Date(parseInt(item.createdAt)), 'HH:MM, dd/mm')}</div>
            </div>
        </div>);
    };

    sendMessage = (fwQaItem) => {
        if (fwQaItem.chatBoxType == 'Q&A' || fwQaItem.chatBoxType == 'BLACKBOX' || fwQaItem.chatBoxType == 'TRANSPARENT_BLACKBOX') {
            const messageContent = this.tinNhan.value();
            if (messageContent == null || messageContent.length == 0) {
                T.notify('Vui lòng nhập tin nhắn!', 'info');
            } else {
                this.props.createFwQuestionAnswerMessage(fwQaItem.id, messageContent, () => {
                    this.tinNhan.value('');
                    this.setState({
                        uploadingImgList: []
                    },
                        // () => this.imageMultiBox.clear()
                    );
                });
            }
        }
    }

    onChatboxListScrollChange = () => {
        if (this.state.chatboxListPageNumber >= this.state.chatboxListPageTotal) {
            this.setState({ chatboxListHasMore: false });
        } else {
            const nextPage = this.state.chatboxListPageNumber + 1;
            this.getChatboxListPage(nextPage, this.state.chatboxListPageSize, '', (data) => {
                let { totalItem, pageSize, pageTotal, pageNumber, list: newList } = data;
                let incomingChatboxMap = {};
                newList.forEach(item => {
                    incomingChatboxMap[item.id] = item;
                });
                this.setState({
                    chatboxListHasMore: true,
                    chatboxListTotalItem: totalItem,
                    chatboxListPageSize: pageSize,
                    chatboxListPageNumber: pageNumber,
                    chatboxListPageTotal: pageTotal,
                    chatboxMap: { ...this.state.chatboxMap, ...incomingChatboxMap },
                });
            });
        }
    }

    onChatboxMessagesScrollChange = () => {
        if (this.state.chatboxMessagesFirstFetch) {
            this.setState({ chatboxMessagesFirstFetch: false });
            const nextPage = 1;
            this.getChatboxMessagesPage(nextPage, this.state.chatboxMessagePageSize, this.state.openingChatboxId, (data) => {
                let { totalItem, pageSize, pageTotal, pageNumber, listMessage: newList } = data;
                this.setState({
                    chatboxMessageHasMore: true,
                    chatboxMessageTotalItem: totalItem,
                    chatboxMessagePageSize: pageSize,
                    chatboxMessagePageNumber: pageNumber,
                    chatboxMessagePageTotal: pageTotal,
                    currentChatBoxMessages: newList
                });
            });
        } else {
            const nextPage = this.state.chatboxMessagePageNumber + 1;
            this.getChatboxMessagesPage(nextPage, this.state.chatboxMessagePageSize, this.state.openingChatboxId, (data) => {
                let { totalItem, pageSize, pageTotal, pageNumber, listMessage: newList } = data;
                this.setState({
                    chatboxMessageHasMore: true,
                    chatboxMessageTotalItem: totalItem,
                    chatboxMessagePageSize: pageSize,
                    chatboxMessagePageNumber: pageNumber,
                    chatboxMessagePageTotal: pageTotal,
                    currentChatBoxMessages: [...newList, this.state.currentChatBoxMessages],
                });
            });
        }
    }
}

const mapStateToProps = state => ({ system: state.system, fwPersonalChatbox: state.lienHe.fwPersonalChatbox });
const mapActionsToProps = { getFwPersonalChatboxPage, createFwQuestionAnswerMessage, getFwQuestionAnswerMessagePage };
export default connect(mapStateToProps, mapActionsToProps)(PersonalChatboxPage);