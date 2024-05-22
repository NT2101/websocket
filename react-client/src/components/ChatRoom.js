import React, { useEffect, useState, useCallback } from 'react';
import { over } from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient = null;

const ChatRoom = () => {
    const [privateChats, setPrivateChats] = useState(new Map());
    const [groupChats, setGroupChats] = useState(new Map());
    const [publicChats, setPublicChats] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [tab, setTab] = useState("CHATROOM");
    const [loggedIn, setLoggedIn] = useState(false);
    const [userData, setUserData] = useState({
        username: '',
        password: '',
        receivername: '',
        connected: false,
        content: ''
    });

    const connect = useCallback((username) => {
        let Sock = new SockJS('http://localhost:8080/ws');
        stompClient = over(Sock);
        stompClient.connect({}, () => onConnected(username), onError);
    }, []);

    useEffect(() => {
        const savedUserData = JSON.parse(sessionStorage.getItem('userData'));
        if (savedUserData) {
            setUserData({ ...savedUserData, connected: true });
            setLoggedIn(true);
            connect(savedUserData.username);
            fetchUserGroups(savedUserData.username); // Fetch user groups when the user logs in
        }
    }, [connect]);

    const fetchUserGroups = (username) => {
        fetch(`http://localhost:8080/api/user/${username}/groups`)
            .then(response => response.json())
            .then(data => {
                setUserGroups(data);
            })
            .catch(error => console.error('Error fetching user groups:', error));
    };

    const onConnected = (username) => {
        setLoggedIn(true);
        stompClient.subscribe('/chatroom/public', onMessageReceived);
        stompClient.subscribe('/user/' + username + '/private', onPrivateMessage);
        stompClient.subscribe('/group/' + username, onGroupMessage);
        userJoin(username);
    };

    const userJoin = (username) => {
        var chatMessage = {
            senderName: username,
            status: "JOIN"
        };
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    };

    const onMessageReceived = (payload) => {
        var payloadData = JSON.parse(payload.body);
        switch (payloadData.status) {
            case "JOIN":
                if (!privateChats.get(payloadData.senderName)) {
                    privateChats.set(payloadData.senderName, []);
                    setPrivateChats(new Map(privateChats));
                }
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                break;
            default:
                console.log(`Unknown status: ${payloadData.status}`);
                break;
        }
    };

    const onPrivateMessage = (payload) => {
        var payloadData = JSON.parse(payload.body);
        if (privateChats.get(payloadData.senderName)) {
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        } else {
            let list = [];
            list.push(payloadData);
            privateChats.set(payloadData.senderName, list);
            setPrivateChats(new Map(privateChats));
        }
    };

    const onGroupMessage = (payload) => {
        var payloadData = JSON.parse(payload.body);
        if (!groupChats.get(payloadData.groupName)) {
            groupChats.set(payloadData.groupName, []);
        }
        groupChats.get(payloadData.groupName).push(payloadData);
        setGroupChats(new Map(groupChats));
    };
    
    const onError = (err) => {
        console.log(err);
    };

    const handleMessage = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, content: value });
    };

    const sendValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                content: userData.content,
                status: "MESSAGE"
            };

            setPublicChats(prevChats => [...prevChats, chatMessage]);
            setUserData({ ...userData, content: "" });
            stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
        }
    };

    const sendPrivateValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                receiverName: tab,
                content: userData.content,
                status: "MESSAGE"
            };

            const newPrivateChats = new Map(privateChats);
            if (newPrivateChats.get(tab)) {
                newPrivateChats.get(tab).push(chatMessage);
            } else {
                newPrivateChats.set(tab, [chatMessage]);
            }
            setPrivateChats(newPrivateChats);

            setUserData({ ...userData, content: "" });
            stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
        }
    };

    const sendGroupValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                groupName: tab,
                content: userData.content,
                status: "MESSAGE"
            };

            const newGroupChats = new Map(groupChats);
            if (newGroupChats.get(tab)) {
                newGroupChats.get(tab).push(chatMessage);
            } else {
                newGroupChats.set(tab, [chatMessage]);
            }
            setGroupChats(newGroupChats);

            setUserData({ ...userData, content: "" });
            stompClient.send("/app/group-message", {}, JSON.stringify(chatMessage));
        }
    };

    const handleUsername = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, username: value });
    };

    const handlePassword = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, password: value });
    };

    const login = () => {
        fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: userData.username, password: userData.password }),
        })
            .then(response => response.text())
            .then(data => {
                if (data === "Đăng nhập thành công!") {
                    sessionStorage.setItem('userData', JSON.stringify({ username: userData.username }));
                    setLoggedIn(true);
                    connect(userData.username);
                } else {
                    alert(data);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    return (
        <div className="container">
            {loggedIn ?
                <div className="chat-box">
                    <div className="member-list">
                        <ul>
                            <li onClick={() => { setTab("CHATROOM") }} className={`member ${tab === "CHATROOM" && "active"}`}>Chatroom</li>
                            {userGroups.map((group, index) => (
                                <li onClick={() => { setTab(group.name) }} className={`member ${tab === group.name && "active"}`} key={index}>{group.name}</li>
                            ))}
                            {[...privateChats.keys()].map((name, index) => (
                                <li onClick={() => { setTab(name) }} className={`member ${tab === name && "active"}`} key={index}>{name}</li>
                            ))}
                        </ul>
                    </div>
                    {tab === "CHATROOM" && <div className="chat-content">
                        <ul className="chat-messages">
                            {publicChats.map((chat, index) => (
                                <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                    <div className="message-data">{chat.content}</div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                </li>
                            ))}
                        </ul>

                        <div className="send-message">
                            <input type="text" className="input-message" placeholder="Enter the message" value={userData.content} onChange={handleMessage} />
                            <button type="button" className="send-button" onClick={sendValue}>Send</button>
                        </div>
                    </div>}
                    {tab !== "CHATROOM" && groupChats.has(tab)  && <div className="chat-content">
                        <ul className="chat-messages">
                            {[...(groupChats.get(tab) || [])].map((chat, index) => (
                                <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                    <div className="message-data">{chat.content}</div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}
                                
                                    </div>}
                                </li>
                            ))}
                        </ul>

                        <div className="send-message">
                            <input type="text" className="input-message" placeholder="Enter the message" value={userData.content} onChange={handleMessage} />
                            <button type="button" className="send-button" onClick={sendGroupValue}>Send</button>
                        </div>
                    </div>}
                    {tab !== "CHATROOM" && privateChats.has(tab) && <div className="chat-content">
                        <ul className="chat-messages">
                            {[...(privateChats.get(tab) || [])].map((chat, index) => (
                                <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                    <div className="message-data">{chat.content}</div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                </li>
                            ))}
                        </ul>

                        <div className="send-message">
                            <input type="text" className="input-message" placeholder="Enter the message" value={userData.content} onChange={handleMessage} />
                            <button type="button" className="send-button" onClick={sendPrivateValue}>Send</button>
                        </div>
                    </div>}
                </div>
                :
                <div className="login">
                    <input
                        id="user-name"
                        placeholder="Enter your name"
                        name="userName"
                        value={userData.username}
                        onChange={handleUsername}
                        margin="normal"
                    />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        name="password"
                        value={userData.password}
                        onChange={handlePassword}
                        margin="normal"
                    />
                    <button type="button" onClick={login}>
                        Login
                    </button>
                </div>}
        </div>
    );
};

export default ChatRoom;