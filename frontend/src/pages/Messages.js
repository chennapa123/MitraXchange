import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import './Messages.css';

let socket;

const Messages = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Init socket
  useEffect(() => {
    socket = io('http://localhost:5000');
    socket.emit('join', user._id);
    socket.on('receiveMessage', (data) => {
      setMessages(prev => {
        // avoid duplicates
        if (prev.some(m => m._id === data._id)) return prev;
        return [...prev, data];
      });
    });
    return () => socket.disconnect();
  }, [user._id]);

  // Load conversations
  useEffect(() => {
    axios.get('/api/messages').then(res => setConversations(res.data));
  }, []);

  // Open conversation if userId in URL
  useEffect(() => {
    if (userId) openConversation(userId);
  }, [userId]); // eslint-disable-line

  const openConversation = async (uid) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/messages/${uid}`);
      setMessages(res.data);
      // Get user info from conversations or fetch
      const conv = conversations.find(c => c.user._id === uid);
      if (conv) setActiveUser(conv.user);
      else {
        const userRes = await axios.get(`/api/users/${uid}`);
        setActiveUser(userRes.data.user);
      }
      navigate(`/messages/${uid}`, { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeUser) return;
    try {
      const res = await axios.post('/api/messages', {
        receiverId: activeUser._id,
        message: newMsg,
      });
      socket.emit('sendMessage', { ...res.data, receiverId: activeUser._id });
      setNewMsg('');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="messages-page">
      {/* Conversations sidebar */}
      <div className="conversations-sidebar">
        <div className="conversations-header">
          <h2>Messages</h2>
        </div>
        {conversations.length === 0 ? (
          <div className="no-convs">
            <span>💬</span>
            <p>No conversations yet</p>
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.user._id}
              className={`conv-item ${activeUser?._id === conv.user._id ? 'active' : ''}`}
              onClick={() => openConversation(conv.user._id)}
            >
              <div className="conv-avatar">{conv.user.name?.charAt(0).toUpperCase()}</div>
              <div className="conv-info">
                <p className="conv-name">{conv.user.name}</p>
                <p className="conv-last">{conv.lastMessage?.message?.substring(0, 30)}...</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat window */}
      <div className="chat-window">
        {!activeUser ? (
          <div className="chat-empty">
            <span>💬</span>
            <h3>Select a conversation</h3>
            <p>Or start chatting from an item page</p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="chat-header-avatar">{activeUser.name?.charAt(0).toUpperCase()}</div>
              <div>
                <p className="chat-header-name">{activeUser.name}</p>
                <p className="chat-header-loc">📍 {activeUser.location || 'Location not set'}</p>
              </div>
            </div>

            <div className="chat-messages">
              {loading ? (
                <div className="spinner" />
              ) : messages.length === 0 ? (
                <div className="no-messages">Say hello! 👋</div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.senderId?._id === user._id || msg.senderId === user._id;
                  return (
                    <div key={msg._id || i} className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                      <p>{msg.message}</p>
                      <span className="msg-time">{formatTime(msg.createdAt)}</span>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form className="chat-input-bar" onSubmit={sendMessage}>
              <input
                className="input chat-input"
                placeholder="Type a message..."
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={!newMsg.trim()}>
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
