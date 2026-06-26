import styled from 'styled-components';

export const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #f5f7fa;
    position: relative;
`;

export const Title = styled.h1`
    color: #2c3e50;
    margin-bottom: 1.5rem;
`;

export const UploadBox = styled.div`
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const FileInput = styled.input`
    margin: 1rem 0;
    padding: 0.5rem;
    border: 2px dashed #bdc3c7;
    border-radius: 8px;
    width: 100%;
    cursor: pointer;

    &:hover {
        border-color: #3498db;
    }
`;

export const ImagePreview = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 1rem 0;
    width: 100%;

    img {
        max-width: 100%;
        max-height: 200px;
        border-radius: 8px;
        border: 2px solid #ecf0f1;
        margin: 0.5rem 0;
    }
`;

export const PreprocessPreview = styled(ImagePreview)`
    padding: 0.5rem;
    border-radius: 8px;
`;

export const PredictButton = styled.button`
    background: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
    margin: 1rem 0;

    &:hover {
        background: #2980b9;
    }

    &:disabled {
        background: #95a5a6;
        cursor: not-allowed;
    }
`;

export const ResultContainer = styled.div`
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 8px;
    width: 100%;
    text-align: center;
    font-size: 1.3rem;
    font-weight: 500;
    border: 2px solid #dfe6e9;
`;

export const LoadingText = styled.p`
    color: #7f8c8d;
    font-style: italic;
`;

export const GitHubLink = styled.a`
    position: absolute;
    top: 1rem;
    right: 1rem;
    color: #333;
    transition: color 0.2s;

    &:hover {
        color: #000;
    }
`;

export const GitHubIcon = styled.svg`
    width: 28px;
    height: 28px;
    fill: currentColor;
    display: block;
`;
