import React, {useState, useRef, useEffect} from 'react';
import * as tf from '@tensorflow/tfjs';
import {
  PageContainer,
  Title,
  UploadBox,
  FileInput,
  ImagePreview,
  PreprocessPreview,
  PredictButton,
  ResultContainer,
  LoadingText, GitHubLink, GitHubIcon,
} from '../styles/StyledComponents';
import {ClassificationModel} from '../classification/classification.ts';

const HomePage: React.FC = () => {
  const [model, setModel] = useState<ClassificationModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [preprocessedUrl, setPreprocessedUrl] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{ dog: number; cat: number } | null>(null);
  const [predicting, setPredicting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initModel = async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        const classifier = new ClassificationModel();
        await classifier.loadModel();
        setModel(classifier);
      } catch (error) {
        console.error('Error loading model:', error);
        alert('Failed to load model. Check console for details.');
      } finally {
        setLoading(false);
      }
    };
    initModel().then(() => console.log("Model loaded"));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPrediction(null);

    const url = URL.createObjectURL(file);
    setOriginalUrl(url);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 150;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, 150, 150);
        // Convert to grayscale
        const imageData = ctx.getImageData(0, 0, 150, 150);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);
        setPreprocessedUrl(canvas.toDataURL());
      }
    };
    img.src = url;
  };

  const handlePredict = async () => {
    if (!model || !selectedFile) return;
    setPredicting(true);
    try {
      const tensor = await model.preprocessImage(selectedFile);
      const result = await model.predict(tensor);
      setPrediction(result);
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Prediction failed. Check console.');
    } finally {
      setPredicting(false);
    }
  };

  const isReady = model !== null && selectedFile !== null;

  return (
    <PageContainer>
      <GitHubLink
        href="https://github.com/Deboxa/Cats_dogs_ML_GRS"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View source on GitHub"
      >
        <GitHubIcon viewBox="0 0 19 19">
          <use href="/icons.svg#github-icon"/>
        </GitHubIcon>
      </GitHubLink>

      <Title>🐱 Cat or Dog? 🐶</Title>
      <UploadBox>
        {loading ? (
          <LoadingText>Loading model…</LoadingText>
        ) : (
          <>
            <FileInput
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            {originalUrl && (
              <ImagePreview>
                <strong>Original Image</strong>
                <img src={originalUrl} alt="Original"/>
              </ImagePreview>
            )}
            {preprocessedUrl && (
              <PreprocessPreview>
                <strong>Preprocessed</strong>
                <img src={preprocessedUrl} alt="Preprocessed"/>
              </PreprocessPreview>
            )}
            <PredictButton
              onClick={handlePredict}
              disabled={!isReady || predicting}
            >
              {predicting ? 'Classifying…' : 'Predict'}
            </PredictButton>
            {prediction && (
              <ResultContainer>
                <div>🐕 Dog: {(prediction.dog * 100).toFixed(1)}%</div>
                <div>🐈 Cat: {(prediction.cat * 100).toFixed(1)}%</div>
              </ResultContainer>
            )}
          </>
        )}
      </UploadBox>
    </PageContainer>
  );
};

export default HomePage;
