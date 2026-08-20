import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import '../styles/Chatbot.css';

function Chatbot() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: '안녕하세요! FarMMS 도우미입니다. 무엇을 도와드릴까요? 😊',
    },
  ]);

  // 메시지 전송
  const handleSendMessage = async () => {
    const message = input.trim();

    if (!message || isLoading) {
      return;
    }

    // 사용자 메시지 표시
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('챗봇 요청:', message);

      const response = await api.post('/chatbot', {
        message: message,
      });

      console.log('챗봇 응답:', response);

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text:
          response?.message ||
          '답변을 불러오지 못했습니다.',
        buttonText: response?.buttonText,
        target: response?.target,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('챗봇 요청 오류:', error);

      let errorMessage = '챗봇 서버와 연결할 수 없습니다.';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          text: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter 키로 전송
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // 페이지 이동
  const handleNavigate = (target) => {
    if (!target) {
      return;
    }

    navigate(target);
    setIsOpen(false);
  };

  return (
    <>
      {/* 챗봇 창 */}
      {isOpen && (
        <div className="farmms-chatbot">
          {/* 헤더 */}
          <div className="farmms-chatbot-header">
            <div className="farmms-chatbot-title">
              <div className="farmms-chatbot-title-icon">
                🤖
              </div>

              <span>FarMMS 도우미</span>
            </div>

            <div className="farmms-chatbot-header-actions">
              <button
                type="button"
                className="farmms-chatbot-header-button"
                onClick={() => setIsOpen(false)}
                aria-label="챗봇 최소화"
              >
                −
              </button>

              <button
                type="button"
                className="farmms-chatbot-header-button"
                onClick={() => setIsOpen(false)}
                aria-label="챗봇 닫기"
              >
                ×
              </button>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="farmms-chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`farmms-chatbot-message-row ${
                  message.type === 'user'
                    ? 'user'
                    : 'bot'
                }`}
              >
                {/* 봇 아이콘 */}
                {message.type === 'bot' && (
                  <div className="farmms-chatbot-bot-icon">
                    🤖
                  </div>
                )}

                {/* 말풍선 */}
                <div
                  className={`farmms-chatbot-message ${
                    message.type === 'user'
                      ? 'user'
                      : 'bot'
                  }`}
                >
                  <div className="farmms-chatbot-message-text">
                    {message.text}
                  </div>

                  {/* 페이지 이동 버튼 */}
                  {message.type === 'bot' &&
                    message.buttonText &&
                    message.target && (
                      <button
                        type="button"
                        className="farmms-chatbot-action-button"
                        onClick={() =>
                          handleNavigate(message.target)
                        }
                      >
                        {message.buttonText}
                      </button>
                    )}
                </div>
              </div>
            ))}

            {/* 로딩 */}
            {isLoading && (
              <div className="farmms-chatbot-message-row bot">
                <div className="farmms-chatbot-bot-icon">
                  🤖
                </div>

                <div className="farmms-chatbot-message bot">
                  <div className="farmms-chatbot-loading">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 입력 영역 */}
          <div className="farmms-chatbot-input-area">
            <input
              type="text"
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              disabled={isLoading}
            />

            <button
              type="button"
              className="farmms-chatbot-send-button"
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              aria-label="메시지 보내기"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* 챗봇 아이콘 */}
      {!isOpen && (
        <button
          type="button"
          className="farmms-chatbot-floating-button"
          onClick={() => setIsOpen(true)}
          aria-label="FarMMS 도우미 열기"
        >
          <span>🤖</span>
        </button>
      )}
    </>
  );
}

export default Chatbot;