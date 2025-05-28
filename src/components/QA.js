import React, { useState } from 'react';
import { FaChevronDown, FaQuestionCircle, FaInfoCircle } from 'react-icons/fa'; // 导入图标

function QA() {
  const [activeIndex, setActiveIndex] = useState(null);

  const qaItems = [
    {
      question: '什么是 U2Net 模型？',
      answer: 'U2Net 是一种用于图像显著性检测和背景移除的深度学习模型。它能够有效地识别图像中的主要对象，并将其从背景中分离出来。',
    },
    {
      question: '为什么选择在浏览器本地处理图像？',
      answer: (
        <ul className="qa-answer-list">
          <li><FaInfoCircle className="qa-icon" /><b>隐私保护：</b>您的图像数据不会上传到任何服务器，完全保护您的个人隐私。</li>
          <li><FaInfoCircle className="qa-icon" /><b>速度快：</b>省去了网络传输的时间，处理速度更快，尤其是在网络条件不佳的情况下。</li>
          <li><FaInfoCircle className="qa-icon" /><b>离线可用：</b>一旦模型加载完成，即使没有网络连接，您也可以继续使用抠图功能。</li>
        </ul>
      ),
    },
    {
      question: '我的图片尺寸有限制吗？',
      answer: '为了保证处理效率和模型兼容性，建议输入图片尺寸不要过大。模型内部会对图片进行缩放处理，但过大的图片可能会导致内存占用过高或处理速度变慢。',
    },
    {
      question: '抠图结果不理想怎么办？',
      answer: (
        <ul className="qa-answer-list">
          <li><FaInfoCircle className="qa-icon" />更换背景更简单的图片。</li>
          <li><FaInfoCircle className="qa-icon" />确保图片主体清晰，没有被遮挡。</li>
          <li><FaInfoCircle className="qa-icon" />检查图片尺寸是否符合模型建议。</li>
        </ul>
      ),
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="qa-container">
      <h1 className="qa-main-title">常见问题 (Q&A)</h1>
      <p className="qa-subtitle">在这里找到您可能遇到的问题的答案。</p>
      <div className="qa-accordion">
        {qaItems.map((item, index) => (
          <div className="qa-item" key={index}>
            <button
              className={`qa-question ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleAccordion(index)}
            >
              <FaQuestionCircle className="qa-question-icon" />
              <h2>{item.question}</h2>
              <FaChevronDown className={`qa-arrow ${activeIndex === index ? 'rotated' : ''}`} />
            </button>
            <div className={`qa-answer ${activeIndex === index ? 'open' : ''}`}>
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QA;