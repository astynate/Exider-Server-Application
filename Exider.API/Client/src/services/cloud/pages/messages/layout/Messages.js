import React, { useContext, useEffect, useState } from 'react';
import Search from '../../../features/search/Search';
import Header from '../../../widgets/header/Header';
import Content from '../widgets/content/Content';
import Input from '../shared/input/Input';
import Chat from '../widgets/chat/Chat';
import Message from '../shared/message/Message';
import styles from './main.module.css';
import cyraAvatar from './images/cyra.png';
import userState from '../../../../../states/user-state';
import { observer } from 'mobx-react-lite';
import { SignalRContext } from '../../../layout/Layout';

const Messages = (props) => {

  const { user } = userState;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSendingMessage, setSendingMessageState] = useState(false);
  const [isSendingPossible, setSendningPossibility] = useState(true);

  const SendMessage = async() => {
    setMessages(prevMessages => [...prevMessages,  { 
      name: user.nickname,
      text: message,
      isMyMessage: true,
      avatar: `data:image/png;base64,${user.avatar}`
    }]);

    setMessage('');

    setMessages(prevMessages => [...prevMessages,  { 
      name: "✦ Сyra",
      text: '⏳',
      isMyMessage: false,
      avatar: cyraAvatar
    }]);

    setSendningPossibility(false);

    await SignalRContext.connection.invoke('SendMessage', message);
  }

  SignalRContext.connection.onclose(() =>{

    setSendningPossibility(true);

  });

  SignalRContext.useSignalREffect(
    "ReceiveMessage",
    (message) => {
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const lastMessageIndex = updatedMessages.length - 1;

        if (lastMessageIndex >= 0) {
          const lastMessage = updatedMessages[lastMessageIndex];

          lastMessage.text = lastMessage.text.replace('⏳', '')
          lastMessage.text = lastMessage.text += message[0];

          if (message[1] === "True") {
            setSendningPossibility(true);
          }

        }

        return updatedMessages;
      });
    },
  );

  useEffect(()=> {

    if (isSendingMessage === true && 
        message.trim().length > 0 && 
        isSendingPossible === true) {
      
      SendMessage();

    }

    setSendingMessageState(false);

  }, [isSendingMessage]);

  useEffect(() => {

    if (props.setPanelState) {
        props.setPanelState(true);
    }

  }, [props.setPanelState]);
  
  return (
    <div className={styles.wrapper}>
      <Search />
      <Header />
      <Content>
        <Chat>
          <Message 
            name="✦ Сyra"
            text={`Hello, ${user.nickname}! My name is Cyra. How can i help you today? 😄`}
            isMyMessage={false}
            avatar={cyraAvatar}
          />
          {messages.map(message => (
            <Message 
              name={message.name}
              text={message.text}
              isMyMessage={message.isMyMessage}
              avatar={message.avatar}
            />
          ))}
        </Chat>
        <Input 
          message={[message, setMessage]} 
          isSendingPossible={[isSendingPossible, setSendningPossibility]}
          isSendingMessage={[isSendingMessage, setSendingMessageState]}
          cancel={() => SignalRContext.connection.stop()}
        />
      </Content>
    </div>
  )

};

export default observer(Messages);