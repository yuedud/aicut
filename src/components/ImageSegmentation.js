import React, { useState, useEffect, useRef } from 'react';
import * as ort from 'onnxruntime-web';

const DB_NAME = 'ONNXModelDB';
const STORE_NAME = 'models';
const MODEL_KEY = 'u2net';

// 打开或创建IndexedDB数据库
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      reject('IndexedDB error: ' + event.target.errorCode);
    };
  });
};

// 将模型存储到IndexedDB
const storeModelInDB = async (db, modelData) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(modelData, MODEL_KEY);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject('Failed to store model in DB: ' + event.target.errorCode);
  });
};

// 从IndexedDB获取模型
const getModelFromDB = async (db) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(MODEL_KEY);
    request.onsuccess = (event) => resolve(event.target.result); // result会是ArrayBuffer或undefined
    request.onerror = (event) => reject('Failed to get model from DB: ' + event.target.errorCode);
  });
};

function ImageSegmentation() { // 将App函数名改为ImageSegmentation
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null); // 存储原始图片用于显示
  const [outputImage, setOutputImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null); // 用于获取原始图片的引用

  // 加载模型
  useEffect(() => {
    const loadModel = async () => {
      try {
        setError(null);
        const db = await openDB();
        let modelData = await getModelFromDB(db);
        if (modelData) {
          console.log('从IndexedDB加载模型.');
        } else {
          console.log('IndexedDB中未找到模型，从网络下载...');
          const response = await fetch('./u2net.onnx');
          if (!response.ok) {
            throw new Error(`网络请求模型失败: ${response.status} ${response.statusText}`);
          }
          modelData = await response.arrayBuffer();
          console.log('模型下载完成，存入IndexedDB...');
          await storeModelInDB(db, modelData);
          console.log('模型已存入IndexedDB.');
        }

        const newSession = await ort.InferenceSession.create(modelData, {
          executionProviders: ['wasm'], // 'webgl' 或 'wasm'
          graphOptimizationLevel: 'all',
        });
        setSession(newSession);
        console.log('ONNX模型加载并初始化成功');
      } catch (e) {
        console.error('ONNX模型加载或初始化失败:', e);
        setError(`模型处理失败: ${e.message}`);
      }
    };
    loadModel();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        setOriginalImage(e.target.result); // 保存原始图片URL
        setOutputImage(null); // 清除旧的输出
        setError(null);
        setLoading(true);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    (async function() {
        if(image && session) {
            await runSegmentation()
            setLoading(false);
        }
    })()
  },[image, session])

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        setOriginalImage(e.target.result);
        setOutputImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // 预处理：调整尺寸为320x320，归一化
  const preprocess = async (imgElement) => {
    const canvas = document.createElement('canvas');
    const modelWidth = 320;
    const modelHeight = 320;
    canvas.width = modelWidth;
    canvas.height = modelHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0, modelWidth, modelHeight);
    const imageData = ctx.getImageData(0, 0, modelWidth, modelHeight);
    const data = imageData.data;

    // NCHW 格式: [batch_size, channels, height, width]
    const float32Data = new Float32Array(1 * 3 * modelHeight * modelWidth);
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];

    for (let i = 0; i < modelHeight * modelWidth; i++) {
      float32Data[i] = (data[i * 4] / 255 - mean[0]) / std[0]; // R
      float32Data[i + modelHeight * modelWidth] = (data[i * 4 + 1] / 255 - mean[1]) / std[1]; // G
      float32Data[i + 2 * modelHeight * modelWidth] = (data[i * 4 + 2] / 255 - mean[2]) / std[2]; // B
    }
    return new ort.Tensor('float32', float32Data, [1, 3, modelHeight, modelWidth]);
  };

  // 后处理：将模型输出转换为透明背景图像
  const postprocess = (outputTensor, originalImgElement) => {
    const outputData = outputTensor.data;
    const [height, width] = outputTensor.dims.slice(-2); // 通常是 [1, 1, H, W]

    const canvas = document.createElement('canvas');
    canvas.width = originalImgElement.naturalWidth; // 使用原始图片尺寸
    canvas.height = originalImgElement.naturalHeight;
    const ctx = canvas.getContext('2d');

    // 1. 绘制原始图片
    ctx.drawImage(originalImgElement, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelData = imageData.data;

    // 2. 创建一个临时的canvas来处理和缩放mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width; // U2Net输出mask的原始宽度
    maskCanvas.height = height; // U2Net输出mask的原始高度
    const maskCtx = maskCanvas.getContext('2d');
    const maskImageData = maskCtx.createImageData(width, height);

    // 归一化mask值 (通常U2Net输出在0-1之间，但最好检查一下)
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (let i = 0; i < outputData.length; i++) {
      minVal = Math.min(minVal, outputData[i]);
      maxVal = Math.max(maxVal, outputData[i]);
    }

    for (let i = 0; i < height * width; i++) {
      let value = (outputData[i] - minVal) / (maxVal - minVal); // 归一化到 0-1
      value = Math.max(0, Math.min(1, value)); // 确保在0-1范围内
      const alpha = value * 255;
      maskImageData.data[i * 4] = 0;     // R
      maskImageData.data[i * 4 + 1] = 0; // G
      maskImageData.data[i * 4 + 2] = 0; // B
      maskImageData.data[i * 4 + 3] = alpha; // Alpha
    }
    maskCtx.putImageData(maskImageData, 0, 0);

    // 3. 将缩放后的mask应用到原始图像的alpha通道
    // 创建一个新的canvas用于绘制最终结果，并将mask缩放到原始图像尺寸
    const finalMaskCanvas = document.createElement('canvas');
    finalMaskCanvas.width = originalImgElement.naturalWidth;
    finalMaskCanvas.height = originalImgElement.naturalHeight;
    const finalMaskCtx = finalMaskCanvas.getContext('2d');
    finalMaskCtx.drawImage(maskCanvas, 0, 0, finalMaskCanvas.width, finalMaskCanvas.height);
    const finalMaskData = finalMaskCtx.getImageData(0, 0, finalMaskCanvas.width, finalMaskCanvas.height);

    for (let i = 0; i < pixelData.length / 4; i++) {
      pixelData[i * 4 + 3] = finalMaskData.data[i * 4 + 3]; // 将mask的alpha通道应用到原始图片
    }
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL();
  };

  const runSegmentation = async () => {
    if (!image || !session) {
      setError('请先上传图片并等待模型加载完成。');
      return;
    }
    setError(null);
    setOutputImage(null);

    try {
      const imgElement = imageRef.current;
      if (!imgElement) {
        throw new Error('图片元素未找到。');
      }

      // 确保图片完全加载
      if (!imgElement.complete) {
        await new Promise(resolve => { imgElement.onload = resolve; });
      }

      const inputTensor = await preprocess(imgElement);
      const feeds = { 'input.1': inputTensor }; // 确保输入名称与模型一致
      const results = await session.run(feeds);
      const outputTensor = results[session.outputNames[0]];
      const outputDataURL = postprocess(outputTensor, imgElement);
      setOutputImage(outputDataURL);
    } catch (e) {
      console.error('抠图失败:', e);
      setError(`抠图处理失败: ${e.message}`);
    }
  };

  const handleDownload = () => {
    if (outputImage) {
      const link = document.createElement('a');
      link.href = outputImage;
      link.download = 'aicut_result.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="segmentation-container component-container">
      <h1 className="segmentation-title">AI 智能背景移除</h1>
      <p className="segmentation-subtitle">上传图片，智能移除背景，所有处理均在本地完成。</p>

      <div className="segmentation-main-content">
        <div className='center'>
            <div className="upload-section" onDrop={handleDrop} onDragOver={handleDragOver}>
            {!image ? (
                <div className="upload-placeholder" onClick={() => fileInputRef.current.click()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-plus"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path><line x1="16" x2="22" y1="5" y2="5"></line><line x1="19" x2="19" y1="2" y2="8"></line><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                <p>拖放图片到此处，或点击上传</p>
                </div>
            ) : (
                <div className="image-preview-container">
                <img ref={imageRef} src={image} alt="Uploaded" className="uploaded-image" />
                <button className="change-image-button" onClick={() => fileInputRef.current.click()}>
                    更换图片
                </button>
                </div>
            )}
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                style={{ display: 'none' }}
            />
            </div>
        </div>
        <div className="center">
          {/* 空态和加载态以及结果显示 */} 
          <div className="output-display-area">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>处理中...</p>
              </div>
            ) : outputImage ? (
                <>
                <div className='center'>
                    <div className='result-title'>处理完成！</div>
                </div>
                <div className='center'>
                    <div className='result-description'>背景已成功移除。您可以下载透明背景图片或继续处理其他图片。图片已在您的设备上本地处理，没有上传到任何服务器。</div>
                </div>
                <div className="output-section">
                
                <div className='output-result'>
                    <div className="output-image-container">
                    <img src={outputImage} alt="Segmented" className="segmented-image" />
                    <button className="change-image-button" onClick={handleDownload}>
                        下载图片
                    </button>
                    </div>
                </div>
                {/* <button className="download-button cta-button secondary large" onClick={handleDownload}>
                  下载结果
                </button> */}
              </div>
                </>

            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageSegmentation;
