import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
const Home = () => {
  return (
    <div className="component-container home-container">
      {/* 顶部英雄区域 - 突出核心功能和视觉冲击 */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>AI 智能背景移除，一键背景移除</h1>
          <p className="subtitle">利用先进的 AI 技术，轻松移除任何图片背景。所有处理均在本地浏览器完成，保护您的隐私。</p>
          <div className="cta-buttons">
            <a href="/segmentation" className="cta-button primary">立即免费背景移除&nbsp;
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right ml-2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </a>
            <a href="/advantages" className="cta-button secondary">了解更多</a>
          </div>
        </div>
        {/* 产品演示 GIF */}
        <div className="hero-image-placeholder">
        <Swiper
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={3}
            effect={'coverflow'}
            loop={true}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
            }}
            modules={[EffectCoverflow, Pagination, Autoplay]}
            coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
            className="mySwiper"
      >
        <SwiperSlide className="hero-gif" >
             <img src="/bg-removal.gif" alt="背景移除演示" className="hero-gif" />
        </SwiperSlide>
        <SwiperSlide className="hero-gif" >
             <img src="/motor-demo.gif" alt="背景移除演示1" className="hero-gif" />
        </SwiperSlide>
        <SwiperSlide className="hero-gif" >
             <img src="/ship-demo.gif" alt="背景移除演示2" className="hero-gif" />
        </SwiperSlide>
        <SwiperSlide className="hero-gif" >
             <img src="/view-move.gif" alt="背景移除演示" className="hero-gif" />
        </SwiperSlide>
    </Swiper>
        </div>
      </section>

      {/* 特色功能区域 - 以卡片形式展示核心优势 */}
      <section className="features-section">
        <div className='h2'>为什么选择我们？</div>
        <div className='h4'>AI Cut 提供快速、简单、易用的图片背景移除工具，让所有人都能轻松创建透明背景图片</div>
        <div className="features-grid">
          <div className="feature-item card">
            <div className="icon-wrapper"><i className="icon-local-processing"></i></div>
            <h3>本地极速处理</h3>
            <p>所有图像处理均在您的浏览器本地完成，无需上传，秒级响应，效率非凡。</p>
          </div>
          <div className="feature-item card">
            <div className="icon-wrapper"><i className="icon-privacy"></i></div>
            <h3>极致隐私保护</h3>
            <p>您的任何图片数据都不会离开您的设备，从源头杜绝隐私泄露风险。</p>
          </div>
          <div className="feature-item card">
            <div className="icon-wrapper"><i className="icon-free"></i></div>
            <h3>永久免费无水印</h3>
            <p>所有强大功能完全免费开放，无隐藏收费，导出图片无任何水印困扰。</p>
          </div>
          <div className="feature-item card">
            <div className="icon-wrapper"><i className="icon-no-login"></i></div>
            <h3>无需注册，即刻使用</h3>
            <p>告别繁琐的注册登录流程，打开即用，让您的创意不受任何阻碍。</p>
          </div>
          <div className="feature-item card">
            <div className="icon-wrapper"><i className="icon-high-quality"></i></div>
            <h3>专业级背景移除效果</h3>
            <p>基于先进的 ONNX 模型，提供媲美专业软件的精准背景移除效果，细节完美呈现。</p>
          </div>
        </div>
      </section>

      {/* 额外信息或行动号召区域 */}
      <section className="call-to-action-section">
        <h2>立即开始您的创意之旅</h2>
        <p>体验前所未有的智能背景移除，让您的图片处理变得简单高效。</p>
        <a href="/segmentation" className="cta-button primary large">开始背景移除</a>
      </section>

    </div>
  );
};

export default Home;