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
  LoadingText,
  GitHubLink,
  GitHubIcon,
} from '../styles/StyledComponents';
import {ClassificationModel} from '../classification/classification';
import {baseUrl, IMAGE_SIZE} from "../constants.ts";

const HomePage: React.FC = () => {
  const [model, setModel] = useState<ClassificationModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [preprocessedUrl, setPreprocessedUrl] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{ label: string; confidence: number } | null>(null);
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
    initModel().then(() => 1);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !model) return;

    setSelectedFile(file);
    setPrediction(null);

    const url = URL.createObjectURL(file);
    setOriginalUrl(url);

    try {
      const preprocessed = await model.getPreprocessedImageUrl(file);
      setPreprocessedUrl(preprocessed);
    } catch (error) {
      console.error('Failed to generate preview:', error);
    }
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

  let resultText = '';
  if (prediction) {
    resultText = `It's a ${prediction.label} with ${(prediction.confidence * 100).toFixed(1)}% confidence`;
  }

  return (
    <PageContainer>
      <GitHubLink
        href="https://github.com/Deboxa/Cats_dogs_ML_GRS"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View source on GitHub"
      >
        <GitHubIcon viewBox="0 0 19 19">
          <use href={`${baseUrl}icons.svg#github-icon`}/>
        </GitHubIcon>
      </GitHubLink>

      <Title>Cat or Dog?</Title>
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
                <strong>Preprocessed (grayscale, {IMAGE_SIZE}x{IMAGE_SIZE})</strong>
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
                {resultText}
              </ResultContainer>
            )}
          </>
        )}
      </UploadBox>
    </PageContainer>
  );
};

export default HomePage;
