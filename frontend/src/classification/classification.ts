import * as tf from '@tensorflow/tfjs';
import {baseUrl, IMAGE_SIZE} from "../constants.ts";

const CHANNELS = 1;

export class ClassificationModel {
  private model: tf.LayersModel | null = null;
  private readonly modelUrl: string;

  constructor(modelUrl: string = `${baseUrl}tfjs_model/model.json`) {
    this.modelUrl = modelUrl;
  }

  async loadModel(): Promise<void> {
    if (this.model) return;
    try {
      this.model = await tf.loadLayersModel(this.modelUrl);
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error;
    }
  }

  private preprocessImageElement(img: HTMLImageElement): {
    tensor: tf.Tensor4D;
    canvas: HTMLCanvasElement;
  } {
    const canvas = document.createElement('canvas');
    canvas.width = IMAGE_SIZE;
    canvas.height = IMAGE_SIZE;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, IMAGE_SIZE, IMAGE_SIZE);

    const imageData = ctx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE);
    const data = imageData.data;
    const grayData = new Float32Array(IMAGE_SIZE * IMAGE_SIZE);

    // Convert to grayscale and store normalized values
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      grayData[i / 4] = gray / 255.0;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    ctx.putImageData(imageData, 0, 0);

    const tensor = tf.tensor4d(grayData, [1, IMAGE_SIZE, IMAGE_SIZE, CHANNELS]);
    return {tensor, canvas};
  }

  async preprocessImage(file: File): Promise<tf.Tensor4D> {
    const img = await this.loadImageFromFile(file);
    const {tensor} = this.preprocessImageElement(img);
    return tensor;
  }

  async getPreprocessedImageUrl(file: File): Promise<string> {
    const img = await this.loadImageFromFile(file);
    const {canvas} = this.preprocessImageElement(img);
    return canvas.toDataURL('image/png');
  }

  private loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async predict(tensor: tf.Tensor4D): Promise<{ label: string; confidence: number }> {
    if (!this.model) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }
    const prediction = this.model.predict(tensor) as tf.Tensor;
    const data = await prediction.data();
    const dogProb = data[0];

    tensor.dispose();
    prediction.dispose();

    const isDog = dogProb >= 0.5;
    return {
      label: isDog ? 'dog' : 'cat',
      confidence: isDog ? dogProb : 1 - dogProb
    };
  }
}
