import * as tf from '@tensorflow/tfjs';

const IMAGE_SIZE = 100;
const CHANNELS = 1;

export class ClassificationModel {
  private model: tf.LayersModel | null = null;
  private readonly modelUrl: string;

  constructor(modelUrl: string = '/tfjs_model/model.json') {
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

  // resize, grayscale, normalize to [0,1]
  async preprocessImage(file: File): Promise<tf.Tensor4D> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = IMAGE_SIZE;
          canvas.height = IMAGE_SIZE;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, IMAGE_SIZE, IMAGE_SIZE);
          const imageData = ctx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE);
          const data = imageData.data;

          const grayData = new Float32Array(IMAGE_SIZE * IMAGE_SIZE);
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            grayData[i / 4] = gray / 255.0; // Normalize to [0,1]
          }

          const tensor = tf.tensor4d(
            grayData,
            [1, IMAGE_SIZE, IMAGE_SIZE, CHANNELS]
          );
          resolve(tensor);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async predict(tensor: tf.Tensor4D): Promise<{ dog: number; cat: number }> {
    if (!this.model) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }
    const prediction = this.model.predict(tensor) as tf.Tensor;
    const data = await prediction.data();

    const [dog, cat] = Array.from(data);
    tensor.dispose();
    prediction.dispose();
    return {dog, cat};
  }
}
